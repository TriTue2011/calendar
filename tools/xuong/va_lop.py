"""Vá hai lỗi chung của các lớp ảnh xương (chạy SAU dung_xuong.py):
 (1) KHE ở chỗ cắt chân xa: lớp chân xa nằm SAU thân; đầu chân của nó phải đặc và nối dài lên phía trên hàng cắt vài chục điểm ảnh, nếu không thì cạnh mềm của đáy thân
     và cạnh mềm của đầu chân cùng bán trong suốt, hở một đường sáng. Nối dài bằng chính màu ruột chân (phần dư bị thân che).
 (2) VÙNG TRẮNG ĐẶC BỊ KẸT (nền trắng nằm lọt trong vòng sừng, vòng đuôi): điểm gần trắng tuyệt đối, liền thành mảng ≥ 300 điểm ảnh, không chạm viền ảnh → trong suốt.
Dùng: va_lop.py <thư mục xuong> khoá [khoá ...]"""
import sys
import numpy as np, cv2
from PIL import Image

def mo(p): return np.array(Image.open(p).convert("RGBA"))
def luu(a, p): Image.fromarray(a, "RGBA").save(p, "WEBP", quality=90, method=6)

def bit_khe(a, che, keo=26, dai_sat=4):
    """che = kênh alpha của LỚP CHÍNH (thân). Chỉ nối dài ở điểm thân che (alpha ≥ 128) cộng một dải mỏng `dai_sat` hàng sát hàng cắt; chỗ nào thân không che thì KHÔNG nối (không lộ khối chữ nhật ngoài viền thân)."""
    rgb, al = a[:, :, :3].copy(), a[:, :, 3]
    n, lab, st, _ = cv2.connectedComponentsWithStats((al > 40).astype(np.uint8), connectivity=8)
    so = 0
    for k in range(1, n):
        if st[k, 4] < 500: continue
        ys, xs = np.where(lab == k); r0 = ys.min()
        ref = min(r0 + 10, al.shape[0] - 1)
        cot = [x for x in range(st[k, 0], st[k, 0] + st[k, 2]) if al[ref, x] >= 200 and lab[ref, x] == k]
        for x in cot:
            for y in range(max(0, r0 - keo), ref):
                if che[y, x] >= 128 or y >= r0 - dai_sat:
                    a[y, x, :3] = rgb[ref, x]; a[y, x, 3] = 255
        so += len(cot)
    return so

def bo_trang_ket(a):
    al = a[:, :, 3]; trang = ((a[:, :, :3].min(axis=2) >= 252) & (al > 200)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(trang, connectivity=4); ra = []
    H, W = al.shape
    for k in range(1, n):
        x, y, w, h, ar = st[k]
        if ar >= 300 and x > 0 and y > 0 and x + w < W and y + h < H:
            m = cv2.dilate((lab == k).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
            a[m, 3] = 0; ra.append((int(ar), int(x), int(y), int(w), int(h)))
    return ra

if __name__ == "__main__":
    thu = sys.argv[1].rstrip("/")
    for k in sys.argv[2:]:
        for lop in ("chinh", "xa"):
            p = f"{thu}/{k}-{lop}.webp"
            try: a = mo(p)
            except FileNotFoundError: continue
            ra = bo_trang_ket(a); so = bit_khe(a, mo(f"{thu}/{k}-chinh.webp")[:, :, 3]) if lop == "xa" else 0
            luu(a, p); print(f"{k:5s} {lop:5s}: bỏ {len(ra)} mảng trắng kẹt {ra[:3]} | nối dài đầu chân {so} cột")
