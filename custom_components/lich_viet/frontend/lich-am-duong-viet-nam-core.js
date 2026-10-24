// Lõi tính toán Âm Dương dùng chung cho các thẻ Home Assistant.
// Tách từ lich-block-am-duong-viet-nam.js để tránh lặp code giữa các thẻ.
// Giữ nguyên thuật toán gốc và các dữ liệu ngày tốt/xấu đang dùng trong bộ thẻ.

import {
  svg_12congiap,
  THAP_NHI_TRUC,
  NHI_THAP_BAT_TU,
  NGAY_THONG_TIN,
  CA_DAO_TUC_NGU
} from './lich-block-am-duong-viet-nam-data.js?v=20261005';

const PI = Math.PI;
function INT(d){ return Math.floor(d); }


const TK19 = [
  0x30baa3, 0x56ab50, 0x422ba0, 0x2cab61, 0x52a370, 0x3c51e8, 0x60d160, 0x4ae4b0, 0x376926, 0x58daa0,
  0x445b50, 0x3116d2, 0x562ae0, 0x3ea2e0, 0x28e2d2, 0x4ec950, 0x38d556, 0x5cb520, 0x46b690, 0x325da4,
  0x5855d0, 0x4225d0, 0x2ca5b3, 0x52a2b0, 0x3da8b7, 0x60a950, 0x4ab4a0, 0x35b2a5, 0x5aad50, 0x4455b0,
  0x302b74, 0x562570, 0x4052f9, 0x6452b0, 0x4e6950, 0x386d56, 0x5e5aa0, 0x46ab50, 0x3256d4, 0x584ae0,
  0x42a570, 0x2d4553, 0x50d2a0, 0x3be8a7, 0x60d550, 0x4a5aa0, 0x34ada5, 0x5a95d0, 0x464ae0, 0x2eaab4,
  0x54a4d0, 0x3ed2b8, 0x64b290, 0x4cb550, 0x385757, 0x5e2da0, 0x4895d0, 0x324d75, 0x5849b0, 0x42a4b0,
  0x2da4b3, 0x506a90, 0x3aad98, 0x606b50, 0x4c2b60, 0x359365, 0x5a9370, 0x464970, 0x306964, 0x52e4a0,
  0x3cea6a, 0x62da90, 0x4e5ad0, 0x392ad6, 0x5e2ae0, 0x4892e0, 0x32cad5, 0x56c950, 0x40d4a0, 0x2bd4a3,
  0x50b690, 0x3a57a7, 0x6055b0, 0x4c25d0, 0x3695b5, 0x5a92b0, 0x44a950, 0x2ed954, 0x54b4a0, 0x3cb550,
  0x286b52, 0x4e55b0, 0x3a2776, 0x5e2570, 0x4852b0, 0x32aaa5, 0x56e950, 0x406aa0, 0x2abaa3, 0x50ab50
];

const TK20 = [
  0x3c4bd8, 0x624ae0, 0x4ca570, 0x3854d5, 0x5cd260, 0x44d950, 0x315554, 0x5656a0, 0x409ad0, 0x2a55d2,
  0x504ae0, 0x3aa5b6, 0x60a4d0, 0x48d250, 0x33d255, 0x58b540, 0x42d6a0, 0x2cada2, 0x5295b0, 0x3f4977,
  0x644970, 0x4ca4b0, 0x36b4b5, 0x5c6a50, 0x466d50, 0x312b54, 0x562b60, 0x409570, 0x2c52f2, 0x504970,
  0x3a6566, 0x5ed4a0, 0x48ea50, 0x336a95, 0x585ad0, 0x442b60, 0x2f86e3, 0x5292e0, 0x3dc8d7, 0x62c950,
  0x4cd4a0, 0x35d8a6, 0x5ab550, 0x4656a0, 0x31a5b4, 0x5625d0, 0x4092d0, 0x2ad2b2, 0x50a950, 0x38b557,
  0x5e6ca0, 0x48b550, 0x355355, 0x584da0, 0x42a5b0, 0x2f4573, 0x5452b0, 0x3ca9a8, 0x60e950, 0x4c6aa0,
  0x36aea6, 0x5aab50, 0x464b60, 0x30aae4, 0x56a570, 0x405260, 0x28f263, 0x4ed940, 0x38db47, 0x5cd6a0,
  0x4896d0, 0x344dd5, 0x5a4ad0, 0x42a4d0, 0x2cd4b4, 0x52b250, 0x3cd558, 0x60b540, 0x4ab5a0, 0x3755a6,
  0x5c95b0, 0x4649b0, 0x30a974, 0x56a4b0, 0x40aa50, 0x29aa52, 0x4e6d20, 0x39ad47, 0x5eab60, 0x489370,
  0x344af5, 0x5a4970, 0x4464b0, 0x2c74a3, 0x50ea50, 0x3d6a58, 0x6256a0, 0x4aaad0, 0x3696d5, 0x5c92e0
];

