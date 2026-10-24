// Bộ vẽ xương cho thẻ «Lịch bloc xưa» (NV269): MỘT ảnh duy nhất biến dạng theo xương
// bằng lưới tam giác WebGL thuần (không thư viện ngoài). Chép logic từ tham chiếu
// xuong-tham-chieu/rig2.html, chỉ tách cấu hình ra tệp JSON riêng.
// Cách dùng: taoXuong(canvas, cauHinh, anh) -> { ve(t), dung(), huy() }.
//   - canvas: thẻ <canvas> (module tự đặt width/height theo cấu hình rồi mới lấy ngữ cảnh).
//   - cauHinh: nội dung frontend/xuong/cho.json (khớp ở hệ 1200 px, K đưa về ảnh 800 px).
//   - anh: { chinh: <ảnh lớp chính>, xa: <ảnh lớp chân xa> } (đã tải xong).
//   - ve(t): vẽ tư thế ở pha t của chu kỳ (t = thời gian / 1,2 s; tự lấy phần dư theo 1).
//   - dung(): đánh dấu tạm dừng (vòng lặp của thẻ không gọi ve khi tạm dừng).
//   - huy(): huỷ ngữ cảnh bằng WEBGL_lose_context (trình duyệt chỉ cho ~16 ngữ cảnh).

// Vận tốc bước (giữ đúng tham chiếu): stance 60% chân lùi đều; swing 40% chân ra
// trước + gập gối; khi chạm đất chân kéo dài nhẹ (hệ số sig) cho khỏi trượt.
const CHU_KY_DUTY = 0.6;
const GOC_GOI = 0.62;

export function dangChan(phi) {
  phi = ((phi % 1) + 1) % 1;
  if (phi < CHU_KY_DUTY) {
    const s = phi / CHU_KY_DUTY;
    return { sh: 1 - 2 * s, flex: 0, stance: 1 };
  }
  const s = (phi - CHU_KY_DUTY) / (1 - CHU_KY_DUTY), e = s * s * (3 - 2 * s);
  return { sh: -1 + 2 * e, flex: GOC_GOI * Math.sin(Math.PI * s), stance: 0 };
}

function xoay(a, px, py) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c * px - s * py, s * px + c * py];
}

// Vị trí bàn chân (hệ toạ độ của cấu hình) của một chân ở pha t, tính bằng
// động học thuận đúng như shader: paw' = hip + R(th) * S * ((knee-hip) +
// R(flex) * (paw-knee)), với S kéo dài theo y khi stance (hệ số sig).
export function viTriBanChan(chan, t) {
  const g = dangChan(t + chan.ph);
  const rest = Math.atan2(chan.paw[0] - chan.hip[0], chan.paw[1] - chan.hip[1]);
  const abs = chan.c + chan.a * g.sh;
  const th = -(abs - rest);
  const sig = g.stance ? 1 / Math.max(0.92, Math.cos(th)) : 1;
  const [dx, dy] = xoay(g.flex, chan.paw[0] - chan.knee[0], chan.paw[1] - chan.knee[1]);
  const sx = chan.knee[0] - chan.hip[0] + dx, sy = chan.knee[1] - chan.hip[1] + dy;
  const [fx, fy] = xoay(th, sx, sig * sy);
  return [chan.hip[0] + fx, chan.hip[1] + fy];
}

// Khoảng cách NGANG giữa bàn chân gần và bàn chân xa cùng cặp ở pha t:
// { truoc: |x(chân trước gần) - x(chân trước xa)|, sau: ... }.
// Cặp trước = chân có hip.x lớn hơn trong mỗi lớp; cặp sau = chân còn lại.
export function khoangCachChan(cauHinh, t) {
  const lay = (lop) => {
    const chan = cauHinh[lop].chan;
    const truoc = chan[0].hip[0] < chan[1].hip[0] ? chan[1] : chan[0];
    const sau = truoc === chan[0] ? chan[1] : chan[0];
    return { truoc, sau };
  };
  const chinh = lay("chinh"), xa = lay("xa");
  return {
    truoc: Math.abs(viTriBanChan(chinh.truoc, t)[0] - viTriBanChan(xa.truoc, t)[0]),
    sau: Math.abs(viTriBanChan(chinh.sau, t)[0] - viTriBanChan(xa.sau, t)[0]),
  };
}

