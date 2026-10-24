// 12 con giáp vẽ bằng SVG có khớp, tô mảng sáng/tối (cel-shading) tự động từ chính hình bóng của từng bộ phận.
// Chuyển động chỉ dùng CSS transform trên các nhóm nhỏ (đùi, cẳng, móng, đầu, bờm, đuôi, mắt); không filter,
// không vòng lặp JS. Thẻ tự thêm class .dung khi ra khỏi màn hình/tab ẩn để dừng hẳn hoạt hoạ.
// Mọi con quay mặt sang PHẢI; mặt đất y=140; viewBox 0 -14 240 174.

export const CHI_KHOA = { "Tý": "ty", "Sửu": "suu", "Dần": "dan", "Mão": "mao", "Thìn": "thin", "Tỵ": "ran", "Ngọ": "ngo", "Mùi": "mui", "Thân": "than", "Dậu": "ga", "Tuất": "cho", "Hợi": "heo" };
export const TEN_THU = { ty: "Chuột", suu: "Trâu", dan: "Hổ", mao: "Mèo", thin: "Rồng", ran: "Rắn", ngo: "Ngựa", mui: "Dê", than: "Khỉ", ga: "Gà", cho: "Chó", heo: "Heo" };

const r1 = (n) => Math.round(n * 10) / 10;

// ---------- màu: từ một màu gốc suy ra 3 tông sáng / giữa / tối ----------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
const tong = (h) => ({ sang: mix(hex(h), [255, 240, 205], 0.32), giua: h, toi: mix(hex(h), [38, 14, 22], 0.42) });

// Tô mảng sáng (mép trên-trái), mảng tối (mép dưới-phải) cho BẤT KỲ hình nào, chỉ bằng dịch chuyển chính nó + clipPath.
function cel(uid, key, d, base, a = [2.6, 3.6], b = [-2.2, -3]) {
  const t = tong(base), c0 = `c0${uid}${key}`, c1 = `c1${uid}${key}`;
  return (
    `<clipPath id="${c0}"><path d="${d}"/></clipPath><clipPath id="${c1}"><path d="${d}" transform="translate(${a[0]} ${a[1]})"/></clipPath>` +
    `<path d="${d}" fill="${t.sang}"/>` +
    `<g clip-path="url(#${c1})"><path d="${d}" fill="${t.toi}"/>` +
    `<g clip-path="url(#${c0})"><path d="${d}" transform="translate(${b[0]} ${b[1]})" fill="${t.giua}"/></g></g>`
  );
}

function mat(x, y, r = 3.4, iris = "#6b3a14") {
  return (
    `<g class="mat" style="transform-origin:${x}px ${y}px">` +
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.86}" fill="#120804"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="${r * 0.78}" ry="${r * 0.66}" fill="${iris}"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="${r * 0.4}" ry="${r * 0.46}" fill="#0b0503"/>` +
    `<circle cx="${r1(x + r * 0.34)}" cy="${r1(y - r * 0.36)}" r="${r1(r * 0.3)}" fill="#fff" opacity=".92"/></g>` +
    `<path d="M${r1(x - r * 1.15)} ${r1(y - r * 0.2)}Q${x} ${r1(y - r * 1.55)} ${r1(x + r * 1.2)} ${r1(y - r * 0.05)}" fill="none" stroke="#2a160a" stroke-width="1.1" stroke-linecap="round"/>`
  );
}

// ---------- Chân hai đốt: đùi thon, gối nhỏ, móng/bàn chân giữ phẳng khi chạm đất ----------
function chan(lop, x, y, u, l, w, mau, mong, kieu, uid, xa) {
  const w2 = w * 0.55, w3 = w * 0.44, yk = y + u, yf = y + u + l, top = y - 9;
  const tren =
    `M${r1(x - w / 2)} ${top + 4}C${r1(x - w / 2)} ${top} ${r1(x + w / 2)} ${top} ${r1(x + w / 2)} ${top + 4}` +
    `C${r1(x + w / 2 + 1.2)} ${r1(y + u * 0.3)} ${r1(x + w2 / 2 + 1.2)} ${r1(y + u * 0.72)} ${r1(x + w2 / 2)} ${yk}` +
    `L${r1(x - w2 / 2)} ${yk}C${r1(x - w2 / 2 - 1.6)} ${r1(y + u * 0.72)} ${r1(x - w / 2 - 1.4)} ${r1(y + u * 0.3)} ${r1(x - w / 2)} ${top + 4}Z`;
  const duoi =
    `M${r1(x - w2 / 2)} ${yk - 1}C${r1(x - w3 / 2 - 0.3)} ${r1(yk + l * 0.3)} ${r1(x - w3 / 2)} ${r1(yk + l * 0.62)} ${r1(x - w3 / 2 - 1)} ${r1(yf - 6)}` +
    `L${r1(x + w3 / 2 + 1)} ${r1(yf - 6)}C${r1(x + w3 / 2)} ${r1(yk + l * 0.62)} ${r1(x + w3 / 2 + 0.3)} ${r1(yk + l * 0.3)} ${r1(x + w2 / 2)} ${yk - 1}Z`;
  const mongSvg =
    kieu === "ban"
      ? `<ellipse cx="${r1(x + 2.4)}" cy="${yf + 0.6}" rx="${r1(w3 / 2 + 3.8)}" ry="3.8" fill="${mong}"/>`
      : `<path d="M${r1(x - w3 / 2 - 0.6)} ${r1(yf - 5)}L${r1(x + w3 / 2 + 0.6)} ${r1(yf - 5)}L${r1(x + w3 / 2 + 2.8)} ${yf + 3.6}C${r1(x + w3 / 2 + 3.2)} ${yf + 4.6} ${r1(x + w3 / 2 + 2.6)} ${yf + 4.8} ${r1(x + w3 / 2 + 1.8)} ${yf + 4.8}L${r1(x - w3 / 2 - 1.2)} ${yf + 4.8}C${r1(x - w3 / 2 - 2)} ${yf + 4.8} ${r1(x - w3 / 2 - 1.8)} ${yf + 4} ${r1(x - w3 / 2 - 1.4)} ${yf + 3.2}Z" fill="${mong}"/>`;
  return (
    `<g class="up ${lop}${xa ? " xa" : ""}" style="transform-origin:${x}px ${y}px">` +
    cel(uid, lop + "u", tren, mau, [1.8, 0], [-1.6, 0]) +
    `<g class="kn" style="transform-origin:${x}px ${yk}px">` +
    `<ellipse cx="${x}" cy="${yk}" rx="${r1(w2 / 2 + 0.9)}" ry="${r1(w2 / 2 + 1.5)}" fill="${tong(mau).giua}"/>` +
    cel(uid, lop + "l", duoi, mau, [1.6, 0], [-1.4, 0]) +
    `<g class="hf" style="transform-origin:${x}px ${yf}px">${mongSvg}</g>` +
    `</g></g>`
  );
}

