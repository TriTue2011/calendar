"""Kiểm tra «chân vẽ rời» của mười con giáp có chân (thân một ảnh + mỗi chân chín tư thế vẽ riêng, gộp một tấm ảnh mỗi con).

- Cấu hình chan/<khoá>/lich.json hợp lệ: khung, vùng chân R nằm trọn trong khung, chín tư thế t tăng từ 0, có tư thế đứng thẳng.
- Mỗi con chỉ có hai tệp (atlas.webp + lich.json); mọi khung nằm trọn trong tấm, không chồng nhau, có alpha thật.
- Pha bước đúng quy ước: bốn chân bước so le một phần tư chu kỳ (sau gần, trước gần, sau xa, trước xa); hai chân lệch nửa chu kỳ.
- Thẻ chọn đường chân rời cho đúng mười con (rồng, rắn dùng sprite), tải sẵn con ngày kế bên, nối được vào vòng vẽ.
- Bộ vẽ JS (cần node): thứ tự lớp xa → thân → gần, cắt đúng khung trong tấm, chọn đúng tư thế theo pha, đứng nghỉ chỉ vẽ một lần.
- Kiểm đột biến: cấu hình hỏng (vùng chân ra ngoài khung, khung ra ngoài tấm, thiếu tư thế đứng) phải bị phát hiện.
- Tổng dung lượng ảnh ≤ 3,5 MB cho cả mười con.
"""

from __future__ import annotations

import copy
import json
import shutil
import subprocess
import textwrap
from pathlib import Path

import pytest
from PIL import Image

GOC = Path(__file__).resolve().parent.parent
FE = GOC / "custom_components" / "lich_viet" / "frontend"
CHAN = FE / "chan"
THE = FE / "lich-bloc-xua-card.js"
MODULE = FE / "lich-bloc-xua-chan.js"
NODE = shutil.which("node")

BON_CHAN = ["cho", "suu", "dan", "mao", "ngo", "mui", "heo", "ty"]
HAI_CHAN = ["ga", "than"]
CO_CHAN = BON_CHAN + HAI_CHAN
KHONG_CHAN = ["thin", "ran"]


def _cfg(khoa: str) -> dict:
    return json.loads((CHAN / khoa / "lich.json").read_text(encoding="utf-8"))


def _khung(cfg: dict):
    """(tên, [x, y, rộng, cao]) của mọi khung trong tấm: thân, rồi từng chân gần/xa."""
    W, H = cfg["khung"]
    out = [("than", [*cfg["than"], W, H])]
    for b in cfg["bo"]:
        for p in b["tu_the"]:
            for lop in ("gan", "xa"):
                out.append((f"{b['ten']}/{lop}/{p['ten']}", [*p[lop], b["R"][2], b["R"][3]]))
    return out


def kiem_cau_hinh(cfg: dict, tam: tuple[int, int] | None = None, bon: bool | None = None) -> list[str]:
    """Trả về danh sách lỗi của một cấu hình (rỗng = hợp lệ); có kích thước tấm thì kiểm cả khung nằm trong tấm."""
    loi: list[str] = []
    W, H = cfg["khung"]
    if not (W > 0 and H > 0):
        loi.append("khung không dương")
    if cfg.get("atlas") != "atlas.webp":
        loi.append("thiếu tên tấm ảnh")
    if not cfg["bo"]:
        return loi + ["không có bộ chân"]
    if bon is not None and len(cfg["bo"]) != (2 if bon else 1):
        loi.append(f"số bộ chân {len(cfg['bo'])} sai")
    for b in cfg["bo"]:
        x, y, w, h = b["R"]
        if x < 0 or y < 0 or x + w > W or y + h > H or w <= 0 or h <= 0:
            loi.append(f"{b['ten']}: vùng chân ra ngoài khung")
        ts = [p["t"] for p in b["tu_the"]]
        if len(ts) != 9 or ts[0] != 0 or ts != sorted(set(ts)) or ts[-1] >= 1:
            loi.append(f"{b['ten']}: tư thế không đủ 9, t không tăng từ 0")
        if "P2_dung" not in [p["ten"] for p in b["tu_the"]]:
            loi.append(f"{b['ten']}: thiếu tư thế đứng thẳng P2_dung")
        if not (-1 <= b["pg"] <= 1 and 0 <= b["px"] <= 1):
            loi.append(f"{b['ten']}: pha ngoài khoảng")
    if tam:
        for ten, (x, y, w, h) in _khung(cfg):
            if x < 0 or y < 0 or x + w > tam[0] or y + h > tam[1]:
                loi.append(f"{ten}: khung ra ngoài tấm")
    return loi


