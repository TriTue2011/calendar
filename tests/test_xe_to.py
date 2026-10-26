"""Kiểm tra hiệu ứng xé tờ «giấy cong như thật»: hình học cuộn trụ (node) và nối vào thẻ.

Giấy bị bóc từ góc dưới phải và CONG thành trụ bán kính R (không gập phẳng): từ đường tiếp xúc T tờ giấy cuộn theo cung
(nửa vòng πR) rồi nằm ngược lại đè lên phần còn lại. Kiểm các bất biến:
- phần còn dán + các dải cong + phần nằm ngược lại phủ vừa đủ cả tờ (không hở, không chồng, diện tích cộng lại bằng cả tờ);
- ảnh của mỗi dải qua ma trận rơi vào dải cung v ∈ [−R, 0]; dải thu mỏng theo cosθ, mặt sau khi θ > π/2;
- phần nằm ngược lại nằm phía trên đường T (đè lên phần còn dán); càng bóc phần còn dán càng nhỏ;
- bán kính R lớn lúc đầu (bóc nhẹ) rồi nhỏ dần (gập gắt hơn khi sắp rời).
"""

from __future__ import annotations

import json
import shutil
import subprocess
import textwrap
from pathlib import Path

import pytest

GOC = Path(__file__).resolve().parent.parent
FE = GOC / "custom_components" / "lich_viet" / "frontend"
GIAY = FE / "lich-bloc-xua-giay.js"
THE = FE / "lich-bloc-xua-card.js"
NODE = shutil.which("node")


def _node(ma: str):
    r = subprocess.run([NODE, "--input-type=module", "-e", ma], capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout.strip())


@pytest.mark.skipif(NODE is None, reason="không có node")
def test_hinh_hoc_giay_cong():
    ma = textwrap.dedent(f"""
        import {{ cuonGiay, dangPoly }} from "{GIAY.as_uri()}";
        const dt = (p) => p.length < 3 ? 0 : Math.abs(p.reduce((s, q, i) => {{ const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }}, 0)) / 2;
        const W = 380, H = 650, N = 12, ra = {{ buoc: [] }};
        for (const u of [0, 0.05, 0.25, 0.5, 0.75, 1]) {{
          const g = cuonGiay(W, H, u, N), v = (p) => g.nx * p[0] + g.ny * p[1] + g.c;
          const daiDt = g.dai.reduce((s, d) => s + dt(d.poly), 0);
          // phần ngược lại là gương của phần giấy dài hơn πR nên cùng diện tích với nó
          const gapDt = dt(g.gap);
          let ngoaiCung = 0, saiMat = 0, gapDuoiT = 0;
          g.dai.forEach((d) => {{
            // dung sai: dải thẳng xấp xỉ cung nên lồi ra tối đa vài % bán kính
            const m = d.mat;
            d.poly.forEach((p) => {{ const q = [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]], vq = v(q); if (vq < -1.03 * g.R || vq > 0.02 * g.R) ngoaiCung++; }});
            if (d.sau !== (d.th > Math.PI / 2)) saiMat++;
          }});
          g.gap.forEach((p) => {{ if (v(p) < -0.01) gapDuoiT++; }});
          ra.buoc.push({{ u, truoc: Math.round(dt(g.truoc)), dai: Math.round(daiDt), gap: Math.round(gapDt), ngoaiCung, saiMat, gapDuoiT, R: g.R, yT: Math.round(g.yT), so: g.dai.length }});
        }}
        ra.dang = dangPoly([[0, 0], [10, 0], [10, 5]]);
        ra.rong = dangPoly([]);
        console.log(JSON.stringify(ra));
    """)
    ra = _node(ma)
    b = ra["buoc"]
    assert all(x["so"] == 12 for x in b)
    assert all(x["ngoaiCung"] == 0 for x in b), "ảnh của mọi dải phải rơi vào dải cung v ∈ [−R, 0]"
    assert all(x["saiMat"] == 0 for x in b), "mặt sau khi và chỉ khi θ > π/2"
    assert all(x["gapDuoiT"] == 0 for x in b), "phần nằm ngược lại phải ở phía trên đường tiếp xúc T (đè lên phần còn dán)"
    truoc = [x["truoc"] for x in b]
    assert truoc == sorted(truoc, reverse=True), "càng bóc phần còn dán càng nhỏ"
    assert b[0]["truoc"] == 380 * 650 or b[0]["truoc"] > 0.98 * 380 * 650, "lúc đầu gần như chưa bóc"
    assert b[-1]["truoc"] < 0.2 * 380 * 650, "lúc cuối chỉ còn dải sát mép dán"
    Rs = [x["R"] for x in b]
    assert Rs == sorted(Rs, reverse=True) and Rs[0] > 1.6 * Rs[-1] > 0, "bán kính cuộn nhỏ dần (bóc nhẹ rồi gắt hơn)"
    assert ra["dang"] == "polygon(0.0px 0.0px,10.0px 0.0px,10.0px 5.0px)"
    assert ra["rong"] == "polygon(0 0,0 0,0 0)", "phần rỗng không được làm hỏng clip-path"