function boChan(c, uid) {
  const { hip, u, l, w, mau, mong, kieu } = c.chan;
  const [fn, bn] = c.chan.gan, [ff, bf] = c.chan.xa;
  const toi = c.chan.toi || mix(hex(mau), [30, 12, 8], 0.35);
  return {
    xa: chan("l-ff", ff, hip, u, l, w, toi, mong, kieu, uid, true) + chan("l-bn", bn, hip, u, l, w, toi, mong, kieu, uid, true),
    gan: chan("l-fn", fn, hip, u, l, w, mau, mong, kieu, uid, false) + chan("l-bf", bf, hip, u, l, w, mau, mong, kieu, uid, false),
  };
}

const bongMat = (cx, rx) => `<ellipse class="bong" cx="${cx}" cy="141.5" rx="${rx}" ry="4.6" fill="#000" opacity=".22"/>`;

function quad(c, uid) {
  const { xa, gan } = boChan(c, uid);
  return (
    bongMat(c.bong[0], c.bong[1]) +
    `<g class="bob">` +
    xa +
    gan +
    `<g${c.lift ? ` transform="translate(0 ${-c.lift})"` : ""}>` +
    `<g class="duoi" style="transform-origin:${c.duoi.goc[0]}px ${c.duoi.goc[1]}px">${c.duoi.svg}</g>` +
    cel(uid, "t", c.than, c.mau, [3.2, 4.4], [-2.4, -3.4]) +
    (c.hoaVan ? `<g clip-path="url(#c0${uid}t)">${c.hoaVan}</g>` : "") +
    `<g class="dau" style="transform-origin:${c.dau.goc[0]}px ${c.dau.goc[1]}px">${c.dau.svg(uid)}</g>` +
    `</g></g>`
  );
}

// lọn bờm/đuôi: lưỡi cong thon, gốc tròn, xoay quanh gốc
function lock(x, y, len, ang, w, mau, cls, curl = 1) {
  const L = len, c = curl;
  const d = `M0 ${-w / 2}C${r1(L * 0.35)} ${r1(-w * 0.9)} ${r1(L * 0.75)} ${r1(-w * 0.2 * c)} ${r1(L)} ${r1(L * 0.18 * c)}C${r1(L * 0.78)} ${r1(w * 0.3 + L * 0.05 * c)} ${r1(L * 0.4)} ${r1(w * 0.9)} 0 ${r1(w / 2)}Z`;
  return `<g class="${cls}" style="transform-origin:${x}px ${y}px"><path d="${d}" transform="translate(${x} ${y}) rotate(${ang})" fill="${mau}"/><circle cx="${x}" cy="${y}" r="${r1(w / 2)}" fill="${mau}"/></g>`;
}

// ================== NGỌ — Ngựa ==================
const NGO_THAN =
  "M60 60C70 51 88 53 100 58C112 63 122 58 130 51C142 37 156 22 172 15C177 14 180 17 179 22C178 28 177 33 176 38C170 52 160 64 154 76" +
  "C158 86 155 96 146 101C130 108 106 106 90 99C84 96 79 95 75 92C62 92 50 78 52 66C52 62 56 60 60 60Z";
const NGO_DAU_D = "M168 13C177 15 190 27 204 41C210 46 214 52 213 58C212 64 206 66 201 63C196 60 192 55 187 52C182 50 178 51 175 45C171 38 168 28 168 13Z";
function bomNgua() {
  const mau = ["#4a1d0c", "#5e2810", "#3b150a", "#6d3015", "#4a1d0c", "#5e2810", "#3b150a"];
  let s = "";
  for (let i = 0; i < 7; i++) {
    const t = i / 6, x = 170 - t * 36, y = 16 + t * 38;
    s += lock(x, y, 30 + (i % 3) * 5, 168 - i * 4 + (i % 2) * 8, 9 - t * 2, mau[i], "m" + (i % 3), 1.3);
  }
  return s;
}
function duoiNgua() {
  const mau = ["#3b150a", "#4a1d0c", "#5e2810", "#3b150a", "#6d3015"];
  let s = "";
  for (let i = 0; i < 5; i++) s += lock(58, 62 + i * 2, 46 + i * 5, 200 + i * 12 - (i % 2) * 6, 11 - i, mau[i], "m" + (i % 3), -1.4);
  return s;
}
const NGO = {
  mau: "#d07a28",
  than: NGO_THAN,
  hoaVan:
    `<path d="M154 76C158 86 155 96 146 101C130 108 106 106 90 99C100 101 128 102 142 94C150 88 152 82 150 70Z" fill="#7a3a10" opacity=".55"/>` +
    `<path d="M62 62C56 70 58 84 70 90C66 80 66 70 70 62Z" fill="#a8541a" opacity=".6"/>` +
    `<ellipse cx="118" cy="97" rx="26" ry="4.5" fill="#f4c88a" opacity=".8"/>`,
  bong: [104, 58],
  lift: 9,
  chan: { hip: 76, u: 30, l: 29, w: 14, mau: "#bd6a22", mong: "#2a1208", gan: [140, 70], xa: [129, 83] },
  duoi: { goc: [58, 62], svg: duoiNgua() },
  dau: {
    goc: [160, 44],
    svg: (uid) =>
      bomNgua() +
      cel(uid, "h", NGO_DAU_D, "#d07a28", [2.4, 3.2], [-2, -2.6]) +
      `<path d="M186 52C191 56 196 60 201 63C206 66 212 64 213 58C213 55 212 52 210 50C207 57 199 58 193 51Z" fill="#7a3a10"/>` +
      `<ellipse cx="208" cy="55" rx="3" ry="2.1" fill="#2a1208" transform="rotate(-30 208 55)"/>` +
      `<path d="M212 61C208 64 203 62 200 59" fill="none" stroke="#3b1a0a" stroke-width="1.1" stroke-linecap="round"/>` +
      `<path d="M170 12L166 -3L179 8Z" fill="#d07a28"/><path d="M176 11L182 -3L186 14Z" fill="#a85a1c"/><path d="M169 9L167 1L175 8Z" fill="#6e3210"/>` +
      mat(184, 31, 3.4),
  },
};