@pytest.mark.parametrize("khoa", CO_CHAN)
def test_cau_hinh_hop_le(khoa):
    tam = Image.open(CHAN / khoa / "atlas.webp").size
    assert kiem_cau_hinh(_cfg(khoa), tam, bon=khoa in BON_CHAN) == []


@pytest.mark.parametrize("khoa", CO_CHAN)
def test_moi_con_chi_hai_tep(khoa):
    """Gộp một tấm ảnh để HACS chỉ tải 2 tệp mỗi con và thẻ chỉ gọi một yêu cầu ảnh."""
    assert sorted(p.name for p in (CHAN / khoa).iterdir()) == ["atlas.webp", "lich.json"]


@pytest.mark.parametrize("khoa", CO_CHAN)
def test_tam_anh_dinh_dang_khung_khong_chong_nhau_va_co_alpha(khoa):
    cfg = _cfg(khoa)
    tam = Image.open(CHAN / khoa / "atlas.webp")
    assert tam.format == "WEBP" and tam.mode == "RGBA"
    khung = _khung(cfg)
    for i, (ta, (xa, ya, wa, ha)) in enumerate(khung):
        for tb, (xb, yb, wb, hb) in khung[i + 1:]:
            assert xa + wa <= xb or xb + wb <= xa or ya + ha <= yb or yb + hb <= ya, f"{ta} chồng {tb}"
    a = tam.crop((cfg["than"][0], cfg["than"][1], cfg["than"][0] + cfg["khung"][0], cfg["than"][1] + cfg["khung"][1])).getchannel("A")
    assert a.getpixel((2, 2)) == 0 and a.getbbox() is not None, "thân phải có nền trong suốt và phần đặc"
    for b in cfg["bo"]:
        xa_rong = 0
        for p in b["tu_the"]:
            for lop in ("gan", "xa"):
                x, y = p[lop]
                lo, hi = tam.crop((x, y, x + b["R"][2], y + b["R"][3])).getchannel("A").getextrema()
                if lop == "gan":
                    assert lo == 0 and hi == 255, f"{b['ten']}/{lop}/{p['ten']}: alpha không có cả phần đặc lẫn trong suốt"
                elif hi == 0:   # chân xa nhấc lên nằm trọn sau thân thì không có gì để vẽ ở tư thế đó
                    xa_rong += 1
        assert xa_rong <= 1, f"{khoa}/{b['ten']}: {xa_rong} tư thế chân xa trống, chân sẽ biến mất quá lâu"


