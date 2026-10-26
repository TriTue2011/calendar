// Hình học bóc giấy cho hiệu ứng xé tờ của thẻ «Lịch bloc xưa» (thuần toán, không đụng DOM nên kiểm thử được bằng node).
// Giấy bị bóc từ góc dưới phải và CONG thành một trụ tròn (không gập phẳng): từ đường tiếp xúc T tờ giấy cuộn lên theo cung bán kính R
// (nửa vòng tròn dài πR), rồi nằm phẳng ngược lại đè lên phần còn lại. Nhìn thẳng từ trước (chiếu vuông góc):
//   - phần còn dán (phẳng, ở phía trên T);
//   - dải cong: cung dài s ứng góc θ = s/R, rơi vào vị trí v = −R·sinθ, dày thu lại cosθ (θ > π/2 là mặt sau);
//   - phần ngược lại: đối xứng gương của phần giấy dài hơn πR, qua đường v = −πR/2.
// v là khoảng cách có dấu tới T, dương về phía trên (phía chỗ dán).

// Giữ phần của đa giác lồi nằm phía a·x + b·y + c ≥ 0 (Sutherland–Hodgman).
export function catNuaMat(poly, a, b, c) {
  const ra = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], fp = a * p[0] + b * p[1] + c, fq = a * q[0] + b * q[1] + c;
    if (fp >= 0) ra.push(p);
    if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); ra.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return ra;
}
// Đối xứng điểm qua đường a·x + b·y + c = 0 (a² + b² = 1): phần giấy gập lại nằm đúng chỗ mới.
export const guongQua = (p, a, b, c) => { const d = a * p[0] + b * p[1] + c; return [p[0] - 2 * d * a, p[1] - 2 * d * b]; };
export const dangPoly = (poly, dx = 0, dy = 0) => poly.length < 3 ? "polygon(0 0,0 0,0 0)" : `polygon(${poly.map((p) => `${(p[0] + dx).toFixed(1)}px ${(p[1] + dy).toFixed(1)}px`).join(",")})`;
// Giấy cong ở bước u (0 → 1) và N dải xấp xỉ phần cong. Trả về: phần còn dán, từng dải (đa giác nguồn, ma trận affine, góc θ, mặt sau?),
// phần ngược lại, đường tiếp xúc T (pháp tuyến nx, ny; c) và bán kính R.
export function cuonGiay(W, H, u, N = 12) {
  const e = Math.pow(u, 1.6), yT = H * (1.03 - 0.89 * e), al = 0.05 + 0.2 * Math.pow(u, 1.2), R = W * (0.15 - 0.07 * u);
  const nx = -Math.sin(al), ny = -Math.cos(al), c = -(nx * W / 2 + ny * yT);   // v(p) = nx·x + ny·y + c, dương phía trên T
  const tam = [[0, 0], [W, 0], [W, H], [0, H]], ds = Math.PI * R / N;
  const truoc = catNuaMat(tam, nx, ny, c);
  const dai = [];
  for (let k = 0; k < N; k++) {
    const lo = -(k + 1) * ds, hi = -k * ds, s = (k + 0.5) * ds, th = s / R, m = Math.cos(th) - 1;   // m = hệ số co − 1
    const poly = catNuaMat(catNuaMat(tam, nx, ny, c - lo), -nx, -ny, -(c - hi));
    const t = (-R * Math.sin(th) + s) + m * (c + s);                              // dịch dọc pháp tuyến: (v_đích − v_nguồn) + m·(c − v_nguồn)
    dai.push({ poly, th, sau: th > Math.PI / 2, mat: [1 + m * nx * nx, m * nx * ny, m * nx * ny, 1 + m * ny * ny, nx * t, ny * t],
      sang: th <= Math.PI / 2 ? 1 - 0.34 * Math.sin(th) : 0.78 + 0.2 * (th - Math.PI / 2) / (Math.PI / 2) });
  }
  const duoi = catNuaMat(tam, -nx, -ny, -(c + Math.PI * R));                      // phần giấy dài hơn πR, sẽ nằm ngược lại
  const gap = duoi.map((p) => guongQua(p, nx, ny, c + Math.PI * R / 2));
  return { truoc, dai, gap, nx, ny, c, R, al, yT, vungDay: catNuaMat(tam, -nx, -ny, -(c - R)) };   // vungDay: phía dưới đáy cung (lộ tờ dưới)
}