const sm = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function dseg(p, a, b) {
  const ax = b[0] - a[0], ay = b[1] - a[1];
  let t = ((p[0] - a[0]) * ax + (p[1] - a[1]) * ay) / (ax * ax + ay * ay);
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * ax, p[1] - a[1] - t * ay);
}

const VS = `attribute vec2 p;attribute vec2 uv;attribute vec4 w;uniform mat3 M[5];uniform vec2 sz;uniform vec2 off;varying vec2 v;
void main(){vec3 q=vec3(p,1.0);float wb=1.0-w.x-w.y-w.z-w.w;vec3 r=wb*(M[0]*q)+w.x*(M[1]*q)+w.y*(M[2]*q)+w.z*(M[3]*q)+w.w*(M[4]*q);r.xy+=off;
gl_Position=vec4(r.x/sz.x*2.0-1.0,1.0-r.y/sz.y*2.0,0.0,1.0);v=uv;}`;
const FS = `precision mediump float;uniform sampler2D t;varying vec2 v;void main(){gl_FragColor=texture2D(t,v);}`;
const I3 = () => [1, 0, 0, 0, 1, 0, 0, 0, 1];
const mul = (A, B) => {
  const R = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let k = 0; k < 3; k++) R[c * 3 + r] += A[k * 3 + r] * B[c * 3 + k];
  return R;
};
const T = (x, y) => [1, 0, 0, 0, 1, 0, x, y, 1];
const Rt = (a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, s, 0, -s, c, 0, 0, 0, 1];
};
const Sc = (sx, sy) => [sx, 0, 0, 0, sy, 0, 0, 0, 1];
const about = (piv, M) => mul(T(piv[0], piv[1]), mul(M, T(-piv[0], -piv[1])));