const TK21 = [
  0x46c960, 0x2ed954, 0x54d4a0, 0x3eda50, 0x2a7552, 0x4e56a0, 0x38a7a7, 0x5ea5d0, 0x4a92b0, 0x32aab5,
  0x58a950, 0x42b4a0, 0x2cbaa4, 0x50ad50, 0x3c55d9, 0x624ba0, 0x4ca5b0, 0x375176, 0x5c5270, 0x466930,
  0x307934, 0x546aa0, 0x3ead50, 0x2a5b52, 0x504b60, 0x38a6e6, 0x5ea4e0, 0x48d260, 0x32ea65, 0x56d520,
  0x40daa0, 0x2d56a3, 0x5256d0, 0x3c4afb, 0x6249d0, 0x4ca4d0, 0x37d0b6, 0x5ab250, 0x44b520, 0x2edd25,
  0x54b5a0, 0x3e55d0, 0x2a55b2, 0x5049b0, 0x3aa577, 0x5ea4b0, 0x48aa50, 0x33b255, 0x586d20, 0x40ad60,
  0x2d4b63, 0x525370, 0x3e49e8, 0x60c970, 0x4c54b0, 0x3768a6, 0x5ada50, 0x445aa0, 0x2fa6a4, 0x54aad0,
  0x4052e0, 0x28d2e3, 0x4ec950, 0x38d557, 0x5ed4a0, 0x46d950, 0x325d55, 0x5856a0, 0x42a6d0, 0x2c55d4,
  0x5252b0, 0x3ca9b8, 0x62a930, 0x4ab490, 0x34b6a6, 0x5aad50, 0x4655a0, 0x2eab64, 0x54a570, 0x4052b0,
  0x2ab173, 0x4e6930, 0x386b37, 0x5e6aa0, 0x48ad50, 0x332ad5, 0x582b60, 0x42a570, 0x2e52e4, 0x50d160,
  0x3ae958, 0x60d520, 0x4ada90, 0x355aa6, 0x5a56d0, 0x462ae0, 0x30a9d4, 0x54a2d0, 0x3ed150, 0x28e952
];

const TK22 = [
  0x4eb520, 0x38d727, 0x5eada0, 0x4a55b0, 0x362db5, 0x5a45b0, 0x44a2b0, 0x2eb2b4, 0x54a950, 0x3cb559,
  0x626b20, 0x4cad50, 0x385766, 0x5c5370, 0x484570, 0x326574, 0x5852b0, 0x406950, 0x2a7953, 0x505aa0,
  0x3baaa7, 0x5ea6d0, 0x4a4ae0, 0x35a2e5, 0x5aa550, 0x42d2a0, 0x2de2a4, 0x52d550, 0x3e5abb, 0x6256a0,
  0x4c96d0, 0x3949b6, 0x5e4ab0, 0x46a8d0, 0x30d4b5, 0x56b290, 0x40b550, 0x2a6d52, 0x504da0, 0x3b9567,
  0x609570, 0x4a49b0, 0x34a975, 0x5a64b0, 0x446a90, 0x2cba94, 0x526b50, 0x3e2b60, 0x28ab61, 0x4c9570,
  0x384ae6, 0x5cd160, 0x46e4a0, 0x2eed25, 0x54da90, 0x405b50, 0x2c36d3, 0x502ae0, 0x3a93d7, 0x6092d0,
  0x4ac950, 0x32d556, 0x58b4a0, 0x42b690, 0x2e5d94, 0x5255b0, 0x3e25fa, 0x6425b0, 0x4e92b0, 0x36aab6,
  0x5c6950, 0x4674a0, 0x31b2a5, 0x54ad50, 0x4055a0, 0x2aab73, 0x522570, 0x3a5377, 0x6052b0, 0x4a6950,
  0x346d56, 0x585aa0, 0x42ab50, 0x2e56d4, 0x544ae0, 0x3ca570, 0x2864d2, 0x4cd260, 0x36eaa6, 0x5ad550,
  0x465aa0, 0x30ada5, 0x5695d0, 0x404ad0, 0x2aa9b3, 0x50a4d0, 0x3ad2b7, 0x5eb250, 0x48b540, 0x33d556
];

