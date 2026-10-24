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
