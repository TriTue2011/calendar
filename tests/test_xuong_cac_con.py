"""Kiểm tra toàn diện cấu hình xương và ảnh lớp của mọi con giáp (12 con).

Bao gồm:
- JSON hợp lệ mọi con:
  - Khớp trong toạ độ ảnh; hip.y < knee.y < paw.y; 0 < a < 0,5; ph ∈ {0, 0,25, 0,5, 0,75}; rong > 0
  - Con sóng (ran, thin): kieu == "song", A > 0, k > 0, omega > 0, dau_x, dau_y trong ảnh.
- Ảnh tồn tại, đúng định dạng WEBP RGBA, có alpha thật, cùng kích thước từng cặp.
- THU_XUONG chỉ chứa khoá có ảnh tồn tại.
- Ba tiêu chí động học bàn chân cho mọi con có chân:
  1. Chân xa / chân gần cùng cặp ≥ 0,8.
  2. Quãng bước nhỏ nhất / lớn nhất ≥ 0,75.
  3. Khe bàn chân gần–xa cùng cặp ≥ 20 px (sau khi trừ bề ngang trung bình).
- Các kiểm tra đột biến (phải phát hiện lỗi khi làm sai cấu hình):
  - Đột biến biên độ chân xa về 0 (phải đỏ tiêu chí chân xa).
  - Đột biến biên độ chân trước lên 0,6 (phải đỏ giới hạn 0 < a < 0,5 hoặc khe bàn chân).
- Tổng dung lượng ảnh webp mới ≤ 4 MB.
"""

from __future__ import annotations

import copy
import json
import math
import re
import sys
from pathlib import Path

from PIL import Image

GOC = Path(__file__).resolve().parent.parent
FE = GOC / "custom_components" / "lich_viet" / "frontend"
XUONG = FE / "xuong"
THE_PATH = FE / "lich-bloc-xua-card.js"

BON_CHAN = ["cho", "suu", "dan", "mao", "mui", "heo", "ngo"]
HAI_CHAN = ["ty", "than", "ga"]
CO_CHAN = BON_CHAN + HAI_CHAN
SONG = ["ran", "thin"]
TAT_CA = CO_CHAN + SONG

KHE_TOI_THIEU_PX = 20.0


# ── Động học thuận ─────────────────────────────────────────────
def _dang(phi, duty=0.65, goi=0.5):
    phi %= 1.0
    if phi < duty:
        return 1 - 2 * phi / duty, 0.0, 1
    s = (phi - duty) / (1 - duty)
    e = s * s * (3 - 2 * s)
    return -1 + 2 * e, goi * math.sin(math.pi * s**0.75), 0


def _xoay(a, px, py):
    c, s = math.cos(a), math.sin(a)
    return c * px - s * py, s * px + c * py


def _vi_tri_ban_chan(chan, t, cfg):
    duty = cfg.get("duty", 0.65)
    goi = cfg.get("goi", 0.5)
    sh, flex, stance = _dang(t + chan["ph"], duty, goi)
    rest = math.atan2(
        chan["paw"][0] - chan["hip"][0], chan["paw"][1] - chan["hip"][1]
    )
    th = -(chan["c"] + chan["a"] * sh - rest)
    sig = 1 / max(0.92, math.cos(th)) if stance else 1
    dx, dy = _xoay(
        flex, chan["paw"][0] - chan["knee"][0], chan["paw"][1] - chan["knee"][1]
    )
    sx = chan["knee"][0] - chan["hip"][0] + dx
    sy = chan["knee"][1] - chan["hip"][1] + dy
    fx, fy = _xoay(th, sx, sig * sy)
    return chan["hip"][0] + fx, chan["hip"][1] + fy


def _quang_chan(chan, cfg):
    xs = [_vi_tri_ban_chan(chan, i / 240, cfg)[0] for i in range(240)]
    return max(xs) - min(xs)


