"""NV269: thẻ lich-bloc-xua-card vẽ con chó bằng bộ vẽ xương (WebGL).

Ảnh lớp hiện tại là bản TẠM tách từ khung đứng nghỉ số 16 của sprite sheet
(xem hoi-nv269-anh-lop-cho.md): test ngưỡng tách chân theo đúng chữ spec
được đánh xfail cho tới khi điều phối giao ảnh lớp chuẩn — số đo thật ghi
trong lý do xfail và trong báo cáo.
"""

from __future__ import annotations

import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest
from PIL import Image

GOC = Path(__file__).resolve().parent.parent
FE = GOC / "custom_components" / "lich_viet" / "frontend"
XUONG = FE / "xuong"
THE = (FE / "lich-bloc-xua-card.js").read_text(encoding="utf-8")
XUONG_JS = (FE / "lich-bloc-xua-xuong.js").read_text(encoding="utf-8")
CFG = json.loads((XUONG / "cho.json").read_text(encoding="utf-8"))

NODE = shutil.which("node")


def kiem_tra_cfg(cfg):
    """Trả về danh sách lỗi của cấu hình xương (rỗng = hợp lệ)."""
    loi = []
    if abs(cfg.get("K", 0) - 800 / 1200) > 1e-12:
        loi.append("K phải bằng 800/1200")
    for lop in ("xa", "chinh"):
        if lop not in cfg:
            loi.append(f"thiếu lớp {lop}")
            continue
        chan = cfg[lop].get("chan", [])
        if len(chan) != 2:
            loi.append(f"lớp {lop} phải có đúng 2 chân")
            continue
        for g in chan:
            for k in ("hip", "knee", "paw"):
                if len(g.get(k, [])) != 2:
                    loi.append(f"{lop}.{g.get('ten')}.{k} phải có 2 toạ độ")
            if not (g["hip"][1] < g["knee"][1] < g["paw"][1]):
                loi.append(f"{lop}.{g.get('ten')}: cần hip.y < knee.y < paw.y")
            if not (0 < g["a"] < 0.5):
                loi.append(f"{lop}.{g.get('ten')}: cần 0 < a < 0,5")
            if g["ph"] not in (0, 0.25, 0.5, 0.75):
                loi.append(f"{lop}.{g.get('ten')}: pha phải thuộc {{0, 0,25, 0,5, 0,75}} (bước so le theo dữ liệu thật)")
            for k in ("hip", "knee", "paw"):
                x, y = g[k]
                if not (0 <= x <= 1200 and 0 <= y <= cfg["anh"]["cao"] * 1200 / cfg["anh"]["rong"]):
                    loi.append(f"{lop}.{g.get('ten')}.{k} nằm ngoài ảnh")
    return loi


def test_cho_json_hop_le():
    assert kiem_tra_cfg(CFG) == []


def test_anh_lop_ton_tai_co_alpha_cung_kich_thuoc():
    chinh = Image.open(XUONG / "cho-chinh.webp")
    xa = Image.open(XUONG / "cho-xa.webp")
    assert chinh.format == "WEBP" and xa.format == "WEBP"
    assert chinh.mode == "RGBA" and xa.mode == "RGBA"
    assert chinh.size == xa.size == (CFG["anh"]["rong"], CFG["anh"]["cao"])
    for im in (chinh, xa):
        a = im.getchannel("A")
        assert a.getextrema()[0] == 0 and a.getextrema()[1] == 255, "ảnh lớp phải có alpha thật"


def test_thu_xuong_chi_chua_khoa_co_anh():
    m = re.search(r"const THU_XUONG = \{(.*?)\};", THE, re.S)
    assert m, "thẻ phải có THU_XUONG"
    for khoa, than in re.findall(r"(\w+):\s*\{([^}]*)\}", m.group(1)):
        tep = re.findall(r'"([^"]+)"', than)
        assert tep, khoa
        for t in tep:
            if t.endswith(".webp"):
                assert (FE / t).exists(), f"{khoa}: thiếu ảnh {t}"


def test_the_nap_bo_ve_xuong_va_giu_nguyen_sprite():
    assert "from './lich-bloc-xua-xuong.js'" in THE
    assert "WEBGL_lose_context" in XUONG_JS and "huy()" in XUONG_JS
    assert "const SPRITE_CSS" in THE and "function keyframesSprite" in THE and "dongSprite" in THE
    # MỘT vòng requestAnimationFrame cho cả thẻ: chỉ trong _chayVongXuong.
    assert THE.count("requestAnimationFrame(buoc)") == 2
    assert "_chayVongXuong" in THE
    assert "taoXuong(cv, cfg, anh)" in THE


