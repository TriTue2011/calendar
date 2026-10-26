// Bộ vẽ «chân vẽ rời» cho thẻ «Lịch bloc xưa»: thân con vật là MỘT ảnh không chân, mỗi
// chân là một chuỗi ảnh (chín tư thế) do model tạo ảnh vẽ riêng, ghép lớp trên Canvas 2D:
//   chân xa (cùng chuỗi ảnh, sẫm hơn, lệch pha) → thân (nhún nhẹ) → chân gần.
// Mọi ảnh của một con nằm chung MỘT tấm (atlas.webp) nên chỉ cần một yêu cầu tải; mỗi khung
// được cắt bằng drawImage nguồn–đích. Không dùng WebGL, không thư viện ngoài. Cách dùng:
//   taoChan(canvas, cauHinh, atlas) -> { ve(t), nghi(), nhip, dung(), huy() }
//   - cauHinh: frontend/chan/<khoá>/lich.json
//       { khung:[W,H], dy, atlas, than:[x,y], bo:[{ ten, R:[x,y,rộng,cao], dx, pg, px,
//         tu_the:[{ ten, t, gan:[x,y], xa:[x,y] }] }] }   (toạ độ gan/xa/than là vị trí trong tấm)
//   - atlas: ảnh tấm đã tải xong.
//   - ve(t): vẽ tư thế ở pha t của chu kỳ (t = số chu kỳ trôi qua; lấy phần dư theo 1).
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

export function taoChan(canvas, cauHinh, atlas) {
  const [W, H] = cauHinh.khung;
  canvas.width = W; canvas.height = H;
  const cx = canvas.getContext("2d");
  let daHuy = false, daNghi = false;
  const bob = cauHinh.dy ?? 3;   // biên độ nhún của thân (px trong khung ảnh), hai nhịp mỗi chu kỳ
  const [tx, ty] = cauHinh.than;
  const veThan = (dy) => cx.drawImage(atlas, tx, ty, W, H, 0, dy, W, H);
  const veChan = (b, vt, dx, dy) => cx.drawImage(atlas, vt[0], vt[1], b.R[2], b.R[3], b.R[0] + dx, b.R[1] + dy, b.R[2], b.R[3]);

  const ve = (t) => {
    if (daHuy) return;
    daNghi = false;
    t = md(t);
    cx.clearRect(0, 0, W, H);
    const dy = -bob * (0.5 - 0.5 * Math.cos(4 * Math.PI * t));
    cauHinh.bo.forEach((b) => veChan(b, b.tu_the[chiSoTuThe(b.tu_the, md(t + b.px))].xa, b.dx, dy));
    veThan(dy);
    cauHinh.bo.forEach((b) => veChan(b, b.tu_the[chiSoTuThe(b.tu_the, md(t + b.pg))].gan, 0, dy));
  };

  const nghi = () => {
    if (daHuy || daNghi) return;
    daNghi = true;
    cx.clearRect(0, 0, W, H);
    const dung = (b) => b.tu_the[Math.max(0, b.tu_the.findIndex((p) => p.ten === DUNG))];
    cauHinh.bo.forEach((b) => veChan(b, dung(b).xa, b.dx, 0));
    veThan(0);
    cauHinh.bo.forEach((b) => veChan(b, dung(b).gan, 0, 0));
  };

  nghi();
  return { ve, nghi, nhip: cauHinh.nhip ?? NHIP, dung() {}, huy() { daHuy = true; } };
}
