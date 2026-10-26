"""Kiểm tra hiệu ứng xé tờ «như giấy thật»: hình học bóc giấy (node) và nối vào thẻ.

Giấy bị bóc từ góc dưới phải; nếp gấp là một đường thẳng nghiêng. Phần phía góc gập qua nếp (đối xứng gương) nên:
- diện tích phần còn phẳng + diện tích phần gập = diện tích tờ, và phần gập giữ nguyên diện tích sau khi đối xứng;
- càng bóc, phần còn phẳng càng nhỏ, phần gập càng lớn; lúc bắt đầu gần như chưa bóc, lúc cuối chỉ còn dải sát mép trên (chỗ dán);
- phần gập đối xứng nằm cùng phía với phần còn phẳng (gập lên trên tờ), mỗi điểm của nó cách nếp bằng điểm gốc.
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


def _node(ma: str) -> dict:
    r = subprocess.run([NODE, "--input-type=module", "-e", ma], capture_output=True, text=True, timeout=60)
    assert r.returncode == 0, r.stderr
    return json.loads(r.stdout.strip())


@pytest.mark.skipif(NODE is None, reason="không có node")
def test_hinh_hoc_boc_giay():
    ma = textwrap.dedent(f"""
        import {{ nepGap, catNuaMat, guongQua, dangPoly }} from "{GIAY.as_uri()}";
        const dt = (p) => Math.abs(p.reduce((s, q, i) => {{ const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }}, 0)) / 2;
        const W = 380, H = 650, ra = {{ buoc: [] }};
        for (const u of [0, 0.05, 0.25, 0.5, 0.75, 1]) {{
          const g = nepGap(W, H, u);
          const dtGoc = dt(g.goc), dtTruoc = dt(g.truoc), dtGap = dt(g.gap);
          // mọi đỉnh gập cách nếp đúng bằng đỉnh gốc, nằm phía trên nếp (nx·x+ny·y+c ≥ 0)
          let sai = 0, duoiNep = 0;
          g.goc.forEach((p, i) => {{ const d0 = Math.abs(g.nx * p[0] + g.ny * p[1] + g.c), q = g.gap[i], d1 = g.nx * q[0] + g.ny * q[1] + g.c; if (Math.abs(d0 - Math.abs(d1)) > 1e-6) sai++; if (d1 < -1e-6) duoiNep++; }});
          ra.buoc.push({{ u, tong: Math.round(dtGoc + dtTruoc), dtTruoc: Math.round(dtTruoc), dtGoc: Math.round(dtGoc), gapBangGoc: Math.abs(dtGap - dtGoc) < 1e-6, sai, duoiNep, yq: Math.round(g.yq) }});
        }}
        ra.dang = dangPoly([[0, 0], [10, 0], [10, 5]]);
        ra.rong = dangPoly([]);
        console.log(JSON.stringify(ra));
    """)
    ra = _node(ma)
    b = ra["buoc"]
    assert all(x["tong"] == 380 * 650 for x in b), "phần phẳng + phần gập phải bằng cả tờ"
    assert all(x["gapBangGoc"] for x in b), "gập không làm đổi diện tích"
    assert all(x["sai"] == 0 for x in b), "đối xứng giữ nguyên khoảng cách tới nếp"
    assert all(x["duoiNep"] == 0 for x in b), "phần gập phải nằm phía trên nếp (lên trên tờ)"
    truoc = [x["dtTruoc"] for x in b]
    assert truoc == sorted(truoc, reverse=True), "càng bóc phần còn phẳng càng nhỏ"
    assert b[0]["dtGoc"] < 0.07 * 380 * 650, "lúc bắt đầu mới bóc một góc nhỏ"
    assert b[-1]["dtTruoc"] < 0.18 * 380 * 650 and b[-1]["yq"] < 0.12 * 650, "lúc cuối chỉ còn dải sát mép trên (chỗ dán)"
    assert ra["dang"] == "polygon(0.0px 0.0px,10.0px 0.0px,10.0px 5.0px)"
    assert ra["rong"] == "polygon(0 0,0 0,0 0)", "phần rỗng không được làm hỏng clip-path"


def test_the_dung_hinh_hoc_boc_giay_khong_con_mep_rach_cu():
    js = THE.read_text(encoding="utf-8")
    assert "import { dangPoly, nepGap } from './lich-bloc-xua-giay.js'" in js
    thân = js.split("async _xeTo(", 1)[1].split("// dán lại", 1)[0]
    assert "nepGap(W, H, u)" in thân and "cloneNode(true)" in thân, "phải bóc theo hình học và có mặt sau lộ chữ mờ"
    assert "gap.remove()" in thân and "bong.remove()" in thân, "xong phải dọn lớp phụ"
    assert "mepRach" not in js and "rotateX(-116deg)" not in thân, "hiệu ứng lật cứng cũ phải bỏ"
    assert "this._hieuUngTat() || imLang" in thân, "giảm chuyển động/chạy im lặng vẫn chỉ mờ đi"