// ================== TÝ — Chuột ==================
const TY = {
  mau: "#a09488",
  than: "M62 126C58 114 70 100 92 98C110 96 126 100 138 106C148 110 152 118 150 126C146 134 130 136 110 136C88 136 66 136 62 126Z",
  hoaVan: `<ellipse cx="108" cy="132" rx="38" ry="6" fill="#e6dccf" opacity=".85"/>`,
  bong: [104, 48],
  chan: { hip: 123, u: 8, l: 8, w: 8, mau: "#8f8479", mong: "#c98b8b", kieu: "ban", gan: [130, 80], xa: [121, 88] },
  duoi: { goc: [64, 124], svg: `<path d="M64 124C44 130 28 118 26 102C25 92 33 86 42 90" fill="none" stroke="#d99a9a" stroke-width="3.2" stroke-linecap="round"/>` },
  dau: {
    goc: [146, 112],
    svg: (uid) =>
      `<circle cx="146" cy="95" r="11" fill="#8d8176"/><circle cx="146" cy="95" r="7" fill="#e5a2a2"/>` +
      `<circle cx="158" cy="93" r="9" fill="#9a8e83"/><circle cx="158" cy="93" r="5.4" fill="#eab0b0"/>` +
      cel(uid, "h", "M142 102C150 96 164 96 176 102C184 106 192 112 194 118C190 122 182 124 172 124C160 126 148 122 142 114Z", "#a69a8f") +
      `<circle cx="193" cy="117" r="3.2" fill="#d98383"/><circle cx="192" cy="116" r="1" fill="#fff" opacity=".7"/>` +
      `<path d="M183 117L204 109M183 119L206 118M183 121L203 127" stroke="#5a4c42" stroke-width=".8" fill="none" stroke-linecap="round"/>` +
      `<rect x="184" y="121" width="3" height="3.4" rx=".8" fill="#fff"/>` +
      mat(168, 107, 2.6, "#3a2418"),
  },
};

// ================== SỬU — Trâu ==================
const SUU = {
  mau: "#6e5c4e",
  than: "M52 78C60 64 90 62 112 64C128 62 138 66 148 72C158 76 166 84 170 92C172 102 166 108 158 112C148 116 140 108 132 112C116 118 90 118 74 112C58 106 48 92 52 78Z",
  hoaVan: `<ellipse cx="102" cy="112" rx="36" ry="7" fill="#9a8878" opacity=".55"/><path d="M76 68C96 62 124 62 142 70" stroke="#8a7664" stroke-width="3" fill="none" opacity=".5"/>`,
  bong: [108, 62],
  chan: { hip: 97, u: 19, l: 20, w: 17, mau: "#5a4a3e", mong: "#1f1813", gan: [138, 72], xa: [126, 86] },
  duoi: { goc: [54, 80], svg: `<path d="M54 80C42 90 38 104 40 118" fill="none" stroke="#4a3b30" stroke-width="3.4" stroke-linecap="round"/><path d="M40 114C34 120 36 130 42 132C48 130 48 120 44 114Z" fill="#2a2018"/>` },
  dau: {
    goc: [164, 96],
    svg: (uid) =>
      `<path d="M174 86C158 78 150 60 164 48C160 62 168 72 184 80Z" fill="#cdb98a"/><path d="M164 48C161 52 160 56 160 60C162 56 164 52 168 50Z" fill="#3b2c20"/>` +
      cel(uid, "h", "M164 88C174 82 190 86 200 94C208 100 212 108 210 116C206 124 196 124 188 120C180 116 170 114 164 106Z", "#6e5c4e") +
      `<path d="M196 116C200 122 208 122 210 116C210 110 206 106 202 108Z" fill="#a89484"/><ellipse cx="205" cy="113" rx="2.4" ry="1.8" fill="#1f1813"/>` +
      `<path d="M168 92C158 90 150 94 146 100C154 100 162 100 168 98Z" fill="#5a4a3e"/>` +
      mat(184, 94, 2.8, "#4a2a12"),
  },
};

// ================== DẦN — Hổ ==================
const DAN = {
  mau: "#e0832a",
  than: "M50 84C54 70 78 66 100 70C116 72 128 72 140 72C152 72 160 80 160 92C160 104 152 110 140 112C124 116 100 116 84 112C64 108 46 98 50 84Z",
  hoaVan:
    `<ellipse cx="104" cy="112" rx="46" ry="8" fill="#f6e6c8" opacity=".95"/>` +
    [66, 80, 94, 108, 122, 136].map((x, i) => `<path d="M${x} 68L${x + 7} ${72 + (i % 2) * 2}L${x + 2} ${98 + (i % 3) * 3}Z" fill="#1c0e06"/>`).join(""),
  bong: [104, 56],
  chan: { hip: 100, u: 20, l: 16, w: 14, mau: "#d27422", mong: "#f3e2c4", kieu: "ban", gan: [138, 70], xa: [126, 82] },
  duoi: { goc: [50, 84], svg: `<path d="M50 84C30 84 18 70 20 50C21 40 28 34 34 38C28 44 28 56 36 66C42 72 48 76 54 78Z" fill="#e0832a"/><path d="M22 58L32 56M24 48L34 48M30 66L38 62" stroke="#1c0e06" stroke-width="3" stroke-linecap="round"/>` },
  dau: {
    goc: [158, 86],
    svg: (uid) =>
      `<circle cx="166" cy="62" r="7.5" fill="#d27422"/><circle cx="166" cy="62" r="4" fill="#f3d6a8"/><circle cx="188" cy="62" r="7.5" fill="#c4691d"/><circle cx="188" cy="62" r="4" fill="#f3d6a8"/>` +
      cel(uid, "h", "M156 86C156 74 166 62 180 62C196 62 206 74 206 86C206 98 196 108 182 108C168 108 156 98 156 86Z", "#e0832a") +
      `<path d="M186 90C198 88 208 96 206 102C202 108 192 108 184 104Z" fill="#f6e8cf"/>` +
      `<path d="M168 64L172 76 M176 62L178 74 M184 62L182 74" stroke="#1c0e06" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M158 84L168 84M160 92L168 90" stroke="#1c0e06" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M204 90L214 94L204 98Z" fill="#e0832a"/><ellipse cx="205" cy="92" rx="3.4" ry="2.4" fill="#2a1410"/>` +
      `<path d="M204 96C201 99 196 99 193 96" fill="none" stroke="#3a1a10" stroke-width="1.2" stroke-linecap="round"/>` +
      `<path d="M198 94L216 90M198 96L216 98" stroke="#fff" stroke-width=".8" opacity=".8"/>` +
      mat(184, 80, 3, "#c8a020"),
  },
};

