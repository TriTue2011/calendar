"""The Vietnamese Lunar Calendar integration."""

from __future__ import annotations

from datetime import date
import hashlib
import logging
import sqlite3
from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import SOURCE_IMPORT, ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.loader import async_get_integration

from .amlich_core import (
    NGAY_THONG_TIN,
    THU,
    get_can_chi_day_month_year,
    get_gio_hac_dao,
    get_gio_hoang_dao,
    get_huong_xuat_hanh,
    get_lunar_date,
    get_lunar_leap_info,
    get_month_name,
    get_nhi_thap_bat_tu,
    get_thap_nhi_truc,
    get_tiet_khi,
    get_year_can_chi,
    lunar_to_solar_extended,
)
from .const import DOMAIN
from .nhap_db import convert_legacy_row, read_legacy_events

_LOGGER = logging.getLogger(__name__)

UI_URL_ROOT = "/lich_viet_ui"
UI_DIR_PATH = "frontend"
PLATFORMS: list[Platform] = [Platform.SENSOR]
#: Entry chính có thêm thực thể Lịch tổng hợp; mỗi entry sự kiện chỉ có cảm biến đếm ngược.
MAIN_PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.CALENDAR]


def _platforms_for(entry: ConfigEntry) -> list[Platform]:
    is_main = entry.data.get("is_main", entry.data.get("event_name") is None)
    return MAIN_PLATFORMS if is_main else PLATFORMS


FRONTEND_RESOURCES = (
    "lich-bloc-xua-card.js",
    "lich-block-am-duong-viet-nam.js",
    "su-kien-am-lich-card.js",
    "lich-block-am-duong-viet-nam-bubble.js",
    "lich-tuan-am-duong-viet-nam.js",
)

SERVICE_IMPORT_SCHEMA = vol.Schema(
    {vol.Optional("path", default="/config/events.db"): cv.string}
)

SERVICE_CONVERT_SCHEMA = vol.Schema(
    {
        vol.Required("conversion_type"): vol.In(
            ["solar_to_lunar", "lunar_to_solar"]
        ),
        vol.Required("day"): vol.All(cv.positive_int, vol.Range(min=1, max=31)),
        vol.Required("month"): vol.All(cv.positive_int, vol.Range(min=1, max=12)),
        vol.Required("year"): vol.All(
            cv.positive_int, vol.Range(min=1800, max=2199)
        ),
    }
)


def _get_frontend_versions(frontend_path: str) -> dict[str, str]:
    """Return content hashes for all frontend resources in one executor job."""
    versions: dict[str, str] = {}
    base_path = Path(frontend_path)

    for file_name in FRONTEND_RESOURCES:
        file_path = base_path / file_name
        try:
            digest = hashlib.sha256()
            with file_path.open("rb") as resource_file:
                for chunk in iter(lambda: resource_file.read(128 * 1024), b""):
                    digest.update(chunk)
        except OSError as err:
            _LOGGER.warning(
                "Không thể đọc tài nguyên frontend %s; bỏ qua đăng ký (%s)",
                file_path,
                err,
            )
            continue

        versions[file_name] = digest.hexdigest()[:16]

    return versions


def _is_duplicate_static_path_error(err: Exception) -> bool:
    """Return True when aiohttp reports a path that is already registered."""
    message = str(err).lower()
    return any(
        marker in message
        for marker in (
            "already registered",
            "already exists",
            "added route will never be executed",
            "duplicate",
        )
    )


