"""Kiểm tra tích hợp trong một Home Assistant giả lập: luồng nhập, thực thể Lịch, cảm biến, dịch vụ nhập events.db."""

from __future__ import annotations

import sqlite3
from datetime import date, datetime, timedelta
from unittest.mock import patch

import pytest
from homeassistant.config_entries import SOURCE_IMPORT
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.lich_viet.const import DOMAIN


async def _nhap(hass: HomeAssistant, **data):
    return await hass.config_entries.flow.async_init(DOMAIN, context={"source": SOURCE_IMPORT}, data=data)


async def _dung_chinh(hass: HomeAssistant):
    with patch("custom_components.lich_viet._async_register_frontend_resources"):
        main = MockConfigEntry(domain=DOMAIN, data={"is_main": True}, unique_id="amlich_main", title="Âm lịch Việt Nam")
        main.add_to_hass(hass)
        assert await hass.config_entries.async_setup(main.entry_id)
        await hass.async_block_till_done()
    return main


async def test_luong_nhap_tao_su_kien_va_chong_trung(hass: HomeAssistant):
    r = await _nhap(hass, event_type="lunar", event_name="Rằm", event_day=15, event_month=1, event_repeat="monthly")
    assert r["type"] == FlowResultType.CREATE_ENTRY and r["data"]["event_repeat"] == "monthly" and r["data"]["event_type"] == "lunar"
    again = await _nhap(hass, event_type="lunar", event_name="Rằm", event_day=15, event_month=1, event_repeat="monthly")
    assert again["type"] == FlowResultType.ABORT and again["reason"] == "already_configured"
    khac = await _nhap(hass, event_type="lunar", event_name="Rằm", event_day=15, event_month=1, event_repeat="yearly")
    assert khac["type"] == FlowResultType.CREATE_ENTRY            # khác kiểu lặp thì là sự kiện khác


@pytest.mark.parametrize(
    "data, ly_do",
    [
        (dict(event_type="solar", event_name="Sai", event_day=31, event_month=4), "invalid_solar_date"),
        (dict(event_type="lunar", event_name="Sai", event_day=31, event_month=1), "invalid_lunar_date"),
        (dict(event_type="solar", event_name="", event_day=1, event_month=1), "event_name_required"),
    ],
)
async def test_luong_nhap_tu_choi_du_lieu_sai(hass: HomeAssistant, data, ly_do):
    r = await _nhap(hass, **data)
    assert r["type"] == FlowResultType.ABORT and r["reason"] == ly_do


async def test_thuc_the_lich_tra_su_kien_qua_dich_vu_calendar(hass: HomeAssistant):
    await _nhap(hass, event_type="lunar", event_name="Tết", event_day=1, event_month=1, event_repeat="yearly")
    await _nhap(hass, event_type="solar", event_name="Quốc khánh", event_day=2, event_month=9, event_repeat="yearly")
    await _dung_chinh(hass)
    assert hass.states.get("calendar.su_kien") is not None
    kq = await hass.services.async_call(
        "calendar", "get_events", {"entity_id": "calendar.su_kien", "start_date_time": "2026-01-01 00:00:00", "end_date_time": "2026-12-31 23:00:00"},
        blocking=True, return_response=True,
    )
    ev = kq["calendar.su_kien"]["events"]
    assert [(e["summary"], e["start"]) for e in ev] == [("Tết", "2026-02-17"), ("Quốc khánh", "2026-09-02")]


async def test_cam_bien_dem_nguoc_dung_ngay(hass: HomeAssistant, freezer):
    freezer.move_to("2026-10-24 10:00:00+07:00")
    await hass.config.async_set_time_zone("Asia/Ho_Chi_Minh")
    await _nhap(hass, event_type="lunar", event_name="Rằm hằng tháng", event_day=15, event_month=1, event_repeat="monthly")
    await _nhap(hass, event_type="solar", event_name="Noel", event_day=25, event_month=12, event_repeat="yearly")
    await _dung_chinh(hass)
    states = {s.attributes.get("friendly_name"): s for s in hass.states.async_all("sensor")}
    # 24/10/2026 là 15/9 âm: Rằm hằng tháng rơi vào hôm nay → còn 0 ngày
    assert states["Rằm hằng tháng"].state == "0" and states["Rằm hằng tháng"].attributes["lap_lai"] == "monthly"
    assert states["Noel"].state == str((date(2026, 12, 25) - date(2026, 10, 24)).days)


def _tao_db(duong_dan, dong):
    c = sqlite3.connect(duong_dan)
    c.execute("CREATE TABLE events (id INTEGER PRIMARY KEY, tendukien TEXT, loaisukien TEXT, ngayam INT, thangam INT, namam INT, ngayduong INT, thangduong INT, namduong INT, mota TEXT, laplai TEXT)")
    c.executemany("INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?)", dong)
    c.commit(); c.close()


async def test_dich_vu_nhap_amlich_db(hass: HomeAssistant, tmp_path):
    db = tmp_path / "events.db"
    _tao_db(db, [
        (1, "Giỗ ông", "lunar", 16, 12, 2010, None, None, None, "ghi chú", "yearly"),
        (2, "Mùng 1", "lunar", 1, None, None, None, None, None, "", "monthly"),
        (3, "Sinh nhật", "solar", None, None, None, 3, 7, 1990, "", "yearly"),
        (4, "Họp một lần", "solar", None, None, None, 1, 1, 2030, "", "none"),
    ])
    hass.config.allowlist_external_dirs.add(str(tmp_path))
    await _dung_chinh(hass)
    kq = await hass.services.async_call(DOMAIN, "nhap_tu_amlich_db", {"path": str(db)}, blocking=True, return_response=True)
    assert kq["da_nhap"] == 3 and kq["da_co_san"] == 0 and [b["ten"] for b in kq["bo_qua"]] == ["Họp một lần"]
    lan2 = await hass.services.async_call(DOMAIN, "nhap_tu_amlich_db", {"path": str(db)}, blocking=True, return_response=True)
    assert lan2["da_nhap"] == 0 and lan2["da_co_san"] == 3                       # chạy lại không tạo trùng
    ten = sorted(e.title for e in hass.config_entries.async_entries(DOMAIN) if not e.data.get("is_main"))
    assert ten == ["Giỗ ông", "Mùng 1", "Sinh nhật"]


async def test_dich_vu_nhap_tu_choi_duong_dan_ngoai_va_file_hong(hass: HomeAssistant, tmp_path):
    from homeassistant.exceptions import ServiceValidationError
    await _dung_chinh(hass)
    with pytest.raises(ServiceValidationError):                       # ngoài thư mục được phép
        await hass.services.async_call(DOMAIN, "nhap_tu_amlich_db", {"path": "/etc/passwd"}, blocking=True, return_response=True)
    (tmp_path / "hong.db").write_bytes(b"khong phai sqlite")
    hass.config.allowlist_external_dirs.add(str(tmp_path))
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(DOMAIN, "nhap_tu_amlich_db", {"path": str(tmp_path / "hong.db")}, blocking=True, return_response=True)
