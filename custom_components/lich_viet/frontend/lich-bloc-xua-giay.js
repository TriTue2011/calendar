// Hình học bóc giấy cho hiệu ứng xé tờ của thẻ «Lịch bloc xưa» (thuần toán, không đụng DOM nên kiểm thử được bằng node).
// Giấy bị bóc từ góc dưới phải: nếp gấp là một đường thẳng; phần giấy phía góc gập qua nếp (đối xứng gương) và nằm lên phần còn lại.

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
// Nếp gấp ở bước u (0 → 1): đi qua (W/2, yq), nghiêng góc al (bên phải nhấc trước, giấy bị bóc từ góc dưới phải lên trên).
export function nepGap(W, H, u) {
  const e = Math.pow(u, 1.7), yq = H * (1 - 0.92 * e), al = 0.03 + 0.19 * Math.pow(u, 1.2);
  const nx = -Math.sin(al), ny = -Math.cos(al), c = -(nx * W / 2 + ny * yq);   // pháp tuyến đơn vị hướng lên; nx·x + ny·y + c = 0
  const tam = [[0, 0], [W, 0], [W, H], [0, H]];
  const truoc = catNuaMat(tam, nx, ny, c), goc = catNuaMat(tam, -nx, -ny, -c);
  return { truoc, goc, gap: goc.map((p) => guongQua(p, nx, ny, c)), nx, ny, c, al, yq };
}