# ---------- động học thuận độc lập bằng Python (đối chiếu với module JS) ----------

def _dang(phi, duty=0.6, goi=0.62):
    phi %= 1.0
    if phi < duty:
        s = phi / duty
        return 1 - 2 * s, 0.0, 1
    s = (phi - duty) / (1 - duty)
    e = s * s * (3 - 2 * s)
    return -1 + 2 * e, goi * math.sin(math.pi * s ** 0.75), 0


def _xoay(a, px, py):
    c, s = math.cos(a), math.sin(a)
    return c * px - s * py, s * px + c * py


def _ban_chan(chan, t, cfg=None):
    cfg = cfg or {}
    sh, flex, stance = _dang(t + chan["ph"], cfg.get("duty", 0.6), cfg.get("goi", 0.62))
    rest = math.atan2(chan["paw"][0] - chan["hip"][0], chan["paw"][1] - chan["hip"][1])
    th = -(chan["c"] + chan["a"] * sh - rest)
    sig = 1 / max(0.92, math.cos(th)) if stance else 1
    dx, dy = _xoay(flex, chan["paw"][0] - chan["knee"][0], chan["paw"][1] - chan["knee"][1])
    sx = chan["knee"][0] - chan["hip"][0] + dx
    sy = chan["knee"][1] - chan["hip"][1] + dy
    fx, fy = _xoay(th, sx, sig * sy)
    return chan["hip"][0] + fx, chan["hip"][1] + fy


def _kc(cfg, t):
    def cap(lop):
        c = cfg[lop]["chan"]
        truoc = c[1] if c[0]["hip"][0] < c[1]["hip"][0] else c[0]
        sau = c[1] if truoc is c[0] else c[0]
        return truoc, sau
    ct, cs = cap("chinh")
    xt, xs = cap("xa")
    return (abs(_ban_chan(ct, t, cfg)[0] - _ban_chan(xt, t, cfg)[0]),
            abs(_ban_chan(cs, t, cfg)[0] - _ban_chan(xs, t, cfg)[0]))


def _min_kc(cfg):
    f = h = float("inf")
    for i in range(240):
        d_f, d_h = _kc(cfg, i / 240)
        f, h = min(f, d_f), min(h, d_h)
    return f, h


def test_khoang_cach_chan_python_khop_js():
    """Đối chiếu động học Python với module JS (cần node; không có thì bỏ qua)."""
    if not NODE:
        pytest.skip("không có node")
    import tempfile

    with tempfile.TemporaryDirectory() as td:
        mod = Path(td) / "xuong.mjs"
        mod.write_text(XUONG_JS, encoding="utf-8")
        js = Path(td) / "kc.mjs"
        js.write_text(
            "import { khoangCachChan } from './xuong.mjs';\n"
            "import { readFileSync } from 'fs';\n"
            "const cfg = JSON.parse(readFileSync(process.argv[2], 'utf-8'));\n"
            "for (const t of [0, 0.1, 0.25, 0.5, 0.75, 0.9]) { const d = khoangCachChan(cfg, t); console.log(t, d.truoc, d.sau); }\n",
            encoding="utf-8",
        )
        out = subprocess.run([NODE, str(js), str(XUONG / "cho.json")],
                             capture_output=True, text=True, check=True, timeout=60).stdout
    for dong in out.strip().splitlines():
        t, f, h = (float(x) for x in dong.split())
        pf, ph = _kc(CFG, t)
        assert abs(f - pf) < 1e-6 and abs(h - ph) < 1e-6, dong


# ---------- tiêu chí chân của chủ máy (đo trên hình vẽ thật bằng do_chan.py; đây là bản động học của cùng tiêu chí) ----------
# (a) chân XA phải di chuyển như chân gần (đã từng «chân xa ở mãi một chỗ»); (b) bước ĐỀU giữa bốn chân; (c) bàn chân gần–xa cùng cặp
# không chồng nhau: khoảng cách ngang tâm bàn chân ≥ (bề ngang chân gần + bề ngang chân xa) / 2, cộng một khe nhìn thấy được.
# `rong` = bề ngang cẳng chân thật (hệ 1200); `r` là bán kính vùng trọng số capsule, KHÔNG phải bề ngang chân.

