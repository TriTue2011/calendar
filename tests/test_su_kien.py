"""Kiểm tra mô-đun tính ngày sự kiện bằng các ngày âm lịch đã biết và đối chiếu chéo với lõi."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from custom_components.lich_viet.amlich_core import get_lunar_date, get_lunar_month_length, get_year_info, jd_to_date
from custom_components.lich_viet.su_kien import (
    lunar_occurrences,
    next_lunar_occurrence,
    next_solar_occurrence,
    solar_occurrences,
)


def test_tet_va_trung_thu_dung_ngay_da_biet():
    assert lunar_occurrences(date(2026, 1, 1), date(2027, 12, 31), 1, 1) == [date(2026, 2, 17), date(2027, 2, 6)]
    assert lunar_occurrences(date(2026, 1, 1), date(2026, 12, 31), 15, 8) == [date(2026, 9, 25)]
    assert lunar_occurrences(date(2026, 1, 1), date(2026, 12, 31), 10, 3) == [date(2026, 4, 26)]  # Giỗ Tổ


def test_thang_12_dau_nam_duong_khong_lech_ca_nam():
    """Lỗi của bản gốc: 20/12 âm đầu năm dương bị trả về năm sau. Ở đây phải ra 7/2/2026."""
    assert next_lunar_occurrence(date(2026, 1, 10), 20, 12) == date(2026, 2, 7)
    assert next_lunar_occurrence(date(2027, 1, 10), 20, 12) == date(2027, 1, 27)


def test_hom_nay_tinh_la_lan_sap_toi():
    assert next_lunar_occurrence(date(2026, 2, 17), 1, 1) == date(2026, 2, 17)
    assert next_solar_occurrence(date(2026, 7, 4), 4, 7) == date(2026, 7, 4)


def test_ngay_30_trong_thang_thieu_lui_ve_ngay_cuoi_thang():
    # tháng 12 âm lịch 2026 chỉ có 29 ngày → ngày 30 lùi về 29/12 âm = 5/2/2027 (mùng 1 Tết là 6/2/2027)
    assert lunar_occurrences(date(2027, 1, 1), date(2027, 3, 1), 30, 12) == [date(2027, 2, 5)]


def test_thang_nhuan_hang_thang_co_ca_thang_nhuan_hang_nam_chi_thang_thuong():
    # năm 2025 nhuận tháng 6: mùng 1 tháng 6 = 25/6, mùng 1 tháng 6 nhuận = 25/7
    hang_thang = lunar_occurrences(date(2025, 6, 1), date(2025, 8, 31), 1, None, "monthly")
    assert date(2025, 6, 25) in hang_thang and date(2025, 7, 25) in hang_thang
    hang_nam = lunar_occurrences(date(2025, 1, 1), date(2025, 12, 31), 1, 6, "yearly")
    assert hang_nam == [date(2025, 6, 25)]


def test_hang_nam_khop_chinh_xac_voi_lunar_date_cua_loi():
    """Đối chiếu chéo: mọi ngày trong 2020–2035 mà lõi nói là (d/m, không nhuận) phải đúng bằng kết quả hàm."""
    dau, cuoi = date(2020, 1, 1), date(2035, 12, 31)
    moi_ngay = [dau + timedelta(days=i) for i in range((cuoi - dau).days + 1)]
    am = {d: get_lunar_date(d.day, d.month, d.year) for d in moi_ngay}
    for day in (1, 15, 29):
        for month in range(1, 13):
            mong_doi = [d for d in moi_ngay if am[d].day == day and am[d].month == month and am[d].leap == 0]
            assert lunar_occurrences(dau, cuoi, day, month) == mong_doi, (day, month)


def test_hang_thang_moi_thang_am_co_dung_mot_ngay():
    dau, cuoi = date(2026, 1, 1), date(2026, 12, 31)
    kq = lunar_occurrences(dau, cuoi, 15, None, "monthly")
    assert all(get_lunar_date(d.day, d.month, d.year).day == 15 for d in kq)
    assert len(kq) == len(set(kq)) and 12 <= len(kq) <= 14


def test_from_year_bo_qua_cac_nam_truoc():
    assert lunar_occurrences(date(2020, 1, 1), date(2030, 12, 31), 1, 1, from_year=2028) == [date(2028, 1, 26), date(2029, 2, 13), date(2030, 2, 2)]


def test_duong_lich_29_2_va_ngay_cuoi_thang():
    assert solar_occurrences(date(2026, 1, 1), date(2026, 12, 31), 29, 2) == [date(2026, 3, 1)]
    assert solar_occurrences(date(2028, 1, 1), date(2028, 12, 31), 29, 2) == [date(2028, 2, 29)]
    assert solar_occurrences(date(2026, 1, 1), date(2026, 12, 31), 31, 4) == []          # 31/4 không tồn tại
    thang = solar_occurrences(date(2026, 1, 1), date(2026, 6, 30), 31, None, "monthly")
    assert thang == [date(2026, 1, 31), date(2026, 2, 28), date(2026, 3, 31), date(2026, 4, 30), date(2026, 5, 31), date(2026, 6, 30)]


def test_ngoai_pham_vi_hoac_dau_cuoi_dao_nguoc_tra_rong():
    assert lunar_occurrences(date(2026, 5, 1), date(2026, 4, 1), 1, 1) == []
    assert solar_occurrences(date(2026, 5, 1), date(2026, 4, 1), 1, 1) == []


def test_ngay_tra_ve_nam_trong_cua_so_va_khong_trung_lap():
    kq = lunar_occurrences(date(2026, 1, 1), date(2030, 12, 31), 1, 1)
    assert kq == sorted(set(kq)) and all(date(2026, 1, 1) <= d <= date(2030, 12, 31) for d in kq)