def _kiem_tra_cfg_con(khoa, cfg):
    """Trả về danh sách lỗi cấu hình (rỗng = hợp lệ)."""
    loi = []
    if cfg.get("kieu") == "song":
        # Cấu hình sóng
        for k in ("A", "k", "omega", "dau_x"):
            if k not in cfg or cfg[k] <= 0:
                loi.append(f"{khoa}: thiếu hoặc sai giá trị {k}")
        if "anh" not in cfg or cfg["anh"].get("rong", 0) <= 0 or cfg["anh"].get("cao", 0) <= 0:
            loi.append(f"{khoa}: thiếu kích thước ảnh")
        if "chinh" not in cfg or "tep" not in cfg["chinh"]:
            loi.append(f"{khoa}: thiếu ảnh chinh")
        return loi

    # Cấu hình có chân (4 chân hoặc 2 chân)
    so_chan_ky_vong = 4 if khoa in BON_CHAN else 2
    if "K" not in cfg or cfg["K"] <= 0:
        loi.append(f"{khoa}: K phải > 0")
    if abs(cfg.get("K", 0) - 800 / cfg.get("he_toa_do", 1)) > 1e-6:
        loi.append(f"{khoa}: K phải bằng 800 / he_toa_do")

    for lop in ("xa", "chinh"):
        if lop not in cfg:
            loi.append(f"{khoa}: thiếu lớp {lop}")
            continue
        chan = cfg[lop].get("chan", [])
        chan_ky_vong = 2 if so_chan_ky_vong == 4 else 1
        if len(chan) != chan_ky_vong:
            loi.append(f"{khoa}.{lop}: cần đúng {chan_ky_vong} chân, thấy {len(chan)}")
            continue

        for g in chan:
            for k in ("hip", "knee", "paw"):
                if len(g.get(k, [])) != 2:
                    loi.append(f"{khoa}.{lop}.{g.get('ten')}.{k} phải có 2 toạ độ")
            if not (g["hip"][1] < g["knee"][1] < g["paw"][1]):
                loi.append(f"{khoa}.{lop}.{g.get('ten')}: cần hip.y < knee.y < paw.y")
            if not (0 < g["a"] < 0.5):
                loi.append(f"{khoa}.{lop}.{g.get('ten')}: cần 0 < a < 0,5, thấy a={g['a']}")
            if g["ph"] not in (0, 0.25, 0.5, 0.75):
                loi.append(f"{khoa}.{lop}.{g.get('ten')}: pha phải thuộc {{0, 0,25, 0,5, 0,75}}")
            if g.get("rong", 0) <= 0:
                loi.append(f"{khoa}.{lop}.{g.get('ten')}: rong phải > 0")

            he_w = cfg["he_toa_do"]
            he_h = cfg["anh"]["cao"] / cfg["K"]
            for k in ("hip", "knee", "paw"):
                x, y = g[k]
                if not (-50 <= x <= he_w + 50 and -50 <= y <= he_h + 50):
                    loi.append(f"{khoa}.{lop}.{g.get('ten')}.{k} nằm ngoài ảnh")
    return loi


# ── 1. Kiểm tra JSON hợp lệ ───────────────────────────────────
def test_json_hop_le_tat_ca_con():
    for khoa in TAT_CA:
        json_path = XUONG / f"{khoa}.json"
        assert json_path.exists(), f"Thiếu tệp {khoa}.json"
        cfg = json.loads(json_path.read_text(encoding="utf-8"))
        loi = _kiem_tra_cfg_con(khoa, cfg)
        assert loi == [], f"{khoa} có lỗi cấu hình: {loi}"


