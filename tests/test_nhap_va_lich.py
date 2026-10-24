"""Kiểm tra: đổi dòng events.db cũ sang sự kiện mới, tập sự kiện cho thực thể Lịch, và bộ sprite con giáp."""

from __future__ import annotations

import sqlite3
from datetime import date
from pathlib import Path
from types import SimpleNamespace

import pytest
from PIL import Image

from custom_components.lich_viet.calendar import collect_events
from custom_components.lich_viet.nhap_db import convert_legacy_row, read_legacy_events

THU = Path(__file__).resolve().parent.parent / "custom_components" / "lich_viet" / "frontend" / "thu"
CON_GIAP = ["ty", "suu", "dan", "mao", "thin", "ran", "ngo", "mui", "than", "ga", "cho", "heo"]


def _dong(**kw):
    base = dict(id=1, ten="Giỗ", loai="lunar", ngayam=15, thangam=8, namam=None, ngayduong=None, thangduong=None, namduong=None, mota="", laplai="yearly")
    base.update(kw)
    return (base["id"], base["ten"], base["loai"], base["ngayam"], base["thangam"], base["namam"], base["ngayduong"], base["thangduong"], base["namduong"], base["mota"], base["laplai"])


def test_dong_cu_am_lich_hang_nam_va_hang_thang():
    d, why = convert_legacy_row(_dong(ten="Rằm tháng 8", ngayam=15, thangam=8, namam=2015, mota=" ghi chú "))
    assert why is None and d["event_type"] == "lunar" and d["event_repeat"] == "yearly"
    assert (d["event_day"], d["event_month"], d["event_year"], d["event_description"]) == (15, 8, 2015, "ghi chú")
    d, _ = convert_legacy_row(_dong(ten="Mùng 1", ngayam=1, thangam=None, laplai="monthly"))
    assert d["event_repeat"] == "monthly" and d["event_month"] == 1 and "event_year" not in d  # tháng không dùng nhưng form cần một giá trị


def test_dong_cu_duong_lich_dung_cot_duong():
    d, _ = convert_legacy_row(_dong(ten="Sinh nhật", loai="solar", ngayam=None, thangam=None, ngayduong=3, thangduong=7, namduong=1990))
    assert d["event_type"] == "solar" and (d["event_day"], d["event_month"], d["event_year"]) == (3, 7, 1990)


@pytest.mark.parametrize(
    "dong, ly_do",
    [
        (_dong(ten="  "), "thiếu tên"),
        (_dong(laplai="none"), "một lần"),
        (_dong(ngayam=None), "thiếu ngày"),
        (_dong(thangam=None), "thiếu tháng"),
    ],
)
def test_dong_khong_nhap_duoc_co_ly_do(dong, ly_do):
    d, why = convert_legacy_row(dong)
    assert d is None and ly_do in why


def test_doc_events_db_chi_doc(tmp_path):
    db = tmp_path / "events.db"
    c = sqlite3.connect(db)
    c.execute("CREATE TABLE events (id INTEGER PRIMARY KEY, tendukien TEXT, loaisukien TEXT, ngayam INT, thangam INT, namam INT, ngayduong INT, thangduong INT, namduong INT, mota TEXT, laplai TEXT)")
    c.execute("INSERT INTO events VALUES (1,'Giỗ','lunar',15,8,NULL,NULL,NULL,NULL,'x','yearly')")
    c.commit(); c.close()
    rows = read_legacy_events(str(db))
    assert len(rows) == 1 and rows[0][1] == "Giỗ"
    with pytest.raises(sqlite3.Error):
        sqlite3.connect(f"file:{db}?mode=ro", uri=True).execute("INSERT INTO events (tendukien) VALUES ('ghi')")   # chế độ chỉ-đọc


def test_doc_events_db_thieu_bang_nem_loi(tmp_path):
    (tmp_path / "rong.db").write_bytes(b"")
    with pytest.raises(sqlite3.Error):
        read_legacy_events(str(tmp_path / "rong.db"))


def _entry(**data):
    return SimpleNamespace(entry_id=data.pop("entry_id", "e1"), title=data.get("event_name", ""), data={"is_main": False, **data}, options={})


def test_lich_liet_ke_su_kien_trong_khoang():
    e = [
        _entry(entry_id="a", event_type="lunar", event_name="Tết", event_day=1, event_month=1, event_repeat="yearly"),
        _entry(entry_id="b", event_type="solar", event_name="Quốc khánh", event_day=2, event_month=9, event_repeat="yearly", event_description="Lễ"),
        SimpleNamespace(entry_id="main", title="x", data={"is_main": True}, options={}),
    ]
    sk = collect_events(e, date(2026, 1, 1), date(2026, 12, 31))
    assert [(x.summary, x.start) for x in sk] == [("Tết", date(2026, 2, 17)), ("Quốc khánh", date(2026, 9, 2))]
    assert sk[0].end == date(2026, 2, 18) and sk[1].description.endswith("Lễ")


