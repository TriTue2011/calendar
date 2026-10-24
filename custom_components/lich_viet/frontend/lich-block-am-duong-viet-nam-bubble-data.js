// Lazy-loaded SVG Bubble Data.
// Individual SVG files are fetched only when selected by the card.

export const svg_12congiap_names = [
  "Robot nữ đỏ tím vẫy tay",
  "Robot nữ pastel vẫy tay",
  "Robot chiến binh đỏ tím",
  "Robot thú cưng bốn chân",
  "Robot hồng nắp mở",
  "Robot mèo trắng kính đen",
  "Robot chó Shiba tai nghe",
  "Robot vàng năng lượng",
  "Robot cá voi mini",
  "Đầu robot mèo xám",
  "Robot camera tím",
  "Robot phi hành gia loa",
  "Robot thỏ trắng tai hồng",
  "Robot bạch tuộc camera",
  "Robot tình yêu hồng",
  "Robot tròn trắng xanh",
  "Robot trắng màn hình xanh",
  "Robot nghiêng kính xanh",
  "Robot nằm kính xanh",
  "Robot xanh đứng",
  "Robot mèo xanh ngồi",
  "Robot anten xanh",
  "Robot phi hành gia hồng",
  "Robot tím đeo headphone",
  "Robot tai nhọn tím",
  "Robot tím đứng",
  "Robot tím trái tim",
  "Cô gái anime tóc tím",
  "Cô gái tóc cam năng động",
  "Cô gái tóc xanh lá",
  "Cô gái bikini vàng",
  "Cô gái bikini đen",
  "Cô gái váy ngủ trắng",
  "Cô gái bikini xanh",
  "Cô gái bikini xanh cổ điển",
  "Cô gái tai thỏ hồng",
  "Nữ sinh váy đen",
  "Nữ sinh tóc đuôi ngựa"
];

export const svg_12congiap_viewboxes = [
  {
    "width": 111.87,
    "height": 199.41
  },
  {
    "width": 112.41,
    "height": 176.59
  },
  {
    "width": 111.42,
    "height": 151.97
  },
  {
    "width": 97.01,
    "height": 138.34
  },
  {
    "width": 68.32,
    "height": 114.17
  },
  {
    "width": 110.43,
    "height": 143.82
  },
  {
    "width": 1817.82,
    "height": 3131.16
  },
  {
    "width": 170.97,
    "height": 370.41
  },
  {
    "width": 128.91,
    "height": 69.53
  },
  {
    "width": 95.97,
    "height": 72.62
  },
  {
    "width": 163.3,
    "height": 309.03
  },
  {
    "width": 237.72,
    "height": 309.09
  },
  {
    "width": 199.1,
    "height": 306.59
  },
  {
    "width": 161.4,
    "height": 306.82
  },
  {
    "width": 179.88,
    "height": 249
  },
  {
    "width": 1423.26,
    "height": 1817.84
  },
  {
    "width": 1316.25,
    "height": 1683.54
  },
  {
    "width": 244.14,
    "height": 225.98
  },
  {
    "width": 244.14,
    "height": 225.98
  },
  {
    "width": 241.54,
    "height": 334.73
  },
  {
    "width": 281.73,
    "height": 281.33
  },
  {
    "width": 183.16,
    "height": 330.52
  },
  {
    "width": 229.21,
    "height": 253
  },
  {
    "width": 237.45,
    "height": 285.9
  },
  {
    "width": 209.33,
    "height": 316.75
  },
  {
    "width": 227.88,
    "height": 317.37
  },
  {
    "width": 190.15,
    "height": 277.91
  },
  {
    "width": 1665.16,
    "height": 2005.25
  },
  {
    "width": 162.25,
    "height": 382.65
  },
  {
    "width": 154.37,
    "height": 369.05
  },
  {
    "width": 164.07,
    "height": 437.76
  },
  {
    "width": 130.5,
    "height": 391.03
  },
  {
    "width": 132.62,
    "height": 386.5
  },
  {
    "width": 130.5,
    "height": 388.05
  },
  {
    "width": 130.5,
    "height": 388.05
  },
  {
    "width": 344.39,
    "height": 486.9
  },
  {
    "width": 149.93,
    "height": 419.14
  },
  {
    "width": 137.94,
    "height": 427.07
  }
];

const SVG_ASSET_VERSION = '20261005';
const svgCache = new Map();

export function getSvgItemCount() {
  return svg_12congiap_names.length;
}

export async function loadSvgItem(index) {
  const safeIndex = Math.max(0, Math.min(getSvgItemCount() - 1, Number.parseInt(index, 10) || 0));
  if (!svgCache.has(safeIndex)) {
    const fileName = String(safeIndex).padStart(2, '0') + '.svg';
    const url = new URL('./assets/bubble-svg/' + fileName + '?v=' + SVG_ASSET_VERSION, import.meta.url);
    svgCache.set(safeIndex, fetch(url).then((response) => {
      if (!response.ok) throw new Error('Không thể tải SVG ' + fileName + ': HTTP ' + response.status);
      return response.text();
    }).catch((error) => {
      svgCache.delete(safeIndex);
      throw error;
    }));
  }
  return svgCache.get(safeIndex);
}
