"""Dựng cấu hình xương tự động từ ảnh _4chan.png (nền trắng, chân rời nhau).

Dùng:  python dung_xuong.py <khoá> [--so-chan 4|2|0] [--rong 800]
       python dung_xuong.py cho
       python dung_xuong.py suu dan mao mui heo ngo ty than ga ran thin

Ảnh nguồn: tai-nguyen/nguon/<khoá>_4chan.png
Ra:
  - custom_components/lich_viet/frontend/xuong/<khoá>.json
  - custom_components/lich_viet/frontend/xuong/<khoá>-chinh.webp
  - custom_components/lich_viet/frontend/xuong/<khoá>-xa.webp (trừ ran, thin)
  - tai-nguyen/kiem/<khoá>-lop.png  (xem bằng mắt)
"""
import argparse
import json
import math
import os
import sys

import cv2
import numpy as np
from PIL import Image

# ── Đường dẫn ──────────────────────────────────────────────────
GOC = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
NGUON = os.path.join(GOC, "tai-nguyen", "nguon")
XUONG = os.path.join(GOC, "custom_components", "lich_viet", "frontend", "xuong")
KIEM = os.path.join(GOC, "tai-nguyen", "kiem")

# ── Số chân mặc định theo loài ──────────────────────────────────
SO_CHAN_MAC_DINH = {
    "cho": 4,
    "suu": 4,
    "dan": 4,
    "mao": 4,
    "mui": 4,
    "heo": 4,
    "ngo": 4,
    "ty": 2,
    "than": 2,
    "ga": 2,
    "ran": 0,
    "thin": 0,
}

# ── Động học thuận (đúng bộ vẽ JS) ────────────────────────────
DUTY_MAC = 0.65
GOI_MAC = 0.5


def dang(phi, duty=DUTY_MAC, goi=GOI_MAC):
    phi %= 1.0
    if phi < duty:
        return 1 - 2 * phi / duty, 0.0, 1
    s = (phi - duty) / (1 - duty)
    e = s * s * (3 - 2 * s)
    return -1 + 2 * e, goi * math.sin(math.pi * s**0.75), 0


def _xoay(a, px, py):
    c, s = math.cos(a), math.sin(a)
    return c * px - s * py, s * px + c * py


def vi_tri_ban_chan(chan, t, duty=DUTY_MAC, goi=GOI_MAC):
    """Trả về (x, y) bàn chân ở pha t."""
    sh, flex, stance = dang(t + chan["ph"], duty, goi)
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


def quang_buoc(chan, duty=DUTY_MAC, goi=GOI_MAC, N=240):
    """Trả quãng di chuyển bàn chân (px)."""
    xs = [vi_tri_ban_chan(chan, i / N, duty, goi)[0] for i in range(N)]
    return max(xs) - min(xs)


