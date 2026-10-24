"""Sensor platform for the Vietnamese Lunar Calendar integration."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
import logging
from typing import Any, Callable

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.util import dt as dt_util

from .amlich_core import (
    NGAY_LE_AL,
    NGAY_LE_DL,
    NGAY_THONG_TIN,
    THU,
    get_can_chi_day_month_year,
    get_can_hour_0,
    get_gio_hac_dao,
    get_gio_hoang_dao,
    get_huong_xuat_hanh,
    get_lunar_date,
    get_lunar_month_length,
    get_month_name,
    get_nhi_thap_bat_tu,
    get_thap_nhi_truc,
    get_tiet_khi,
    get_year_can_chi,
    get_year_info,
    jd_to_date,
)
from .su_kien import next_lunar_occurrence, next_solar_occurrence, normalize_repeat

_LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class CalculatedState:
    """Calculated entity state returned from an executor job."""

    value: str | int | None
    attributes: dict[str, Any]
    name: str | None = None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up sensors from a config entry."""
    is_main = entry.data.get("is_main", entry.data.get("event_name") is None)

    if is_main:
        entities: list[SensorEntity] = [AmLichSensor(entry)]
    else:
        event_type = entry.data.get("event_type", "lunar")
        entities = [
            DuongLichEventSensor(entry)
            if event_type == "solar"
            else AmLichEventSensor(entry)
        ]

    async_add_entities(entities)


class DailyCalculatedSensor(SensorEntity):
    """Base entity which recalculates once per local day and on demand."""

    _attr_should_poll = False
    _attr_available = True

    def __init__(self) -> None:
        self._unsub_daily_update: Callable[[], None] | None = None

    async def async_added_to_hass(self) -> None:
        """Calculate initial state and schedule the next local midnight update."""
        await super().async_added_to_hass()
        await self._async_refresh()
        self.async_on_remove(self._cancel_daily_update)
        self._schedule_daily_update()

    async def async_update(self) -> None:
        """Support an explicit homeassistant.update_entity request."""
        await self._async_refresh()

    async def _async_refresh(self) -> None:
        today = dt_util.now().date()
        try:
            result = await self.hass.async_add_executor_job(
                self._calculate_state, today
            )
        except Exception:  # Keep entity/platform setup resilient to calculation bugs.
            _LOGGER.exception(
                "Không thể tính trạng thái cho %s",
                self.entity_id or self._attr_unique_id,
            )
            self._attr_available = False
            return

        self._attr_available = True
        self._attr_native_value = result.value
        self._attr_extra_state_attributes = result.attributes
        if result.name is not None:
            self._attr_name = result.name

    def _calculate_state(self, today: date) -> CalculatedState:
        raise NotImplementedError

    def _cancel_daily_update(self) -> None:
        if self._unsub_daily_update is not None:
            self._unsub_daily_update()
            self._unsub_daily_update = None

    def _schedule_daily_update(self) -> None:
        self._cancel_daily_update()
        next_day = dt_util.now() + timedelta(days=1)
        next_midnight = dt_util.start_of_local_day(next_day) + timedelta(seconds=5)
        self._unsub_daily_update = async_track_point_in_time(
            self.hass, self._async_handle_daily_update, next_midnight
        )

    async def _async_handle_daily_update(self, _now: datetime) -> None:
        self._unsub_daily_update = None
        try:
            await self._async_refresh()
            self.async_write_ha_state()
        finally:
            self._schedule_daily_update()


class AmLichSensor(DailyCalculatedSensor):
    """Daily Vietnamese lunar calendar sensor."""

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__()
        self._entry = entry
        self._attr_name = "Âm lịch hằng ngày"
        self._attr_unique_id = "amlich_hangngay"
        self._attr_icon = "mdi:calendar-today-outline"
        self._attr_native_value = None
        self._attr_extra_state_attributes = {}

    def _calculate_state(self, today: date) -> CalculatedState:
        lunar = get_lunar_date(today.day, today.month, today.year)
        if not lunar:
            return CalculatedState("Lỗi: Không thể tính toán", {})

        jd = lunar.jd
        weekday = THU[today.weekday()]
        month_name = get_month_name(lunar.month, lunar.leap == 1)
        lunar_month_length = get_lunar_month_length(lunar)
        lunar_month_type = (
            "Tháng Đủ (30 ngày)"
            if lunar_month_length == 30
            else "Tháng Thiếu (29 ngày)"
        )
        can_chi_day, can_chi_month, can_chi_year = (
            get_can_chi_day_month_year(lunar)
        )
        solar_holiday = NGAY_LE_DL.get(
            f"{today.day}/{today.month}", "Không Có"
        )
        lunar_holiday = (
            NGAY_LE_AL.get(f"{lunar.day}/{lunar.month}")
            if lunar.leap == 0
            else None
        ) or "Không Có"
        day_info = NGAY_THONG_TIN.get(can_chi_day, {})

        value = f"{weekday}, {lunar.day} {month_name} năm {can_chi_year}"
        attributes = {
            "solar_date": today.strftime("%d/%m/%Y"),
            "weekday": weekday,
            "lunar_day": lunar.day,
            "lunar_month": lunar.month,
            "lunar_year": lunar.year,
            "is_leap_month": lunar.leap == 1,
            "month_name": month_name,
            "lunar_month_type": lunar_month_type,
            "lunar_date": f"{lunar.day:02}/{lunar.month:02}/{lunar.year}",
            "can_chi_day": can_chi_day,
            "can_chi_month": can_chi_month,
            "can_chi_year": can_chi_year,
            "can_chi_hour_0": get_can_hour_0(jd),
            "solar_holiday": solar_holiday,
            "lunar_holiday": lunar_holiday,
            "tiet_khi": get_tiet_khi(jd),
            "gio_hoang_dao": get_gio_hoang_dao(jd),
            "gio_hac_dao": get_gio_hac_dao(jd),
            "huong_xuat_hanh": get_huong_xuat_hanh(jd),
            "thap_nhi_truc": get_thap_nhi_truc(jd),
            "nhi_thap_bat_tu": get_nhi_thap_bat_tu(jd),
            "ngay_chi_tiet": day_info.get("chiTiet", []),
            "ngay_mo_ta": day_info.get("moTa", ""),
        }
        return CalculatedState(value, attributes)


