"""Đo VỊ TRÍ BÀN CHÂN trên hình vẽ thật của bộ vẽ xương (lớp chân gần và lớp chân xa vẽ riêng): mỗi chân một chuỗi x(t).
Kiểm: (1) cả 4 chân luôn nhìn thấy; (2) chân xa KHÔNG đứng một chỗ: quãng di chuyển ≈ chân gần; (3) bước ĐỀU: quãng di chuyển 4 chân bằng nhau,
pha chạm đất chạy tuyến tính; (4) khoảng cách giữa bàn chân gần–xa cùng cặp ≥ bề ngang chân. Dùng: do_chan.py [N=240] [anh_ra.png]"""
import base64, io, json, shutil, socket, subprocess, sys, tempfile, time, urllib.request
import numpy as np
sys.path.insert(0, "/tmp/claude-0/-opt-claude-c2a/ba994edd-3966-48b1-98dc-16c64d07bc5e/scratchpad/w2a/test")
sys.path.insert(0, "/tmp/claude-0/-opt-claude-c2a/ba994edd-3966-48b1-98dc-16c64d07bc5e/scratchpad/pylib")
import cv2
from ui_chung import CDP
from PIL import Image

N = int(sys.argv[1]) if len(sys.argv) > 1 else 240
RA = sys.argv[2] if len(sys.argv) > 2 else None
URL = sys.argv[3] if len(sys.argv) > 3 else "http://127.0.0.1:8791/xuong_do.html"


def mo_chrome():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); cong = s.getsockname()[1]
    ho = tempfile.mkdtemp(prefix="cdp-chan-")
    p = subprocess.Popen(["/usr/bin/google-chrome", "--headless=new", "--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                          f"--remote-debugging-port={cong}", f"--user-data-dir={ho}", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    mo = urllib.request.build_opener(urllib.request.ProxyHandler({})); ws = None
    for _ in range(200):
        try:
            ws = json.loads(mo.open(f"http://127.0.0.1:{cong}/json/version", timeout=1).read())["webSocketDebuggerUrl"]; break
        except OSError:
            time.sleep(0.05)
    return p, ho, ws


def anh(b64):
    return np.array(Image.open(io.BytesIO(base64.b64decode(b64.split(",", 1)[1]))).convert("RGBA"))


def ban_chan(mask, vung_y0=0, doc_duoi=8):
    """Các thành phần liền của mask (chỉ từ hàng vung_y0 trở xuống) → [(x_ban_chan, y_day, dien_tich)] sắp theo x. Bàn chân = trung bình x của ~doc_duoi hàng thấp nhất."""
    m = mask.copy(); m[:vung_y0] = 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), connectivity=8)
    ra = []
    for k in range(1, n):
        if st[k, 4] < 1500:
            continue
        ys, xs = np.where(lab == k); y1 = ys.max(); sel = ys >= y1 - doc_duoi
        ra.append((float(xs[sel].mean()), int(y1), int(st[k, 4])))
    return sorted(ra)