// ================== MÃO — Mèo ==================
const MAO = {
  mau: "#dba264",
  than: "M62 112C64 100 80 96 98 98C112 98 126 100 136 104C146 108 150 118 146 126C142 134 126 136 108 136C88 136 66 134 62 124Z",
  hoaVan:
    `<ellipse cx="104" cy="132" rx="36" ry="6" fill="#f6ead6" opacity=".9"/>` +
    [76, 90, 104, 118].map((x) => `<path d="M${x} 98L${x + 5} 100L${x + 1} 114Z" fill="#a8672a" opacity=".85"/>`).join(""),
  bong: [102, 46],
  chan: { hip: 118, u: 11, l: 10, w: 9, mau: "#cf9457", mong: "#f6ead6", kieu: "ban", gan: [128, 78], xa: [120, 86] },
  duoi: { goc: [64, 112], svg: `<path d="M64 112C48 108 40 92 44 74C46 62 54 54 62 56C54 62 52 74 56 86C58 94 62 100 66 104Z" fill="#dba264"/><path d="M45 72L54 72M47 62L56 64" stroke="#a8672a" stroke-width="3" stroke-linecap="round"/>` },
  dau: {
    goc: [150, 106],
    svg: (uid) =>
      `<path d="M148 80L146 62L160 72Z" fill="#cf9457"/><path d="M174 74L180 60L186 78Z" fill="#cf9457"/><path d="M150 76L149 67L156 73Z" fill="#f0b8b0"/><path d="M177 74L180 66L183 76Z" fill="#f0b8b0"/>` +
      cel(uid, "h", "M146 94C146 80 158 72 170 72C184 72 192 82 192 94C192 106 182 114 168 114C156 114 146 106 146 94Z", "#dba264") +
      `<path d="M168 90L168 82M162 91L160 85M174 91L176 85" stroke="#a8672a" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M165 103L171 103L168 106Z" fill="#d98a8a"/>` +
      `<path d="M166 107C164 110 160 110 158 108M170 107C172 110 176 110 178 108" fill="none" stroke="#5a3418" stroke-width="1" stroke-linecap="round"/>` +
      `<path d="M158 100L142 96M158 103L141 104M178 100L194 96M178 103L195 104" stroke="#fff" stroke-width=".9" opacity=".9"/>` +
      mat(158, 92, 3.2, "#9ac04a") + mat(178, 92, 3.2, "#9ac04a"),
  },
};

// ================== MÙI — Dê ==================
const MUI = {
  mau: "#e8dcc8",
  than:
    "M62 82C68 72 88 72 106 74C120 74 130 72 138 68C144 60 148 52 154 46C158 44 162 46 162 50C162 58 160 68 158 80C162 90 158 102 148 108C136 114 118 114 102 112C84 112 68 108 62 98C58 92 58 88 62 82Z",
  hoaVan: `<ellipse cx="102" cy="112" rx="34" ry="6" fill="#b9ac96" opacity=".6"/>`,
  bong: [104, 56],
  chan: { hip: 100, u: 20, l: 18, w: 10, mau: "#dacebb", mong: "#3a3028", gan: [138, 70], xa: [127, 82] },
  duoi: { goc: [62, 84], svg: `<path d="M62 84C54 78 52 70 58 66C60 72 64 76 68 78Z" fill="#e8dcc8"/>` },
  dau: {
    goc: [154, 60],
    svg: (uid) =>
      `<path d="M160 36C150 24 156 8 170 4C164 14 166 24 174 32Z" fill="#8a7a66"/>` +
      `<path d="M158 44L140 40L152 52Z" fill="#cfc2ac"/><path d="M154 44L144 42L152 49Z" fill="#e9b8b0"/>` +
      cel(uid, "h", "M152 36C158 30 170 30 178 38C186 46 196 56 198 64C198 70 192 72 186 70C178 68 170 66 164 58C158 52 154 46 152 36Z", "#e8dcc8") +
      `<path d="M186 70C188 76 186 86 182 92C178 84 180 76 182 70Z" fill="#f4eee0"/>` +
      `<ellipse cx="195" cy="64" rx="2.4" ry="1.8" fill="#4a3a30"/>` +
      mat(172, 44, 3, "#c8a020"),
  },
};

// ================== THÂN — Khỉ ==================
const THAN = {
  mau: "#8e5c34",
  than: "M62 84C70 70 92 68 108 72C124 74 136 74 146 80C154 88 156 100 150 108C142 116 124 116 108 114C90 112 72 110 64 100C58 94 58 90 62 84Z",
  hoaVan: `<ellipse cx="108" cy="112" rx="34" ry="6" fill="#d8b48a" opacity=".7"/>`,
  bong: [104, 54],
  chan: { hip: 96, u: 22, l: 18, w: 11, mau: "#7a4c28", mong: "#e0c09a", kieu: "ban", gan: [138, 72], xa: [127, 84] },
  duoi: { goc: [62, 86], svg: `<path d="M62 86C44 90 32 78 34 62C36 50 46 46 52 52C46 54 44 62 48 68C52 74 58 76 64 76Z" fill="#7a4c28"/>` },
  dau: {
    goc: [152, 84],
    svg: (uid) =>
      `<circle cx="160" cy="62" r="9" fill="#7a4c28"/><circle cx="160" cy="62" r="5.4" fill="#e8c7a0"/>` +
      cel(uid, "h", "M152 76C152 64 162 56 174 56C188 56 196 66 196 78C196 90 186 98 172 98C160 98 152 90 152 76Z", "#8e5c34") +
      `<path d="M158 76C158 68 166 64 174 66C184 66 190 72 190 80C190 90 182 94 172 94C164 94 158 88 158 76Z" fill="#ecd0aa"/>` +
      `<ellipse cx="180" cy="88" rx="9" ry="6" fill="#f2dcc0"/>` +
      `<ellipse cx="186" cy="85" rx="1.2" ry="1" fill="#3a2418"/><ellipse cx="181" cy="85" rx="1.2" ry="1" fill="#3a2418"/>` +
      `<path d="M176 91C180 93 184 92 186 90" fill="none" stroke="#6a3a22" stroke-width="1.2" stroke-linecap="round"/>` +
      mat(170, 74, 2.8, "#4a2a12") + mat(182, 74, 2.8, "#4a2a12"),
  },
};