@pytest.mark.skipif(NODE is None, reason="không có node")
def test_phan_chia_to_khong_ho_khong_chong():
    """Phần còn dán + mọi dải + phần giấy dài hơn πR phủ đúng cả tờ: đếm điểm mẫu thuộc đúng một vùng theo v."""
    ma = textwrap.dedent(f"""
        import {{ cuonGiay }} from "{GIAY.as_uri()}";
        const W = 380, H = 650, N = 12, ra = [];
        const trong = (poly, x, y) => {{ let t = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {{ const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) t = !t; }} return t; }};
        for (const u of [0.1, 0.4, 0.7, 0.95]) {{
          const g = cuonGiay(W, H, u, N); let hai = 0, khong = 0, tong = 0;
          for (let x = 3; x < W; x += 19) for (let y = 3; y < H; y += 17) {{
            tong++; const v = g.nx * x + g.ny * y + g.c;
            let dem = (v >= 0 && trong(g.truoc, x, y)) ? 1 : 0;
            g.dai.forEach((d) => {{ if (trong(d.poly, x, y)) dem++; }});
            // phần dài hơn πR: không lưu đa giác nguồn, suy từ v ≤ −πR
            if (v <= -Math.PI * g.R) dem++;
            if (dem === 0) khong++; else if (dem > 1) hai++;
          }}
          ra.push({{ u, tong, hai, khong }});
        }}
        console.log(JSON.stringify(ra));
    """)
    for x in _node(ma):
        assert x["khong"] == 0, f"u={x['u']}: {x['khong']}/{x['tong']} điểm không thuộc vùng nào"
        assert x["hai"] <= 0.02 * x["tong"], f"u={x['u']}: {x['hai']}/{x['tong']} điểm thuộc hai vùng (chỉ chấp nhận sát biên)"


def test_the_dung_giay_cong():
    js = THE.read_text(encoding="utf-8")
    assert "import { catNuaMat, cuonGiay, dangPoly } from './lich-bloc-xua-giay.js'" in js
    than = js.split("_dungXe(tren, duoi) {", 1)[1].split("// dán lại", 1)[0]
    assert "cuonGiay(W, H, u, Math.max(1, N))" in than and "cloneNode(true)" in than, "phải cuộn giấy theo dải cong và có mặt sau lộ chữ mờ"
    assert "const N = don ? 0 : 10" in than, "10 dải: đủ cong mà nhẹ cho điện thoại (18 dải làm rớt khung hình)"
    assert "drop-shadow" not in than and "grayscale" not in than and "brightness(" not in than.split("const doi", 1)[1], "không dùng filter trong vòng vẽ: filter bắt mỗi dải dựng lớp riêng cỡ cả tờ"
    assert "hop(d.poly)" in than, "mỗi dải phải là lớp nhỏ theo hộp bao của chính nó, không phải cả tờ"
    assert "if (!dang) await new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin)))" in than, "bấm nút: dựng lớp xong (hai khung) rồi mới đếm giờ để khung đầu không giật"
    assert "nhom.remove()" in than and "bong.remove()" in than, "xong phải dọn lớp phụ"
    assert "mepRach" not in js and "rotateX(-116deg)" not in than and "nepGap" not in js, "hiệu ứng lật/gập phẳng cũ phải bỏ"
    assert "this._hieuUngTat() || imLang" in than, "giảm chuyển động/chạy im lặng vẫn chỉ mờ đi"


