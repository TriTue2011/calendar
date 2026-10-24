"""Tính ngày xảy ra của sự kiện lặp lại (âm lịch / dương lịch, hằng năm / hằng tháng).

Mô-đun thuần tính toán, dùng chung cho cảm biến đếm ngược và thực thể Lịch, để hai nơi
không bao giờ lệch nhau.

Quy ước (giữ nguyên hành vi của cảm biến gốc):
- Âm lịch, hằng năm: tháng thường (không nhuận) có số ``month``; ngày lớn hơn độ dài tháng
  (ví dụ 30 trong tháng thiếu 29 ngày) lùi về ngày cuối tháng.
- Âm lịch, hằng tháng: mọi tháng âm lịch kể cả tháng nhuận (tháng nào cũng có Rằm, mùng 1).
- Dương lịch, hằng năm: 29/2 ở năm không nhuận rơi vào 1/3; ngày không tồn tại khác thì bỏ qua.
- Dương lịch, hằng tháng: ngày lớn hơn độ dài tháng lùi về ngày cuối tháng.
"""

from __future__ import annotations

from calendar import monthrange
from datetime import date, timedelta

from .amlich_core import (
    get_lunar_date,
    get_lunar_month_length,
    get_year_info,
    jd_to_date,
    jdn,
)

YEARLY = "yearly"
MONTHLY = "monthly"
REPEATS = (YEARLY, MONTHLY)

#: Cửa sổ tìm «lần sắp tới»; đủ cho cả năm nhuận (hằng năm ≤ 385 ngày).
NEXT_HORIZON_DAYS = 800


def normalize_repeat(value: object) -> str:
    """Trả về ``yearly`` hoặc ``monthly``; giá trị lạ hoặc rỗng coi là hằng năm."""
    return MONTHLY if value == MONTHLY else YEARLY


def lunar_occurrences(
    start: date,
    end: date,
    day: int,
    month: int | None,
    repeat: str = YEARLY,
    from_year: int | None = None,
) -> list[date]:
    """Các ngày dương lịch trong [start, end] (gồm cả hai đầu) rơi vào sự kiện âm lịch.

    ``from_year``: bỏ qua các lần thuộc năm âm lịch nhỏ hơn giá trị này.
    """
    if end < start:
        return []
    first = get_lunar_date(start.day, start.month, start.year)
    last = get_lunar_date(end.day, end.month, end.year)
    if first is None or last is None:
        return []
    start_jd, end_jd = jdn(start.day, start.month, start.year), jdn(end.day, end.month, end.year)
    repeat = normalize_repeat(repeat)

    found: list[date] = []
    for lunar_year in range(first.year, last.year + 1):
        if from_year is not None and lunar_year < from_year:
            continue
        try:
            months = get_year_info(lunar_year)
        except ValueError:
            continue
        for info in months:
            if repeat == YEARLY and (info.month != month or info.leap != 0):
                continue
            actual_day = min(day, get_lunar_month_length(info))
            target_jd = info.jd + actual_day - 1
            if start_jd <= target_jd <= end_jd:
                d, m, y = jd_to_date(target_jd)
                found.append(date(y, m, d))
    return sorted(found)


def solar_occurrences(
    start: date,
    end: date,
    day: int,
    month: int | None,
    repeat: str = YEARLY,
    from_year: int | None = None,
) -> list[date]:
    """Các ngày dương lịch trong [start, end] (gồm cả hai đầu) rơi vào sự kiện dương lịch."""
    if end < start:
        return []
    repeat = normalize_repeat(repeat)
    found: list[date] = []
    for year in range(start.year, end.year + 1):
        if from_year is not None and year < from_year:
            continue
        months = [month] if repeat == YEARLY and month else range(1, 13)
        for m in months:
            last_day = monthrange(year, m)[1]
            if day <= last_day:
                target = date(year, m, day)
            elif repeat == MONTHLY:
                target = date(year, m, last_day)
            elif m == 2 and day == 29:
                target = date(year, 3, 1)
            else:
                continue
            if start <= target <= end:
                found.append(target)
    return sorted(found)


def next_lunar_occurrence(
    today: date, day: int, month: int | None, repeat: str = YEARLY
) -> date | None:
    """Lần sắp tới (kể cả hôm nay) của sự kiện âm lịch; None nếu ngoài phạm vi 1800–2199."""
    hits = lunar_occurrences(today, today + timedelta(days=NEXT_HORIZON_DAYS), day, month, repeat)
    return hits[0] if hits else None


def next_solar_occurrence(
    today: date, day: int, month: int | None, repeat: str = YEARLY
) -> date | None:
    """Lần sắp tới (kể cả hôm nay) của sự kiện dương lịch."""
    hits = solar_occurrences(today, today + timedelta(days=NEXT_HORIZON_DAYS), day, month, repeat)
    return hits[0] if hits else None