// ================== TUẤT — Chó ==================
const CHO = {
  mau: "#d89a4e",
  than: "M58 90C62 78 84 74 104 76C120 78 132 78 142 82C152 86 156 98 152 106C148 114 132 116 114 116C94 116 70 114 60 102C56 96 56 92 58 90Z",
  hoaVan: `<ellipse cx="104" cy="113" rx="40" ry="6" fill="#f3e6cf" opacity=".9"/>`,
  bong: [104, 52],
  chan: { hip: 103, u: 18, l: 15, w: 11, mau: "#c8883c", mong: "#f3e6cf", kieu: "ban", gan: [138, 74], xa: [127, 86] },
  duoi: { goc: [58, 90], svg: `<path d="M58 90C42 86 34 72 38 58C40 50 48 48 52 54C46 58 46 68 52 74C56 78 60 80 62 82Z" fill="#d89a4e"/><path d="M38 60C40 52 46 52 50 56" fill="none" stroke="#f3e6cf" stroke-width="3" stroke-linecap="round"/>` },
  dau: {
    goc: [150, 88],
    svg: (uid) =>
      `<path d="M158 66C148 62 142 72 144 86C150 84 156 78 160 72Z" fill="#8a5324"/>` +
      cel(uid, "h", "M152 80C152 68 164 62 176 64C186 66 192 72 198 78C206 82 212 86 212 92C212 98 204 100 198 98C190 98 180 100 172 98C160 96 152 90 152 80Z", "#d89a4e") +
      `<path d="M186 82C196 80 210 86 212 92C212 98 204 100 198 98C192 98 186 96 184 90Z" fill="#f6ead2"/>` +
      `<ellipse cx="210" cy="90" rx="3.6" ry="2.8" fill="#1a0e08"/><circle cx="209" cy="89" r="1" fill="#fff" opacity=".7"/>` +
      `<path d="M203 99C206 106 200 108 198 104" fill="#e57a8a"/>` +
      `<path d="M206 94C203 97 199 97 196 95" fill="none" stroke="#3a1a10" stroke-width="1.1" stroke-linecap="round"/>` +
      mat(178, 76, 3, "#5a3010"),
  },
};

// ================== HỢI — Heo ==================
const HEO = {
  mau: "#f0a9a0",
  than: "M54 94C56 78 80 72 104 74C124 74 142 78 150 90C156 100 152 114 138 118C122 122 90 122 72 116C58 110 52 102 54 94Z",
  hoaVan: `<ellipse cx="102" cy="118" rx="36" ry="6" fill="#f8cfc8" opacity=".9"/>`,
  bong: [102, 52],
  chan: { hip: 110, u: 13, l: 14, w: 12, mau: "#e69890", mong: "#7a4a44", gan: [132, 76], xa: [121, 88] },
  duoi: { goc: [54, 96], svg: `<path d="M54 96C44 96 38 90 42 84C46 80 52 84 48 88C46 90 44 90 44 88" fill="none" stroke="#e08a82" stroke-width="3" stroke-linecap="round"/>` },
  dau: {
    goc: [150, 98],
    svg: (uid) =>
      `<path d="M158 76L152 62L170 70Z" fill="#e08a82"/><path d="M158 74L155 67L166 71Z" fill="#f4b6ae"/>` +
      cel(uid, "h", "M148 94C148 80 160 72 174 74C186 76 194 84 198 92C200 100 194 108 182 110C168 112 148 106 148 94Z", "#f0a9a0") +
      `<ellipse cx="198" cy="95" rx="8" ry="9.5" fill="#e58a86"/><ellipse cx="200" cy="95" rx="6.6" ry="8" fill="#f3a8a2"/>` +
      `<ellipse cx="200" cy="92" rx="1.5" ry="2.3" fill="#7a2a28"/><ellipse cx="200" cy="99" rx="1.5" ry="2.3" fill="#7a2a28"/>` +
      mat(176, 86, 2.8, "#4a2a18"),
  },
};