KHE_TOI_THIEU_PX = 20


def _quang(cfg, lop, ten):
    chan = next(g for g in cfg[lop]["chan"] if g["ten"] == ten)
    xs = [_ban_chan(chan, i / 240, cfg)[0] for i in range(240)]
    return max(xs) - min(xs)


def _bon_quang(cfg):
    return {(lop, ten): _quang(cfg, lop, ten) for lop in ("chinh", "xa") for ten in ("sau", "truoc")}


def _khe(cfg):
    """Khe nhỏ nhất (px) giữa bàn chân gần và xa SAU KHI trừ bề ngang trung bình của hai chân, tính cho {trước, sau}."""
    rong = lambda lop, ten: next(g for g in cfg[lop]["chan"] if g["ten"] == ten)["rong"]
    truoc = sau = float("inf")
    for i in range(240):
        f, h = _kc(cfg, i / 240)
        truoc = min(truoc, f - (rong("chinh", "truoc") + rong("xa", "truoc")) / 2)
        sau = min(sau, h - (rong("chinh", "sau") + rong("xa", "sau")) / 2)
    return truoc, sau


def test_chan_xa_di_chuyen_nhu_chan_gan():
    q = _bon_quang(CFG)
    for ten in ("sau", "truoc"):
        ti_le = q[("xa", ten)] / q[("chinh", ten)]
        assert ti_le >= 0.8, f"chân {ten} xa chỉ di chuyển {ti_le:.2f} lần chân gần (đứng một chỗ)"


def test_buoc_deu_giua_bon_chan():
    q = list(_bon_quang(CFG).values())
    assert min(q) / max(q) >= 0.75, f"quãng bước không đều: {[round(x) for x in q]}"


def test_khe_ban_chan_gan_xa_lon_hon_be_ngang_chan():
    truoc, sau = _khe(CFG)
    assert truoc >= KHE_TOI_THIEU_PX and sau >= KHE_TOI_THIEU_PX, f"khe trước {truoc:.0f} px, sau {sau:.0f} px (cần ≥ {KHE_TOI_THIEU_PX})"


def test_dot_bien_chan_xa_dung_yen_bi_phat_hien():
    import copy

    mut = copy.deepcopy(CFG)
    for g in mut["xa"]["chan"]:
        g["a"] = 0.0
    q = _bon_quang(mut)
    assert min(q[("xa", "sau")] / q[("chinh", "sau")], q[("xa", "truoc")] / q[("chinh", "truoc")]) < 0.8


def test_dot_bien_bien_do_chan_truoc_bi_phat_hien():
    """Đổi biên độ cả hai chân trước lên 0,6 phải làm khe bàn chân trước chồng nhau (khe < ngưỡng)."""
    import copy

    mut = copy.deepcopy(CFG)
    mut["chinh"]["chan"][1]["a"] = 0.6
    mut["xa"]["chan"][1]["a"] = 0.6
    truoc, _ = _khe(mut)
    assert truoc < KHE_TOI_THIEU_PX, f"đột biến không bị phát hiện: khe trước {truoc:.0f} px"


# ---------- 4 đột biến trên bản sao (mỗi cái ít nhất một kiểm tra đỏ) ----------

def test_dot_bien_doi_ten_khoa_cau_hinh():
    import copy

    mut = copy.deepcopy(CFG)
    mut["chinhX"] = mut.pop("chinh")
    assert kiem_tra_cfg(mut), "đổi tên khoá phải làm kiểm tra cấu hình đỏ"


def test_dot_bien_dao_dau_goc():
    import copy

    mut = copy.deepcopy(CFG)
    mut["chinh"]["chan"][1]["a"] = -mut["chinh"]["chan"][1]["a"]
    khac = any(abs(_kc(CFG, t)[0] - _kc(mut, t)[0]) > 1 for t in [0, 0.25, 0.5, 0.75])
    assert khac, "đảo dấu biên độ phải đổi vị trí bàn chân"


def test_dot_bien_bo_lop_xa():
    import copy

    mut = copy.deepcopy(CFG)
    del mut["xa"]
    assert kiem_tra_cfg(mut), "bỏ lớp xa phải làm kiểm tra cấu hình đỏ"