@pytest.mark.parametrize("khoa", CO_CHAN)
def test_chan_xa_khong_sang_hon_chan_gan(khoa):
    """Chân xa không được sáng hơn chân gần quá 10% (đọc được là chân phía xa): so độ sáng trung bình phần đặc."""
    cfg = _cfg(khoa)
    tam = Image.open(CHAN / khoa / "atlas.webp")
    for b in cfg["bo"]:
        def sang(lop):
            tong = n = 0
            for p in b["tu_the"]:
                x, y = p[lop]
                im = tam.crop((x, y, x + b["R"][2], y + b["R"][3]))
                px = im.resize((im.width // 8, im.height // 8)).tobytes()
                for i in range(0, len(px), 4):
                    if px[i + 3] > 200:
                        tong += (px[i] + px[i + 1] + px[i + 2]) / 3; n += 1
            return tong / max(1, n)
        assert sang("xa") <= sang("gan") * 1.10, f"{khoa}/{b['ten']}: chân xa sáng hơn chân gần"


def test_pha_buoc_dung_quy_uoc():
    for khoa in BON_CHAN:
        bo = {b["ten"]: b for b in _cfg(khoa)["bo"]}
        assert set(bo) == {"sau", "truoc"}
        pha = {  # (chân, lớp) -> pha cộng vào t
            ("sau", "gan"): bo["sau"]["pg"], ("truoc", "gan"): bo["truoc"]["pg"],
            ("sau", "xa"): bo["sau"]["px"], ("truoc", "xa"): bo["truoc"]["px"],
        }
        mod = sorted(round(v % 1, 2) for v in pha.values())
        assert mod == [0.0, 0.25, 0.5, 0.75], f"{khoa}: bốn chân phải lệch pha đều một phần tư, được {mod}"
    for khoa in HAI_CHAN:
        (b,) = _cfg(khoa)["bo"]
        assert b["pg"] == 0 and b["px"] == 0.5, f"{khoa}: hai chân lệch nửa chu kỳ"


def test_tong_dung_luong_anh():
    tong = sum(f.stat().st_size for f in CHAN.rglob("*.webp"))
    assert tong <= 3.5 * 1024 * 1024, f"{tong / 1024 / 1024:.2f} MB"


def test_chi_con_co_chan_co_thu_muc():
    assert sorted(p.name for p in CHAN.iterdir() if p.is_dir()) == sorted(CO_CHAN)


# ── Nối vào thẻ ────────────────────────────────────────────────
def test_the_chon_dung_muoi_con_va_noi_vao_vong_ve():
    js = THE.read_text(encoding="utf-8")
    ds = js.split("const THU_CHAN = new Set([", 1)[1].split("]);", 1)[0]
    khoa = sorted(k.strip().strip('"') for k in ds.split(","))
    assert khoa == sorted(CO_CHAN)
    for k in KHONG_CHAN:
        assert f'"{k}"' not in ds, "rồng và rắn không có chân"
        assert f'  {k}: {{ chinh:' not in js, f"{k} không được đi đường xương: sprite uốn sóng đẹp hơn"
    assert "import { taoChan } from './lich-bloc-xua-chan.js'" in js
    assert js.index("THU_CHAN.has(khoa)") < js.index("THU_XUONG[khoa] && coWebGL()"), "đường chân rời phải được thử trước xương"
    assert 'data-chan="1"' in js and "cv.dataset.chan" in js and "taoChan(cv, cfg, anh)" in js
    assert "x.nghi()" in js, "vòng vẽ phải gọi nghi() khi con vật đứng nghỉ"
    assert "x.nhip ? u * x.nhip : u % 1" in js, "vòng vẽ phải nhân nhịp riêng của chân vẽ rời (chậm hơn xương)"
    assert "this._taiSanKeBen()" in js and "taiSanChan(" in js, "phải tải sẵn con của ngày/tháng kế bên"
    assert "cfg.atlas" in js, "thẻ phải tải tấm ảnh gộp, không tải từng khung"


def test_nep_gap_goc_khong_de_len_dong_thang_nam():
    """Nếp gấp góc phải nằm dưới dòng «THÁNG … BÍNH NGỌ» (cao ≥ 20cqw) và chỉ hiện khi có chuột (không dính trên cảm ứng)."""
    js = THE.read_text(encoding="utf-8")
    dong = next(l for l in js.splitlines() if l.startswith(".canh-xe{"))
    top = float(dong.split("top:", 1)[1].split("cqw", 1)[0])
    assert top >= 20, f"nếp gấp ở top:{top}cqw sẽ đè lên dòng tháng/năm"
    assert "@media (hover:hover){.ban:hover .canh-xe{opacity:1}}" in js


def test_the_vua_chieu_cao_man_hinh():
    """Cả thẻ (kể cả hàng nút) cao ≈ 1,91 lần bề rộng: bề rộng tối đa phải co theo chiều cao màn hình để không tràn."""
    js = THE.read_text(encoding="utf-8")
    dong = next(l for l in js.splitlines() if l.startswith(".ban{"))
    assert "max(240px,calc((100dvh - 96px) / 1.92))" in dong and "max(240px,calc((100vh - 96px) / 1.92))" in dong, "thiếu giới hạn theo chiều cao (dvh, có vh dự phòng)"
    assert dong.index("100vh") < dong.index("100dvh"), "vh phải đứng trước dvh để trình duyệt cũ dùng vh, trình duyệt mới ghi đè bằng dvh"


# ── Bộ vẽ JS thật (cần node) ───────────────────────────────────
def _chay_node(ma: str) -> str:
    r = subprocess.run([NODE, "--input-type=module", "-e", ma], capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, r.stderr
    return r.stdout.strip()


@pytest.mark.skipif(NODE is None, reason="không có node")
def test_bo_ve_thu_tu_lop_cat_khung_va_chon_tu_the():
    ma = textwrap.dedent(f"""
        import {{ taoChan, chiSoTuThe }} from "{MODULE.as_uri()}";
        const goi = [];
        const cx = {{ clearRect() {{ goi.push("xoa"); }},
          drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh) {{ goi.push(`${{sx}},${{sy}},${{sw}}x${{sh}}@${{dx}},${{dy}}`); }} }};
        const cv = {{ getContext: () => cx }};
        // mỗi chân ở tư thế i nằm ở (100*i + {{gan:0|xa:50}}, 10 hoặc 20 theo bộ) trong tấm
        const mk = (y) => [0, .08, .18, .32, .46, .6, .7, .8, .9].map((t, i) => ({{ ten: i === 2 ? "P2_dung" : "P" + i, t, gan: [100 * i, y], xa: [100 * i + 50, y] }}));
        const cau = {{ khung: [100, 80], dy: 4, atlas: "atlas.webp", than: [5, 6], bo: [
          {{ ten: "sau", R: [10, 40, 30, 30], dx: -2, pg: 0, px: .5, tu_the: mk(300) }},
          {{ ten: "truoc", R: [60, 40, 30, 30], dx: 2, pg: -.25, px: .25, tu_the: mk(400) }} ]}};
        const tt = cau.bo[0].tu_the;
        const c = taoChan(cv, cau, {{ ten: "ATLAS" }});
        const ra = {{}};
        ra.khoiDau = goi.splice(0).join("|");            // vẽ nghỉ ngay khi tạo
        c.nghi(); ra.nghiLai = goi.length;               // gọi lại: không vẽ thêm
        c.ve(0); ra.t0 = goi.splice(0).join("|");        // t=0: nhún 0
        c.ve(0.25); ra.t25 = goi.splice(0).join("|");
        ra.chiSo = [chiSoTuThe(tt, 0), chiSoTuThe(tt, .07), chiSoTuThe(tt, .08), chiSoTuThe(tt, .95)];
        ra.nhip = c.nhip;
        c.huy(); c.ve(0.5); ra.sauHuy = goi.length;
        console.log(JSON.stringify(ra));
    """)
    ra = json.loads(_chay_node(ma))
    # đứng nghỉ: chân xa P2_dung (x = 250 + 50 = 250? tư thế 2 → gan (200,y), xa (250,y)), thân (5,6) cỡ 100x80, chân gần P2_dung
    assert ra["khoiDau"] == "xoa|250,300,30x30@8,40|250,400,30x30@62,40|5,6,100x80@0,0|200,300,30x30@10,40|200,400,30x30@60,40"
    assert ra["nghiLai"] == 0
    # t=0: sau gần P0 (pg 0); trước gần pha .75 → P6 (t .7); sau xa pha .5 → P4 (t .46); trước xa pha .25 → P2 (t .18)
    assert ra["t0"] == "xoa|450,300,30x30@8,40|250,400,30x30@62,40|5,6,100x80@0,0|0,300,30x30@10,40|600,400,30x30@60,40"
    # t=0.25: nhún dy = -4*(0.5-0.5*cos(pi)) = -4; sau xa pha .75 → P6
    assert ra["t25"].startswith("xoa|650,300,30x30@8,36") and "5,6,100x80@0,-4" in ra["t25"]
    assert ra["chiSo"] == [0, 0, 1, 8]
    assert ra["nhip"] == 0.6, "nhịp bước phải là 0,6 (một vòng ≈ 2 s như bản demo đã duyệt)"
    assert ra["sauHuy"] == 0


# ── Đột biến: kiểm tra phải bắt được cấu hình hỏng ─────────────
def test_dot_bien_vung_chan_ra_ngoai_khung_bi_bat():
    cfg = copy.deepcopy(_cfg("cho"))
    cfg["bo"][0]["R"][0] = cfg["khung"][0] - 10
    assert any("ra ngoài khung" in l for l in kiem_cau_hinh(cfg))


def test_dot_bien_khung_ra_ngoai_tam_bi_bat():
    cfg = copy.deepcopy(_cfg("heo"))
    tam = Image.open(CHAN / "heo" / "atlas.webp").size
    cfg["bo"][1]["tu_the"][4]["gan"] = [tam[0] - 5, 0]
    assert any("ra ngoài tấm" in l for l in kiem_cau_hinh(cfg, tam))


def test_dot_bien_thieu_tu_the_dung_bi_bat():
    cfg = copy.deepcopy(_cfg("ga"))
    cfg["bo"][0]["tu_the"][2]["ten"] = "P2x"
    assert any("P2_dung" in l for l in kiem_cau_hinh(cfg))


def test_dot_bien_t_khong_tang_bi_bat():
    cfg = copy.deepcopy(_cfg("ty"))
    cfg["bo"][1]["tu_the"][3]["t"] = 0.05
    assert any("t không tăng" in l for l in kiem_cau_hinh(cfg))