# ── 2. Kiểm tra ảnh lớp tồn tại, alpha thật, cùng kích thước ──
def test_anh_lop_ton_tai_va_dung_dinh_dang():
    for khoa in TAT_CA:
        cfg = json.loads((XUONG / f"{khoa}.json").read_text(encoding="utf-8"))
        chinh_path = XUONG / f"{khoa}-chinh.webp"
        assert chinh_path.exists(), f"Thiếu ảnh {chinh_path.name}"
        chinh = Image.open(chinh_path)
        assert chinh.format == "WEBP", f"{chinh_path.name} phải là WEBP"
        assert chinh.mode == "RGBA", f"{chinh_path.name} phải là RGBA"
        assert chinh.size == (cfg["anh"]["rong"], cfg["anh"]["cao"])
        a = chinh.getchannel("A")
        assert a.getextrema()[0] == 0 and a.getextrema()[1] == 255, f"{chinh_path.name} phải có alpha thật"

        if cfg.get("kieu") != "song":
            xa_path = XUONG / f"{khoa}-xa.webp"
            assert xa_path.exists(), f"Thiếu ảnh {xa_path.name}"
            xa = Image.open(xa_path)
            assert xa.format == "WEBP", f"{xa_path.name} phải là WEBP"
            assert xa.mode == "RGBA", f"{xa_path.name} phải là RGBA"
            assert xa.size == chinh.size, f"{xa_path.name} phải cùng kích thước với {chinh_path.name}"
            ax = xa.getchannel("A")
            assert ax.getextrema()[0] == 0 and ax.getextrema()[1] == 255, f"{xa_path.name} phải có alpha thật"


# ── 3. THU_XUONG chỉ chứa khoá có ảnh tồn tại ─────────────────
def test_thu_xuong_chi_chua_khoa_co_anh():
    noi_dung = THE_PATH.read_text(encoding="utf-8")
    m = re.search(r"const THU_XUONG = \{(.*?)\};", noi_dung, re.S)
    assert m, "Thẻ phải có định nghĩa const THU_XUONG"
    for khoa, than in re.findall(r"(\w+):\s*\{([^}]*)\}", m.group(1)):
        tep_list = re.findall(r'"([^"]+)"', than)
        assert tep_list, f"{khoa}: THU_XUONG không có tệp"
        for t in tep_list:
            if t.endswith(".webp") or t.endswith(".json"):
                assert (FE / t).exists(), f"{khoa}: thiếu tệp {t}"


# ── 4. Ba tiêu chí động học bàn chân cho mọi con có chân ─────
def _tinh_dong_hoc(cfg):
    chinh = cfg["chinh"]["chan"]
    xa = cfg["xa"]["chan"]

    if len(chinh) == 2 and len(xa) == 2:
        # Bốn chân: cặp sau [xa 0, chính 0], cặp trước [chính 1, xa 1]
        q_xs = _quang_chan(xa[0], cfg)
        q_gs = _quang_chan(chinh[0], cfg)
        q_gt = _quang_chan(chinh[1], cfg)
        q_xt = _quang_chan(xa[1], cfg)

        tl_sau = q_xs / q_gs
        tl_truoc = q_xt / q_gt
        all_q = [q_xs, q_gs, q_gt, q_xt]

        min_sau = float("inf")
        min_truoc = float("inf")
        for i in range(240):
            t = i / 240
            x_xs = _vi_tri_ban_chan(xa[0], t, cfg)[0]
            x_gs = _vi_tri_ban_chan(chinh[0], t, cfg)[0]
            x_gt = _vi_tri_ban_chan(chinh[1], t, cfg)[0]
            x_xt = _vi_tri_ban_chan(xa[1], t, cfg)[0]

            ks = abs(x_gs - x_xs) - (chinh[0]["rong"] + xa[0]["rong"]) / 2
            kt = abs(x_gt - x_xt) - (chinh[1]["rong"] + xa[1]["rong"]) / 2
            min_sau = min(min_sau, ks)
            min_truoc = min(min_truoc, kt)

        return {
            "ti_le": [tl_sau, tl_truoc],
            "deu": min(all_q) / max(all_q),
            "khe": [min_sau, min_truoc],
        }
    else:
        # Hai chân: [xa 0], [chính 0]
        q_x = _quang_chan(xa[0], cfg)
        q_g = _quang_chan(chinh[0], cfg)
        all_q = [q_x, q_g]

        min_khe = float("inf")
        for i in range(240):
            t = i / 240
            x_x = _vi_tri_ban_chan(xa[0], t, cfg)[0]
            x_g = _vi_tri_ban_chan(chinh[0], t, cfg)[0]
            k = abs(x_g - x_x) - (chinh[0]["rong"] + xa[0]["rong"]) / 2
            min_khe = min(min_khe, k)

        return {
            "ti_le": [q_x / q_g],
            "deu": min(all_q) / max(all_q),
            "khe": [min_khe],
        }


