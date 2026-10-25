"""Tách ảnh một con vật (nền trắng, chân rời nhau) thành hai lớp cho bộ vẽ xương: LỚP CHÍNH (thân + chân gần) và LỚP CHÂN XA (chân sẫm màu hơn, nằm sau thân).
Dùng:  python3 -I lam_lop.py ảnh_nguon.png thu_muc_ra [--vlo 0.5 --vhi 0.86 --smin 0.45 --h 20 38 --ymin 0.57 --dientich 4000 --rong 800]
Ra: <thu_muc_ra>/goc.png (đã tách nền, cắt sát), chinh.png, xa.png (rộng --rong px), xem.png (hai lớp trên nền xanh để soi bằng mắt).
Điều chỉnh theo TỪNG con (màu chân xa mỗi con một khác): xem xem.png; chân xa phải là các mảng liền, không dính mảnh thân; lớp chính không còn viền sót ở chỗ chân xa cũ.
Nguyên tắc (đã đo trên con chó): (1) chân xa = vùng màu sẫm hơn thân (V trong [vlo,vhi], bão hoà > smin, sắc H trong khoảng) bên dưới đường ngang ymin×cao; chỉ giữ thành phần liền đủ lớn (--dientich);
(2) viền tối KHÔNG sát màu thân sáng (V>0,88) là viền ngoài của chân xa → đi theo chân xa; viền sát thân sáng thuộc thân → ở lại lớp chính;
(3) đầu chân xa nối dài 36 px lên trên bằng phần ruột (thu hẹp mỗi bên 14 px để bỏ viền) cho khỏi lộ mép cắt khi xoay; (4) lớp chính: khoét lõi chân xa nở 3 px, rồi phép mở 7 px trong vùng quanh chân xa để xoá viền mảnh sót."""
import argparse, os, sys
import numpy as np, cv2
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument("nguon"); ap.add_argument("ra")
ap.add_argument("--vlo", type=float, default=0.5); ap.add_argument("--vhi", type=float, default=0.86); ap.add_argument("--smin", type=float, default=0.45)
ap.add_argument("--h", type=float, nargs=2, default=[20, 38]); ap.add_argument("--ymin", type=float, default=0.57)
ap.add_argument("--dientich", type=int, default=4000); ap.add_argument("--rong", type=int, default=800)
a = ap.parse_args(); os.makedirs(a.ra, exist_ok=True)

im = np.array(Image.open(a.nguon).convert("RGB"))
trang = (im.min(axis=2) > 236)
n, lab = cv2.connectedComponents(trang.astype(np.uint8), connectivity=4)
bg = np.zeros_like(trang)
for k in set(lab[0].tolist() + lab[-1].tolist() + lab[:, 0].tolist() + lab[:, -1].tolist()):
    if k: bg |= (lab == k)
al = (~bg).astype(np.uint8) * 255
al = cv2.morphologyEx(al, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)); al = cv2.GaussianBlur(al, (0, 0), 0.8)
ys, xs = np.where(al > 30); x0, x1, y0, y1 = xs.min() - 6, xs.max() + 7, ys.min() - 6, ys.max() + 7
im4 = np.dstack([im, al])[y0:y1, x0:x1]; Image.fromarray(im4, "RGBA").save(f"{a.ra}/goc.png")
rgb, A = im4[:, :, :3], im4[:, :, 3]
hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV_FULL).astype(np.float32); Hh = hsv[:, :, 0] * 360 / 255; S = hsv[:, :, 1] / 255; V = hsv[:, :, 2] / 255
ymin = int(a.ymin * im4.shape[0])
nau = ((V > a.vlo) & (V < a.vhi) & (S > a.smin) & (Hh > a.h[0]) & (Hh < a.h[1]) & (A > 200)).astype(np.uint8); nau[:ymin] = 0
nau = cv2.morphologyEx(nau, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(nau, connectivity=8); loi = np.zeros_like(nau)
for k in range(1, n):
    if st[k, 4] > a.dientich: loi[lab == k] = 1; print("lõi chân xa:", st[k][:4].tolist(), int(st[k, 4]))
E = lambda m, k: cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
toi = ((V < 0.62) & (A > 20)).astype(np.uint8)
gan_than = E(((V > 0.88) & (A > 200)).astype(np.uint8), 11) > 0
vien_ngoai = (E(loi, 25) > 0) & (toi > 0) & (~gan_than)
xa = loi | vien_ngoai.astype(np.uint8); xa = cv2.morphologyEx(xa, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))); xa[:ymin] = 0
mm = cv2.GaussianBlur(xa.astype(np.float32), (0, 0), 1.0)
xaimg = im4.copy(); xaimg[:, :, 3] = (A * mm).astype(np.uint8); ext = xaimg.copy()
nl, lab2, st2, _ = cv2.connectedComponentsWithStats(xa, connectivity=8)
for k in range(1, nl):
    if st2[k, 4] < a.dientich: continue
    yy, xx = np.where(lab2 == k); ytop = yy.min(); hang = np.where(lab2[ytop + 16] == k)[0]
    if len(hang) < 30: continue
    for dy in range(1, 37):
        for x in range(hang.min() + 14, hang.max() - 14 + 1):
            if ext[ytop - dy, x, 3] == 0: ext[ytop - dy, x] = xaimg[ytop + 16, x]
lo = (E(loi, 7) > 0) | vien_ngoai
chinhA = np.where(lo & (V < 0.86), 0, A).astype(np.uint8)
mo = cv2.morphologyEx(chinhA, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
chinhA = np.where(E(xa, 41) > 0, mo, chinhA).astype(np.uint8)
chinh = im4.copy(); chinh[:, :, 3] = chinhA
sc = a.rong / im4.shape[1]; sz = (a.rong, int(im4.shape[0] * sc))
Image.fromarray(chinh, "RGBA").resize(sz, Image.LANCZOS).save(f"{a.ra}/chinh.png"); Image.fromarray(ext, "RGBA").resize(sz, Image.LANCZOS).save(f"{a.ra}/xa.png")
def tren(f, c):
    i = Image.open(f).convert("RGBA"); b = Image.new("RGBA", i.size, c); b.alpha_composite(i); return b.convert("RGB")
c1, c2 = tren(f"{a.ra}/chinh.png", (80, 200, 120, 255)), tren(f"{a.ra}/xa.png", (120, 170, 255, 255))
xem = Image.new("RGB", (c1.width, c1.height * 2 + 8), (255, 255, 255)); xem.paste(c1, (0, 0)); xem.paste(c2, (0, c1.height + 8)); xem.save(f"{a.ra}/xem.png")
print("ảnh gốc cắt", im4.shape[1], "x", im4.shape[0], "→ lớp", sz, "| hệ số thu về", round(sc, 4), "(toạ độ khớp tính ở hệ ảnh gốc cắt, nhân hệ số này)")