def main():
    p, ho, ws = mo_chrome()
    c = CDP(ws); tid = c.goi("Target.createTarget", {"url": "about:blank"})["targetId"]; se = c.goi("Target.attachToTarget", {"targetId": tid, "flatten": True})["sessionId"]
    G = lambda m, pa=None: c.goi(m, pa, se)
    G("Runtime.enable"); G("Emulation.setDeviceMetricsOverride", {"width": 1100, "height": 900, "deviceScaleFactor": 1, "mobile": False}); G("Page.navigate", {"url": URL})
    js = lambda e: G("Runtime.evaluate", {"expression": e, "awaitPromise": True, "returnByValue": True})
    for _ in range(150):
        if js("window.san===1")["result"].get("value"):
            break
        time.sleep(0.1)
    else:
        print("lỗi trang:", js("document.body.innerText")); return
    cfg = js("window.cfg")["result"]["value"]; K = cfg["K"]; PX, PY = cfg["le_khung"]
    xa = {"sau": [], "truoc": []}; gan = {"sau": [], "truoc": []}; thieu = 0; tam = []
    Y_BUNG = int(PY + 690 * K)                       # dưới đường bụng (hệ canvas): chỉ phần chân của lớp chính
    for k in range(N):
        a, b = js(f"window.chup({k / N})")["result"]["value"]
        A, B = anh(a), anh(b)
        g = ban_chan(A[:, :, 3] > 128, Y_BUNG); f = ban_chan(B[:, :, 3] > 128, int(PY + 500 * K))
        if len(g) != 2 or len(f) != 2:
            thieu += 1; gan["sau"].append(np.nan); gan["truoc"].append(np.nan); xa["sau"].append(np.nan); xa["truoc"].append(np.nan); continue
        (gan["sau"].append((g[0][0] - PX) / K), gan["truoc"].append((g[1][0] - PX) / K), xa["sau"].append((f[0][0] - PX) / K), xa["truoc"].append((f[1][0] - PX) / K))
        if RA and k in (0, N // 8, N // 4, 3 * N // 8, N // 2, 5 * N // 8, 3 * N // 4, 7 * N // 8):
            comp = Image.new("RGBA", (A.shape[1], A.shape[0]), (238, 226, 205, 255)); comp.alpha_composite(Image.fromarray(B)); comp.alpha_composite(Image.fromarray(A)); tam.append(comp.convert("RGB"))
    c.dong(); p.kill(); p.wait(10); shutil.rmtree(ho, ignore_errors=True)
    legs = {"sau_xa": xa["sau"], "sau_gan": gan["sau"], "truoc_gan": gan["truoc"], "truoc_xa": xa["truoc"]}
    rong = {kk: next(g["rong"] for lop in ("chinh", "xa") for g in cfg[lop]["chan"] if g["ten"] == kk.split("_")[0] and ((lop == "xa") == kk.endswith("xa"))) for kk in legs}
    print(f"khung đo: {N}, khung thiếu chân (không đủ 2+2 chân tách rời): {thieu}")
    ptp = {}
    for ten, s in legs.items():
        s = np.array(s, dtype=float)
        ptp[ten] = np.nanmax(s) - np.nanmin(s)
        # pha chạm đất = 60% đầu của chu kỳ: x phải trượt đều (tuyến tính) — độ lệch so với đường thẳng
        ph = next(g["ph"] for lop in ("chinh", "xa") for g in cfg[lop]["chan"] if g["ten"] == ten.split("_")[0] and ((lop == "xa") == ten.endswith("xa")))
        s = np.roll(s, int(round(ph * N)))                  # chân lệch pha: xoay chuỗi để cửa sổ chạm đất bắt đầu ở 0
        n_st = int(N * 0.6); seg = s[:n_st]; ok = ~np.isnan(seg)
        co = np.polyfit(np.arange(n_st)[ok], seg[ok], 1); res = seg[ok] - np.polyval(co, np.arange(n_st)[ok])
        print(f"  {ten:10s} quãng di chuyển {ptp[ten]:6.1f} px | x nhỏ nhất {np.nanmin(s):6.1f} lớn nhất {np.nanmax(s):6.1f} | pha chạm đất: độ lệch khỏi đường thẳng lớn nhất {np.abs(res).max():4.1f} px (tốc độ {co[0] * N / 1.2:6.0f} px/s)")
    tb = np.mean(list(ptp.values()))
    print("  quãng di chuyển: nhỏ nhất/lớn nhất = %.2f ; chân xa / chân gần cùng cặp: sau %.2f, trước %.2f" % (min(ptp.values()) / max(ptp.values()), ptp["sau_xa"] / ptp["sau_gan"], ptp["truoc_xa"] / ptp["truoc_gan"]))
    for ten, (n, x) in {"cặp sau": ("sau_gan", "sau_xa"), "cặp trước": ("truoc_gan", "truoc_xa")}.items():
        d = np.abs(np.array(legs[n]) - np.array(legs[x])); can = (rong[n] + rong[x]) / 2
        print(f"  {ten}: khoảng cách ngang bàn chân gần–xa nhỏ nhất {np.nanmin(d):6.1f} px (cần ≥ {can:.0f}: bề ngang chân) → {'ĐẠT' if np.nanmin(d) >= can else 'KHÔNG ĐẠT'}")
    if RA and tam:
        w, h = tam[0].size; o = Image.new("RGB", (w * 4 // 2, h * 2 // 2), (255, 255, 255))
        o = Image.new("RGB", (w * 4, h * 2), (255, 255, 255))
        for i, im in enumerate(tam):
            o.paste(im, ((i % 4) * w, (i // 4) * h))
        o.resize((o.width // 2, o.height // 2), Image.LANCZOS).save(RA); print("ảnh:", RA)


main()
