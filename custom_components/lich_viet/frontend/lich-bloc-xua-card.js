// Thẻ «Lịch bloc xưa» cho Home Assistant (Lịch Việt).
// Hai chế độ: «bloc» (tờ lịch xé từng ngày) và «de_ban» (lịch tháng gáy lò xo, lật tờ qua gáy).
// Dữ liệu âm dương, giờ hoàng đạo, ca dao… lấy từ lõi của bộ thẻ; hình con giáp là sprite WebP phát bằng CSS
// (không vòng lặp JS), tự dừng khi thẻ ra khỏi màn hình hoặc tab bị ẩn.

import {
  CA_DAO_TUC_NGU, CHI_EMOJI, NGAY_LE_AL, NGAY_LE_AL_STRING, NGAY_LE_DL, NGAY_LE_DL_STRING, TIETKHI, TUAN,
  getCanChi, getGioHoangDao, getHuongXuatHanh, getLunarDate, getSunLongitude, getThanSat, getUniqueDailyContent, getYearCanChi,
} from './lich-am-duong-viet-nam-core.js?v=20261005';
import { CHI_KHOA, TEN_THU, THU_CSS, veConGiap } from './lich-bloc-xua-thu.js';

const THU_ANH = {
  // mọi sprite sheet: lưới cot × hang khung, phát theo thứ tự; fps là tốc độ khi «chạy»
  ngo: { cot: 4, hang: 3, fps: 14 }, ty: { cot: 4, hang: 3, fps: 10 }, suu: { cot: 4, hang: 3, fps: 9 }, dan: { cot: 4, hang: 3, fps: 10 },
  mao: { cot: 4, hang: 3, fps: 10 }, thin: { cot: 4, hang: 3, fps: 10 }, ran: { cot: 4, hang: 3, fps: 10 }, mui: { cot: 4, hang: 3, fps: 10 },
  than: { cot: 4, hang: 3, fps: 10 }, ga: { cot: 4, hang: 3, fps: 10 }, cho: { cot: 4, hang: 3, fps: 11 }, heo: { cot: 4, hang: 3, fps: 10 },
};
const GOC = new URL("./thu/", import.meta.url).href;
const LE_NGHI_DL = new Set(["1/1", "30/4", "1/5", "2/9"]);
const LE_NGHI_AL = new Set(["1/1", "2/1", "3/1", "10/3"]);
const THANG = ["", "Một", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "M. Một", "Chạp"];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const cat = (html) => String(html ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const cungNgay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const congNgay = (d, n) => { const r = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return r; };

// ---------- thông tin một ngày ----------
export function thongTinNgay(d) {
  const dd = d.getDate(), mm = d.getMonth() + 1, yy = d.getFullYear();
  const al = getLunarDate(dd, mm, yy);
  const canChi = getCanChi(al); // [ngày, tháng, năm]
  const le = [];
  NGAY_LE_DL.forEach((k, i) => { if (k === `${dd}/${mm}`) le.push(NGAY_LE_DL_STRING[i]); });
  if (al.leap === 0) NGAY_LE_AL.forEach((k, i) => { if (k === `${al.day}/${al.month}`) le.push(NGAY_LE_AL_STRING[i]); });
  const nghi = LE_NGHI_DL.has(`${dd}/${mm}`) || (al.leap === 0 && LE_NGHI_AL.has(`${al.day}/${al.month}`));
  const gio = [];
  const re = /([^\s,<>]+)\s+\S+\s+<b[^>]*>\((\d+)-(\d+)h\)<\/b>/g;
  let m; const html = getGioHoangDao(al.jd);
  while ((m = re.exec(html))) gio.push({ chi: m[1], tu: +m[2], den: +m[3] });
  const ts = getThanSat(al);
  const tot = ts.truc?.info?.tot || "", xau = ts.truc?.info?.xau || "";
  return {
    d, dd, mm, yy, thu: TUAN[d.getDay()], cn: d.getDay() === 0, t7: d.getDay() === 6, al, canChi, le, nghi,
    tiet: TIETKHI[getSunLongitude(al.jd + 1, 7.0)], gio, huong: cat(getHuongXuatHanh(al.jd)),
    truc: ts.truc?.name || "", sao: ts.sao?.name || "", saoDanhGia: ts.sao?.info?.danhGia || "", tot, xau,
    namCan: getYearCanChi(al.year), caDao: getUniqueDailyContent(CA_DAO_TUC_NGU, "lich_viet_cadao", d),
  };
}
const chiCua = (canChi) => String(canChi || "").split(" ").pop();
// con giáp hiển thị: mặc định theo NGÀY (đổi mỗi tờ, giống thẻ của Khải); cấu hình con_giap: ngay | thang | nam
const chiThu = (tt, loai = "ngay") => CHI_KHOA[chiCua(tt.canChi[{ ngay: 0, thang: 1, nam: 2 }[loai] ?? 0])] || "ngo";
const huyHieu = (tt) => ["Ngày", "Tháng", "Năm"].map((n, i) => `<span>${n} ${esc(chiCua(tt.canChi[i]))}</span>`).join("");
const gioHienTai = (gio, now) => { const h = now.getHours(); return gio.find((g) => (g.tu > g.den ? h >= g.tu || h < g.den : h >= g.tu && h < g.den)); };

// ---------- hình con giáp: sprite WebP (nếu có), không thì bộ vector dự phòng ----------
let _uid = 0;
function keyframesSprite(ten, cot, hang) {
  const n = cot * hang; let s = `@keyframes ${ten}{`;
  for (let i = 0; i < n; i++) {
    const c = i % cot, r = Math.floor(i / cot);
    s += `${(i * 100 / n).toFixed(3)}%{background-position:${cot > 1 ? (c * 100 / (cot - 1)).toFixed(2) : 0}% ${hang > 1 ? (r * 100 / (hang - 1)).toFixed(2) : 0}%}`;
  }
  return s + "}";
}
const SPRITE_CSS = Object.entries(THU_ANH).map(([k, v]) => keyframesSprite("sp-" + k, v.cot, v.hang)).join("\n") + `
.sp{display:block;width:100%;background-repeat:no-repeat;background-position:0 0;image-rendering:auto}
.sp.chay{animation-name:var(--sp);animation-duration:var(--sd);animation-iteration-count:infinite;animation-timing-function:step-end}
.thu-hop{position:relative;width:100%}
.thu-hop.dung .sp,.dung .sp{animation-play-state:paused}
`;
const spriteCache = new Map(); // khoa -> Promise<{rong, cao} | null>
function dongSprite(khoa) {
  if (!spriteCache.has(khoa)) {
    spriteCache.set(khoa, new Promise((res) => {
      if (!THU_ANH[khoa]) return res(null);
      const im = new Image();
      im.onload = () => res({ rong: im.naturalWidth / THU_ANH[khoa].cot, cao: im.naturalHeight / THU_ANH[khoa].hang });
      im.onerror = () => res(null);
      im.src = `${GOC}${khoa}.webp`;
    }));
  }
  return spriteCache.get(khoa);
}
async function hinhThu(khoa, chay) {
  const sp = await dongSprite(khoa);
  if (sp) {
    const c = THU_ANH[khoa], n = c.cot * c.hang;
    return `<div class="sp${chay ? " chay" : ""}" style="aspect-ratio:${sp.rong}/${sp.cao};background-image:url('${GOC}${khoa}.webp');background-size:${c.cot * 100}% ${c.hang * 100}%;--sp:sp-${khoa};--sd:${(n / c.fps).toFixed(3)}s" role="img" aria-label="${esc(TEN_THU[khoa] || "")}"></div>`;
  }
  return `<div class="thu ${chay ? "di" : "nghi"}">${veConGiap(khoa, "u" + ++_uid)}</div>`;
}

// ---------- CSS ----------
const CSS = `
:host{display:block;--giay:#f6edd6;--giay2:#efe2c2;--muc:#2d1b10;--do:#b3261e;--vang:#c8962e;--xanh:#2a6a54;--vien:#8a2a1c;
 font-family:"Noto Serif","Source Serif 4",Georgia,"Times New Roman",serif;color:var(--muc);-webkit-tap-highlight-color:transparent}
*{box-sizing:border-box}
.ban{container-type:inline-size;position:relative;width:100%;max-width:var(--rong,380px);margin:0 auto;user-select:none;touch-action:pan-x}
button{font:inherit;color:inherit}
.giay{background-color:var(--giay);
 background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .38 0 0 0 0 .26 0 0 0 0 .1 0 0 0 .1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"),
 radial-gradient(120% 90% at 50% 40%,rgba(255,255,255,.55),rgba(255,255,255,0) 60%),linear-gradient(180deg,#f9f1dc,#eddcb5);
 box-shadow:inset 0 0 28px rgba(150,100,30,.28)}
/* ================= BLOC ================= */
.chong{position:relative;perspective:1500px;perspective-origin:50% 8%;padding-top:4.2cqw}
.chong::before{content:"";position:absolute;left:3cqw;right:3cqw;bottom:-2.4cqw;height:5cqw;border-radius:50%;background:radial-gradient(ellipse at center,rgba(60,35,10,.38),rgba(60,35,10,0) 70%);z-index:0}
.to,.to-ao{position:relative;width:100%;aspect-ratio:360/560;border-radius:1.4cqw 1.4cqw 2.2cqw 2.2cqw;overflow:hidden}
.nen-to{position:relative;z-index:1;border-radius:1.4cqw 1.4cqw 2.2cqw 2.2cqw;box-shadow:0 .6cqw 0 #e6d6ae,0 1.2cqw 0 #dccb9d,0 1.8cqw 0 #d1bf8f,0 2.4cqw 3cqw rgba(50,28,8,.35)}
.lop{position:absolute;inset:0}
.lop.duoi{z-index:1}.lop.tren{z-index:3;transform-origin:50% 0;will-change:transform}
.lop .to{position:absolute;inset:0;height:100%;aspect-ratio:auto}
.ghim{position:absolute;z-index:6;top:0;left:0;right:0;height:5.6cqw;border-radius:1.4cqw 1.4cqw 0 0;background:linear-gradient(180deg,#8f2318,#6e1810 70%,#561009);box-shadow:0 .5cqw 1cqw rgba(0,0,0,.35)}
.ghim::before,.ghim::after{content:"";position:absolute;top:1cqw;width:3.2cqw;height:3.2cqw;border-radius:50%;background:radial-gradient(circle at 40% 35%,#2b1208,#000 70%);box-shadow:inset 0 .3cqw .6cqw rgba(0,0,0,.8),0 .2cqw 0 rgba(255,255,255,.18)}
.ghim::before{left:9cqw}.ghim::after{right:9cqw}
.ghim i{position:absolute;left:50%;top:1.6cqw;width:14cqw;height:2cqw;margin-left:-7cqw;border-radius:1cqw;background:linear-gradient(180deg,#e9e4da,#9c968a);box-shadow:0 .3cqw .5cqw rgba(0,0,0,.4)}
.xepto{position:absolute;inset:0;z-index:2;border-radius:inherit;pointer-events:none;background:linear-gradient(180deg,rgba(40,20,5,.0),rgba(40,20,5,.0));opacity:0}
.noidung{position:absolute;inset:0;padding:5.8cqw 4.6cqw 4cqw;display:flex;flex-direction:column;justify-content:space-between;gap:.8cqw}
.vien-trong{position:absolute;inset:2.6cqw;border:.5cqw double rgba(138,42,28,.55);border-radius:1cqw;pointer-events:none}
.dau-to{display:flex;justify-content:space-between;align-items:baseline;font-weight:700;letter-spacing:.14em;color:var(--vien);font-size:4.3cqw;text-transform:uppercase;padding:0 1cqw;border-bottom:.35cqw dotted rgba(138,42,28,.5);padding-bottom:1.1cqw}
.dau-to b{font-size:5.4cqw;letter-spacing:.06em}
.thu-ngay{text-align:center;font-weight:800;letter-spacing:.34em;color:var(--muc);font-size:5.6cqw;margin-top:.6cqw;text-transform:uppercase}
.so{text-align:center;font-family:"Playfair Display","Noto Serif Display","Bodoni MT",Georgia,serif;font-weight:900;font-size:29cqw;line-height:30cqw;height:30cqw;font-variant-numeric:lining-nums;color:#241710;text-shadow:0 .5cqw 0 rgba(255,255,255,.55),0 -.2cqw 0 rgba(0,0,0,.18);letter-spacing:-.02em;margin:-.4cqw 0 0}
.so.do{color:var(--do)}.so.t7{color:#1d4a63}
.am{text-align:center;font-size:4.7cqw;font-weight:700;color:var(--vien);line-height:1.25}
.am small{display:block;font-size:3.5cqw;font-weight:500;color:var(--muc);opacity:.85;letter-spacing:.02em}
.le{margin:.4cqw auto 0;padding:.5cqw 3cqw;border-radius:99px;background:var(--do);color:#fff3d6;font-size:3.5cqw;font-weight:700;letter-spacing:.04em;text-align:center;max-width:92%}
.khung-thu{position:relative;flex:0 0 auto;min-height:0;display:grid;grid-template-columns:44% 1fr;gap:2cqw;align-items:end;border-top:.35cqw dotted rgba(138,42,28,.45);border-bottom:.35cqw dotted rgba(138,42,28,.45);padding:1cqw 0}
.canh-thu{position:relative;align-self:end;overflow:visible;padding-bottom:1.2cqw}
.canh-thu::after{content:"";position:absolute;left:-4%;right:-4%;bottom:.4cqw;height:.9cqw;border-radius:99px;background:repeating-linear-gradient(90deg,rgba(90,60,20,.45) 0 5cqw,transparent 5cqw 8cqw);animation:duong 1.1s linear infinite;animation-play-state:paused;opacity:.7}
.chay-on.dang-chay .canh-thu::after{animation-play-state:running}
@keyframes duong{to{background-position-x:-8cqw}}
.hh{display:flex;gap:.8cqw;justify-content:center;margin-top:.6cqw;font-size:2.5cqw;font-weight:700;color:var(--vien);white-space:nowrap}
.hh span{background:rgba(255,248,230,.85);border:.25cqw solid rgba(200,150,46,.7);border-radius:99px;padding:.15cqw 1.4cqw}
.dau-thang .hh{justify-content:flex-end;flex-wrap:wrap;color:#fff1cf}.dau-thang .hh span{background:rgba(0,0,0,.22);border-color:rgba(255,230,160,.6)}
.thongtin{font-size:3.4cqw;line-height:1.35;display:flex;flex-direction:column;gap:.9cqw;align-self:center}
.thongtin div{display:flex;gap:1.2cqw}
.thongtin b{color:var(--vien);min-width:11cqw;font-weight:700}
.gio{display:grid;grid-template-columns:repeat(6,1fr);gap:.8cqw;margin-top:.4cqw}
.gio span{font-size:2.9cqw;text-align:center;padding:.5cqw 0;border-radius:.8cqw;background:rgba(138,42,28,.07);color:rgba(45,27,16,.45)}
.gio span.hd{background:var(--vien);color:#fff4d9;font-weight:700}
.gio span.nay{outline:.4cqw solid var(--vang);box-shadow:0 0 0 .3cqw var(--giay);animation:nhap 1.6s ease-in-out infinite;animation-play-state:paused}
.chay-on .gio span.nay{animation-play-state:running}
@keyframes nhap{50%{filter:brightness(1.25)}}
.nenky{font-size:3.2cqw;line-height:1.32;display:grid;grid-template-columns:1fr 1fr;gap:2cqw}
.nenky p{margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.nenky p b{color:var(--xanh)}.nenky p.ky b{color:var(--do)}
.cadao{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-align:center;font-style:italic;font-size:3.5cqw;line-height:1.32;color:#3b2616;padding:1.2cqw 2.4cqw;border-radius:1cqw;background:rgba(200,150,46,.12);box-shadow:inset 0 0 0 .3cqw rgba(200,150,46,.45)}
.sukien{display:flex;flex-wrap:wrap;gap:1cqw;justify-content:center;font-size:3.2cqw}
.sukien span{background:#fff8e6;border:.3cqw solid var(--vang);border-radius:99px;padding:.3cqw 2.2cqw}
.bong-to{position:absolute;inset:0;z-index:5;pointer-events:none;opacity:0;background:linear-gradient(180deg,rgba(255,255,255,.0) 0,rgba(40,20,5,.45) 100%)}
.canh-xe{position:absolute;z-index:7;top:5.6cqw;right:0;width:13cqw;height:13cqw;pointer-events:none;
 background:linear-gradient(225deg,rgba(0,0,0,0) 48%,rgba(90,60,20,.28) 50%,#fff7e0 52%,#e3d2a6 100%);border-radius:0 0 0 2cqw;transition:width .25s,height .25s;opacity:.0}
.ban:hover .canh-xe{opacity:1}
/* thanh nút */
.thanhnut{display:flex;justify-content:center;gap:2cqw;margin-top:4cqw}
.nut{border:.35cqw solid rgba(138,42,28,.55);background:#fff8e6;color:var(--vien);border-radius:99px;padding:1.3cqw 3.6cqw;font-size:3.5cqw;font-weight:700;cursor:pointer;transition:transform .12s,background .2s}
.nut:hover{background:#ffeec2}.nut:active{transform:scale(.95)}
.nut.nho{padding:1.3cqw 2.6cqw}
/* ================= ĐỂ BÀN ================= */
.de-ban{position:relative;perspective:1700px;padding:0 1cqw}
.de-khung{position:relative;transform-origin:50% 100%;transform:rotateX(2deg);padding-top:6cqw}
.lo-xo{position:absolute;z-index:8;top:0;left:5cqw;right:5cqw;height:9cqw;display:flex;justify-content:space-between;pointer-events:none}
.lo-xo i{display:block;width:3.3cqw;height:9cqw;border-radius:2cqw;border:.7cqw solid #b9b6b0;border-bottom-color:#6e6b66;background:linear-gradient(90deg,rgba(255,255,255,.7),rgba(0,0,0,0) 55%);transform:rotate(-8deg);box-shadow:0 .5cqw .6cqw rgba(0,0,0,.35)}
.trang{position:relative;border-radius:1.6cqw;overflow:hidden;min-height:0}
.lop-trang{position:absolute;inset:0;z-index:3;transform-origin:50% 0;border-radius:inherit}
.mat-truoc,.mat-sau{position:absolute;inset:0;backface-visibility:hidden;border-radius:inherit;overflow:hidden}
.mat-sau{transform:rotateX(180deg);background:linear-gradient(180deg,#e6d7ad,#d6c394)}
.bong-lat{position:absolute;inset:0;pointer-events:none;opacity:0;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(30,15,4,.5))}
.nen-trang{position:relative;z-index:1}
.dau-thang{position:relative;padding:5cqw 4cqw 2.4cqw;display:grid;grid-template-columns:1fr 38%;align-items:end;background:linear-gradient(180deg,#b3261e,#8c1c14);color:#fff1cf;border-bottom:.8cqw solid var(--vang)}
.dau-thang .t{font-weight:900;font-size:8.6cqw;letter-spacing:.06em;text-transform:uppercase;line-height:1}
.dau-thang .n{font-size:3.7cqw;letter-spacing:.12em;opacity:.95;margin:.8cqw 0 3.6cqw}
.dau-thang .am-thang{font-size:3.1cqw;opacity:.85;margin-bottom:3cqw}
.dau-thang .canh-thu{padding-bottom:0;margin-bottom:-.2cqw}
.dau-thang .canh-thu::after{display:none}
.luoi-thu{display:grid;grid-template-columns:repeat(7,1fr);padding:1.6cqw 2cqw 0;gap:0}
.luoi-thu .th{font-size:3cqw;font-weight:800;text-align:center;color:var(--vien);padding:1.2cqw 0}
.luoi-thu .th.cn{color:var(--do)}
.o{position:relative;aspect-ratio:1/1.08;border:0;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2cqw;cursor:pointer;border-radius:1.4cqw;padding:0;color:inherit;transition:background .15s,transform .12s}
.o:hover{background:rgba(200,150,46,.18)}.o:active{transform:scale(.94)}
.o b{font-size:5.4cqw;font-weight:800;font-family:"Playfair Display",Georgia,serif;line-height:1;font-variant-numeric:lining-nums}
.o small{font-size:2.6cqw;opacity:.7;line-height:1}
.o.la{opacity:.32}.o.cn b,.o.nghi b{color:var(--do)}.o.t7 b{color:#1d4a63}
.o.mung1 small{color:var(--do);font-weight:800;opacity:1}
.o.nay{background:radial-gradient(circle at 50% 50%,#d6332a 0 62%,transparent 64%)}.o.nay b,.o.nay small{color:#fff6dc;opacity:1}
.o.chon{box-shadow:inset 0 0 0 .5cqw var(--vang);background:rgba(200,150,46,.18)}
.o i.cs{position:absolute;top:1cqw;right:1.6cqw;width:1.6cqw;height:1.6cqw;border-radius:50%;background:var(--xanh)}
.chitiet{margin:1.4cqw 3cqw 3.4cqw;padding:2cqw 2.6cqw;border-radius:1.4cqw;background:rgba(255,248,230,.75);box-shadow:inset 0 0 0 .3cqw rgba(200,150,46,.5);font-size:3.2cqw;line-height:1.38}
.chitiet h4{margin:0 0 .8cqw;color:var(--vien);font-size:3.8cqw}
.chitiet .dong{display:flex;flex-wrap:wrap;gap:.8cqw 2cqw;opacity:.92}
.chan-de{position:relative;height:9cqw;margin:0 4cqw;clip-path:polygon(2% 0,98% 0,100% 100%,0 100%);background:repeating-linear-gradient(92deg,#a06a38 0 1.4cqw,#94602f 1.4cqw 2.6cqw,#a77440 2.6cqw 4cqw);box-shadow:inset 0 1cqw 1.4cqw rgba(0,0,0,.35)}
.bong-ban{position:absolute;left:6%;right:6%;bottom:-3cqw;height:6cqw;border-radius:50%;background:radial-gradient(ellipse at center,rgba(40,24,8,.45),rgba(40,24,8,0) 70%);z-index:-1}
.hien{animation:hien .25s ease-out}
@keyframes hien{from{opacity:0;transform:translateY(1cqw)}}
@media (prefers-reduced-motion:reduce){.canh-thu::after,.gio span.nay{animation:none!important}.hien{animation:none}}
${THU_CSS}
${SPRITE_CSS}
`;

// ---------- mép rách ngẫu nhiên (theo ngày) ----------
function mepRach(seed) {
  let x = (seed * 9301 + 49297) % 233280, pts = ["0% 0%"];
  for (let p = 0; p <= 100; p += 2.5) { x = (x * 9301 + 49297) % 233280; pts.push(`${p}% ${(x / 233280 * 1.5).toFixed(2)}%`); }
  pts.push("100% 0%", "100% 100%", "0% 100%");
  return `polygon(${pts.join(",")})`;
}

class LichBlocXuaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._cfg = {}; this._hass = null; this._ngay = new Date(); this._chonNgay = new Date(); this._anim = false;
    this._suKien = new Map(); this._thuTimer = 0; this._midnight = 0; this._hien = true; this._ready = false;
  }
  static getStubConfig() { return { type: "custom:lich-bloc-xua-card", mode: "bloc" }; }
  getCardSize() { return this._cfg.mode === "de_ban" ? 8 : 9; }

  setConfig(c) {
    this._cfg = { mode: "bloc", hoat_hoa: true, nut: true, rong: 380, ...c };
    if (!["bloc", "de_ban"].includes(this._cfg.mode)) throw new Error("mode phải là bloc hoặc de_ban");
    this._ready = false; if (this.isConnected) this._dung();
  }
  set hass(h) { this._hass = h; if (!this._ready) { this._ready = true; this._dung(); } }

  connectedCallback() {
    this._io = new IntersectionObserver((es) => { this._hien = es.some((e) => e.isIntersecting); this._capNhatChay(); }, { threshold: 0.05 });
    this._io.observe(this);
    this._vis = () => { this._capNhatChay(); if (!document.hidden) this._kiemTraNgay(); };
    document.addEventListener("visibilitychange", this._vis);
    if (this._cfg && this._ready) this._dung();
  }
  disconnectedCallback() {
    this._io?.disconnect(); document.removeEventListener("visibilitychange", this._vis);
    clearTimeout(this._thuTimer); clearTimeout(this._midnight);
  }

  // ----- dựng khung -----
  async _dung() {
    const c = this._cfg;
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="ban" style="--rong:${+c.rong || 380}px"><div class="goc"></div></div>`;
    this._goc = this.shadowRoot.querySelector(".goc"); this._banEl = this.shadowRoot.querySelector(".ban");
    this._ngay = this._ngay || new Date();
    if (c.mode === "de_ban") await this._veDeBan(); else await this._veBloc();
    this._datGioNuaDem(); this._lichThu(); this._capNhatChay(); this._gan();
    this._taiSuKien();
  }
  _capNhatChay() {
    const chay = this._hien && !document.hidden && this._cfg.hoat_hoa !== false;
    this._banEl?.classList.toggle("chay-on", chay);
    this.shadowRoot.querySelectorAll(".thu,.thu-hop,.sp").forEach((e) => e.classList.toggle("dung", !chay));
  }
  _kiemTraNgay() {
    const now = new Date();
    if (this._cfg.mode === "bloc" && this._theoHomNay && !cungNgay(this._ngay, now)) this._chuyenNgay(now, 1, true);
  }
  _datGioNuaDem() {
    clearTimeout(this._midnight);
    const now = new Date(), dich = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    this._midnight = setTimeout(() => { this._kiemTraNgay(); this._datGioNuaDem(); }, dich - now);
  }
  // con vật: nghỉ rồi chạy xen kẽ (đỡ tốn CPU, trông có sống)
  _lichThu() {
    clearTimeout(this._thuTimer);
    if (this._cfg.hoat_hoa === false) return;
    const doi = (chay) => {
      this._chayThu = chay; this._banEl?.classList.toggle("dang-chay", chay);
      this.shadowRoot.querySelectorAll(".sp").forEach((e) => e.classList.toggle("chay", chay));
      this.shadowRoot.querySelectorAll(".thu").forEach((e) => { e.classList.toggle("di", chay); e.classList.toggle("nghi", !chay); });
      this._thuTimer = setTimeout(() => doi(!chay), chay ? 4200 + Math.random() * 2500 : 3500 + Math.random() * 3500);
    };
    doi(true);
  }
  _gan() {
    const g = this._goc;
    g.querySelectorAll("[data-h]").forEach((b) => b.addEventListener("click", () => this._hanhDong(b.dataset.h)));
    this._cuChi();
  }
  _hanhDong(h) {
    if (this._anim) return;
    const bloc = this._cfg.mode === "bloc";
    if (h === "truoc") bloc ? this._chuyenNgay(congNgay(this._ngay, -1), -1) : this._chuyenThang(-1);
    else if (h === "sau") bloc ? this._chuyenNgay(congNgay(this._ngay, 1), 1) : this._chuyenThang(1);
    else if (h === "nay") { const n = new Date(); bloc ? this._chuyenNgay(n, n >= this._ngay ? 1 : -1) : this._chuyenThang(n.getFullYear() * 12 + n.getMonth() > this._thang.y * 12 + this._thang.m ? 1 : -1, n); }
    else if (h === "doi") { this._cfg = { ...this._cfg, mode: bloc ? "de_ban" : "bloc" }; this._dung(); }
  }

  // ----- sự kiện từ thực thể Lịch (nếu cấu hình calendar_entity) -----
  async _taiSuKien() {
    const ent = this._cfg.calendar_entity;
    if (!ent || !this._hass?.callApi) return;
    const d = this._cfg.mode === "de_ban" ? new Date(this._thang.y, this._thang.m, 1) : this._ngay;
    const dau = this._cfg.mode === "de_ban" ? d : new Date(d.getFullYear(), d.getMonth(), 1);
    const cuoi = new Date(dau.getFullYear(), dau.getMonth() + 1, 1);
    const khoa = iso(dau);
    if (this._suKien.has(khoa)) return this._veSuKien();
    try {
      const kq = await this._hass.callApi("GET", `calendars/${ent}?start=${dau.toISOString()}&end=${cuoi.toISOString()}`);
      const map = {}; for (const e of kq || []) { const k = (e.start?.date || e.start?.dateTime || "").slice(0, 10); (map[k] ||= []).push(e.summary); }
      this._suKien.set(khoa, map);
    } catch { this._suKien.set(khoa, {}); }
    this._veSuKien();
  }
  _suKienCua(d) { const map = this._suKien.get(iso(new Date(d.getFullYear(), d.getMonth(), 1))); return (map && map[iso(d)]) || []; }
  _veSuKien() {
    const root = this._goc;
    root.querySelectorAll("[data-sk]").forEach((e) => { const d = new Date(e.dataset.sk + "T00:00:00"); e.innerHTML = this._suKienCua(d).slice(0, 3).map((s) => `<span>◆ ${esc(s)}</span>`).join(""); });
    root.querySelectorAll(".o[data-d]").forEach((e) => { const d = new Date(e.dataset.d + "T00:00:00"); const co = this._suKienCua(d).length > 0; const dot = e.querySelector("i.cs"); if (co && !dot) e.insertAdjacentHTML("beforeend", "<i class='cs'></i>"); });
  }

  // ======================= BLOC =======================
  async _traTo(d) {
    const tt = thongTinNgay(d), khoa = chiThu(tt, this._cfg.con_giap), now = new Date();
    const hd = gioHienTai(tt.gio, now), laHomNay = cungNgay(d, now);
    const hinh = await hinhThu(khoa, this._chayThu !== false);
    const gioHtml = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"].map((chi) => {
      const g = tt.gio.find((x) => x.chi === chi); return `<span class="${g ? "hd" : ""}${g && laHomNay && hd && hd.chi === chi ? " nay" : ""}" title="${g ? `${g.tu}–${g.den}h` : ""}">${chi}</span>`;
    }).join("");
    const al = tt.al, loai = tt.cn || tt.nghi ? "do" : tt.t7 ? "t7" : "";
    return `
      <div class="giay to"><div class="vien-trong"></div><div class="noidung">
        <div class="dau-to"><span>Tháng ${tt.mm}</span><b>${tt.yy}</b><span>${esc(tt.namCan)}</span></div>
        <div class="thu-ngay">${tt.thu}</div>
        <div class="so ${loai}">${tt.dd}</div>
        <div class="am">Ngày ${al.day} tháng ${al.month}${al.leap ? " nhuận" : ""} âm lịch<small>Ngày ${esc(tt.canChi[0])} · tháng ${esc(tt.canChi[1])} · năm ${esc(tt.canChi[2])} · tiết ${esc(tt.tiet)}</small></div>
        ${tt.le.length ? `<div class="le">${esc(tt.le.slice(0, 2).join(" · "))}</div>` : ""}
        <div class="khung-thu">
          <div class="canh-thu">${hinh}<div class="hh">${huyHieu(tt)}</div></div>
          <div class="thongtin">
            <div><b>Trực</b><span>${esc(tt.truc)}</span></div>
            <div><b>Sao</b><span>${esc(tt.sao)} ${tt.saoDanhGia ? `(${esc(tt.saoDanhGia.split(" ")[0])})` : ""}</span></div>
            <div><b>Xuất hành</b><span>${esc(tt.huong.replace(/\s*\|.*$/, "").replace("Hỷ Thần:", "Hỷ").replace("- Tài Thần:", "· Tài"))}</span></div>
            <div class="gio" style="display:grid;margin:0">${gioHtml}</div>
          </div>
        </div>
        <div class="nenky"><p><b>Nên:</b> ${esc(tt.tot.split(".")[0] || "—")}</p><p class="ky"><b>Kỵ:</b> ${esc(tt.xau.split(".")[0] || "—")}</p></div>
        <div class="sukien" data-sk="${iso(d)}"></div>
        <div class="cadao">${tt.caDao}</div>
      </div></div>`;
  }
  async _veBloc() {
    this._theoHomNay = cungNgay(this._ngay, new Date());
    const tren = await this._traTo(this._ngay), duoi = await this._traTo(congNgay(this._ngay, 1));
    this._goc.innerHTML = `
      <div class="chong"><div class="ghim"><i></i></div>
        <div class="nen-to"><div class="to-ao" style="visibility:hidden"></div>
          <div class="lop duoi">${duoi}<div class="bong-to"></div></div>
          <div class="lop tren">${tren}<div class="bong-to"></div></div>
        </div><div class="canh-xe"></div></div>
      ${this._cfg.nut ? `<div class="thanhnut"><button class="nut" data-h="truoc">‹ Hôm qua</button><button class="nut" data-h="nay">Hôm nay</button><button class="nut" data-h="sau">Ngày mai ›</button><button class="nut nho" data-h="doi" title="Chuyển sang lịch để bàn">⇄</button></div>` : ""}`;
    this._veSuKien();
  }
  _hieuUngTat() { return matchMedia("(prefers-reduced-motion: reduce)").matches || this._cfg.hoat_hoa === false; }
  async _chuyenNgay(dich, huong, imLang = false) {
    if (this._anim) return; this._anim = true;
    const goc = this._goc, tren = goc.querySelector(".lop.tren"), duoi = goc.querySelector(".lop.duoi");
    const truoc = this._ngay; this._ngay = dich; this._theoHomNay = cungNgay(dich, new Date());
    if (huong > 0) {
      duoi.innerHTML = await this._traTo(dich) + '<div class="bong-to"></div>';
      await this._xeTo(tren, duoi, truoc, imLang);
    } else {
      tren.dataset.cu = "1";
      const moi = await this._traTo(dich); duoi.innerHTML = tren.innerHTML;
      tren.innerHTML = moi + '<div class="bong-to"></div>';
      await this._danTo(tren, duoi);
    }
    await this._veBloc(); this._lichThu(); this._capNhatChay(); this._gan(); this._taiSuKien(); this._anim = false;
  }
  // xé tờ: nhấc mép dưới, lật quanh đường răng cưa phía trên rồi bay lên
  async _xeTo(tren, duoi, ngay, imLang) {
    if (this._hieuUngTat() || imLang) { await tren.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" }).finished.catch(() => {}); return; }
    tren.style.clipPath = mepRach(ngay.getDate() + ngay.getMonth() * 31);
    const bt = tren.querySelector(".bong-to"), dd = duoi.querySelector(".bong-to");
    duoi.animate([{ transform: "scale(.982) translateY(.8%)", filter: "brightness(.9)" }, { transform: "scale(1)", filter: "brightness(1)" }], { duration: 900, easing: "cubic-bezier(.3,.1,.2,1)", fill: "both" });
    dd.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: 900, fill: "forwards" });
    bt.animate([{ opacity: 0 }, { opacity: 0.1, offset: 0.2 }, { opacity: 0.5, offset: 0.62 }, { opacity: 0.7 }], { duration: 900, fill: "forwards" });
    const a = tren.animate([
      { transform: "rotateX(0) rotateZ(0) translate3d(0,0,0)", offset: 0, easing: "cubic-bezier(.3,0,.5,1)" },
      { transform: "rotateX(-5deg) rotateZ(-1.6deg) translate3d(-.4%,-.3%,6px)", offset: 0.15, easing: "cubic-bezier(.4,0,.8,.6)" },
      { transform: "rotateX(-22deg) rotateZ(-3.4deg) translate3d(-1.6%,-1.5%,22px)", offset: 0.34 },
      { transform: "rotateX(-70deg) rotateZ(-9deg) translate3d(-7%,-22%,70px)", offset: 0.68, opacity: 1 },
      { transform: "rotateX(-116deg) rotateZ(-17deg) translate3d(-16%,-58%,100px)", offset: 1, opacity: 0 },
    ], { duration: 940, fill: "forwards", easing: "linear" });
    await a.finished.catch(() => {});
  }
  // dán lại (về ngày trước): tờ cũ rơi từ trên xuống, nảy nhẹ
  async _danTo(tren, duoi) {
    if (this._hieuUngTat()) { await tren.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: "both" }).finished.catch(() => {}); return; }
    const a = tren.animate([
      { transform: "rotateX(-116deg) rotateZ(-17deg) translate3d(-16%,-58%,100px)", opacity: 0, offset: 0, easing: "cubic-bezier(.3,.6,.4,1)" },
      { transform: "rotateX(-50deg) rotateZ(-6deg) translate3d(-5%,-14%,50px)", opacity: 1, offset: 0.45, easing: "ease-in" },
      { transform: "rotateX(4deg) rotateZ(.4deg) translate3d(0,.6%,0)", opacity: 1, offset: 0.82, easing: "ease-out" },
      { transform: "rotateX(0) rotateZ(0)", opacity: 1, offset: 1 },
    ], { duration: 820, fill: "both" });
    await a.finished.catch(() => {});
  }

  // ======================= ĐỂ BÀN =======================
  async _veDeBan() {
    const n = this._ngay; this._thang = this._thang || { y: n.getFullYear(), m: n.getMonth() };
    this._chonNgay = this._chonNgay || n;
    const html = await this._traThang(this._thang.y, this._thang.m);
    this._goc.innerHTML = `
      <div class="de-ban"><div class="de-khung">
        <div class="lo-xo">${"<i></i>".repeat(14)}</div>
        <div class="trang giay"><div class="nen-trang">${html}</div></div>
        <div class="chan-de"><div class="bong-ban"></div></div>
      </div></div>
      ${this._cfg.nut ? `<div class="thanhnut"><button class="nut" data-h="truoc">‹ Tháng trước</button><button class="nut" data-h="nay">Hôm nay</button><button class="nut" data-h="sau">Tháng sau ›</button><button class="nut nho" data-h="doi" title="Chuyển sang lịch bloc">⇄</button></div>` : ""}`;
    this._ganO();
    this._veSuKien();
  }
  _ganO() {
    this._goc.querySelectorAll(".o[data-d]").forEach((o) => o.addEventListener("click", () => {
      this._chonNgay = new Date(o.dataset.d + "T00:00:00");
      this._goc.querySelectorAll(".o.chon").forEach((x) => x.classList.remove("chon")); o.classList.add("chon");
      this._doiThuTheoNgay(this._chonNgay);
      const ct = this._goc.querySelector(".chitiet"); if (ct) { ct.outerHTML = this._chiTiet(this._chonNgay); this._goc.querySelector(".chitiet").classList.add("hien"); this._veSuKien(); }
    }));
  }
  async _doiThuTheoNgay(d) {
    const kh = this._goc.querySelector(".dau-thang .canh-thu"); if (!kh) return;
    const tt = thongTinNgay(d), html = await hinhThu(chiThu(tt, this._cfg.con_giap), this._chayThu !== false);
    const khoi = kh.querySelector(".khoi-thu"), hh = kh.querySelector(".hh");
    if (khoi) { khoi.innerHTML = html; khoi.classList.remove("hien"); void khoi.offsetWidth; khoi.classList.add("hien"); }
    if (hh) hh.innerHTML = huyHieu(tt);
    this._capNhatChay();
  }
  _chiTiet(d) {
    const t = thongTinNgay(d), al = t.al;
    return `<div class="chitiet"><h4>${t.thu}, ${t.dd}/${t.mm}/${t.yy} — ${al.day}/${al.month}${al.leap ? " nhuận" : ""} âm lịch</h4>
      <div class="dong"><span>Ngày ${esc(t.canChi[0])}</span><span>tháng ${esc(t.canChi[1])}</span><span>năm ${esc(t.canChi[2])}</span><span>tiết ${esc(t.tiet)}</span><span>Trực ${esc(t.truc)}</span></div>
      ${t.le.length ? `<div class="dong" style="color:var(--do);font-weight:700">${esc(t.le.join(" · "))}</div>` : ""}
      <div class="dong">Giờ hoàng đạo: ${t.gio.map((g) => `${g.chi} (${g.tu}–${g.den}h)`).join(", ")}</div>
      <div class="sukien" data-sk="${iso(d)}" style="justify-content:flex-start;margin-top:.8cqw"></div></div>`;
  }
  async _traThang(y, m) {
    const dau = new Date(y, m, 1), so = new Date(y, m + 1, 0).getDate(), lech = (dau.getDay() + 6) % 7;
    const ngayHienThu = (this._chonNgay.getMonth() === m && this._chonNgay.getFullYear() === y) ? this._chonNgay : (new Date().getMonth() === m && new Date().getFullYear() === y ? new Date() : new Date(y, m, 1));
    const ttThu = thongTinNgay(ngayHienThu);
    const hinh = await hinhThu(chiThu(ttThu, this._cfg.con_giap), this._chayThu !== false);
    const a1 = getLunarDate(1, m + 1, y), a2 = getLunarDate(so, m + 1, y), now = new Date();
    let cells = ""; const hdr = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((t, i) => `<div class="th${i === 6 ? " cn" : ""}">${t}</div>`).join("");
    for (let i = 0; i < lech; i++) { const d = congNgay(dau, i - lech); cells += this._o(d, true, now); }
    for (let i = 1; i <= so; i++) cells += this._o(new Date(y, m, i), false, now);
    const cuoi = (7 - ((lech + so) % 7)) % 7; for (let i = 1; i <= cuoi; i++) cells += this._o(new Date(y, m + 1, i), true, now);
    return `
      <div class="dau-thang"><div><div class="t">Tháng ${m + 1}</div><div class="n">${y} · ${esc(getYearCanChi(a1.year))}</div><div class="am-thang">Âm lịch: tháng ${a1.month}${a1.leap ? " nhuận" : ""} – ${a2.month}${a2.leap ? " nhuận" : ""}</div></div><div class="canh-thu"><div class="khoi-thu">${hinh}</div><div class="hh">${huyHieu(ttThu)}</div></div></div>
      <div class="luoi-thu">${hdr}${cells}</div>
      ${this._chiTiet(this._chonNgay.getMonth() === m && this._chonNgay.getFullYear() === y ? this._chonNgay : (now.getMonth() === m && now.getFullYear() === y ? now : dau))}`;
  }
  _o(d, la, now) {
    const al = getLunarDate(d.getDate(), d.getMonth() + 1, d.getFullYear());
    const nghi = LE_NGHI_DL.has(`${d.getDate()}/${d.getMonth() + 1}`) || (al.leap === 0 && LE_NGHI_AL.has(`${al.day}/${al.month}`));
    const cls = ["o", la ? "la" : "", d.getDay() === 0 ? "cn" : "", d.getDay() === 6 ? "t7" : "", nghi ? "nghi" : "", al.day === 1 ? "mung1" : "", cungNgay(d, now) ? "nay" : "", cungNgay(d, this._chonNgay) && !la ? "chon" : ""].filter(Boolean).join(" ");
    return `<button class="${cls}" data-d="${iso(d)}"><b>${d.getDate()}</b><small>${al.day === 1 ? `${al.day}/${al.month}` : al.day}</small></button>`;
  }
  // lật tờ qua gáy lò xo: một tờ có mặt trước (tháng cũ/mới) và mặt sau, quay quanh mép trên rồi khuất sau gáy
  async _chuyenThang(huong, ve = null) {
    if (this._anim) return; this._anim = true;
    const t = this._thang;
    const dich = ve ? { y: ve.getFullYear(), m: ve.getMonth() } : (() => { const x = new Date(t.y, t.m + huong, 1); return { y: x.getFullYear(), m: x.getMonth() }; })();
    const trang = this._goc.querySelector(".trang"), cu = this._goc.querySelector(".nen-trang");
    if (ve) this._chonNgay = ve;
    const moi = await this._traThang(dich.y, dich.m);
    const xong = async () => { this._thang = dich; await this._veDeBan(); this._lichThu(); this._capNhatChay(); this._gan(); this._taiSuKien(); this._anim = false; };
    if (this._hieuUngTat()) return xong();
    trang.style.minHeight = trang.offsetHeight + "px"; trang.style.perspective = "1400px";
    const mk = (cls, html) => { const e = document.createElement("div"); e.className = cls; if (html != null) e.innerHTML = html; return e; };
    const lop = mk("lop-trang"); lop.style.transformStyle = "preserve-3d";
    const truoc = mk("mat-truoc giay", huong > 0 ? cu.innerHTML : moi); const sau = mk("mat-sau");
    const bong = mk("bong-lat"); truoc.appendChild(bong); lop.append(truoc, sau);
    if (huong > 0) cu.innerHTML = moi;            // tờ mới nằm sẵn bên dưới, tờ cũ lật đi
    trang.appendChild(lop);
    const keyNext = [{ transform: "rotateX(0)" }, { transform: "rotateX(-14deg)", offset: .16 }, { transform: "rotateX(-96deg)", offset: .6 }, { transform: "rotateX(-172deg)", offset: .92 }, { transform: "rotateX(-180deg)" }];
    const keyPrev = [{ transform: "rotateX(-180deg)" }, { transform: "rotateX(-84deg)", offset: .4 }, { transform: "rotateX(6deg)", offset: .86 }, { transform: "rotateX(0)" }];
    const a = lop.animate(huong > 0 ? keyNext : keyPrev, { duration: 900, easing: "cubic-bezier(.45,.05,.3,1)", fill: "forwards" });
    bong.animate([{ opacity: 0 }, { opacity: .6, offset: .5 }, { opacity: 0 }], { duration: 900 });
    await a.finished.catch(() => {});
    return xong();
  }

  // ----- cử chỉ: vuốt lên = xé/lật tiếp, vuốt xuống = về trước; kéo theo ngón tay ở chế độ bloc -----
  _cuChi() {
    const ban = this._banEl; if (!ban || ban._cc) return; ban._cc = true;
    let y0 = null, t0 = 0, kt = null;
    ban.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; y0 = e.clientY; t0 = performance.now(); kt = this._goc.querySelector(".lop.tren"); });
    ban.addEventListener("pointermove", (e) => {
      if (y0 == null || this._anim) return;
      const dy = y0 - e.clientY;
      if (this._cfg.mode === "bloc" && kt && dy > 0) {
        const p = Math.min(1, dy / (ban.clientHeight * 0.45));
        kt.style.transform = `rotateX(${-p * 26}deg) rotateZ(${-p * 3.2}deg) translate3d(${-p * 1.5}%,${-p * 1.5}%,${p * 20}px)`;
        const b = kt.querySelector(".bong-to"); if (b) b.style.opacity = String(p * 0.5);
      }
    });
    const xong = (e) => {
      if (y0 == null) return; const dy = y0 - e.clientY, dt = performance.now() - t0; y0 = null;
      if (kt) { kt.style.transform = ""; const b = kt.querySelector(".bong-to"); if (b) b.style.opacity = ""; }
      const nhanh = Math.abs(dy) / Math.max(dt, 1) > 0.5;
      if (dy > 40 || (nhanh && dy > 20)) this._hanhDong("sau"); else if (dy < -40 || (nhanh && dy < -20)) this._hanhDong("truoc");
    };
    ban.addEventListener("pointerup", xong); ban.addEventListener("pointercancel", () => { y0 = null; if (kt) kt.style.transform = ""; });
    this.tabIndex = 0;
    this.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") this._hanhDong("sau"); else if (e.key === "ArrowLeft" || e.key === "ArrowDown") this._hanhDong("truoc"); });
  }
}

if (!customElements.get("lich-bloc-xua-card")) customElements.define("lich-bloc-xua-card", LichBlocXuaCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "lich-bloc-xua-card")) {
  window.customCards.push({ type: "lich-bloc-xua-card", name: "Lịch bloc xưa", description: "Tờ lịch bloc xé từng ngày hoặc lịch để bàn lật tháng, có con giáp động.", preview: true });
}