def test_vuot_keo_chay_chinh_cuon_giay_va_lien_mach_khi_tha():
    """Vuốt lên: chính cuộn giấy bóc dần theo ngón tay (tờ trên che kín tờ dưới lúc đầu), thả thì chạy tiếp từ mức đang kéo, không nghiêng cứng rồi giật về."""
    js = THE.read_text(encoding="utf-8")
    cu_chi = js.split("_cuChi() {", 1)[1].split("this.tabIndex = 0;", 1)[0]
    assert "this._dungXe(kt," in cu_chi and "c.doi(c.u, 0)" in cu_chi, "kéo phải điều khiển cuộn giấy"
    assert "rotateX" not in cu_chi, "bỏ kiểu nghiêng cứng khi kéo (làm tờ giật về khi thả)"
    assert "huyKeo()" in cu_chi, "kéo ngắn rồi thả phải trả về chỗ cũ"
    xe = js.split("async _xeTo(", 1)[1].split("// dán lại", 1)[0]
    assert "const u0 = ctl.u" in xe and "u0 + (1 - u0) * e" in xe, "chạy tiếp từ mức đang kéo"
    chuyen = js.split("async _chuyenNgay(", 1)[1].split("_xeTo(tren, duoi", 1)[0]
    assert 'duoi.dataset.ngay !== iso(dich)' in chuyen, "tờ dưới đã đúng ngày thì không dựng lại (hình chớp, trễ lúc bắt đầu)"
    assert 'data-ngay="${iso(congNgay(this._ngay, 1))}"' in js


def test_toc_do_xe_ap_cho_xe_dan_lat_va_co_o_cau_hinh():
    """Hệ số tốc độ xé: thời lượng = mặc định / hệ số (giới hạn 0,25–4), có trong thẻ, bảng bánh răng, form cấu hình và README."""
    js = THE.read_text(encoding="utf-8")
    assert "_heSoXe() { const v = +this._cai(\"toc_do_xe\"); return Math.min(4, Math.max(0.25, v > 0 ? v : 1)); }" in js
    xe = js.split("async _xeTo(", 1)[1].split("// dán lại", 1)[0]
    assert "T_BOC = Math.max(260 / hs, 760 * (1 - u0) / hs), T_RA = 340 / hs" in xe
    assert "820 / this._heSoXe()" in js, "dán lại tờ phải theo hệ số"
    assert js.count("900 / this._heSoXe()") == 2, "lật tháng (tờ và bóng) phải theo hệ số"
    assert 'h("Tốc độ xé tờ", "toc_do_xe"' in js and "toc_do_xe: 1" in js and 'name: "toc_do_xe"' in js and "toc_do_xe:" in js.split("const NHAN_SUA", 1)[1]
    assert 'i.dataset.k !== "toc_do_xe"' in js, "kéo thanh tốc độ xé không được khởi động lại lịch nghỉ/chạy của con vật"
    assert "toc_do_xe" in (GOC / "README.md").read_text(encoding="utf-8")


def test_to_duoi_khong_doi_ti_le_theo_khung():
    """Đổi scale/transform của tờ dưới mỗi khung làm trình duyệt dựng lại cả tờ (điện thoại ra ô trống như ảnh chủ máy): chỉ được đổi độ tối bằng lớp phủ."""
    js = THE.read_text(encoding="utf-8")
    dung = js.split("_dungXe(tren, duoi) {", 1)[1].split("// bóc dần từ mức", 1)[0]
    assert "duoi.style.transform" not in dung and "duoi.style.filter" not in dung
    assert "dd.style.opacity" in dung


def test_xe_kieu_don_gian_cho_may_yeu():
    """xe_kieu: don_gian = không nhân bản tờ, không dải (≈4 lớp thay vì 12); mặc định vẫn là cuộn giấy đầy đủ; có trong form cấu hình và README."""
    js = THE.read_text(encoding="utf-8")
    than = js.split("_dungXe(tren, duoi) {", 1)[1].split("// bóc dần từ mức", 1)[0]
    assert 'const don = this._cfg.xe_kieu === "don_gian"' in than
    assert "const eco = don ? document.createElement(\"div\") : banSao()" in than, "chế độ đơn giản không được nhân bản tờ"
    assert "g.dai.slice(0, N)" in than, "N = 0 thì không dựng dải"
    assert "catNuaMat(catNuaMat(" in than, "dải cong của chế độ đơn giản cắt theo vùng cuộn"
    assert 'xe_kieu: "cuon"' in js, "mặc định phải là cuộn giấy đầy đủ"
    assert 'name: "xe_kieu"' in js and "don_gian" in js.split("const SCHEMA_SUA", 1)[1]
    assert "xe_kieu" in (GOC / "README.md").read_text(encoding="utf-8")