export function taoXuong(canvasMe, cauHinh, anh) {
  const K = cauHinh.K;
  const W = cauHinh.anh.rong, H = cauHinh.anh.cao;
  const PX = cauHinh.le_khung[0], PY = cauHinh.le_khung[1];
  const CW = W + 2 * PX, CH = H + 2 * PY;
  const NHUN = cauHinh.nhun_than_px ?? 3;
  canvasMe.width = CW; canvasMe.height = CH;
  const gl = canvasMe.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true, preserveDrawingBuffer: true })
    || canvasMe.getContext("experimental-webgl", { premultipliedAlpha: true, alpha: true, antialias: true, preserveDrawingBuffer: true });
  if (!gl) throw new Error("không có WebGL");

  // Đưa khớp và bán kính về hệ ảnh (nhân K), giữ nguyên c/a/ph.
  const lop = {};
  for (const key of ["xa", "chinh"]) {
    const L = cauHinh[key];
    lop[key] = {
      legs: L.chan.map((g) => ({
        hip: [g.hip[0] * K, g.hip[1] * K], knee: [g.knee[0] * K, g.knee[1] * K], paw: [g.paw[0] * K, g.paw[1] * K],
        c: g.c, a: g.a, ph: g.ph, r: (g.r ?? L.r) * K,
        rest: Math.atan2(g.paw[0] - g.hip[0], g.paw[1] - g.hip[1]),
      })),
    };
  }

  function sh(type, src) {
    const o = gl.createShader(type);
    gl.shaderSource(o, src); gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o));
    return o;
  }
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr); gl.useProgram(pr);

  const CELL = 8, NX = W / CELL, NY = Math.ceil(H / CELL);
  function build(layer) {
    const P = [], UV = [], Wt = [];
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
      const x = i * CELL, y = Math.min(H, j * CELL);
      P.push(x, y); UV.push(x / W, y / H);
      const w = [0, 0, 0, 0];
      layer.legs.forEach((L, k) => {
        const d = Math.min(dseg([x, y], L.hip, L.knee), dseg([x, y], L.knee, L.paw));
        const lw = 1 - sm(L.r, L.r + 36 * K, d);
        const low = sm(L.knee[1] - 30 * K, L.knee[1] + 30 * K, y);
        const up = sm(L.hip[1] - 10 * K, L.hip[1] + 110 * K, y);
        w[k * 2] = lw * up * (1 - low); w[k * 2 + 1] = lw * low;
      });
      Wt.push(...w);
    }
    const idx = [];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
    const mk = (d, t) => {
      const b = gl.createBuffer();
      gl.bindBuffer(t, b); gl.bufferData(t, d, gl.STATIC_DRAW);
      return b;
    };
    layer.bp = mk(new Float32Array(P), gl.ARRAY_BUFFER);
    layer.bu = mk(new Float32Array(UV), gl.ARRAY_BUFFER);
    layer.bw = mk(new Float32Array(Wt), gl.ARRAY_BUFFER);
    layer.bi = mk(new Uint16Array(idx), gl.ELEMENT_ARRAY_BUFFER);
    layer.n = idx.length;
  }
  function loadTex(im) {
    const tx = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, a, b);
    return tx;
  }
  for (const key of ["xa", "chinh"]) {
    build(lop[key]);
    lop[key].tx = loadTex(anh[key]);
  }
  const loc = {
    p: gl.getAttribLocation(pr, "p"), uv: gl.getAttribLocation(pr, "uv"), w: gl.getAttribLocation(pr, "w"),
    off: gl.getUniformLocation(pr, "off"), M: gl.getUniformLocation(pr, "M"), sz: gl.getUniformLocation(pr, "sz"),
  };
  function bones(layer, t) {
    const M = [I3()];
    layer.legs.forEach((L) => {
      const g = dangChan(t + L.ph);
      const abs = L.c + L.a * g.sh;
      const th = -(abs - L.rest);
      const sig = g.stance ? 1 / Math.max(0.92, Math.cos(th)) : 1;
      const up = about(L.hip, mul(Rt(th), Sc(1, sig)));
      const low = mul(up, about(L.knee, Rt(g.flex)));
      M.push(up, low);
    });
    return M;
  }

  const state = { huy: false, dung: false };
  return {
    ve(t) {
      if (state.huy) return;
      state.dung = false;
      t = ((t % 1) + 1) % 1;
      gl.viewport(0, 0, CW, CH);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      // Chân xa vẽ trước (lớp sau thân), chân gần vẽ sau (lớp trước thân).
      for (const key of ["xa", "chinh"]) {
        const L = lop[key];
        const M = bones(L, t);
        while (M.length < 5) M.push(I3());
        gl.bindBuffer(gl.ARRAY_BUFFER, L.bp); gl.enableVertexAttribArray(loc.p); gl.vertexAttribPointer(loc.p, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, L.bu); gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, L.bw); gl.enableVertexAttribArray(loc.w); gl.vertexAttribPointer(loc.w, 4, gl.FLOAT, false, 0, 0);
        gl.uniform2f(loc.off, PX, PY + NHUN * Math.sin(2 * Math.PI * (t * 2 + 0.25)));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, L.bi);
        gl.bindTexture(gl.TEXTURE_2D, L.tx);
        gl.uniformMatrix3fv(loc.M, false, new Float32Array(M.flat()));
        gl.uniform2f(loc.sz, CW, CH);
        gl.drawElements(gl.TRIANGLES, L.n, gl.UNSIGNED_SHORT, 0);
      }
    },
    dung() { state.dung = true; },
    huy() {
      if (state.huy) return;
      state.huy = true;
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
    },
  };
}