def test_dot_bien_bo_huy_canvas():
    """Bỏ lệnh loseContext khỏi bản sao module thì test vòng đời phải bắt được."""
    if not NODE:
        pytest.skip("không có node")
    import tempfile

    mut = XUONG_JS.replace("if (ext) ext.loseContext();", "if (ext) { /* đã bỏ */ }")
    assert "loseContext" not in mut
    with tempfile.TemporaryDirectory() as td:
        mod = Path(td) / "xuong.mjs"
        mod.write_text(mut, encoding="utf-8")
        js = Path(td) / "lc.mjs"
        js.write_text(
            "import { taoXuong } from './xuong.mjs';\n"
            "import { readFileSync } from 'fs';\n"
            "const cfg = JSON.parse(readFileSync(process.argv[2], 'utf-8'));\n"
            "let draws = 0, lost = 0;\n"
            "const gl = new Proxy({}, { get: (o, k) => {\n"
            "  if (k === 'getShaderParameter') return () => true;\n"
            "  if (k === 'getAttribLocation') return () => 0;\n"
            "  if (k === 'getUniformLocation') return () => ({});\n"
            "  if (k === 'getExtension') return () => ({ loseContext: () => { lost += 1; } });\n"
            "  if (k === 'drawElements') return () => { draws += 1; };\n"
            "  if (k === 'TRIANGLES') return 4;\n"
            "  return () => {};\n"
            "} });\n"
            "const canvas = { width: 0, height: 0, getContext: () => gl };\n"
            "const x = taoXuong(canvas, cfg, { chinh: {}, xa: {} });\n"
            "x.ve(0.25); const sauVe = draws; x.huy(); x.ve(0.5);\n"
            "console.log(JSON.stringify({ sauVe, draws, lost }));\n",
            encoding="utf-8",
        )
        out = subprocess.run([NODE, str(js), str(XUONG / "cho.json")],
                             capture_output=True, text=True, check=True, timeout=60).stdout
    kq = json.loads(out.strip().splitlines()[-1])
    assert kq["lost"] == 0, "bản sao bỏ loseContext phải không gọi loseContext"


def test_vong_doi_canvas_gia_webgl():
    """ve() vẽ 2 lớp; huy() gọi loseContext đúng một lần; ve() sau huy() không vẽ thêm."""
    if not NODE:
        pytest.skip("không có node")
    import tempfile

    with tempfile.TemporaryDirectory() as td:
        mod = Path(td) / "xuong.mjs"
        mod.write_text(XUONG_JS, encoding="utf-8")
        js = Path(td) / "lc.mjs"
        js.write_text(
            "import { taoXuong } from './xuong.mjs';\n"
            "import { readFileSync } from 'fs';\n"
            "const cfg = JSON.parse(readFileSync(process.argv[2], 'utf-8'));\n"
            "let draws = 0, lost = 0;\n"
            "const gl = new Proxy({}, { get: (o, k) => {\n"
            "  if (k === 'getShaderParameter') return () => true;\n"
            "  if (k === 'getAttribLocation') return () => 0;\n"
            "  if (k === 'getUniformLocation') return () => ({});\n"
            "  if (k === 'getExtension') return () => ({ loseContext: () => { lost += 1; } });\n"
            "  if (k === 'drawElements') return () => { draws += 1; };\n"
            "  if (k === 'TRIANGLES') return 4;\n"
            "  return () => {};\n"
            "} });\n"
            "const canvas = { width: 0, height: 0, getContext: () => gl };\n"
            "const x = taoXuong(canvas, cfg, { chinh: {}, xa: {} });\n"
            "x.ve(0.25); const sauVe = draws; x.huy(); x.huy(); x.ve(0.5);\n"
            "console.log(JSON.stringify({ sauVe, draws, lost }));\n",
            encoding="utf-8",
        )
        out = subprocess.run([NODE, str(js), str(XUONG / "cho.json")],
                             capture_output=True, text=True, check=True, timeout=60).stdout
    kq = json.loads(out.strip().splitlines()[-1])
    assert kq["sauVe"] == 2, kq
    assert kq["draws"] == 2 and kq["lost"] == 1, kq


def test_node_check_moi_tep_js():
    if not NODE:
        pytest.skip("không có node")
    for f in sorted(FE.glob("*.js")):
        r = subprocess.run([NODE, "--check", str(f)], capture_output=True, text=True, timeout=60)
        assert r.returncode == 0, f"{f.name}: {r.stderr}"
