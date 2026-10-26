// Bộ vẽ «chân vẽ rời» cho thẻ «Lịch bloc xưa»: thân con vật là MỘT ảnh không chân, mỗi
// chân là một chuỗi ảnh (chín tư thế) do model tạo ảnh vẽ riêng, ghép lớp trên Canvas 2D:
//   chân xa (cùng chuỗi ảnh, sẫm hơn, lệch pha) → thân (nhún nhẹ) → chân gần.
// Không dùng WebGL, không thư viện ngoài. Cách dùng:
//   taoChan(canvas, cauHinh, anh) -> { ve(t), nghi(), nhip, dung(), huy() }
//   - cauHinh: frontend/chan/<khoá>/lich.json
//   - anh: { than: <ảnh thân>, bo: [{ gan: [ảnh…], xa: [ảnh…] }, …] } cùng thứ tự cauHinh.bo
//   - ve(t): vẽ tư thế ở pha t của chu kỳ (t = thời gian / 1,2 s, lấy phần dư theo 1).
//   - nghi(): vẽ tư thế đứng nghỉ (mọi chân ở tư thế «đứng thẳng»), chỉ vẽ lại khi cần.

const md = (t) => ((t % 1) + 1) % 1;
// Nhịp bước: hệ số nhân vào đồng hồ chung của thẻ (một chu kỳ 1,2 s ở tốc độ 1). 0,6 ⇒ một vòng ≈ 2 s, đúng tốc độ bản demo chủ máy đã duyệt.
const NHIP = 0.6;
const DUNG = "P2_dung";   // tư thế chân thẳng đứng, bàn chân phẳng dưới khớp: dùng làm dáng đứng nghỉ

// Tư thế đang hiện của một chân ở pha t: tư thế cuối cùng có t ≤ pha.
export function chiSoTuThe(tuThe, t) {
  let k = 0;
  for (let i = 0; i < tuThe.length; i++) if (tuThe[i].t <= t) k = i;
  return k;
}

// Đường dẫn ảnh của một cấu hình, theo thứ tự thân rồi từng bộ chân (gần, xa).
export function duongDanAnh(cauHinh) {
  return {
    than: cauHinh.than,
    bo: cauHinh.bo.map((b) => ({
      gan: b.tu_the.map((p) => `${b.ten}_gan_${p.ten}.webp`),
      xa: b.tu_the.map((p) => `${b.ten}_xa_${p.ten}.webp`),
    })),
  };
}

export function taoChan(canvas, cauHinh, anh) {
  const [W, H] = cauHinh.khung;
  canvas.width = W; canvas.height = H;
  const cx = canvas.getContext("2d");
  let daHuy = false, daNghi = false;
  const bob = cauHinh.dy ?? 3;   // biên độ nhún của thân (px trong khung ảnh), hai nhịp mỗi chu kỳ

  const ve = (t) => {
    if (daHuy) return;
    daNghi = false;
    t = md(t);
    cx.clearRect(0, 0, W, H);
    const dy = -bob * (0.5 - 0.5 * Math.cos(4 * Math.PI * t));
    cauHinh.bo.forEach((b, j) => {
      const L = anh.bo[j].xa, k = chiSoTuThe(b.tu_the, md(t + b.px));
      if (L[k]) cx.drawImage(L[k], b.R[0] + b.dx, b.R[1] + dy);
    });
    cx.drawImage(anh.than, 0, dy);
    cauHinh.bo.forEach((b, j) => {
      const L = anh.bo[j].gan, k = chiSoTuThe(b.tu_the, md(t + b.pg));
      if (L[k]) cx.drawImage(L[k], b.R[0], b.R[1] + dy);
    });
  };

  const nghi = () => {
    if (daHuy || daNghi) return;
    daNghi = true;
    cx.clearRect(0, 0, W, H);
    const dang = (b, L) => L[Math.max(0, b.tu_the.findIndex((p) => p.ten === DUNG))];
    cauHinh.bo.forEach((b, j) => { const im = dang(b, anh.bo[j].xa); if (im) cx.drawImage(im, b.R[0] + b.dx, b.R[1]); });
    cx.drawImage(anh.than, 0, 0);
    cauHinh.bo.forEach((b, j) => { const im = dang(b, anh.bo[j].gan); if (im) cx.drawImage(im, b.R[0], b.R[1]); });
  };

  nghi();
  return { ve, nghi, nhip: cauHinh.nhip ?? NHIP, dung() {}, huy() { daHuy = true; } };
}
