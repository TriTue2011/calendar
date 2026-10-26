"""Đóng gói ảnh «chân vẽ rời» của một con vào frontend/chan/<khoá>/ thành MỘT ảnh ghép (atlas.webp) + lich.json.

Nguồn là thư mục `lap_*` do bộ ghép lớp tạo ra (thân không chân + chín tư thế mỗi chân, lớp gần và lớp xa).
  hai chân : lich.json {R:[x,y,w,h], khung, tu_the}, tệp than.webp, gan_<tư thế>.webp, xa_<tư thế>.webp
  bốn chân : lich.json {khung, bo:[{ten,R,dx,pg,px,tu_the}]}, tệp than.webp, <bộ>_gan_<tư thế>.webp, <bộ>_xa_<tư thế>.webp
Ra: chan/<khoá>/atlas.webp (mọi ảnh xếp kệ vào một tấm) và chan/<khoá>/lich.json (cùng một khuôn cho mọi con):
  {khung:[W,H], dy, atlas, than:[x,y], bo:[{ten, R:[x,y,w,h], dx, pg, px, tu_the:[{ten, t, gan:[x,y], xa:[x,y]}]}]}
  Mỗi khung chân có kích thước R[2]×R[3]; thân có kích thước khung. Gộp một tấm để HACS chỉ tải 2 tệp mỗi con (trước là 38) và thẻ chỉ gọi 1 yêu cầu ảnh.

Dùng: python tools/chan_roi/dung_chan.py <thư mục nguồn> <khoá> hai|bon [dx_chân_xa] [biên_độ_nhún]
  hai chân: chân xa lệch pha 0,5 và dịch ngang dx (mặc định -35); bốn chân: pha và độ lệch đọc từ lich.json.
Ảnh nguồn rộng ~1350 px; thẻ chỉ hiện ~160–380 px CSS nên thu nhỏ TY_LE (0,5) cho nhẹ bộ nhớ khi giải mã (toạ độ, dx, khung, biên độ nhún thu theo).
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image

GOC = Path(__file__).resolve().parents[2]
DICH = GOC / "custom_components" / "lich_viet" / "frontend" / "chan"
TY_LE = 0.5
BE_RONG_TAM = 2048
LE = 2   # khoảng đệm giữa hai khung trong tấm


def thu(nguon: Path) -> Image.Image:
    im = Image.open(nguon).convert("RGBA")
    return im.resize((max(1, round(im.width * TY_LE)), max(1, round(im.height * TY_LE))), Image.LANCZOS)


def xep_ke(muc: list[tuple[str, Image.Image]]) -> tuple[Image.Image, dict[str, list[int]]]:
    """Xếp các ảnh theo kệ (cao trước); trả về tấm ảnh và vị trí [x, y] của từng khoá."""
    vi_tri: dict[str, list[int]] = {}
    x = y = hang = 0
    for ten, im in sorted(muc, key=lambda m: -m[1].height):
        if x and x + im.width > BE_RONG_TAM:
            x, y, hang = 0, y + hang + LE, 0
        vi_tri[ten] = [x, y]
        x += im.width + LE
        hang = max(hang, im.height)
    tam = Image.new("RGBA", (BE_RONG_TAM, y + hang), (0, 0, 0, 0))
    for ten, im in muc:
        tam.paste(im, tuple(vi_tri[ten]))
    return tam, vi_tri


# Tư thế chạm đất (đủ để đứng): chân gần chọn trong ĐUNG_GAN, chân xa trong ĐUNG_XA.
DUNG_GAN = ("P1b_ha", "P2_dung", "P2b_day")
DUNG_XA = ("P1_truoc", "P1b_ha", "P2_dung", "P2b_day", "P3_sau")


def chon_dung(khung: tuple[int, int], than: Image.Image, bo: list[dict], anh: dict[str, Image.Image]) -> dict[str, dict[str, str]]:
    """Với mỗi bộ chân, chọn cặp (gần, xa) đứng chạm đất sao cho chân xa HIỆN RÕ nhất: diện tích chân xa không bị thân và chân gần che.
    Dáng đứng nghỉ cũ vẽ cả hai ở P2_dung nên chân xa lọt sau chân gần, nhìn như mất một chân."""
    W, H = khung
    a_than = np.array(than.getchannel("A")) > 20
    ra: dict[str, dict[str, str]] = {}
    for b in bo:
        x0, y0, w, h = b["R"]
        best = None
        for g in DUNG_GAN:
            ag = np.zeros((H, W), bool); ag[y0:y0 + h, x0:x0 + w] = np.array(anh[f"{b['ten']}/gan/{g}"].getchannel("A")) > 20
            che = a_than | ag
            for x in DUNG_XA:
                ax = np.zeros((H, W), bool)
                dx = b["dx"]
                xs0, xs1 = x0 + dx, x0 + dx + w
                sub = np.array(anh[f"{b['ten']}/xa/{x}"].getchannel("A")) > 20
                ax[y0:y0 + h, max(0, xs0):min(W, xs1)] = sub[:, max(0, -xs0):w - max(0, xs1 - W)]
                hien = int((ax & ~che).sum())
                diem = hien - (0 if g == "P2_dung" else 0.02 * hien)   # ưu tiên nhẹ chân gần thẳng đứng khi hoà
                if best is None or diem > best[0]:
                    best = (diem, g, x)
        ra[b["ten"]] = {"gan": best[1], "xa": best[2]}
    return ra


def main(nguon: Path, khoa: str, loai: str, dx: int = -35, dy: float = 5.0) -> None:
    d = json.loads((nguon / "lich.json").read_text(encoding="utf-8"))
    ra = DICH / khoa
    ra.mkdir(parents=True, exist_ok=True)
    muc = [("than", thu(nguon / "than.webp"))]
    if loai == "hai":
        bo = [{"ten": "chan", "R": d["R"], "dx": dx, "pg": 0.0, "px": 0.5, "tu_the": d["tu_the"]}]
        ten_tep = lambda b, lop, p: f"{lop}_{p}.webp"
    else:
        bo = d["bo"]
        ten_tep = lambda b, lop, p: f"{b['ten']}_{lop}_{p}.webp"
    for b in bo:
        for p in b["tu_the"]:
            for lop in ("gan", "xa"):
                muc.append((f"{b['ten']}/{lop}/{p['ten']}", thu(nguon / ten_tep(b, lop, p["ten"]))))
    anh = dict(muc)
    dung = chon_dung((round(d["khung"][0] * TY_LE), round(d["khung"][1] * TY_LE)), anh["than"],
                     [{**b, "R": [round(v * TY_LE) for v in b["R"]], "dx": round(b["dx"] * TY_LE)} for b in bo], anh)
    tam, vt = xep_ke(muc)
    tam.save(ra / "atlas.webp", "WEBP", quality=88, method=6)
    for b in bo:
        b["R"] = [round(v * TY_LE) for v in b["R"]]
        b["dx"] = round(b["dx"] * TY_LE)
        b["tu_the"] = [{"ten": p["ten"], "t": p["t"], "gan": vt[f"{b['ten']}/gan/{p['ten']}"], "xa": vt[f"{b['ten']}/xa/{p['ten']}"]} for p in b["tu_the"]]
    cfg = {"khung": [round(v * TY_LE) for v in d["khung"]], "dy": dy * TY_LE, "atlas": "atlas.webp", "than": vt["than"], "dung": dung, "bo": bo}
    (ra / "lich.json").write_text(json.dumps(cfg, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    for f in ra.glob("*.webp"):   # dọn ảnh rời của bản đóng gói cũ
        if f.name != "atlas.webp":
            f.unlink()
    print(khoa, dung, sum(f.stat().st_size for f in ra.iterdir()) // 1024, "KB", "tấm", tam.size, "khung", cfg["khung"])


if __name__ == "__main__":
    a = sys.argv[1:]
    main(Path(a[0]), a[1], a[2], int(a[3]) if len(a) > 3 else -35, float(a[4]) if len(a) > 4 else (5.0 if a[2] == "hai" else 3.0))