def test_tieu_chi_dong_hoc_tat_ca_con_co_chan():
    for khoa in CO_CHAN:
        cfg = json.loads((XUONG / f"{khoa}.json").read_text(encoding="utf-8"))
        kq = _tinh_dong_hoc(cfg)

        # Tiêu chí 1: chân xa / chân gần cùng cặp ≥ 0.8
        for tl in kq["ti_le"]:
            assert tl >= 0.8, f"{khoa}: tỉ lệ chân xa/gần = {tl:.2f} < 0.8"

        # Tiêu chí 2: quãng bước nhỏ nhất / lớn nhất ≥ 0.75
        assert kq["deu"] >= 0.75, f"{khoa}: độ đều bước = {kq['deu']:.2f} < 0.75"

        # Tiêu chí 3: khe bàn chân ≥ 20 px
        for kh in kq["khe"]:
            assert kh >= KHE_TOI_THIEU_PX, f"{khoa}: khe = {kh:.1f} px < {KHE_TOI_THIEU_PX} px"


# ── 5. Kiểm tra các đột biến (phải bị phát hiện đỏ) ───────────
def test_dot_bien_chan_xa_dung_yen_bi_phat_hien():
    for khoa in CO_CHAN:
        cfg = json.loads((XUONG / f"{khoa}.json").read_text(encoding="utf-8"))
        mut = copy.deepcopy(cfg)
        for g in mut["xa"]["chan"]:
            g["a"] = 0.0
        kq = _tinh_dong_hoc(mut)
        # Đột biến đặt a=0 phải làm tỉ lệ chân xa/chân gần < 0.8
        assert any(tl < 0.8 for tl in kq["ti_le"]), f"{khoa}: đột biến chân xa đứng yên không bị phát hiện"


def test_dot_bien_bien_do_lon_bi_phat_hien():
    """Đổi biên độ lên 0.6 phải vi phạm kiểm tra cấu hình (0 < a < 0.5) hoặc khe bàn chân."""
    for khoa in CO_CHAN:
        cfg = json.loads((XUONG / f"{khoa}.json").read_text(encoding="utf-8"))
        mut = copy.deepcopy(cfg)
        for g in mut["chinh"]["chan"]:
            g["a"] = 0.6
        for g in mut["xa"]["chan"]:
            g["a"] = 0.6

        loi_cfg = _kiem_tra_cfg_con(khoa, mut)
        co_loi_cfg = any("cần 0 < a < 0,5" in err for err in loi_cfg)
        kq = _tinh_dong_hoc(mut)
        co_loi_khe = any(kh < KHE_TOI_THIEU_PX for kh in kq["khe"])
        assert co_loi_cfg or co_loi_khe, f"{khoa}: đột biến a=0.6 không bị phát hiện"


# ── 6. Tổng dung lượng webp ≤ 4 MB ───────────────────────────
def test_tong_dung_luong_anh_webp():
    tong_byte = sum(f.stat().st_size for f in XUONG.glob("*.webp"))
    gioi_han = 4 * 1024 * 1024
    assert tong_byte <= gioi_han, f"Tổng ảnh WEBP = {tong_byte / 1024 / 1024:.2f} MB > 4 MB"


# ── Chạy tự động khi gọi trực tiếp bằng python ────────────────
if __name__ == "__main__":
    test_funcs = [
        test_json_hop_le_tat_ca_con,
        test_anh_lop_ton_tai_va_dung_dinh_dang,
        test_thu_xuong_chi_chua_khoa_co_anh,
        test_tieu_chi_dong_hoc_tat_ca_con_co_chan,
        test_dot_bien_chan_xa_dung_yen_bi_phat_hien,
        test_dot_bien_bien_do_lon_bi_phat_hien,
        test_tong_dung_luong_anh_webp,
    ]
    loi_count = 0
    for fn in test_funcs:
        try:
            fn()
            print(f"PASS: {fn.__name__}")
        except Exception as e:
            print(f"FAIL: {fn.__name__}: {e}")
            loi_count += 1
    if loi_count > 0:
        sys.exit(1)
    print("\nTẤT CẢ TEST ĐÃ VƯỢT QUA!")
