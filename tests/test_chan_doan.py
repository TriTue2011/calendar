"""Chế độ chẩn đoán (chan_doan: true): thống kê khung hình, báo cáo chữ, nối vào thẻ, canh số phiên bản."""

from __future__ import annotations

import json
import shutil
import subprocess
import textwrap
from pathlib import Path

import pytest

GOC = Path(__file__).resolve().parent.parent
FE = GOC / "custom_components" / "lich_viet" / "frontend"
THE = FE / "lich-bloc-xua-card.js"
CD = FE / "lich-bloc-xua-chandoan.js"
NODE = shutil.which("node")


def _node(ma: str):
    r = subprocess.run([NODE, "--input-type=module", "-e", ma], capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout.strip())


def test_phien_ban_trong_the_khop_manifest():
    ver = json.loads((GOC / "custom_components" / "lich_viet" / "manifest.json").read_text(encoding="utf-8"))["version"]
    assert f'const PHIEN_BAN = "{ver}"' in THE.read_text(encoding="utf-8"), "báo cáo chẩn đoán phải ghi đúng phiên bản đang cài"


@pytest.mark.skipif(NODE is None, reason="không có node")
def test_thong_ke_va_bao_cao():
    ma = textwrap.dedent(f"""
        import {{ thongKeKhung, ChanDoan }} from "{CD.as_uri()}";
        const k = thongKeKhung([16, 17, 16, 40, 120, 17, 60, 16, 16, 16]);
        const cd = new ChanDoan({{ phienBan: "9.9.9", ua: "Android Test", dpr: 2.6, man: "360x780", loi: 8, ram: 4, kieu: "bloc", heo: null }});
        cd.ghiLoi("lỗi thử"); cd.ghiLongTask(77);
        for (const t of [1000, 1016, 1033, 2500, 2516]) cd.vongThu(t);   // khoảng 1467 ms là vòng bị dừng → không tính
        const gh = cd.batDauXe({{ kieu: "vuốt", u0: 0.4, hs: 2 }});
        [0, 16, 32, 80, 96].forEach((t) => gh.khung(t, {{ lop: 7 }})); gh.ket({{ dungLai: 12 }});
        cd.ghiKiemTra("thử");
        const bc = cd.baoCao(() => new Date(2026, 9, 26, 21, 5));
        console.log(JSON.stringify({{ k, bc, vong: cd.vong }}));
    """)
    r = _node(ma)
    assert r["k"] == {"n": 10, "tb": 33, "p95": 120, "max": 120, "c33": 3, "c50": 2, "c100": 1}
    assert r["vong"] == [16, 17, 16], "khoảng dừng >1 s không được tính vào vòng con vật"
    bc = r["bc"]
    for chuoi in ("LỊCH VIỆT 9.9.9 chẩn đoán 26/10 21:05", "DPR 2.6", "màn 360x780", "Lỗi bắt được (1): lỗi thử", "Tác vụ dài >50ms: 1, lâu nhất 77 ms",
                  "Xé #1 [vuốt, u0=0.40, hệ số 2]:", "lớp đồ hoạ tối đa 7", "dựng lại tờ sau xé 12 ms", "Vòng con vật: 3 khung", "Kiểm tra sau xé #1: thử"):
        assert chuoi in bc, chuoi


def test_the_noi_chan_doan_dung_cho():
    js = THE.read_text(encoding="utf-8")
    assert "import { ChanDoan } from './lich-bloc-xua-chandoan.js'" in js
    assert "this._cfg.chan_doan" in js and "this._htmlChanDoan()" in js and "data-cd-chep" in js
    xe = js.split("async _xeTo(", 1)[1].split("// dán lại", 1)[0]
    assert "this._cd?.batDauXe(" in xe and "gh?.khung(now" in xe and "gh?.ket()" in xe
    assert "this._cdKiemTraTo(\"ngay sau xé\")" in js, "phải kiểm tra trạng thái hai tờ ngay sau khi dựng lại"
    assert "this._cd?.vongThu(now)" in js and "this._cd?.datLaiVong()" in js
    assert 'e.target.closest("[data-cdoan]")' in js, "chạm vào khung chẩn đoán không được bắt đầu cử chỉ vuốt"
    assert js.count("this._tatChanDoan()") >= 2, "tắt chan_doan hoặc gỡ thẻ phải gỡ bộ lắng nghe"
    assert 'name: "chan_doan"' in js
    assert "chan_doan" in (GOC / "README.md").read_text(encoding="utf-8")