class AmLichEventSensor(DailyCalculatedSensor):
    """Countdown sensor for a recurring lunar event."""

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__()
        self._entry = entry
        self._attr_unique_id = f"amlich_event_{entry.entry_id}"
        self._attr_icon = "mdi:calendar-clock"
        self._attr_native_unit_of_measurement = "ngày"
        self._attr_name = entry.options.get(
            "event_name", entry.data.get("event_name", "Sự kiện")
        )

    def _calculate_state(self, today: date) -> CalculatedState:
        event_name = self._entry.options.get(
            "event_name", self._entry.data.get("event_name", "Sự kiện")
        )
        event_day = self._entry.options.get(
            "event_day", self._entry.data.get("event_day")
        )
        event_month = self._entry.options.get(
            "event_month", self._entry.data.get("event_month")
        )
        event_year = self._entry.options.get(
            "event_year", self._entry.data.get("event_year")
        )
        event_description = self._entry.options.get(
            "event_description", self._entry.data.get("event_description", "")
        )
        birth_day = self._entry.options.get(
            "birth_day", self._entry.data.get("birth_day")
        )
        birth_month = self._entry.options.get(
            "birth_month", self._entry.data.get("birth_month")
        )
        birth_year = self._entry.options.get(
            "birth_year", self._entry.data.get("birth_year")
        )

        if event_day is None or event_month is None:
            old_date = self._entry.options.get(
                "event_date", self._entry.data.get("event_date", "1/1")
            )
            try:
                parts = old_date.replace("-", "/").split("/")
                event_day, event_month = int(parts[0]), int(parts[1])
            except (AttributeError, IndexError, TypeError, ValueError):
                event_day, event_month = 1, 1

        try:
            target_day, target_month = int(event_day), int(event_month)
        except (TypeError, ValueError):
            target_day, target_month = 1, 1

        try:
            event_year = int(event_year) if event_year else None
        except (TypeError, ValueError):
            event_year = None
        try:
            birth_year = int(birth_year) if birth_year else None
        except (TypeError, ValueError):
            birth_year = None

        lunar_event_text = f"{target_day}/{target_month}"
        historical_solar_text = "Không rõ"
        historical_weekday = "Không rõ"
        event_year_can_chi = "Không rõ"

        if event_year is not None:
            lunar_event_text = f"{target_day}/{target_month}/{event_year}"
            event_year_can_chi = f"{get_year_can_chi(event_year)}/{event_year}"
            try:
                historical_year = get_year_info(event_year)
                for index, month_info in enumerate(historical_year):
                    if month_info.month != target_month or month_info.leap != 0:
                        continue
                    month_length = get_lunar_month_length(
                        historical_year[index]
                    )
                    actual_day = min(target_day, month_length)
                    solar_day, solar_month, solar_year = jd_to_date(
                        month_info.jd + actual_day - 1
                    )
                    historical_date = date(solar_year, solar_month, solar_day)
                    historical_solar_text = historical_date.strftime("%d/%m/%Y")
                    historical_weekday = THU[historical_date.weekday()]
                    break
            except (IndexError, TypeError, ValueError):
                pass

        lunar_today = get_lunar_date(today.day, today.month, today.year)
        if not lunar_today:
            return CalculatedState("Lỗi", {}, str(event_name))

        repeat = normalize_repeat(
            self._entry.options.get("event_repeat", self._entry.data.get("event_repeat"))
        )
        event_date = next_lunar_occurrence(today, target_day, target_month, repeat)
        if event_date is None:
            return CalculatedState("Không tính được", {}, str(event_name))
        occurrence_lunar = get_lunar_date(event_date.day, event_date.month, event_date.year)
        occurrence_year = occurrence_lunar.year if occurrence_lunar else lunar_today.year
        days_left = (event_date - today).days
        years_elapsed = (
            occurrence_year - event_year if event_year is not None else 0
        )
        age = (
            event_year - birth_year
            if event_year is not None and birth_year is not None
            else 0
        )

        attributes: dict[str, Any] = {
            "ngay_am_lich_su_kien": lunar_event_text,
            "ngay_duong_lich_su_kien": historical_solar_text,
            "thu_su_kien": historical_weekday,
            "nam_can_chi_su_kien": event_year_can_chi,
            "ngay_duong_lich_hien_tai": event_date.strftime("%d/%m/%Y"),
            "thu_hien_tai": THU[event_date.weekday()],
            "so_nam": years_elapsed,
            "lap_lai": repeat,
            "chi_tiet": event_description,
        }
        if birth_day or birth_month or birth_year:
            birth_parts = [
                str(value)
                for value in (birth_day, birth_month, birth_year)
                if value not in (None, "")
            ]
            attributes["ngay_thang_nam_sinh"] = "/".join(birth_parts)
        attributes["so_tuoi"] = age

        return CalculatedState(days_left, attributes, str(event_name))


