"""Canh cấu trúc: dịch vụ khai báo phải có bản dịch, tệp giao diện đăng ký phải tồn tại, manifest hợp lệ."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest
import yaml

GOC = Path(__file__).resolve().parent.parent / "custom_components" / "lich_viet"
MANIFEST = json.loads((GOC / "manifest.json").read_text(encoding="utf-8"))
DICH = {ng: json.loads((GOC / "translations" / f"{ng}.json").read_text(encoding="utf-8")) for ng in ("vi", "en")}
DICH_VU = yaml.safe_load((GOC / "services.yaml").read_text(encoding="utf-8"))


def test_manifest_hop_le():
    assert MANIFEST["domain"] == "lich_viet" and re.fullmatch(r"\d+\.\d+\.\d+", MANIFEST["version"])
    khoa = list(MANIFEST)
    assert khoa[:2] == ["domain", "name"] and khoa[2:] == sorted(khoa[2:])      # hassfest yêu cầu thứ tự khoá
    assert MANIFEST["config_flow"] is True and MANIFEST["documentation"].endswith("/calendar")


@pytest.mark.parametrize("ngon_ngu", ["vi", "en"])
def test_moi_dich_vu_co_ban_dich_du_ten_mo_ta_va_truong(ngon_ngu):
    dv = DICH[ngon_ngu]["services"]
    assert set(dv) == set(DICH_VU), "dịch vụ khai báo và bản dịch phải khớp nhau"
    for ten, mo_ta in DICH_VU.items():
        assert dv[ten].get("name") and dv[ten].get("description"), ten
        for truong in (mo_ta or {}).get("fields", {}):
            assert dv[ten]["fields"][truong].get("name"), f"{ten}.{truong}"


def test_icon_dich_vu_chi_cho_dich_vu_co_that():
    icons = json.loads((GOC / "icons.json").read_text(encoding="utf-8"))
    assert set(icons["services"]) <= set(DICH_VU)


def test_tep_giao_dien_dang_ky_deu_ton_tai():
    ma = (GOC / "__init__.py").read_text(encoding="utf-8")
    ds = re.search(r"FRONTEND_RESOURCES = \((.*?)\)", ma, re.S).group(1)
    tep = re.findall(r'"([^"]+\.js)"', ds)
    assert "lich-bloc-xua-card.js" in tep
    for t in tep:
        assert (GOC / "frontend" / t).exists(), t


def test_brand_du_bon_tep_va_dung_kich_thuoc():
    from PIL import Image
    for ten, kt in (("icon.png", 256), ("icon@2x.png", 512), ("dark_icon.png", 256), ("dark_icon@2x.png", 512)):
        assert Image.open(GOC / "brand" / ten).size == (kt, kt), ten


def test_the_nhan_loi_cau_hinh_sai():
    js = (GOC / "frontend" / "lich-bloc-xua-card.js").read_text(encoding="utf-8")
    assert 'mode phải là bloc hoặc de_ban' in js and 'customElements.define("lich-bloc-xua-card"' in js


@pytest.mark.parametrize("khoa", ["toc_do", "chay_giay", "nghi_giay", "cai_dat"])
def test_tuy_chon_chuyen_dong_co_trong_the_va_readme(khoa):
    """Mỗi tuỳ chọn chuyển động phải được thẻ đọc (kể cả bảng bánh răng) và được README ghi lại, tránh lệch nhau."""
    the = (GOC / "frontend" / "lich-bloc-xua-card.js").read_text(encoding="utf-8")
    readme = (GOC.parent.parent / "README.md").read_text(encoding="utf-8")
    assert khoa in the and f"{khoa}:" in readme
    if khoa != "cai_dat":
        assert f'data-k="{khoa}"' in the or f"data-k=\"${{k}}\"" in the or f'"{khoa}"' in the


def test_hoat_hoa_con_vat_chay_tren_luong_ghep_hinh_va_cung_mot_chu_ky():
    """Thiết kế giữ cho chuyển động mượt trên điện thoại (đo bằng vết hiệu năng Chrome, 2 giây hoạt họa: bản dùng background-position vẽ lại 135 lần ở luồng chính,
    bản transform + opacity 0 lần): tư thế đổi bằng transform, mờ chuyển bằng opacity, cả hai CÙNG thời lượng (--sd) nên không thể lệch nhịp."""
    the = (GOC / "frontend" / "lich-bloc-xua-card.js").read_text(encoding="utf-8")
    khung = the[the.index("function keyframesSprite"):the.index("const SPRITE_CSS")]
    assert "transform:" in khung and "background-position" not in khung
    css = the[the.index("const SPRITE_CSS"):the.index(".thu-hop{position:relative")]
    assert ".spx.chay .vo.b{opacity:0;animation:spx-ramp var(--sd) linear infinite}" in css and "step-end infinite" in css
    assert "--ft" not in the, "mờ chuyển phải dùng chung --sd với bước đổi tư thế, không có đồng hồ riêng"
