// Chế độ chẩn đoán của thẻ «Lịch bloc xưa» (bật bằng `chan_doan: true` trong YAML): đo ngay trên thiết bị đang chạy (kể cả WebView trong ứng dụng
// Home Assistant) rồi gom thành một đoạn chữ ngắn để chép gửi đi. Không gửi gì ra ngoài, không lưu gì, tắt `chan_doan` là hết.
// Phần thuần (thongKeKhung, ChanDoan.baoCao) không đụng DOM nên kiểm thử được bằng node.

const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
const lam = (x) => Math.round(x);

// Thống kê các khoảng giữa hai khung hình (ms): số khung, trung bình, p95, lớn nhất, số khung chậm.
export function thongKeKhung(iv) {
  const n = iv.length;
  if (!n) return { n: 0, tb: 0, p95: 0, max: 0, c33: 0, c50: 0, c100: 0 };
  const tong = iv.reduce((a, b) => a + b, 0);
  return { n, tb: lam(tong / n), p95: lam(pct(iv, 0.95)), max: lam(Math.max(...iv)), c33: iv.filter((x) => x > 33).length, c50: iv.filter((x) => x > 50).length, c100: iv.filter((x) => x > 100).length };
}

const dongKhung = (k) => `${k.n} khung, tb ${k.tb} ms, p95 ${k.p95}, lớn nhất ${k.max}; chậm >33ms: ${k.c33}, >50ms: ${k.c50}, >100ms: ${k.c100}`;

export class ChanDoan {
  constructor(moiTruong) {
    this.env = moiTruong;       // {phienBan, ua, dpr, man, loi, ram, kieu}
    this.loi = []; this.xe = []; this.longtask = []; this.vong = []; this._vongTruoc = 0; this.kiemTra = [];
    this.moLuc = Date.now();
  }
  ghiLoi(thongBao) { if (this.loi.length < 8) this.loi.push(String(thongBao).slice(0, 160)); }
  ghiLongTask(ms) { if (this.longtask.length < 400) this.longtask.push(ms); }
  // vòng con vật: gọi mỗi khung hình của vòng requestAnimationFrame chung; chỉ giữ 600 khung gần nhất
  // >1 s giữa hai khung là vòng bị dừng/dựng lại, không tính
  vongThu(now) { if (this._vongTruoc && now - this._vongTruoc < 1000) { this.vong.push(now - this._vongTruoc); if (this.vong.length > 600) this.vong.shift(); } this._vongTruoc = now; }
  datLaiVong() { this._vongTruoc = 0; }
  // một lần xé: trả về bộ ghi; khung(now, trangThai) mỗi khung, ket(them) khi xong
  batDauXe(mota) {
    const run = { ...mota, iv: [], truoc: 0, giaiDoan: [], dai: 0, t0: 0, tong: 0, dungLai: null, lopMax: 0, daKet: false };
    this.xe.push(run); if (this.xe.length > 6) this.xe.shift();
    const self = this;
    return {
      khung(now, tt) {
        if (run.truoc) run.iv.push(now - run.truoc); else run.t0 = now;
        run.truoc = now;
        if (tt) { run.lopMax = Math.max(run.lopMax, tt.lop || 0); if (tt.bat) run.giaiDoan.push(tt.bat); }
      },
      ket(them) { run.daKet = true; run.tong = lam(performance.now() - (run.t0 || performance.now())); Object.assign(run, them || {}); self.ghi && self.ghi(); },
      run,
    };
  }
  ghiKiemTra(k) { this.kiemTra.push(k); if (this.kiemTra.length > 6) this.kiemTra.shift(); }
  baoCao(giay = () => new Date()) {
    const e = this.env, d = giay(), L = [];
    L.push(`LỊCH VIỆT ${e.phienBan} chẩn đoán ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    L.push(`Máy: ${e.ua} | DPR ${e.dpr} | màn ${e.man} | lõi ${e.loi ?? "?"} | RAM ${e.ram ?? "?"} GB | kiểu ${e.kieu}`);
    L.push(`Lỗi bắt được (${this.loi.length}): ${this.loi.length ? this.loi.join(" || ") : "không"}`);
    const lt = this.longtask;
    L.push(`Tác vụ dài >50ms: ${lt.length}${lt.length ? `, lâu nhất ${lam(Math.max(...lt))} ms` : ""}`);
    this.xe.forEach((r, i) => {
      const k = thongKeKhung(r.iv);
      L.push(`Xé #${i + 1} [${r.kieu}, u0=${(r.u0 ?? 0).toFixed(2)}, hệ số ${r.hs ?? 1}]: ${r.daKet ? r.tong + " ms" : "CHƯA XONG"}; ${dongKhung(k)}; lớp đồ hoạ tối đa ${r.lopMax}` + (r.dungLai != null ? `; dựng lại tờ sau xé ${lam(r.dungLai)} ms` : ""));
    });
    if (this.vong.length) L.push(`Vòng con vật: ${dongKhung(thongKeKhung(this.vong))}`);
    this.kiemTra.forEach((k, i) => L.push(`Kiểm tra sau xé #${i + 1}: ${k}`));
    if (e.heap) L.push(`Bộ nhớ JS: ${e.heap()}`);
    return L.join("\n");
  }
}