// ================== Con thân chuỗi đốt (rắn, rồng) ==================
function seg(i, x, y, r, c, hoa, vay) {
  return (
    `<g class="sg" style="--i:${i}">` +
    (vay ? vay(x, y, r, i) : "") +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.toi}"/>` +
    `<circle cx="${x}" cy="${r1(y - r * 0.12)}" r="${r1(r * 0.9)}" fill="${c.mau}"/>` +
    `<ellipse cx="${x}" cy="${r1(y + r * 0.58)}" rx="${r1(r * 0.7)}" ry="${r1(r * 0.3)}" fill="${c.bung}" opacity=".9"/>` +
    (hoa(i) ? `<ellipse cx="${x}" cy="${r1(y - r * 0.5)}" rx="${r1(r * 0.55)}" ry="${r1(r * 0.28)}" fill="${c.toi}" opacity=".85"/>` : "") +
    `<circle cx="${r1(x - r * 0.3)}" cy="${r1(y - r * 0.46)}" r="${r1(r * 0.28)}" fill="#fff" opacity=".3"/></g>`
  );
}
function veRan(uid) {
  const c = { mau: "#5f8f3e", toi: "#2f5426", bung: "#e2d9a0" }, N = 30;
  let th = "";
  for (let i = N - 1; i >= 1; i--) {
    const x = 200 - i * 6.2, y = 124 + 5 * Math.sin(i * 0.5), r = 1.6 + 7.6 * Math.pow(1 - i / N, 0.6);
    th += seg(i, r1(x), r1(y), r1(r), c, (k) => k % 3 === 0);
  }
  const dau =
    `<g class="sg" style="--i:0">` +
    `<path d="M192 116C200 106 218 108 230 118C234 123 232 130 224 131C214 134 200 134 192 130Z" fill="${c.toi}"/>` +
    `<path d="M192 115C200 106 218 107 230 117C220 116 206 116 194 120Z" fill="#9ccb62"/>` +
    `<path d="M192 116C200 107 218 108 230 118C232 122 230 126 226 127C214 126 202 124 192 124Z" fill="${c.mau}"/>` +
    `<path d="M196 126C208 129 220 128 228 126C226 131 214 133 202 132Z" fill="${c.bung}"/>` +
    `<path d="M230 123L246 119M240 121L248 124M240 121L247 116" class="ln" fill="none" stroke="#d63a4a" stroke-width="1.8" stroke-linecap="round" style="transform-origin:230px 123px"/>` +
    `<ellipse cx="225" cy="118" rx="1.2" ry="1" fill="#1a0e08"/>` +
    mat(212, 118, 2.9, "#d8a416") +
    `</g>`;
  return `<ellipse class="bong" cx="110" cy="141.5" rx="86" ry="4.4" fill="#000" opacity=".2"/><g class="bob">${th}${dau}</g>`;
}
function veRong(uid) {
  const c = { mau: "#34a47c", toi: "#16634d", bung: "#f4dc96" }, N = 34, vang = "#f2b84b";
  let th = "";
  const pt = (i) => { const t = i / (N - 1); return [188 - 158 * t, 56 + 46 * t + 17 * Math.sin(6.4 * t), 2 + 8.4 * Math.pow(1 - t * 0.92, 0.7)]; };
  for (let i = N - 1; i >= 1; i--) {
    const [x, y, r] = pt(i);
    const gai = (X, Y, R, k) => (k % 2 === 0 ? `<path d="M${r1(X - 3)} ${r1(Y - R * 0.7)}L${r1(X - 8)} ${r1(Y - R - 9)}L${r1(X + 3.5)} ${r1(Y - R * 0.8)}Z" fill="#e85a3a"/>` : "");
    const chanR = (k) => {
      if (k !== 9 && k !== 22) return "";
      const lx = r1(x), ly = r1(y + r * 0.5);
      return `<g class="lgR" style="transform-origin:${lx}px ${ly}px"><path d="M${lx} ${ly}Q${r1(lx - 3)} ${r1(ly + 9)} ${r1(lx - 9)} ${r1(ly + 15)}" fill="none" stroke="${c.toi}" stroke-width="4.6" stroke-linecap="round"/><path d="M${r1(lx - 9)} ${r1(ly + 15)}l-4 3M${r1(lx - 9)} ${r1(ly + 15)}l-1 5M${r1(lx - 9)} ${r1(ly + 15)}l4 3" stroke="${vang}" stroke-width="1.6" stroke-linecap="round"/></g>`;
    };
    th += seg(i, r1(x), r1(y), r1(r), c, (k) => k % 3 === 1, (X, Y, R, k) => gai(X, Y, R, k) + chanR(k));
  }
  const dau =
    `<g class="sg" style="--i:0">` +
    lock(194, 44, 30, 196, 7, "#e0523a", "m0", 1.2) + lock(194, 48, 26, 214, 6, "#f2894a", "m1", 1.2) + lock(194, 40, 24, 180, 5, "#e0523a", "m2", 1.2) +
    `<path d="M196 40C192 28 182 22 172 23C179 27 184 33 189 42Z" fill="${vang}"/><path d="M185 30C184 24 188 20 194 20C190 23 189 26 189 31Z" fill="${vang}"/>` +
    `<path d="M188 50C190 38 204 32 220 36C230 38 238 44 236 50C234 54 228 54 224 52C216 54 204 56 196 58C190 56 187 54 188 50Z" fill="${c.toi}"/>` +
    `<path d="M188 50C190 38 204 32 220 36C230 38 238 44 236 50C226 46 212 44 198 48Z" fill="#6fd0a8"/>` +
    `<path d="M188 50C190 40 204 34 220 38C230 40 236 44 236 50C234 54 228 54 224 52C216 54 204 56 196 58C190 56 187 54 188 50Z" fill="${c.mau}"/>` +
    `<path d="M196 58C208 60 220 58 228 55C232 60 228 66 220 66C210 66 200 64 196 60Z" fill="${c.toi}"/>` +
    `<path d="M200 60C208 62 218 61 226 58L224 62C216 64 208 64 202 62Z" fill="${c.bung}"/>` +
    `<path d="M214 56L216 60L218 56ZM222 55L223 59L226 55Z" fill="#fff"/>` +
    `<ellipse cx="232" cy="43" rx="2.2" ry="1.6" fill="#0d3a2c"/>` +
    `<g class="bg" style="transform-origin:233px 50px"><path d="M233 51C246 56 252 70 242 83" fill="none" stroke="${vang}" stroke-width="2.2" stroke-linecap="round"/></g>` +
    `<g class="bg b2" style="transform-origin:231px 53px"><path d="M231 53C241 63 243 77 233 89" fill="none" stroke="${vang}" stroke-width="1.8" stroke-linecap="round"/></g>` +
    `<g class="mat" style="transform-origin:212px 42px"><ellipse cx="212" cy="42" rx="4.4" ry="3.4" fill="#fff4c4"/><ellipse cx="212" cy="42" rx="2.3" ry="3" fill="#d63a1a"/><rect x="211.2" y="39.4" width="1.6" height="5.2" rx=".8" fill="#190a05"/></g>` +
    `<path d="M203 37Q212 33 221 38" fill="none" stroke="#0d3a2c" stroke-width="1.4" stroke-linecap="round"/>` +
    `<g class="ngoc" style="transform-origin:236px 18px"><circle cx="236" cy="18" r="7" fill="#ffe27a"/><circle cx="236" cy="18" r="4.4" fill="#fff6c8"/><circle cx="234" cy="15.6" r="1.6" fill="#fff"/></g>` +
    `</g>`;
  return `<ellipse class="bong" cx="110" cy="141.5" rx="86" ry="4.4" fill="#000" opacity=".16"/><g class="bob">${th}${dau}</g>`;
}