class DuongLichEventSensor(DailyCalculatedSensor):
    """Countdown sensor for a recurring solar event."""

    def __init__(self, entry: ConfigEntry) -> None:
        super().__init__()
        self._entry = entry
        self._attr_unique_id = f"duonglich_event_{entry.entry_id}"
        self._attr_icon = "mdi:calendar-star"
        self._attr_native_unit_of_measurement = "ngày"
        self._attr_name = entry.options.get(
            "event_name", entry.data.get("event_name", "Sự kiện")
        )

    def _calculate_state(self, today: date) -> CalculatedState:
        event_name = self._entry.options.get(
            "event_name", self._entry.data.get("event_name", "Sự kiện")
        )
        event_day = self._entry.options.get(
            "event_day", self._entry.data.get("event_day")
        )
        event_month = self._entry.options.get(
            "event_month", self._entry.data.get("event_month")
        )
        event_year = self._entry.options.get(
            "event_year", self._entry.data.get("event_year")
        )
        event_description = self._entry.options.get(
            "event_description", self._entry.data.get("event_description", "")
        )

        if event_day is None or event_month is None:
            old_date = self._entry.options.get(
                "event_date", self._entry.data.get("event_date", "1/1")
            )
            try:
                parts = old_date.replace("-", "/").split("/")
                event_day, event_month = int(parts[0]), int(parts[1])
            except (AttributeError, IndexError, TypeError, ValueError):
                event_day, event_month = 1, 1

        try:
            target_day, target_month = int(event_day), int(event_month)
        except (TypeError, ValueError):
            target_day, target_month = 1, 1
        try:
            event_year = int(event_year) if event_year else None
        except (TypeError, ValueError):
            event_year = None

        solar_event_text = f"{target_day}/{target_month}"
        historical_lunar_text = "Không rõ"
        historical_weekday = "Không rõ"
        event_year_can_chi = "Không rõ"

        if event_year is not None:
            solar_event_text = f"{target_day}/{target_month}/{event_year}"
            event_year_can_chi = f"{get_year_can_chi(event_year)}/{event_year}"
            try:
                historical_date = date(event_year, target_month, target_day)
                historical_weekday = THU[historical_date.weekday()]
                historical_lunar = get_lunar_date(
                    target_day, target_month, event_year
                )
                if historical_lunar:
                    historical_lunar_text = (
                        f"{historical_lunar.day}/{historical_lunar.month}/"
                        f"{historical_lunar.year}"
                    )
                    if historical_lunar.leap == 1:
                        historical_lunar_text += " (Nhuận)"
            except ValueError:
                pass

        repeat = normalize_repeat(
            self._entry.options.get("event_repeat", self._entry.data.get("event_repeat"))
        )
        next_event = next_solar_occurrence(today, target_day, target_month, repeat)
        if next_event is None:
            return CalculatedState("Ngày không hợp lệ", {}, str(event_name))
        target_year = next_event.year
        days_left = (next_event - today).days
        years_elapsed = target_year - event_year if event_year is not None else 0
        lunar_equivalent = get_lunar_date(
            next_event.day, next_event.month, next_event.year
        )
        current_lunar_text = "Không tính được"
        if lunar_equivalent:
            current_lunar_text = (
                f"{lunar_equivalent.day}/{lunar_equivalent.month}"
                + (" (Nhuận)" if lunar_equivalent.leap == 1 else "")
                + f"/{get_year_can_chi(lunar_equivalent.year)}"
            )

        attributes = {
            "ngay_duong_lich_su_kien": solar_event_text,
            "ngay_am_lich_su_kien": historical_lunar_text,
            "thu_su_kien": historical_weekday,
            "nam_can_chi_su_kien": event_year_can_chi,
            "ngay_am_lich_hien_tai": current_lunar_text,
            "thu_hien_tai": THU[next_event.weekday()],
            "so_nam": years_elapsed,
            "lap_lai": repeat,
            "chi_tiet": event_description,
        }
        return CalculatedState(days_left, attributes, str(event_name))