const CAN = ["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
const CHI = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const CHI_EMOJI = ["🐭","🐂","🐯","🐱","🐲","🐍","🐴","🐐","🐵","🐔","🐶","🐷"];
const TUAN = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
const TUAN_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const GIO_HD = ["110100101100","001101001011","110011010010","101100110100","001011001101","010010110011"]; 
const TIETKHI = ["Xuân Phân","Thanh Minh","Cốc Vũ","Lập Hạ","Tiểu Mãn","Mang Chủng","Hạ Chí","Tiểu Thử","Đại Thử","Lập Thu","Xử Thử","Bạch Lộ","Thu Phân","Hàn lộ","Sương Giáng","Lập đông","Tiểu Tuyết","Đại Tuyết","Đông Chí","Tiểu Hàn","Đại Hàn","Lập Xuân","Vũ Thủy","Kinh Trập"];

const NGAY_LE_DL = ["1/1","9/1","3/2","14/2","26/2","27/2","8/3","20/3","22/3","26/3","31/3","1/4","30/4","1/5","7/5","12/5","19/5","1/6","18/6","21/6","28/6","11/7","27/7","28/7","19/8","2/9","10/9","1/10","10/10","13/10","16/10","17/10","20/10","31/10","9/11","19/11","20/11","23/11","28/11","29/11","1/12","19/12","25/12","22/12"];
const NGAY_LE_DL_STRING = ["Tết Dương lịch","Truyền thống HS-SV","Thành lập Đảng","Lễ tình nhân","Vía Thần Tài","Thầy thuốc Việt Nam","Quốc tế Phụ nữ","Quốc tế Hạnh phúc","Nước sạch Thế giới","Thành lập Đoàn TNCS Hồ Chí Minh","Lễ Phục Sinh","Cá tháng Tư","Giải phóng Miền Nam","Quốc tế Lao động","Chiến thắng Điện Biên Phủ","Ngày của Mẹ","Ngày sinh Chủ tịch Hồ Chí Minh","Quốc tế Thiếu Nhi","Ngày của Cha","Báo chí Việt Nam","Gia đình Việt Nam","Dân số thế giới","Thương binh liệt sĩ","Thành lập công đoàn VN","Cách mạng Tháng 8","Quốc Khánh","Thành lập MTTQ Việt Nam","Quốc tế người cao tuổi","Giải phóng Thủ Đô","Doanh nhân Việt Nam","Lương thực thế giới","Quốc tế xóa nghèo","Phụ nữ Việt Nam","Halloween","Pháp luật Việt Nam","Quốc tế Nam giới","Nhà giáo Việt Nam","Thành lập Hội chữ thập đỏ","Lễ Tạ Ơn","Black Friday","Phòng chống AIDS","Toàn quốc kháng chiến","Lễ Giáng Sinh","Thành lập Quân đội nhân dân"];
const NGAY_LE_AL = ["1/1","2/1","3/1","15/1","3/3","10/3","15/4","5/5","7/7","15/7","15/8","9/9","10/10","15/10","23/12"];
const NGAY_LE_AL_STRING = ["Mùng Một Tết","Mùng 2 Tết","Mùng 3 Tết","Tết Nguyên Tiêu","Tết Hàn Thực","Giỗ tổ Hùng Vương","Lễ Phật Đản","Tết Đoan Ngọ","Lễ Thất Tịch","Lễ Vu Lan","Tết Trung Thu","Tết Trùng Cửu","Tết Trùng Thập","Tết Hạ Nguyên","Ông Táo Về Trời"];

const PAGE_LOAD_ID = Date.now() + '_' + Math.random().toString(36).slice(2);

function getDateKey(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function isSameSolarDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function getUniqueDailyContent(sourceArray, storageKey = 'cadao_tracker', dateObj = null) {
  if (!sourceArray || sourceArray.length === 0) return "";

  const totalItems = sourceArray.length;
  const hasDisplayDate = dateObj instanceof Date && !isNaN(dateObj.getTime());
  const nowObj = new Date();
  const displayObj = hasDisplayDate ? dateObj : nowObj;
  const dateStr = getDateKey(displayObj);

  // Khi người dùng vuốt sang ngày khác, nội dung vẫn bám theo ngày đang xem.
  // Riêng ngày hôm nay phải đổi theo mỗi lần tải trang và không lặp lại trong ngày.
  if (hasDisplayDate && !isSameSolarDate(displayObj, nowObj)) {
      const seed = jdn(displayObj.getDate(), displayObj.getMonth() + 1, displayObj.getFullYear());
      const selectedIndex = Math.abs((seed * 9301 + 49297) % 233280) % totalItems;
      const content = sourceArray[selectedIndex];
      return content ? content.replace(/\n/g, '<br>') : "";
  }

  let storedData;
  try { storedData = JSON.parse(localStorage.getItem(storageKey)) || {}; }
  catch (e) { storedData = {}; }

  if (
      storedData.date !== dateStr
      || storedData.totalItems !== totalItems
      || !Array.isArray(storedData.shownIndices)
  ) {
      storedData = { date: dateStr, totalItems, shownIndices: [] };
  }

  // Tránh đổi câu liên tục khi Home Assistant render lại cùng một lần tải trang.
  if (
      storedData.pageLoadId === PAGE_LOAD_ID
      && Number.isInteger(storedData.currentIndex)
      && storedData.currentIndex >= 0
      && storedData.currentIndex < totalItems
  ) {
      const content = sourceArray[storedData.currentIndex];
      return content ? content.replace(/\n/g, '<br>') : "";
  }

  const shownSet = new Set(
      storedData.shownIndices.filter(index => Number.isInteger(index) && index >= 0 && index < totalItems)
  );

  let availableIndices = [];
  for (let i = 0; i < totalItems; i++) {
      if (!shownSet.has(i)) availableIndices.push(i);
  }

  // Nếu đã dùng hết toàn bộ danh sách trong ngày thì bắt đầu một vòng mới.
  if (availableIndices.length === 0) {
      shownSet.clear();
      availableIndices = Array.from({ length: totalItems }, (_, index) => index);
  }

  const randomPointer = Math.floor(Math.random() * availableIndices.length);
  const selectedIndex = availableIndices[randomPointer];
  shownSet.add(selectedIndex);

  storedData.date = dateStr;
  storedData.totalItems = totalItems;
  storedData.shownIndices = Array.from(shownSet);
  storedData.currentIndex = selectedIndex;
  storedData.pageLoadId = PAGE_LOAD_ID;
  storedData.updatedAt = Date.now();

  try { localStorage.setItem(storageKey, JSON.stringify(storedData)); }
  catch (e) { /* Bỏ qua nếu trình duyệt chặn localStorage. */ }

  const content = sourceArray[selectedIndex];
  return content ? content.replace(/\n/g, '<br>') : "";
}

function jdn(dd, mm, yy){
  let a = INT((14 - mm) / 12);
  let y = yy + 4800 - a;
  let m = mm + 12 * a - 3;
  let jd = dd + INT((153*m+2)/5) + 365*y + INT(y/4) - INT(y/100) + INT(y/400) - 32045;
  return jd;
}

function jdn2dateFunc(jd){
  let Z, A, alpha, B, C, D, E, dd, mm, yyyy;
  Z = jd;
  if (Z < 2299161) { A = Z; } else { alpha = INT((Z-1867216.25)/36524.25); A = Z + 1 + alpha - INT(alpha/4); }
  B = A + 1524; C = INT((B-122.1)/365.25); D = INT(365.25*C); E = INT((B-D)/30.6001);
  dd = INT(B - D - INT(30.6001*E));
  if (E < 14) mm = E - 1; else mm = E - 13;
  if (mm < 3) yyyy = C - 4715; else yyyy = C - 4716;
  return [dd, mm, yyyy];
}

function decodeLunarYear(yy, k){
  let monthLengths = [29,30];
  let regularMonths = new Array(12);
  let offsetOfTet = k >> 17;
  let leapMonth = k & 0xf;
  let leapMonthLength = monthLengths[(k >> 16) & 0x1];
  let solarNY = jdn(1,1,yy);
  let currentJD = solarNY + offsetOfTet;
  let j = k >> 4;
  for (let i=0;i<12;i++){ regularMonths[12 - i - 1] = monthLengths[j & 0x1]; j >>= 1; }
  let ly = [];
  if (leapMonth === 0){
    for (let mm=1; mm<=12; mm++){ ly.push(new LunarDate(1, mm, yy, 0, currentJD)); currentJD += regularMonths[mm-1]; }
  } else {
    for (let mm=1; mm<=leapMonth; mm++){ ly.push(new LunarDate(1, mm, yy, 0, currentJD)); currentJD += regularMonths[mm-1]; }
    ly.push(new LunarDate(1, leapMonth, yy, 1, currentJD)); currentJD += leapMonthLength;
    for (let mm=leapMonth+1; mm<=12; mm++){ ly.push(new LunarDate(1, mm, yy, 0, currentJD)); currentJD += regularMonths[mm-1]; }
  }
  return ly;
}

const YEAR_INFO_CACHE = new Map();

function getYearInfo(yyyy){
  const year = Number(yyyy);
  if (!Number.isInteger(year) || year < 1800 || year > 2199) return [];
  const cached = YEAR_INFO_CACHE.get(year);
  if (cached) return cached;

  let yearCode;
  if (year < 1900) yearCode = TK19[year - 1800];
  else if (year < 2000) yearCode = TK20[year - 1900];
  else if (year < 2100) yearCode = TK21[year - 2000];
  else yearCode = TK22[year - 2100];

  if (typeof yearCode !== "number") return [];
  const decoded = decodeLunarYear(year, yearCode);
  YEAR_INFO_CACHE.set(year, decoded);
  return decoded;
}

function LunarDate(dd, mm, yy, leap, jd){ this.day = dd; this.month = mm; this.year = yy; this.leap = leap; this.jd = jd; }

const FIRST_DAY = jdn(25,1,1800);
const LAST_DAY = jdn(31,12,2199);

function findLunarDate(jd, ly){
  if (!Array.isArray(ly) || ly.length === 0 || jd > LAST_DAY || jd < FIRST_DAY || ly[0].jd > jd) return new LunarDate(0,0,0,0,jd);
  let i = ly.length-1;
  while (jd < ly[i].jd) i--;
  let off = jd - ly[i].jd;
  return new LunarDate(ly[i].day + off, ly[i].month, ly[i].year, ly[i].leap, jd);
}

function getLunarDate(dd, mm, yyyy){
  let ly = getYearInfo(yyyy);
  const jd = jdn(dd, mm, yyyy);
  if (!ly.length) return new LunarDate(0,0,0,0,jd);
  if (jd < ly[0].jd) ly = getYearInfo(yyyy - 1);
  return findLunarDate(jd, ly);
}

function SunLongitude(jd){
  let T = (jd - 2451545.0) / 36525;
  let T2 = T*T;
  let dr = PI/180;
  let M = 357.52910 + 35999.05030*T - 0.0001559*T2 - 0.00000048*T*T2;
  let L0 = 280.46645 + 36000.76983*T + 0.0003032*T2;
  let DL = (1.914600 - 0.004817*T - 0.000014*T2)*Math.sin(dr*M);
  DL = DL + (0.019993 - 0.000101*T)*Math.sin(2*dr*M) + 0.000290*Math.sin(3*dr*M);
  let L = (L0 + DL) * dr;
  L = L - PI*2*INT(L/(PI*2));
  return L;
}
function getSunLongitude(dayNumber, timeZone){
  return INT(SunLongitude(dayNumber - 0.5 - timeZone/24.0) / PI * 12);
}

function getYearCanChi(year){ return CAN[(year+6) % 10] + " " + CHI[(year+8) % 12]; }
function getCanHour0(jdnv){ return CAN[((jdnv-1)*2) % 10]; }

function getCanChi(lunar){
  let dayName = CAN[(lunar.jd + 9) % 10] + " " + CHI[(lunar.jd+1)%12];
  let monthName = CAN[(lunar.year*12 + lunar.month + 3) % 10] + " " + CHI[(lunar.month+1)%12];
  if (lunar.leap === 1) monthName += " (nhuận)";
  let yearName = getYearCanChi(lunar.year);
  return [dayName, monthName, yearName];
}

function getDayName(lunarDate){
  if (lunarDate.day === 0) return "";
  const cc = getCanChi(lunarDate);
  return "Ngày " + cc[0] + ", tháng " + cc[1] + ", năm " + cc[2];
}

function getGioHoangDao(jd){
  const chiOfDay = (jd + 1) % 12;
  const gioHD = GIO_HD[chiOfDay % 6];
  let ret = ""; let count = 0;
  for (let i=0; i<12; i++){
    if (gioHD.charAt(i) === '1'){
      ret += CHI[i] + " " + CHI_EMOJI[i] + ' <b style="color: var(--popup-accent);">(' + ((i*2+23)%24) + '-' + ((i*2+1)%24) + 'h)</b>';
      if (count++ < 5) ret += ", ";
    }
  }
  return ret;
}

function getGioHacDao(jd){
  const chiOfDay = (jd + 1) % 12;
  const gioHD = GIO_HD[chiOfDay % 6]; 
  let ret = ""; let count = 0;
  for (let i=0; i<12; i++){
    if (gioHD.charAt(i) === '0'){ 
      ret += '<b style="color: var(--color-warn);">' + CHI[i] + '</b>' + " " + CHI_EMOJI[i] + ' <b style="color: var(--color-warn);">(' + ((i*2+23)%24) + '-' + ((i*2+1)%24) + 'h)</b>';
      if (count++ < 5) ret += ", ";
    }
  }
  return ret;
}

	function getSvgConGiap(chiIndex) {
  const svgString = svg_12congiap[chiIndex] || ""; 
  return svgString.replace('<svg', '<svg style="width: 100%; height: 100%;"');
}

	function getCanChiNgay(jd) {
		const can = CAN[(jd + 9) % 10];
		const chi = CHI[(jd + 1) % 12];
		return [can, chi];
	}

	const HUONG = { DONG_BAC: "Đông Bắc", TAY_BAC: "Tây Bắc", TAY_NAM: "Tây Nam", CHINH_NAM: "Chính Nam", DONG_NAM: "Đông Nam", CHINH_DONG: "Chính Đông", CHINH_BAC: "Chính Bắc", CHINH_TAY: "Chính Tây" };
	const HY_THAN_RULES = { [HUONG.DONG_BAC]: ["Giáp", "Kỷ"], [HUONG.TAY_BAC]: ["Ất", "Canh"], [HUONG.TAY_NAM]: ["Bính", "Tân"], [HUONG.CHINH_NAM]: ["Đinh", "Nhâm"], [HUONG.DONG_NAM]: ["Mậu", "Quý"] };
	const TAI_THAN_RULES = { [HUONG.DONG_NAM]: ["Giáp", "Ất"], [HUONG.CHINH_DONG]: ["Bính", "Đinh"], [HUONG.CHINH_BAC]: ["Mậu"], [HUONG.CHINH_NAM]: ["Kỷ"], [HUONG.TAY_NAM]: ["Canh", "Tân"], [HUONG.CHINH_TAY]: ["Nhâm"], [HUONG.TAY_BAC]: ["Quý"] };
	
	const HAC_THAN_FREE = new Set(["QuýTỵ", "GiápNgọ", "ẤtMùi", "BínhThân", "ĐinhDậu", "MậuTuất", "KỷHợi", "CanhTý", "TânSửu", "NhâmDần", "QuýMão", "GiápThìn", "ẤtTỵ", "BínhNgọ", "ĐinhMùi", "MậuThân"]);

	const HAC_THAN_MAP = new Map([
		["KỷDậu", HUONG.DONG_BAC], ["CanhTuất", HUONG.DONG_BAC], ["TânHợi", HUONG.DONG_BAC], ["NhâmTý", HUONG.DONG_BAC], ["QuýSửu", HUONG.DONG_BAC], ["GiápDần", HUONG.DONG_BAC],
		["ẤtMão", HUONG.CHINH_DONG], ["BínhThìn", HUONG.CHINH_DONG], ["ĐinhTỵ", HUONG.CHINH_DONG], ["MậuNgọ", HUONG.CHINH_DONG], ["KỷMùi", HUONG.CHINH_DONG],
		["CanhThân", HUONG.DONG_NAM], ["TânDậu", HUONG.DONG_NAM], ["NhâmTuất", HUONG.DONG_NAM], ["QuýHợi", HUONG.DONG_NAM], ["GiápTý", HUONG.DONG_NAM], ["ẤtSửu", HUONG.DONG_NAM],
		["BínhDần", HUONG.CHINH_NAM], ["ĐinhMão", HUONG.CHINH_NAM], ["MậuThìn", HUONG.CHINH_NAM], ["KỷTỵ", HUONG.CHINH_NAM], ["CanhNgọ", HUONG.CHINH_NAM],
		["TânMùi", HUONG.TAY_NAM], ["NhâmThân", HUONG.TAY_NAM], ["QuýDậu", HUONG.TAY_NAM], ["GiápTuất", HUONG.TAY_NAM], ["ẤtHợi", HUONG.TAY_NAM], ["BínhTý", HUONG.TAY_NAM],
		["ĐinhSửu", HUONG.CHINH_TAY], ["MậuDần", HUONG.CHINH_TAY], ["KỷMão", HUONG.CHINH_TAY], ["CanhThìn", HUONG.CHINH_TAY], ["TânTỵ", HUONG.CHINH_TAY],
		["NhâmNgọ", HUONG.TAY_BAC], ["QuýMùi", HUONG.TAY_BAC], ["GiápThân", HUONG.TAY_BAC], ["ẤtDậu", HUONG.TAY_BAC], ["BínhTuất", HUONG.TAY_BAC], ["ĐinhHợi", HUONG.TAY_BAC],
		["MậuTý", HUONG.CHINH_BAC], ["KỷSửu", HUONG.CHINH_BAC], ["CanhDần", HUONG.CHINH_BAC], ["TânMão", HUONG.CHINH_BAC], ["NhâmThìn", HUONG.CHINH_BAC]
	]);

	function getHuongXuatHanh(jd) {
		const cc = getCanChiNgay(jd);
		const can = cc[0];
		const chi = cc[1];
		const canChi = `${can}${chi}`;
		const findDirection = (rules, canNgay) => {
				for (const [direction, cans] of Object.entries(rules)) {
						if (cans.includes(canNgay)) return direction;
				}
				return "Không rõ";
		};
		const hyThan = findDirection(HY_THAN_RULES, can);
		const taiThan = findDirection(TAI_THAN_RULES, can);
		
		let hacThan;
		if (HAC_THAN_FREE.has(canChi)) {
				hacThan = "— Tránh xuất hành hướng Lên Trời gặp Hạc Thần (xấu)";
		} else {
				hacThan = HAC_THAN_MAP.get(canChi) || "Không rõ";
		}
		
		let tot = `Hỷ Thần: <b style="color: var(--color-good, #4caf50);">${hyThan}</b> - Tài Thần: <b style="color: var(--color-good, #4caf50);">${taiThan}</b>`;
		let xau = `Tránh: <b style="color: var(--color-warn, #f44336);">${hacThan}</b>`;
		return `${tot} | ${xau}`;
	}

function getThanSat(lunarDate) {
	  const TRUC_ORDER = ["Kiến","Trừ","Mãn","Bình","Định","Chấp","Phá","Nguy","Thành","Thu","Khai","Bế"];
  const st_index = getSunLongitude(lunarDate.jd, 7);
  const month_chi_list = [3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,0,0,1,1,2,2,3];
  const month_chi_index = month_chi_list[st_index];
  const day_chi_index = (lunarDate.jd + 1) % 12;
  const duty_index = (day_chi_index - month_chi_index+12) % 12;
	  const trucName = TRUC_ORDER[duty_index];
	  const trucInfo = THAP_NHI_TRUC[trucName];

  const saoNames = Object.keys(NHI_THAP_BAT_TU);
  const jd_ref = 2451545;
  const mansion_ref_index = 16;
  const day_diff = lunarDate.jd - jd_ref;
  
  // FIX: Phép toán Modulo phải trả về giá trị dương khi day_diff là số âm (VD: năm < 2000)
  const current_mansion_index = ((mansion_ref_index + day_diff) % 28 + 28) % 28;
  
  const saoName = saoNames[current_mansion_index];
  const saoInfo = NHI_THAP_BAT_TU[saoName];

		const cc = getCanChi(lunarDate);
		const ngayCC = cc[0];
		const napAm = NGAY_THONG_TIN[ngayCC];
		let thongTin = "";
  if (napAm) {
      let rawString = napAm.moTa + "\n" + napAm.chiTiet.join("\n");
      thongTin = rawString.replace(/\n/g, '<br>');
		} else {
			thongTin = "Không có dữ liệu cho ngày này.";
		}

  const EMOJI_TRUC = {"Kiến":"🚪","Trừ":"✂️","Mãn":"🌕","Bình":"⚖️","Định":"📜","Chấp":"✍️","Phá":"💥","Nguy":"⚠️","Thành":"🏰","Thu":"🌾","Khai":"🔑","Bế":"🔒"};
  const EMOJI_SAO = {"Giác":"🐉","Cang":"🦄","Đê":"🏞️","Phòng":"🏠","Tâm":"❤️","Vĩ":"🦚","Cơ":"🧵","Đẩu":"🛶","Ngưu":"🐂","Nữ":"👩","Hư":"🌫️","Nguy":"⚠️","Thất":"7️⃣","Bích":"💎","Khuê":"📚","Lâu":"🏯","Vị":"🍽️","Mão":"🐇","Tất":"🧦","Chủy":"👄","Sâm":"🌱","Tỉnh":"💧","Quỷ":"👹","Liễu":"🌿","Tinh":"⭐","Trương":"📜","Dực":"🪽","Chẩn":"🩺"};

  return {
    truc: { name: trucName, info: trucInfo, emoji: EMOJI_TRUC[trucName] || "" },
    sao: { name: saoName, info: saoInfo, emoji: EMOJI_SAO[saoName] || "" },
    napAm: thongTin
  };
}

export function getLichAmDuongHelpers() {
  return {
    jdn,
    jdn2dateFunc,
    getYearInfo,
    findLunarDate,
    getLunarDate,
    getYearCanChi,
    getCanHour0,
    getCanChi,
    getCanChiNgay,
    getDayName,
    getSunLongitude,
    getGioHoangDao,
    getGioHacDao,
    getSvgConGiap,
    getHuongXuatHanh,
    getThanSat,
    CAN,
    CHI,
    CHI_EMOJI,
    TUAN,
    TUAN_EN,
    TIETKHI
  };
}

export function getLichAmDuongInfo(dd, mm, yy) {
  const jd = jdn(dd, mm, yy);
  const lunar = getLunarDate(dd, mm, yy);
  return {
    solar: { day: dd, month: mm, year: yy },
    jd,
    lunar,
    canChi: getCanChi(lunar),
    tietKhi: TIETKHI[getSunLongitude(jd + 1, 7.0)],
    thanSat: getThanSat(lunar)
  };
}

export {
  CA_DAO_TUC_NGU,
  CAN,
  CHI,
  CHI_EMOJI,
  TUAN,
  TUAN_EN,
  GIO_HD,
  TIETKHI,
  NGAY_LE_DL,
  NGAY_LE_DL_STRING,
  NGAY_LE_AL,
  NGAY_LE_AL_STRING,
  LunarDate,
  jdn,
  jdn2dateFunc,
  decodeLunarYear,
  getYearInfo,
  findLunarDate,
  getLunarDate,
  SunLongitude,
  getSunLongitude,
  getYearCanChi,
  getCanHour0,
  getCanChi,
  getDayName,
  getGioHoangDao,
  getGioHacDao,
  getSvgConGiap,
  getCanChiNgay,
  getHuongXuatHanh,
  getThanSat,
  getUniqueDailyContent
};