// ================== DẬU — Gà trống (hai chân) ==================
function veGa(uid) {
  const bom = (x, y, len, ang, w, mau, cls) => lock(x, y, len, ang, w, mau, cls, -1.1);
  const duoi =
    `<g class="duoi" style="transform-origin:72px 90px">` +
    bom(72, 92, 58, 218, 12, "#1d4a3a", "m0") + bom(72, 90, 62, 232, 12, "#2a7a5a", "m1") + bom(72, 88, 56, 246, 11, "#b3261e", "m2") +
    bom(72, 92, 50, 204, 10, "#2a7a5a", "m1") + bom(74, 90, 44, 258, 9, "#1d4a3a", "m0") +
    `</g>`;
  const chanGa = chan("l-ff", 100, 112, 10, 13, 6, "#c98f1e", "#c98f1e", "ban", uid, true) + chan("l-fn", 116, 112, 10, 13, 6, "#e3ac2e", "#e3ac2e", "ban", uid, false);
  const than = "M66 94C64 76 84 66 106 70C124 74 136 86 136 100C136 114 120 126 100 126C80 126 68 112 66 94Z";
  const canh = "M82 92C88 80 112 80 124 90C122 106 106 114 92 110C84 106 80 100 82 92Z";
  const dau =
    `<g class="dau" style="transform-origin:126px 86px">` +
    cel(uid, "n", "M118 88C124 70 126 58 132 46L150 48C152 64 150 78 142 92Z", "#e0892a") +
    `<path d="M124 78l-7 5M126 68l-8 4M126 88l-8 3" stroke="#c9601a" stroke-width="3" stroke-linecap="round"/>` +
    cel(uid, "h", "M128 44C128 34 136 28 146 30C154 32 158 40 156 48C154 56 144 58 136 56C130 54 128 50 128 44Z", "#e8b030") +
    `<path d="M156 40L170 46L156 50Z" fill="#f0b82c"/><path d="M156 40L170 46L156 44Z" fill="#fbd75a"/>` +
    `<path d="M134 32C132 22 138 20 140 26C140 18 148 16 148 26C150 22 156 24 152 32Z" fill="#d62d27"/>` +
    `<path d="M152 52C154 60 150 66 146 62C146 58 148 54 150 52Z" fill="#d62d27"/>` +
    mat(144, 40, 2.8, "#c8601a") +
    `</g>`;
  return (
    `<ellipse class="bong" cx="104" cy="141.5" rx="44" ry="4.2" fill="#000" opacity=".22"/>` +
    `<g class="bob">` + chanGa +
    `<g transform="translate(0 -8)">` + duoi + cel(uid, "t", than, "#c0541f", [3, 4], [-2.4, -3]) +
    `<g clip-path="url(#c0${uid}t)"><ellipse cx="108" cy="122" rx="30" ry="6" fill="#e6b88a" opacity=".6"/></g>` +
    `<g class="canh" style="transform-origin:90px 90px">` + cel(uid, "c", canh, "#8f3a14", [2, 3], [-2, -2.6]) +
    `<path d="M92 92L118 96M90 98L116 104M94 86L120 90" stroke="#5a2410" stroke-width="1.1" opacity=".7" fill="none"/></g>` +
    dau + `</g></g>`
  );
}

export const ANIMALS = {
  ngo: { quad: NGO, ck: ".9s" }, ty: { quad: TY, ck: ".55s" }, suu: { quad: SUU, ck: "1.25s" }, dan: { quad: DAN, ck: ".85s" },
  mao: { quad: MAO, ck: ".6s" }, mui: { quad: MUI, ck: ".8s" }, than: { quad: THAN, ck: ".75s" }, cho: { quad: CHO, ck: ".7s" }, heo: { quad: HEO, ck: ".8s" },
  ran: { veFn: veRan, ck: "1.9s", loai: "xuc" }, thin: { veFn: veRong, ck: "2.4s", loai: "xuc" }, ga: { veFn: veGa, ck: ".6s", loai: "ga" },
};

export function veConGiap(khoa, uid = "x") {
  const t = ANIMALS[khoa];
  if (!t) return "";
  const inner = t.quad ? quad(t.quad, uid) : t.veFn(uid);
  return `<svg class="thu-svg ${t.loai || "quad"}" viewBox="0 -14 240 174" width="100%" role="img" aria-label="${TEN_THU[khoa] || "Con giáp"}" style="--ck:${t.ck}">${inner}</svg>`;
}

// ---------- Hoạt hoạ: sinh keyframes từ hàm giải tích để đùi/cẳng/móng luôn khớp nhau ----------
const sm = (x) => x * x * (3 - 2 * x);
function noiSuy(kp, t) {
  for (let i = 0; i < kp.length - 1; i++) {
    const [t0, v0] = kp[i], [t1, v1] = kp[i + 1];
    if (t >= t0 && t <= t1) return v0 + (v1 - v0) * sm((t - t0) / (t1 - t0 || 1));
  }
  return kp[kp.length - 1][1];
}
function keyframes(ten, up, kn) {
  let s = `@keyframes ${ten}-up{`, k = `@keyframes ${ten}-kn{`, h = `@keyframes ${ten}-hf{`;
  for (let p = 0; p <= 100; p += 5) {
    const t = p / 100, u = up(t), n = kn(t);
    s += `${p}%{rotate:${r1(u)}deg}`; k += `${p}%{rotate:${r1(n)}deg}`; h += `${p}%{rotate:${r1(-(u + n) * 0.9)}deg}`;
  }
  return s + "}" + k + "}" + h + "}";
}
const DI_UP = (t) => (t < 0.5 ? -24 + 48 * (t / 0.5) : 24 - 48 * sm((t - 0.5) / 0.5));
const DI_KN = (t) => (t < 0.5 ? 0 : 64 * Math.pow(Math.sin(Math.PI * ((t - 0.5) / 0.5)), 1.2));
const PHI_TRUOC_UP = [[0, -52], [0.28, 6], [0.5, 38], [0.72, -8], [1, -52]];
const PHI_TRUOC_KN = [[0, 4], [0.28, 6], [0.5, 70], [0.72, 100], [0.9, 40], [1, 4]];
const PHI_SAU_UP = [[0, 18], [0.22, 44], [0.45, 20], [0.7, -42], [1, 18]];
const PHI_SAU_KN = [[0, 12], [0.22, 2], [0.45, 50], [0.7, 85], [0.9, 40], [1, 12]];