async def _async_register_frontend_resources(hass: HomeAssistant) -> None:
    """Serve and register all frontend modules idempotently.

    The version is part of the static URL prefix so relative ES-module imports also
    receive a new URL on every integration release. This prevents stale imported
    modules from surviving browser/cache refreshes after an update.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})

    integration = await async_get_integration(hass, DOMAIN)
    integration_version = str(integration.version or "0")
    ui_url_base = f"{UI_URL_ROOT}/{integration_version}"
    frontend_path = hass.config.path("custom_components", DOMAIN, UI_DIR_PATH)

    static_urls: set[str] = domain_data.setdefault("frontend_static_urls", set())
    if ui_url_base not in static_urls:
        try:
            await hass.http.async_register_static_paths(
                [StaticPathConfig(ui_url_base, frontend_path, True)]
            )
        except (RuntimeError, ValueError) as err:
            # Integration/config-entry reloads can revisit this code while the
            # aiohttp route from the first setup is still present. A duplicate
            # route is therefore safe; other registration failures must surface.
            if not _is_duplicate_static_path_error(err):
                raise
            _LOGGER.debug(
                "Đường dẫn frontend %s đã được đăng ký; tiếp tục dùng lại",
                ui_url_base,
            )
        static_urls.add(ui_url_base)

    # Reuse hashes on the second call during normal startup. Calling
    # add_extra_js_url again is intentional: it makes setup self-healing if the
    # frontend URL manager was recreated while hass.data for this integration
    # remained alive.
    versions: dict[str, str] | None = domain_data.get("frontend_versions")
    if not versions or domain_data.get("frontend_version_base") != ui_url_base:
        versions = await hass.async_add_executor_job(
            _get_frontend_versions, frontend_path
        )
        domain_data["frontend_versions"] = versions
        domain_data["frontend_version_base"] = ui_url_base

    desired_urls = {
        f"{ui_url_base}/{file_name}?hacstag={version}"
        for file_name, version in versions.items()
    }
    previous_urls = set(domain_data.get("frontend_resource_urls", ()))

    # Remove obsolete URLs left by an older registration in the same process.
    for old_url in previous_urls - desired_urls:
        remove_extra_js_url(hass, old_url)

    # Register every desired URL on each setup attempt. UrlManager stores a set,
    # so this is cheap and safe while also recovering from transient frontend
    # registration state loss.
    for resource_url in sorted(desired_urls):
        add_extra_js_url(hass, resource_url)

    missing = sorted(set(FRONTEND_RESOURCES) - set(versions))
    if missing:
        _LOGGER.error(
            "Thiếu tài nguyên frontend của Âm lịch Việt Nam: %s",
            ", ".join(missing),
        )

    domain_data["frontend_resource_urls"] = tuple(sorted(desired_urls))
    domain_data["frontend_resources_registered"] = not missing


def _get_date_details(jd: int, lunar_obj: Any) -> dict[str, Any]:
    """Build detailed calendar information for an action response."""
    can_chi_day, can_chi_month, can_chi_year = get_can_chi_day_month_year(
        lunar_obj
    )
    day_info = NGAY_THONG_TIN.get(can_chi_day, {})
    return {
        "lunar_day": lunar_obj.day,
        "month_name": get_month_name(lunar_obj.month, lunar_obj.leap == 1),
        "can_chi_day": can_chi_day,
        "can_chi_month": can_chi_month,
        "can_chi_year": can_chi_year,
        "tiet_khi": get_tiet_khi(jd),
        "gio_hoang_dao": get_gio_hoang_dao(jd),
        "gio_hac_dao": get_gio_hac_dao(jd),
        "huong_xuat_hanh": get_huong_xuat_hanh(jd),
        "thap_nhi_truc": get_thap_nhi_truc(jd),
        "nhi_thap_bat_tu": get_nhi_thap_bat_tu(jd),
        "ngay_mo_ta": day_info.get("moTa", ""),
        "ngay_chi_tiet": day_info.get("chiTiet", []),
    }


def _convert_date(data: dict[str, Any]) -> dict[str, Any]:
    """Convert a date synchronously outside the Home Assistant event loop."""
    conversion_type = data["conversion_type"]
    day = int(data["day"])
    month = int(data["month"])
    year = int(data["year"])

    if conversion_type == "solar_to_lunar":
        try:
            solar_date = date(year, month, day)
        except ValueError as err:
            raise ValueError(
                f"Ngày dương lịch {day}/{month}/{year} không tồn tại"
            ) from err

        lunar = get_lunar_date(day, month, year)
        if not lunar:
            raise ValueError("Ngày nằm ngoài phạm vi hỗ trợ 1800-2199")

        year_can_chi = get_year_can_chi(lunar.year)
        leap_month = get_lunar_leap_info(lunar.year)
        response: dict[str, Any] = {
            "ngay": lunar.day,
            "thang": lunar.month,
            "nam": lunar.year,
            "nam_can_chi": year_can_chi,
            "thu": THU[solar_date.weekday()],
            "ngay_duong_lich": f"{day}/{month}/{year}",
            "ngay_am_lich": (
                f"{lunar.day}/{lunar.month}/{lunar.year}"
                + (" (Nhuận)" if lunar.leap == 1 else "")
            ),
            "details": _get_date_details(lunar.jd, lunar),
        }

        if leap_month > 0:
            message = (
                f"Năm âm lịch {year_can_chi} ({lunar.year}) "
                f"có nhuận tháng {leap_month}."
            )
            if lunar.month == leap_month:
                message += " Tháng bạn tra trùng ngay vào tháng Nhuận này!"
                both_solar, _ = lunar_to_solar_extended(
                    lunar.day, lunar.month, lunar.year
                )
                if lunar.leap == 1:
                    if "regular" in both_solar:
                        response["ngay_duong_thang_thuong"] = both_solar[
                            "regular"
                        ]["ngay_duong_lich"]
                    response["ngay_duong_thang_nhuan"] = f"{day}/{month}/{year}"
                else:
                    response["ngay_duong_thang_thuong"] = f"{day}/{month}/{year}"
                    if "leap" in both_solar:
                        response["ngay_duong_thang_nhuan"] = both_solar["leap"][
                            "ngay_duong_lich"
                        ]
            response["thong_bao_nhuan"] = message
        else:
            response["thong_bao_nhuan"] = (
                f"Năm âm lịch {year_can_chi} ({lunar.year}) không có tháng nhuận."
            )

        return response

    both_solar, leap_month = lunar_to_solar_extended(day, month, year)
    if not both_solar:
        raise ValueError(f"Ngày {day}/{month}/{year} âm lịch không tồn tại")

    default_result = both_solar.get("regular", both_solar.get("leap"))
    if not default_result:
        raise ValueError(f"Không thể quy đổi ngày {day}/{month}/{year} âm lịch")

    solar_date = date(
        default_result["nam"], default_result["thang"], default_result["ngay"]
    )
    lunar_for_details = get_lunar_date(
        default_result["ngay"],
        default_result["thang"],
        default_result["nam"],
    )
    year_can_chi = get_year_can_chi(year)
    response = {
        "ngay": default_result["ngay"],
        "thang": default_result["thang"],
        "nam": default_result["nam"],
        "nam_can_chi": year_can_chi,
        "thu": THU[solar_date.weekday()],
        "ngay_am_lich": f"{day}/{month}/{year}",
        "ngay_duong_lich": default_result["ngay_duong_lich"],
    }

    if lunar_for_details:
        response["details"] = _get_date_details(
            lunar_for_details.jd, lunar_for_details
        )

    if leap_month > 0:
        message = (
            f"Năm âm lịch {year_can_chi} ({year}) có nhuận tháng {leap_month}."
        )
        if month == leap_month:
            message += (
                " Tháng bạn đang quy đổi chính là tháng nhuận! "
                "Dưới đây là 2 kết quả:"
            )
            if "regular" in both_solar:
                response["ngay_duong_thang_thuong"] = both_solar["regular"][
                    "ngay_duong_lich"
                ]
            if "leap" in both_solar:
                response["ngay_duong_thang_nhuan"] = both_solar["leap"][
                    "ngay_duong_lich"
                ]
        response["thong_bao_nhuan"] = message
    else:
        response["thong_bao_nhuan"] = (
            f"Năm âm lịch {year_can_chi} ({year}) không có tháng nhuận."
        )

    return response


async def _async_handle_convert_date(
    hass: HomeAssistant, call: ServiceCall
) -> ServiceResponse:
    """Handle the convert_date action."""
    try:
        return await hass.async_add_executor_job(_convert_date, dict(call.data))
    except ValueError as err:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="invalid_date",
            translation_placeholders={"message": str(err)},
        ) from err
    except Exception as err:
        _LOGGER.exception("Không thể quy đổi ngày")
        raise HomeAssistantError(
            translation_domain=DOMAIN,
            translation_key="conversion_failed",
        ) from err


async def _async_import_amlich_db(hass: HomeAssistant, call: ServiceCall) -> ServiceResponse:
    """Nhập sự kiện từ events.db của tích hợp ``amlich`` cũ (chỉ đọc; nhập hai lần không trùng)."""
    path = call.data["path"]
    if not await hass.async_add_executor_job(hass.config.is_allowed_path, path):
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="path_not_allowed")
    try:
        rows = await hass.async_add_executor_job(read_legacy_events, path)
    except sqlite3.Error as err:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="cannot_read_db",
            translation_placeholders={"message": str(err)},
        ) from err

    imported = duplicates = 0
    skipped: list[dict[str, str]] = []
    for row in rows:
        data, reason = convert_legacy_row(row)
        if data is None:
            skipped.append({"ten": str(row[1]), "ly_do": str(reason)})
            continue
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": SOURCE_IMPORT}, data=data
        )
        if result["type"] == FlowResultType.CREATE_ENTRY:
            imported += 1
        elif result.get("reason") == "already_configured":
            duplicates += 1
        else:
            skipped.append({"ten": data["event_name"], "ly_do": str(result.get("reason"))})
    return {"da_nhap": imported, "da_co_san": duplicates, "bo_qua": skipped}


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up shared integration resources."""
    try:
        await _async_register_frontend_resources(hass)
    except Exception:  # Frontend failure must not block sensor/action setup.
        _LOGGER.exception("Không thể đăng ký frontend của Âm lịch Việt Nam")

    if not hass.services.has_service(DOMAIN, "convert_date"):

        async def async_handle_convert_date(call: ServiceCall) -> ServiceResponse:
            return await _async_handle_convert_date(hass, call)

        hass.services.async_register(
            DOMAIN,
            "convert_date",
            async_handle_convert_date,
            schema=SERVICE_CONVERT_SCHEMA,
            supports_response=SupportsResponse.ONLY,
        )

    async def async_handle_import(call: ServiceCall) -> ServiceResponse:
        return await _async_import_amlich_db(hass, call)

    async_register_admin_service(
        hass,
        DOMAIN,
        "nhap_tu_amlich_db",
        async_handle_import,
        schema=SERVICE_IMPORT_SCHEMA,
        supports_response=SupportsResponse.ONLY,
    )

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up a Vietnamese Lunar Calendar config entry."""
    # Re-run the idempotent frontend registration from the config-entry path as
    # well. This is important for entry reloads and protects against a transient
    # failure in shared async_setup without ever blocking the sensor platform.
    try:
        await _async_register_frontend_resources(hass)
    except Exception:
        _LOGGER.exception("Không thể đăng ký lại frontend của Âm lịch Việt Nam")

    await hass.config_entries.async_forward_entry_setups(entry, _platforms_for(entry))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry without removing shared actions or resources."""
    return await hass.config_entries.async_unload_platforms(entry, _platforms_for(entry))

