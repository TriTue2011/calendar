"""Đóng gói ảnh «chân vẽ rời» của một con vào frontend/chan/<khoá>/.

Nguồn là thư mục `lap_*` do bộ ghép lớp tạo ra (thân không chân + chín tư thế mỗi chân, lớp gần và lớp xa).
  hai chân : lich.json {R:[x,y,w,h], khung, tu_the}, tệp than.webp, gan_<tư thế>.webp, xa_<tư thế>.webp
  bốn chân : lich.json {khung, bo:[{ten,R,dx,pg,px,tu_the}]}, tệp than.webp, <bộ>_gan_<tư thế>.webp, <bộ>_xa_<tư thế>.webp
Ra: chan/<khoá>/lich.json (cùng một khuôn cho mọi con) + các ảnh webp, tên theo `<bộ>_gan|xa_<tư thế>.webp`.

Dùng: python tools/chan_roi/dung_chan.py <thư mục nguồn> <khoá> hai|bon [dx_chân_xa] [biên_độ_nhún]
  hai chân: chân xa lệch pha 0,5 và dịch ngang dx (mặc định -35); bốn chân: pha và độ lệch đọc từ lich.json.
Ảnh nguồn rộng ~1350 px; thẻ chỉ hiện ~160–380 px CSS nên thu nhỏ TY_LE (0,5) cho nhẹ bộ nhớ khi giải mã (toạ độ, dx, khung, biên độ nhún thu theo).
"""
import json, sys
from pathlib import Path

from PIL import Image

GOC = Path(__file__).resolve().parents[2]
DICH = GOC / "custom_components" / "lich_viet" / "frontend" / "chan"


TY_LE = 0.5


def thu(nguon: Path, dich: Path) -> None:
    im = Image.open(nguon).convert("RGBA")
    im = im.resize((max(1, round(im.width * TY_LE)), max(1, round(im.height * TY_LE))), Image.LANCZOS)
    im.save(dich, "WEBP", quality=88, method=6)


def main(nguon: Path, khoa: str, loai: str, dx: int = -35, dy: float = 5.0) -> None:
    d = json.loads((nguon / "lich.json").read_text(encoding="utf-8"))
    ra = DICH / khoa
    ra.mkdir(parents=True, exist_ok=True)
    thu(nguon / "than.webp", ra / "than.webp")
    if loai == "hai":
        bo = [{"ten": "chan", "R": d["R"], "dx": dx, "pg": 0.0, "px": 0.5, "tu_the": d["tu_the"]}]
        for p in d["tu_the"]:
            thu(nguon / f"gan_{p['ten']}.webp", ra / f"chan_gan_{p['ten']}.webp")
            thu(nguon / f"xa_{p['ten']}.webp", ra / f"chan_xa_{p['ten']}.webp")
    else:
        bo = d["bo"]
        for b in bo:
            for p in b["tu_the"]:
                for l in ("gan", "xa"):
                    thu(nguon / f"{b['ten']}_{l}_{p['ten']}.webp", ra / f"{b['ten']}_{l}_{p['ten']}.webp")
    for b in bo:   # toạ độ thu theo ảnh; R còn là [x, y, rộng, cao] của vùng chân trong khung
        b["R"] = [round(v * TY_LE) for v in b["R"]]
        b["dx"] = round(b["dx"] * TY_LE)
    cfg = {"khung": [round(v * TY_LE) for v in d["khung"]], "dy": dy * TY_LE, "than": "than.webp", "bo": bo}
    (ra / "lich.json").write_text(json.dumps(cfg, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(khoa, sum(f.stat().st_size for f in ra.iterdir()) // 1024, "KB", cfg["khung"])


if __name__ == "__main__":
    a = sys.argv[1:]
    main(Path(a[0]), a[1], a[2], int(a[3]) if len(a) > 3 else -35, float(a[4]) if len(a) > 4 else (5.0 if a[2] == "hai" else 3.0))