# ── Tách nền và cắt sát ───────────────────────────────────────
def tach_nen_va_cat(im_rgb):
    """Tách nền trắng bằng flood-fill từ viền, cắt sát. Trả (im4_rgba)."""
    trang = im_rgb.min(axis=2) > 236
    n, lab = cv2.connectedComponents(trang.astype(np.uint8), connectivity=4)
    bg = np.zeros_like(trang)
    canh = set(
        lab[0].tolist()
        + lab[-1].tolist()
        + lab[:, 0].tolist()
        + lab[:, -1].tolist()
    )
    for k in canh:
        if k:
            bg |= lab == k
    al = (~bg).astype(np.uint8) * 255
    al = cv2.morphologyEx(al, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    al = cv2.GaussianBlur(al, (0, 0), 0.8)
    ys, xs = np.where(al > 30)
    x0 = max(0, xs.min() - 6)
    x1 = min(im_rgb.shape[1], xs.max() + 7)
    y0 = max(0, ys.min() - 6)
    y1 = min(im_rgb.shape[0], ys.max() + 7)
    im4 = np.dstack([im_rgb, al])[y0:y1, x0:x1]
    return im4


# ── Tìm đường bụng và dải chân bằng hình học ─────────────────
def tim_duong_bung(alpha, so_chan):
    """Tìm hàng y thấp nhất của thân nơi các chân bắt đầu tách rời.
    Quét qua các hàng y, tìm vùng y mà phần bên dưới tách thành đúng `so_chan`
    thành phần chân chạm xuống gần đáy ảnh.
    """
    h, w = alpha.shape
    valid_ys = []
    for y in range(int(h * 0.50), int(h * 0.88)):
        below = (alpha[y + 1:, :] > 128).astype(np.uint8)
        n, lab, st, cen = cv2.connectedComponentsWithStats(below, connectivity=8)
        leg_comps = []
        for k in range(1, n):
            area = st[k, cv2.CC_STAT_AREA]
            bot = y + 1 + st[k, cv2.CC_STAT_TOP] + st[k, cv2.CC_STAT_HEIGHT]
            if bot > h * 0.78 and area > w * h * 0.002:
                leg_comps.append((k, cen[k][0], area, bot))
        if len(leg_comps) == so_chan:
            valid_ys.append((y, leg_comps))
    if not valid_ys:
        return int(h * 0.70)
    # Lấy hàng y nhỏ nhất trong dải (bắt đầu tách) cộng biên an toàn 3px
    return valid_ys[0][0] + 3


def tim_dai_chan(alpha, y_bung, so_chan):
    """Tìm các dải chân bên dưới đường bụng, sắp xếp từ trái sang phải theo x."""
    h, w = alpha.shape
    below = np.zeros_like(alpha)
    below[y_bung + 1:, :] = (alpha[y_bung + 1:, :] > 128).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(below, connectivity=8)
    dais = []
    for k in range(1, n):
        area = st[k, cv2.CC_STAT_AREA]
        bot = st[k, cv2.CC_STAT_TOP] + st[k, cv2.CC_STAT_HEIGHT]
        if area > w * h * 0.002 and bot > h * 0.78:
            mask = (lab == k).astype(np.uint8)
            cx = cen[k][0]
            dais.append((mask, st[k], cx))
    dais.sort(key=lambda d: d[2])
    return dais


# ── Đặt khớp từ hình học dải chân ────────────────────────────
def dat_khop(dai_mask, y_bung):
    """Đặt paw, hip, knee, rong, r từ dải chân:
    - paw = trung điểm hàng thấp nhất
    - hip = trong thân, trên y_bung ~0.25 chiều cao chân, theo trục dải
    - knee = ~0.55 chiều dài hip->paw trên trục dải
    - rong = bề ngang dải chân ở hàng cách đáy ~60 px
    - r = ~0.9 × bề ngang đùi gần hông
    """
    ys, xs = np.where(dai_mask > 0)
    if len(ys) == 0:
        return None
    y_bot = ys.max()
    y_top = ys.min()

    # Bàn chân: trung điểm hàng thấp nhất
    paw_x = float(xs[ys == y_bot].mean())
    paw_y = float(y_bot)

    # Trục dải chân: trung điểm từng hàng
    truc = {}
    for y in range(y_top, y_bot + 1):
        row_xs = xs[ys == y]
        if len(row_xs) > 0:
            truc[y] = float(row_xs.mean())

    chieu_cao_chan = paw_y - y_bung
    hip_y = y_bung - 0.25 * max(chieu_cao_chan, 50)

    # Trục dải chân gần đỉnh: nội suy tuyến tính lên hip_y
    top_ys = [y for y in truc if y <= y_top + 0.3 * chieu_cao_chan]
    if len(top_ys) >= 5:
        poly = np.polyfit(top_ys, [truc[y] for y in top_ys], 1)
        hip_x = float(np.polyval(poly, hip_y))
    else:
        hip_x = paw_x

    # Gối: ~0.55 chiều dài từ hip đến paw
    target_knee_y = hip_y + 0.55 * (paw_y - hip_y)
    closest_y = min(truc.keys(), key=lambda y: abs(y - target_knee_y))
    knee_x = truc[closest_y]
    knee_y = float(closest_y)

    # rong: bề ngang ở hàng cách đáy ~60 px
    y_rong = max(y_top, int(y_bot - 60))
    xs_rong = xs[ys == y_rong]
    rong = int(xs_rong.max() - xs_rong.min()) if len(xs_rong) > 1 else 60

    # r: ~0.9 × bề ngang đùi gần hông (dưới y_bung)
    y_dui = min(y_bot - 10, max(y_top, int(y_bung + 0.15 * chieu_cao_chan)))
    xs_dui = xs[ys == y_dui]
    bengang_dui = int(xs_dui.max() - xs_dui.min()) if len(xs_dui) > 1 else rong
    r = int(0.9 * bengang_dui)

    return {
        "hip": [round(hip_x), round(hip_y)],
        "knee": [round(knee_x), round(knee_y)],
        "paw": [round(paw_x), round(paw_y)],
        "rong": max(20, rong),
        "r": max(30, r),
    }


# ── Tách lớp ảnh hình học ────────────────────────────────────
def tach_lop_hinh_hoc(im4, dais, y_bung, so_chan, rong_anh=800):
    """Tách lớp chính và lớp chân xa bằng hình học:
    - Lớp xa: dải chân xa kéo dài lên trên đường bụng 36px bằng phần ruột
    - Lớp chính: khoét phần chân xa dưới đường bụng, viền mềm, xóa viền mảnh
    """
    h, w = im4.shape[:2]
    A = im4[:, :, 3].copy()

    idx_xa = [0, 3] if so_chan == 4 else [0]
    idx_gan = [1, 2] if so_chan == 4 else [1]

    xa_mask = np.zeros((h, w), dtype=np.uint8)
    for i in idx_xa:
        xa_mask |= dais[i][0]

    gan_mask = np.zeros((h, w), dtype=np.uint8)
    for i in idx_gan:
        gan_mask |= dais[i][0]

    xa_below = xa_mask.copy()
    xa_below[: y_bung + 1, :] = 0

    E = lambda m, k: cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))

    # Lớp chân xa
    xa_soft = cv2.GaussianBlur((xa_below * 255).astype(np.uint8), (0, 0), 1.0).astype(np.float32) / 255.0
    ext_xa = im4.copy()
    ext_xa[:, :, 3] = (A * xa_soft).astype(np.uint8)

    # Nối dài chân xa 36px lên trên qua y_bung bằng phần ruột
    nl, lab2, st2, _ = cv2.connectedComponentsWithStats(xa_below, connectivity=8)
    for k in range(1, nl):
        if st2[k, 4] < w * h * 0.001:
            continue
        yy, xx = np.where(lab2 == k)
        ytop = yy.min()
        hang_ref = min(ytop + 16, yy.max())
        hang = xx[yy == hang_ref]
        if len(hang) < 15:
            continue
        h_min, h_max = hang.min(), hang.max()
        for dy in range(1, 37):
            yr = ytop - dy
            if yr < 0:
                break
            for x in range(h_min + 14, h_max - 14 + 1):
                if ext_xa[yr, x, 3] == 0:
                    ext_xa[yr, x] = ext_xa[hang_ref, x]

    # Lớp chính: khoét phần xa_below nở nhẹ (5px), bảo vệ chân gần
    loi = E(xa_below, 5) > 0
    gan_dil = E(gan_mask, 5) > 0
    loi_cut = loi & (~gan_dil)

    chinhA = np.where(loi_cut, 0, A).astype(np.uint8)
    # Phép mở 7px quanh vùng chân xa để xoá viền mảnh sót
    mo = cv2.morphologyEx(chinhA, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    vung_gan_xa = E(xa_below, 35) > 0
    vung_gan_xa[: max(0, y_bung - 10), :] = False
    vung_gan_xa = vung_gan_xa & (~gan_mask.astype(bool))
    chinhA = np.where(vung_gan_xa, mo, chinhA).astype(np.uint8)

    chinh = im4.copy()
    chinh[:, :, 3] = chinhA

    sc = rong_anh / w
    sz = (rong_anh, int(h * sc))
    chinh_img = Image.fromarray(chinh, "RGBA").resize(sz, Image.LANCZOS)
    xa_img = Image.fromarray(ext_xa, "RGBA").resize(sz, Image.LANCZOS)
    return chinh_img, xa_img, sz


# ── Tìm c, a cho động học thuận ──────────────────────────────
def tim_a_cho_quang(chan, quang_muc, duty=DUTY_MAC, goi=GOI_MAC, N=240):
    """Tìm biên độ a sao cho quãng di chuyển bàn chân ≈ quang_muc px."""
    lo, hi = 0.01, 0.49
    for _ in range(40):
        mid = (lo + hi) / 2
        c_tmp = {**chan, "a": mid}
        if quang_buoc(c_tmp, duty, goi, N) < quang_muc:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def tinh_khe_4chan(legs, duty=DUTY_MAC, goi=GOI_MAC, N=240):
    """Kiểm tra khe nhỏ nhất giữa bàn chân gần–xa cùng cặp (trước và sau)."""
    xs_sau, gan_sau, gan_truoc, xs_truoc = legs
    min_sau = float("inf")
    min_truoc = float("inf")
    for i in range(N):
        t = i / N
        x_xs = vi_tri_ban_chan(xs_sau, t, duty, goi)[0]
        x_gs = vi_tri_ban_chan(gan_sau, t, duty, goi)[0]
        x_gt = vi_tri_ban_chan(gan_truoc, t, duty, goi)[0]
        x_xt = vi_tri_ban_chan(xs_truoc, t, duty, goi)[0]

        khe_sau = abs(x_gs - x_xs) - (gan_sau["rong"] + xs_sau["rong"]) / 2
        khe_truoc = abs(x_gt - x_xt) - (gan_truoc["rong"] + xs_truoc["rong"]) / 2
        min_sau = min(min_sau, khe_sau)
        min_truoc = min(min_truoc, khe_truoc)
    return min_truoc, min_sau


def tinh_khe_2chan(xa, gan, duty=DUTY_MAC, goi=GOI_MAC, N=240):
    """Kiểm tra khe nhỏ nhất giữa hai chân gần–xa."""
    min_khe = float("inf")
    for i in range(N):
        t = i / N
        x_xa = vi_tri_ban_chan(xa, t, duty, goi)[0]
        x_gan = vi_tri_ban_chan(gan, t, duty, goi)[0]
        khe = abs(x_gan - x_xa) - (gan["rong"] + xa["rong"]) / 2
        min_khe = min(min_khe, khe)
    return min_khe


# ── Xử lý con 4 chân hoặc 2 chân ─────────────────────────────
def xu_ly_co_chan(khoa, im4, so_chan, rong_anh=800):
    h, w = im4.shape[:2]
    he_toa_do = w
    K = rong_anh / he_toa_do

    # 1. Tìm đường bụng và dải chân
    y_bung = tim_duong_bung(im4[:, :, 3], so_chan)
    dais = tim_dai_chan(im4[:, :, 3], y_bung, so_chan)
    if len(dais) != so_chan:
        print(f"  ✗ Không tìm đủ {so_chan} dải chân cho {khoa} (thấy {len(dais)})")
        return None

    # 2. Tách lớp ảnh
    chinh_img, xa_img, sz = tach_lop_hinh_hoc(im4, dais, y_bung, so_chan, rong_anh)

    # 3. Đặt khớp và tính góc dạng sẵn c
    if so_chan == 4:
        phas = [0.5, 0.0, 0.25, 0.75]  # [xa-sau, gan-sau, gan-truoc, xa-truoc]
        tens = ["sau", "sau", "truoc", "truoc"]
        lops = [1, 0, 0, 1]  # 0=chính, 1=xa
    else:
        phas = [0.5, 0.0]  # [xa, gan]
        tens = ["chan", "chan"]
        lops = [1, 0]

    legs = []
    for i in range(so_chan):
        kh = dat_khop(dais[i][0], y_bung)
        c = math.atan2(kh["paw"][0] - kh["hip"][0], kh["paw"][1] - kh["hip"][1])
        # r lớp xa ≈ 1.5 × bề ngang đùi
        if lops[i] == 1:
            kh["r"] = int(kh["r"] * 1.5)
        legs.append({**kh, "c": c, "ph": phas[i], "ten": tens[i], "lop": lops[i]})

    # 4. Tìm a theo quãng mục tiêu và ràng buộc khe
    quang_muc = 170.0 * w / 1200.0
    for l in legs:
        l["a"] = tim_a_cho_quang(l, quang_muc)

    for _ in range(50):
        if so_chan == 4:
            kt, ks = tinh_khe_4chan(legs)
            if kt >= 20 and ks >= 20:
                break
        else:
            khe = tinh_khe_2chan(legs[0], legs[1])
            if khe >= 20:
                break
        quang_muc *= 0.95
        for l in legs:
            l["a"] = tim_a_cho_quang(l, quang_muc)

    # 5. Gom dữ liệu xuất JSON
    chinh_chan = []
    xa_chan = []
    for l in legs:
        item = {
            "ten": l["ten"],
            "hip": l["hip"],
            "knee": l["knee"],
            "paw": l["paw"],
            "c": round(l["c"], 3),
            "a": round(l["a"], 3),
            "ph": l["ph"],
            "rong": l["rong"],
            "r": l["r"],
        }
        if l["lop"] == 0:
            chinh_chan.append(item)
        else:
            xa_chan.append(item)

    r_xa = max(c["r"] for c in xa_chan) if xa_chan else 150

    cfg = {
        "K": K,
        "anh": {"rong": rong_anh, "cao": sz[1]},
        "chinh": {"tep": f"{khoa}-chinh.webp", "chan": chinh_chan},
        "chu_ky_giay": 1.2,
        "ghi_chu": (
            f"Cấu hình xương con {khoa} ({so_chan} chân). "
            f"Toạ độ khớp ở hệ ảnh gốc rộng {he_toa_do} px; "
            f"K = {rong_anh}/{he_toa_do} đưa về ảnh lớp rộng {rong_anh} px."
        ),
        "he_toa_do": he_toa_do,
        "le_khung": [60, 30],
        "nhun_than_px": 3,
        "xa": {"tep": f"{khoa}-xa.webp", "r": r_xa, "chan": xa_chan},
        "duty": DUTY_MAC,
        "goi": GOI_MAC,
    }

    # 6. Lưu tệp
    os.makedirs(XUONG, exist_ok=True)
    os.makedirs(KIEM, exist_ok=True)

    bo_qua = khoa == "cho" and os.path.exists(os.path.join(XUONG, "cho.json"))
    if not bo_qua:
        with open(os.path.join(XUONG, f"{khoa}.json"), "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=1, ensure_ascii=False)
        chinh_img.save(os.path.join(XUONG, f"{khoa}-chinh.webp"), "WEBP", quality=90, method=4)
        xa_img.save(os.path.join(XUONG, f"{khoa}-xa.webp"), "WEBP", quality=90, method=4)
    else:
        print(f"  ℹ Bỏ qua ghi {khoa}.json và webp (đã có bản chó chuẩn tinh chỉnh)")

    # Ảnh kiểm: hai lớp trên nền màu
    def tren_nen(img, mau):
        bg = Image.new("RGBA", img.size, mau)
        bg.alpha_composite(img)
        return bg.convert("RGB")

    c1 = tren_nen(chinh_img, (80, 200, 120, 255))
    c2 = tren_nen(xa_img, (120, 170, 255, 255))
    xem = Image.new("RGB", (c1.width, c1.height * 2 + 8), (255, 255, 255))
    xem.paste(c1, (0, 0))
    xem.paste(c2, (0, c1.height + 8))
    xem.save(os.path.join(KIEM, f"{khoa}-lop.png"))

    # In báo cáo
    print(f"\n  ═══ {khoa.upper()} ({so_chan} chân) ═══")
    print(f"  Số chân thấy: {so_chan}")
    print(f"  Ảnh gốc cắt: {w}×{h} → lớp {rong_anh}×{sz[1]} (K={K:.4f})")
    print(f"  Đường bụng: y={y_bung}")
    for l in legs:
        q = quang_buoc(l)
        lop_str = "xa" if l["lop"] == 1 else "chính"
        print(
            f"  {lop_str:5s} {l['ten']:6s} ph={l['ph']:.2f} c={l['c']:+.3f} a={l['a']:.3f} "
            f"rong={l['rong']} r={l['r']} quãng={q:.0f}px "
            f"hip={l['hip']} knee={l['knee']} paw={l['paw']}"
        )
    if so_chan == 4:
        kt, ks = tinh_khe_4chan(legs)
        print(f"  Khe nhỏ nhất: trước={kt:.0f}px, sau={ks:.0f}px (cần ≥ 20)")
    else:
        khe = tinh_khe_2chan(legs[0], legs[1])
        print(f"  Khe nhỏ nhất: {khe:.0f}px (cần ≥ 20)")

    return cfg


# ── Xử lý con sóng (rắn, rồng) ───────────────────────────────
def xu_ly_song(khoa, im4, rong_anh=800):
    h, w = im4.shape[:2]
    he_toa_do = w
    K = rong_anh / he_toa_do
    cao_anh = int(h * K)
    sz = (rong_anh, cao_anh)

    al = im4[:, :, 3]
    # Tìm tâm đầu: nằm ở 20% bên phải của thân
    head_region = al[:, int(w * 0.80):]
    ys, xs = np.where(head_region > 100)
    if len(xs) > 0:
        dau_x_orig = int(w * 0.80) + float(xs.mean())
        dau_y_orig = float(ys.mean())
    else:
        dau_x_orig = w * 0.90
        dau_y_orig = h * 0.50

    dau_x = round(dau_x_orig * K, 1)
    dau_y = round(dau_y_orig * K, 1)

    # Bước sóng ≈ 1.15 × chiều dài thân
    lambda_song = 1.15 * rong_anh
    k_val = round(2 * math.pi / lambda_song, 5)
    omega_val = round(2 * math.pi, 4)
    A_val = 26.0

    chinh_img = Image.fromarray(im4, "RGBA").resize(sz, Image.LANCZOS)

    cfg = {
        "kieu": "song",
        "A": A_val,
        "k": k_val,
        "omega": omega_val,
        "dau_x": dau_x,
        "dau_y": dau_y,
        "K": K,
        "he_toa_do": he_toa_do,
        "anh": {"rong": rong_anh, "cao": cao_anh},
        "le_khung": [60, 30],
        "nhun_than_px": 2,
        "chu_ky_giay": 1.2,
        "chinh": {"tep": f"{khoa}-chinh.webp"},
    }

    os.makedirs(XUONG, exist_ok=True)
    os.makedirs(KIEM, exist_ok=True)

    with open(os.path.join(XUONG, f"{khoa}.json"), "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=1, ensure_ascii=False)
    chinh_img.save(os.path.join(XUONG, f"{khoa}-chinh.webp"), "WEBP", quality=90, method=4)

    # Ảnh kiểm: trên nền màu
    bg = Image.new("RGBA", chinh_img.size, (80, 200, 120, 255))
    bg.alpha_composite(chinh_img)
    bg.convert("RGB").save(os.path.join(KIEM, f"{khoa}-lop.png"))

    print(f"\n  ═══ {khoa.upper()} (chế độ sóng) ═══")
    print(f"  Ảnh gốc cắt: {w}×{h} → lớp {rong_anh}×{cao_anh} (K={K:.4f})")
    print(f"  Đầu: dau_x={dau_x}, dau_y={dau_y}")
    print(f"  Sóng: A={A_val}, k={k_val}, omega={omega_val}")

    return cfg


# ── Hàm chạy chính ───────────────────────────────────────────
def xu_ly_mot_con(khoa, so_chan=None, rong_anh=800):
    anh_path = os.path.join(NGUON, f"{khoa}_4chan.png")
    if not os.path.exists(anh_path):
        print(f"✗ Không tìm thấy {anh_path}")
        return None

    im_rgb = np.array(Image.open(anh_path).convert("RGB"))
    im4 = tach_nen_va_cat(im_rgb)

    if so_chan is None:
        so_chan = SO_CHAN_MAC_DINH.get(khoa, 4)

    if so_chan == 0:
        return xu_ly_song(khoa, im4, rong_anh)
    else:
        return xu_ly_co_chan(khoa, im4, so_chan, rong_anh)


def main():
    ap = argparse.ArgumentParser(description="Dựng cấu hình xương tự động")
    ap.add_argument("khoa", nargs="+", help="Khoá con vật (vd: suu, dan, ran, ...)")
    ap.add_argument("--so-chan", type=int, default=None, help="Số chân (4, 2 hoặc 0)")
    ap.add_argument("--rong", type=int, default=800, help="Bề ngang ảnh lớp (px)")
    args = ap.parse_args()

    for khoa in args.khoa:
        xu_ly_mot_con(khoa, args.so_chan, args.rong)


if __name__ == "__main__":
    main()