def test_lich_hang_thang_va_nam_goc():
    e = [_entry(entry_id="m", event_type="lunar", event_name="Rằm", event_day=15, event_month=1, event_repeat="monthly"),
         _entry(entry_id="g", event_type="lunar", event_name="Giỗ", event_day=1, event_month=1, event_year=2028, event_repeat="yearly")]
    thang = [x for x in collect_events(e, date(2026, 1, 1), date(2026, 12, 31)) if x.summary == "Rằm"]
    assert 12 <= len(thang) <= 14
    assert [x for x in collect_events(e, date(2026, 1, 1), date(2027, 12, 31)) if x.summary == "Giỗ"] == []      # trước năm gốc 2028


def test_uid_su_kien_khac_nhau_moi_lan():
    e = [_entry(entry_id="m", event_type="lunar", event_name="Rằm", event_day=15, event_month=1, event_repeat="monthly")]
    uids = [x.uid for x in collect_events(e, date(2026, 1, 1), date(2026, 12, 31))]
    assert len(uids) == len(set(uids))


@pytest.mark.parametrize("khoa", CON_GIAP)
def test_sprite_con_giap_day_du_va_nhe(khoa):
    p = THU / f"{khoa}.webp"
    assert p.exists(), f"thiếu {p.name}"
    im = Image.open(p)
    assert im.format == "WEBP" and im.mode in ("RGBA", "LA") and im.width % 5 == 0 and im.height % 2 == 0   # lưới 5×2: 8 khung bước + 2 khung đứng nghỉ
    assert p.stat().st_size < 300_000                      # mỗi sprite sheet dưới 300 KB
    assert im.getchannel("A").getextrema()[0] == 0          # có vùng trong suốt (đã bỏ nền)


KHONG_CHAN = {"ran", "thin"}


def _khung(im, i):
    import numpy as np
    fw, fh = im.width // 5, im.height // 2
    return np.array(im.crop(((i % 5) * fw, (i // 5) * fh, (i % 5 + 1) * fw, (i // 5 + 1) * fh)).convert("RGBA"))[:, :, 3] > 40


def _iou(a, b):
    return float((a & b).sum()) / max(1, float((a | b).sum()))


@pytest.mark.parametrize("khoa", CON_GIAP)
def test_chu_ky_buoc_co_dong_tac_that(khoa):
    """Lớp lỗi từng xảy ra: sprite 12 khung do AI vẽ có chân gần như đứng yên (bàn chân cố định qua cả chu kỳ),
    nên làm chậm hay nhanh đều không giống bước đi. Đo trên dữ liệu thật: hai khung khác nhau nhất trong chu kỳ
    phải có dáng chân KHÁC nhau rõ (IoU vùng chân ≤ 0,62 với con có chân); rắn/rồng phải có sóng uốn khác pha."""
    im = Image.open(THU / f"{khoa}.webp")
    f = [_khung(im, i) for i in range(10)]
    h = f[0].shape[0]
    if khoa in KHONG_CHAN:
        assert _iou(f[0], f[4]) <= 0.80, "khung 0 và 4 (lệch nửa chu kỳ) gần như trùng, thân không uốn"
    else:
        chan = lambda m: m[int(h * 0.65):, :]    # vùng chân: 35% dưới của khung
        gan_nhat = min(_iou(chan(f[i]), chan(f[j])) for i in range(8) for j in range(i + 1, 8))
        assert gan_nhat <= 0.62, "trong cả chu kỳ không có hai khung nào chân khác nhau rõ: chân gần như đứng yên"
        assert _iou(chan(f[8]), chan(f[0])) <= 0.90, "tư thế đứng nghỉ giống hệt tư thế bước"


NEN = Path(__file__).resolve().parent.parent / "custom_components" / "lich_viet" / "frontend" / "nen"


@pytest.mark.parametrize("khoa", CON_GIAP)
def test_anh_nen_du_12_thang_va_nhe(khoa):
    for thang in range(1, 13):
        p = NEN / f"{khoa}-{thang}.webp"
        assert p.exists(), f"thiếu {p.name}"
        assert p.stat().st_size < 80_000, f"{p.name} quá nặng"
        w, h = Image.open(p).size
        assert 1.8 <= w / h <= 2.2, f"{p.name} sai tỉ lệ 2:1 ({w}x{h})"
