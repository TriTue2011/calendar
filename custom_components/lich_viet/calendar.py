"""Thực thể Lịch (calendar) của Lịch Việt: hiện mọi sự kiện âm/dương lịch trên màn hình Lịch của Home Assistant."""

from __future__ import annotations

from datetime import date, datetime, timedelta
import logging
from typing import Any

from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from .const import DOMAIN
from .su_kien import (
    lunar_occurrences,
    normalize_repeat,
    solar_occurrences,
)

_LOGGER = logging.getLogger(__name__)

SCAN_INTERVAL = timedelta(hours=1)
#: Cửa sổ tìm «sự kiện kế tiếp» để hiển thị trạng thái thực thể.
NEXT_WINDOW_DAYS = 400


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Chỉ entry chính mới có thực thể Lịch tổng hợp."""
    async_add_entities([LichVietCalendar(entry)], update_before_add=True)   # tính sự kiện hôm nay ngay, không đợi lần thăm dò đầu


def _option(entry: ConfigEntry, key: str, default: Any = None) -> Any:
    return entry.options.get(key, entry.data.get(key, default))


def _int_or_none(value: Any) -> int | None:
    try:
        return int(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def collect_events(
    entries: list[ConfigEntry], start: date, end: date
) -> list[CalendarEvent]:
    """Mọi lần xảy ra trong [start, end] (gồm cả hai đầu) của các sự kiện đã cấu hình."""
    events: list[CalendarEvent] = []
    for entry in entries:
        if entry.data.get("is_main", entry.data.get("event_name") is None):
            continue
        name = str(_option(entry, "event_name", entry.title or "Sự kiện"))
        day, month = _int_or_none(_option(entry, "event_day")), _int_or_none(_option(entry, "event_month"))
        if day is None:
            continue
        origin_year = _int_or_none(_option(entry, "event_year"))
        repeat = normalize_repeat(_option(entry, "event_repeat"))
        kind = _option(entry, "event_type", "lunar")
        description = str(_option(entry, "event_description", "") or "")
        if kind == "solar":
            dates = solar_occurrences(start, end, day, month, repeat, origin_year)
            label = f"{day}/{month} dương lịch" if repeat == "yearly" else f"ngày {day} hằng tháng (dương lịch)"
        else:
            dates = lunar_occurrences(start, end, day, month, repeat, origin_year)
            label = f"{day}/{month} âm lịch" if repeat == "yearly" else f"ngày {day} hằng tháng (âm lịch)"
        text = f"{label}\n{description}".strip() if description else label
        for when in dates:
            events.append(
                CalendarEvent(
                    summary=name,
                    start=when,
                    end=when + timedelta(days=1),
                    description=text,
                    uid=f"{entry.entry_id}_{when:%Y%m%d}",
                )
            )
    events.sort(key=lambda event: (event.start, event.summary))
    return events


class LichVietCalendar(CalendarEntity):
    """Lịch tổng hợp mọi sự kiện âm/dương lịch của Lịch Việt."""

    _attr_has_entity_name = True
    _attr_name = "Sự kiện"
    _attr_icon = "mdi:calendar-star"

    def __init__(self, entry: ConfigEntry) -> None:
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_lich_su_kien"
        self._event: CalendarEvent | None = None

    @property
    def event(self) -> CalendarEvent | None:
        """Sự kiện hôm nay hoặc sự kiện sắp tới gần nhất."""
        return self._event

    def _entries(self) -> list[ConfigEntry]:
        return self.hass.config_entries.async_entries(DOMAIN)

    async def async_update(self) -> None:
        today = dt_util.now().date()
        found = collect_events(self._entries(), today, today + timedelta(days=NEXT_WINDOW_DAYS))
        self._event = found[0] if found else None

    async def async_get_events(
        self, hass: HomeAssistant, start_date: datetime, end_date: datetime
    ) -> list[CalendarEvent]:
        """Sự kiện trong khoảng [start_date, end_date) mà màn hình Lịch yêu cầu."""
        start = dt_util.as_local(start_date).date()
        end_local = dt_util.as_local(end_date)
        end = end_local.date()
        if end_local.time() == datetime.min.time():
            end -= timedelta(days=1)  # đầu mút cuối là nửa mở: 00:00 không tính ngày đó
        return collect_events(self._entries(), start, end)