export const THU_CSS =
  `.thu{--ck:.95s}
.thu-svg{display:block;overflow:visible}
.thu .up,.thu .kn,.thu .hf,.thu .dau,.thu .duoi,.thu .bob,.thu .mat,.thu .m0,.thu .m1,.thu .m2{transform-box:view-box}
` +
  keyframes("di", DI_UP, DI_KN) +
  keyframes("pt", (t) => noiSuy(PHI_TRUOC_UP, t), (t) => noiSuy(PHI_TRUOC_KN, t)) +
  keyframes("ps", (t) => noiSuy(PHI_SAU_UP, t), (t) => noiSuy(PHI_SAU_KN, t)) +
  `
@keyframes thu-bob{0%,100%{translate:0 0}25%{translate:0 -2.2px}50%{translate:0 0}75%{translate:0 -2.2px}}
@keyframes thu-phi-bob{0%{translate:0 0;rotate:3deg}28%{translate:0 2px;rotate:-1deg}55%{translate:0 -9px;rotate:-5deg}80%{translate:0 -3px;rotate:1deg}100%{translate:0 0;rotate:3deg}}
@keyframes thu-dau{0%,100%{rotate:-2.5deg}50%{rotate:2.5deg}}
@keyframes thu-phi-dau{0%,100%{rotate:3deg}50%{rotate:-4deg}}
@keyframes thu-duoi{0%,100%{rotate:-7deg}50%{rotate:9deg}}
@keyframes thu-tho{0%,100%{scale:1 1}50%{scale:1.006 1.014}}
@keyframes thu-chop{0%,94%,100%{scale:1 1}97%{scale:1 .12}}
@keyframes thu-bom{0%,100%{rotate:-5deg}50%{rotate:6deg}}
@keyframes thu-phi-bom{0%,100%{rotate:-11deg}50%{rotate:12deg}}
.thu.di .up{animation:di-up var(--ck) infinite linear}
.thu.di .kn{animation:di-kn var(--ck) infinite linear}
.thu.di .hf{animation:di-hf var(--ck) infinite linear}
.thu.di .l-ff .up,.thu.di .l-ff .kn,.thu.di .l-ff .hf,.thu.di .l-bn .up,.thu.di .l-bn .kn,.thu.di .l-bn .hf{animation-delay:calc(var(--ck) * -.5)}
.thu.di .bob{animation:thu-bob var(--ck) infinite ease-in-out}
.thu.di .dau{animation:thu-dau var(--ck) infinite ease-in-out}
.thu.chay{--pk:calc(var(--ck) * .62)}
.thu.chay .l-fn .up,.thu.chay .l-ff .up{animation:pt-up var(--pk) infinite linear}
.thu.chay .l-fn .kn,.thu.chay .l-ff .kn{animation:pt-kn var(--pk) infinite linear}
.thu.chay .l-fn .hf,.thu.chay .l-ff .hf{animation:pt-hf var(--pk) infinite linear}
.thu.chay .l-bn .up,.thu.chay .l-bf .up{animation:ps-up var(--pk) infinite linear}
.thu.chay .l-bn .kn,.thu.chay .l-bf .kn{animation:ps-kn var(--pk) infinite linear}
.thu.chay .l-bn .hf,.thu.chay .l-bf .hf{animation:ps-hf var(--pk) infinite linear}
.thu.chay .l-ff .up,.thu.chay .l-ff .kn,.thu.chay .l-ff .hf,.thu.chay .l-bf .up,.thu.chay .l-bf .kn,.thu.chay .l-bf .hf{animation-delay:calc(var(--pk) * -.07)}
.thu.chay .bob{animation:thu-phi-bob var(--pk) infinite ease-in-out;transform-origin:110px 100px}
.thu.chay .dau{animation:thu-phi-dau var(--pk) infinite ease-in-out}
.thu.chay .m0,.thu.chay .m1,.thu.chay .m2{animation-name:thu-phi-bom;animation-duration:.5s}
.thu .duoi{animation:thu-duoi 2.8s infinite ease-in-out}
.thu.di .duoi{animation-duration:calc(var(--ck) * 1.5)}
.thu.chay .duoi{animation-duration:.5s}
.thu.nghi .bob{animation:thu-tho 3.6s infinite ease-in-out;transform-origin:110px 140px}
.thu .mat{animation:thu-chop 5.4s infinite}
.thu .m0{animation:thu-bom 2.1s infinite ease-in-out}
.thu .m1{animation:thu-bom 2.1s infinite ease-in-out -.7s}
.thu .m2{animation:thu-bom 2.1s infinite ease-in-out -1.4s}
@keyframes thu-ran{0%,100%{translate:0 -5.5px}50%{translate:0 5.5px}}
@keyframes thu-lg{0%,100%{rotate:-16deg}50%{rotate:16deg}}
@keyframes thu-lg2{0%,100%{rotate:14deg}50%{rotate:-14deg}}
@keyframes thu-bg{0%,100%{rotate:-9deg}50%{rotate:11deg}}
@keyframes thu-luoi{0%,86%,100%{scale:1 1}90%{scale:1.5 1}95%{scale:.7 1}}
@keyframes thu-ngoc{0%,100%{scale:1}50%{scale:1.16}}
@keyframes thu-canh{0%,100%{rotate:0deg}50%{rotate:-4deg}}
@keyframes thu-ga-dau{0%,100%{translate:0 0;rotate:0deg}30%{translate:6px 3px;rotate:6deg}60%{translate:-2px -1px;rotate:-3deg}}
.thu .sg,.thu .lgR,.thu .bg,.thu .ln,.thu .ngoc,.thu .canh{transform-box:view-box}
.thu .sg{--p:2.4s;animation:thu-ran var(--p) infinite ease-in-out;animation-delay:calc(var(--i) * var(--p) / 26 - var(--p))}
.thu.di .sg{--p:1.9s}.thu.chay .sg{--p:1s}.thu.nghi .sg{--p:3.6s}
.thu .lgR{animation:thu-lg 1.2s infinite ease-in-out}
.thu .bg{animation:thu-bg 2.4s infinite ease-in-out}.thu .bg.b2{animation-delay:-.8s}
.thu .ln{animation:thu-luoi 4.2s infinite}
.thu .ngoc{animation:thu-ngoc 2s infinite ease-in-out}
.thu .canh{animation:thu-canh 3s infinite ease-in-out}
.thu.di .ga .dau,.thu.di svg.ga .dau{animation:thu-ga-dau var(--ck) infinite ease-in-out}

.thu.dung *{animation-play-state:paused !important}
@media (prefers-reduced-motion:reduce){.thu *{animation:none !important}}
`;
