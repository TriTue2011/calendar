"""Đọc sự kiện từ ``events.db`` của tích hợp ``amlich`` (smarthomeblack) để nhập vào Lịch Việt.

Bảng nguồn ``events``: id, tendukien, loaisukien (solar|lunar), ngayam, thangam, namam,
ngayduong, thangduong, namduong, mota, laplai (none|yearly|monthly). Chỉ ĐỌC (mở chế độ chỉ-đọc).
"""

from __future__ import annotations

import sqlite3
from typing import Any

_SELECT = (
    "SELECT id, tendukien, loaisukien, ngayam, thangam, namam, "
    "ngayduong, thangduong, namduong, mota, laplai FROM events ORDER BY id"
)


def read_legacy_events(path: str) -> list[tuple]:
    """Đọc mọi dòng sự kiện; lỗi mở file hoặc thiếu bảng thì ném sqlite3.Error."""
    connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        return connection.execute(_SELECT).fetchall()
    finally:
        connection.close()


def _as_int(value: Any) -> int | None:
    try:
        number = int(float(str(value).strip()))
    except (TypeError, ValueError):
        return None
    return number or None


def convert_legacy_row(row: tuple) -> tuple[dict[str, Any] | None, str | None]:
    """Đổi một dòng cũ sang dữ liệu nhập: (dữ liệu, None) hoặc (None, lý do bỏ qua)."""
    _id, name, kind, l_day, l_month, l_year, s_day, s_month, s_year, note, repeat = row
    name = (name or "").strip()
    if not name:
        return None, "thiếu tên"
    if repeat not in ("yearly", "monthly"):
        return None, "sự kiện một lần (chưa hỗ trợ)"

    event_type = "solar" if kind == "solar" else "lunar"
    day, month, year = (
        (_as_int(s_day), _as_int(s_month), _as_int(s_year))
        if event_type == "solar"
        else (_as_int(l_day), _as_int(l_month), _as_int(l_year))
    )
    if day is None:
        return None, "thiếu ngày"
    if repeat == "yearly" and month is None:
        return None, "thiếu tháng"
    data: dict[str, Any] = {
        "event_type": event_type,
        "event_name": name,
        "event_day": day,
        "event_month": month or 1,   # hằng tháng: tháng không dùng nhưng form yêu cầu một giá trị
        "event_repeat": repeat,
        "event_description": (note or "").strip(),
    }
    if year:
        data["event_year"] = year
    return data, None
