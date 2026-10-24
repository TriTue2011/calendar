import { getLichAmDuongHelpers as haLichGetSharedHelpers } from './lich-am-duong-viet-nam-core.js?v=20261005';
// ==========================================
// LUNAR CALENDAR POPUP MODULE
// File này chỉ chứa giao diện và logic của Popup
// ==========================================

let _haLichPopupHelpers = null;

const HA_LICH_DAY_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const HA_LICH_LUNAR_MONTH_NAMES = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Mười Một', 'Chạp'];

function haLichPad2(value) {
    return String(value).padStart(2, '0');
}

function haLichGetTodaySolarParts() {
    const now = new Date();
    return {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
}

export function getLichAmDuongTodayInfo(helpersOverride = null) {
    const today = haLichGetTodaySolarParts();
    return getLichAmDuongDateInfo(today.day, today.month, today.year, helpersOverride);
}

function haLichResolveHelpers(helpersOverride = null) {
    if (helpersOverride) return helpersOverride;
    if (_haLichPopupHelpers) return _haLichPopupHelpers;
    try {
        return haLichGetSharedHelpers();
    } catch (err) {
        return null;
    }
}

export function getLichAmDuongDateInfo(dd = null, mm = null, yy = null, helpersOverride = null) {
    if (dd === null || mm === null || yy === null) {
        const today = haLichGetTodaySolarParts();
        dd = today.day;
        mm = today.month;
        yy = today.year;
    }
    const helpers = haLichResolveHelpers(helpersOverride);
    const missingCore = !helpers || typeof helpers.jdn !== 'function' || typeof helpers.getLunarDate !== 'function';
    const CAN = Array.isArray(helpers?.CAN) ? helpers.CAN : [];
    const CHI = Array.isArray(helpers?.CHI) ? helpers.CHI : [];
    const jd = missingCore ? 0 : helpers.jdn(dd, mm, yy);
    const lunar = missingCore ? { day: dd, month: mm, year: yy, leap: 0 } : helpers.getLunarDate(dd, mm, yy);

    const lunarDay = Number(lunar?.day) || dd;
    const lunarMonth = Number(lunar?.month) || mm;
    const lunarYear = Number(lunar?.year) || yy;
    const lunarLeap = Number(lunar?.leap) || 0;
    const dayIndex = missingCore ? new Date(yy, mm - 1, dd).getDay() : ((jd + 1) % 7 + 7) % 7;
    const canChiNam = (CAN.length && CHI.length) ? CAN[(lunarYear + 6) % 10] + ' ' + CHI[(lunarYear + 8) % 12] : 'Không rõ';
    const monthName = HA_LICH_LUNAR_MONTH_NAMES[lunarMonth] || String(lunarMonth);
    const leapText = lunarLeap ? ' nhuận' : '';

    return {
        day: dd,
        month: mm,
        year: yy,
        jd,
        lunarDay,
        lunarMonth,
        lunarYear,
        lunarLeap,
        canChiNam,
        solarLine: `${HA_LICH_DAY_NAMES[dayIndex]}, ${haLichPad2(dd)} - ${haLichPad2(mm)} - ${yy}`,
        lunarLine: `${lunarDay} Tháng ${monthName}${leapText}, ${canChiNam}`,
        source: missingCore ? 'missing_core' : 'shared_core'
    };
}

export function injectPopupDOM() {
    // 1. Khung HTML Popup
    if (!document.getElementById('ha-lich-popup')) {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="ha-lich-popup" class="ha-popup">
                <div class="ha-popup-box">
                    <div class="ha-popup-header">
                        <span id="ha-popup-title">Chi tiết</span>
                        <button type="button" class="ha-popup-close" aria-label="Đóng">✕</button>
                    </div>
                    <div id="ha-popup-content" class="ha-popup-content"></div>
                </div>
            </div>
        `);
    }

    const popup = document.getElementById('ha-lich-popup');
    if (popup && popup.dataset.listenersAttached !== 'true') {
        popup.addEventListener('click', (event) => {
            if (event.target === popup) closeDayPopup();
        });
        popup.querySelector('.ha-popup-close')?.addEventListener('click', closeDayPopup);
        popup.dataset.listenersAttached = 'true';
    }

    // 2. Style CSS cho Popup
    if (!document.getElementById('ha-lich-popup-style')) {
        const style = document.createElement('style');
        style.id = 'ha-lich-popup-style';
        style.innerHTML = `
            .ha-popup { position: fixed !important; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); z-index: 99999 !important; display: none; justify-content: center; align-items: flex-end; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
            .ha-popup.show { display: flex !important; }
            
            .ha-popup-box { background: rgba(var(--popup-bg-rgb), var(--popup-opacity)) !important; color: var(--popup-text) !important; width: 100%; max-width: 500px; max-height: 85vh; border-radius: 24px 24px 0 0; padding: 24px; overflow-y: auto; animation: slideUp 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); margin-bottom: 0; border-top: 1px solid rgba(var(--popup-text-rgb), 0.1); box-shadow: 0 -10px 40px rgba(0,0,0,0.5); }
            @media (min-width: 600px) { .ha-popup { align-items: center; } .ha-popup-box { border-radius: 24px; margin-bottom: auto; width: 420px; border: 1px solid rgba(var(--popup-text-rgb), 0.1); } }
            
            .ha-popup-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 1.2em; margin-bottom: 20px; border-bottom: 1px solid rgba(var(--popup-text-rgb), 0.1); padding-bottom: 15px; }
            .ha-popup-close { font-size: 24px; cursor: pointer; padding: 5px; color: rgba(var(--popup-text-rgb), 0.6); transition: color 0.2s; line-height: 1; border: 0; background: transparent; font-family: inherit; }
            .ha-popup-close:hover { color: var(--popup-text); }
            
            .popup-info-grid { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 20px; }
            @media (min-width: 400px) { .popup-info-grid { grid-template-columns: 1fr 1fr; } }
            .popup-info-item { background: rgba(var(--popup-text-rgb), 0.04); padding: 10px 14px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; border: 1px solid rgba(var(--popup-text-rgb), 0.05); }
            .popup-info-item.full-width { grid-column: 1 / -1; flex-direction: row; justify-content: space-between; align-items: center; }
            .info-label { font-size: 0.85em; color: rgba(var(--popup-text-rgb), 0.6); }
            .info-value { font-size: 1em; font-weight: 600; color: var(--popup-accent); }
            
            .popup-detail-card { background: rgba(var(--popup-text-rgb), 0.03); border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(var(--popup-text-rgb), 0.06); }
            .popup-detail-title { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 10px; color: var(--popup-text); font-size: 1.05em; border-bottom: 1px dashed rgba(var(--popup-text-rgb), 0.15); padding-bottom: 8px; }
            .popup-detail-content { font-size: 0.95em; line-height: 1.6; color: rgba(var(--popup-text-rgb), 0.85); }
            
            .ha-badge { display: inline-flex; align-items: center; justify-content: center; padding: 2px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold; }
            .badge-green { background: rgba(var(--popup-text-rgb), 0.08); color: var(--color-good); border: 1px solid var(--color-good); }
            .badge-red { background: rgba(var(--popup-text-rgb), 0.08); color: var(--color-bad); border: 1px solid var(--color-bad); }
            .badge-yellow { background: rgba(var(--popup-text-rgb), 0.08); color: var(--color-warn); border: 1px solid var(--color-warn); }
            
            .text-highlight { color: var(--popup-text); font-weight: 600; }
            .poem-text { margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(var(--popup-text-rgb), 0.1); text-align: center; font-style: italic; font-family: 'Playfair Display', serif; color: var(--popup-accent); white-space: pre-wrap; line-height: 1.7; opacity: 0.9; }
            
            @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            .ha-popup-box::-webkit-scrollbar { width: 6px; }
            .ha-popup-box::-webkit-scrollbar-track { background: transparent; }
            .ha-popup-box::-webkit-scrollbar-thumb { background: rgba(var(--popup-text-rgb), 0.2); border-radius: 10px; }
            .ha-popup-box::-webkit-scrollbar-thumb:hover { background: rgba(var(--popup-text-rgb), 0.3); }
        `;
        document.head.appendChild(style);
    }
}

export function initPopupCore(helpers) {
    _haLichPopupHelpers = helpers || haLichResolveHelpers() || null;
}

export function closeDayPopup() {
    const popup = document.getElementById('ha-lich-popup');
    if (popup) popup.classList.remove('show');
}

export function showDayPopup(dd, mm, yy, theme = 'default', opacity = 95) {
    const helpers = haLichResolveHelpers();
    if (!helpers) return;

    const {
        jdn, getLunarDate, getCanChiNgay, TIETKHI,
        getSunLongitude, getGioHoangDao, getGioHacDao,
        getHuongXuatHanh, getThanSat, CAN, CHI
    } = helpers;

    function convertSolar2Lunar(day, month, year) {
        if (typeof getLunarDate === 'function') {
            const lunar = getLunarDate(day, month, year);
            return [lunar.day, lunar.month, lunar.year, lunar.leap];
        }
        return [day, month, year, 0];
    }

    const popup = document.getElementById('ha-lich-popup');
    if (!popup) return;

    try {
        // --- CHUẨN BỊ MÀU SẮC THEO THEME POPUP ---
        const themes = {
            'default': { bg: '#1c1c1e', text: '#ffffff', accent: '#ffff99' },
            'theme1':  { bg: '#000000', text: '#ffffff', accent: '#4ade80' },
            'theme2':  { bg: '#f8fafc', text: '#0f172a', accent: '#d97706' },
            'theme3':  { bg: '#0f172a', text: '#f8fafc', accent: '#38bdf8' },
            'theme4':  { bg: '#450a0a', text: '#fef08a', accent: '#fde047' },
            'theme5':  { bg: '#14532d', text: '#f0fdf4', accent: '#86efac' },
            'theme6':  { bg: '#38271d', text: '#fff7ed', accent: '#fdba74' },
            'theme7':  { bg: '#2e1065', text: '#ede9fe', accent: '#c084fc' },
            'theme8':  { bg: '#fef08a', text: '#451a03', accent: '#9a3412' },
            'theme9':  { bg: '#e2e8f0', text: '#020617', accent: '#2563eb' },
            'theme10': { bg: '#083344', text: '#cffafe', accent: '#22d3ee' }
        };
        const currentTheme = themes[theme] || themes['default'];
        
        const hex2rgb = (hex) => {
            let v = hex.replace('#', '');
            if(v.length===3) v = v.split('').map(x=>x+x).join('');
            return `${parseInt(v.substring(0,2), 16)}, ${parseInt(v.substring(2,4), 16)}, ${parseInt(v.substring(4,6), 16)}`;
        };
        
        const bgRgb = hex2rgb(currentTheme.bg);
        const textRgb = hex2rgb(currentTheme.text);
        
        const [r, g, b] = bgRgb.split(',').map(Number);
        const lightBg = ((r * 299) + (g * 587) + (b * 114)) / 1000 > 128;
        
        const cGood = lightBg ? '#15803d' : '#4ade80';
        const cBad  = lightBg ? '#b91c1c' : '#f87171';
        const cWarn = lightBg ? '#b45309' : '#fbbf24';

        // --- TÍNH TOÁN DỮ LIỆU NGÀY ---
        const jd_val = jdn(dd, mm, yy);
        const lunarArr = convertSolar2Lunar(dd, mm, yy);
        const lunarDate = { day: lunarArr[0], month: lunarArr[1], year: lunarArr[2], leap: lunarArr[3], jd: jd_val };

        const canChiNam = CAN[(lunarDate.year + 6) % 10] + " " + CHI[(lunarDate.year + 8) % 12];
        
        const canNamIdx = (lunarDate.year + 6) % 10;
        const canThang1 = ((canNamIdx % 5) + 1) * 2;
        const canThang = (canThang1 + (lunarDate.month - 1)) % 10;
        const chiThang = (lunarDate.month + 1) % 12;
        const canChiThang = CAN[canThang] + " " + CHI[chiThang];

        let canChiNgayStr = "";
        if (typeof getCanChiNgay === 'function') {
            const temp = getCanChiNgay(jd_val);
            canChiNgayStr = Array.isArray(temp) ? temp.join(" ") : temp;
        } else {
             canChiNgayStr = CAN[(jd_val + 9) % 10] + " " + CHI[(jd_val + 1) % 12];
        }

        const canNgayIdx = (jd_val + 9) % 10;
        const canGioTyIdx = (canNgayIdx % 5) * 2;
        const khoiGioTy = CAN[canGioTyIdx] + " Tý";

        let tietKhi = "Không rõ";
        if (typeof TIETKHI !== 'undefined' && typeof getSunLongitude === 'function') {
            tietKhi = TIETKHI[getSunLongitude(jd_val + 1, 7.0)];
        }

        const gioHoangDao = (typeof getGioHoangDao === 'function') ? getGioHoangDao(jd_val) : "...";
        const gioHacDao = (typeof getGioHacDao === 'function') ? getGioHacDao(jd_val) : "...";
        const huongXuatHanh = (typeof getHuongXuatHanh === 'function') ? getHuongXuatHanh(jd_val) : "...";
        
        const thanSat = (typeof getThanSat === 'function') ? getThanSat(lunarDate) : { 
            truc: {name:"...", emoji:"", info:{tot:"", xau:""}}, 
            napAm: "...", 
            sao: {name:"...", emoji:"", info:{danhGia:"", tenNgay:"", nenLam:"", kiengCu:"", ngoaiLe:"", tuongTinh:"", tho:""}} 
        };
        if(!thanSat.truc.info) thanSat.truc.info = {tot:"...", xau:"..."};
        if(!thanSat.sao.info) thanSat.sao.info = {danhGia:"...", nenLam:"...", kiengCu:""};

        const danhGiaRaw = thanSat.sao.info.danhGia || "";
        const isGood = danhGiaRaw.includes('Tốt');
        const isBad = danhGiaRaw.includes('Xấu');
        const saoBadgeClass = isGood ? 'badge-green' : (isBad ? 'badge-red' : 'badge-yellow');
        
        const danhGiaShort = danhGiaRaw.split(' ')[0] || "";
        const danhGiaDetail = danhGiaRaw.includes('(') ? danhGiaRaw.substring(danhGiaRaw.indexOf('(')) : "";
        const thoText = (thanSat.sao.info.tho || '').replace(/^\s+/gm, '');

        // --- GÁN CSS VARIABLE CHO POPUP ---
        const popupRoot = document.getElementById('ha-lich-popup');
        if (popupRoot) {
            popupRoot.style.setProperty('--popup-bg-rgb', bgRgb);
            popupRoot.style.setProperty('--popup-opacity', opacity / 100);
            popupRoot.style.setProperty('--popup-text', currentTheme.text);
            popupRoot.style.setProperty('--popup-text-rgb', textRgb);
            popupRoot.style.setProperty('--popup-accent', currentTheme.accent);
            popupRoot.style.setProperty('--color-good', cGood);
            popupRoot.style.setProperty('--color-bad', cBad);
            popupRoot.style.setProperty('--color-warn', cWarn);
        }

        // --- DỰNG HTML GIAO DIỆN ---
        let res = `<div class="lunar-popup-detail" style="font-family: 'Be Vietnam Pro', sans-serif;">`;
        
        res += `
            <div style="text-align:center; margin-bottom: 20px;">
                <div style="font-size:1.8em; font-weight: 800; color: var(--popup-accent); letter-spacing: 0.5px; text-shadow: 0 2px 10px rgba(var(--popup-text-rgb), 0.1);">${dd}/${mm}/${yy}</div>
                <div style="font-size:0.9em; opacity: 0.7; margin-top: 4px;">Dương lịch</div>
            </div>`;

        res += `<div class="popup-info-grid">
                <div class="popup-info-item full-width">
                    <span class="info-label">Âm lịch</span>
                    <span class="info-value" style="font-size: 1.2em;">${lunarDate.day}/${lunarDate.month} ${lunarDate.leap ? '<span style="font-size:0.7em; opacity:0.8">(Nhuận)</span>' : ''}</span>
                </div>
                <div class="popup-info-item">
                    <span class="info-label">Ngày</span>
                    <span class="info-value">${canChiNgayStr}</span>
                </div>
                <div class="popup-info-item">
                    <span class="info-label">Tháng</span>
                    <span class="info-value">${canChiThang}</span>
                </div>
                <div class="popup-info-item">
                    <span class="info-label">Năm</span>
                    <span class="info-value">${canChiNam}</span>
                </div>
                <div class="popup-info-item">
                    <span class="info-label">Tiết khí</span>
                    <span class="info-value">${tietKhi}</span>
                </div>
            </div>`;

        res += `<div class="popup-detail-card">
                    <div class="popup-detail-title">🧭 Hướng & Giờ</div>
                    <div class="popup-detail-content">
                        <div style="margin-bottom: 10px;">
                            <span class="info-label">Giờ Hoàng Đạo:</span><br>
                            ${gioHoangDao}
                        </div>
                        <div style="margin-bottom: 10px;">
                            <span class="info-label">Giờ Hắc Đạo:</span><br>
                            ${gioHacDao}
                        </div>
                        <div>
                            <span class="info-label">Xuất hành:</span><br>
                            ${huongXuatHanh}
                        </div>
                    </div>
                </div>`;

        res += `<div class="popup-detail-card">
                    <div class="popup-detail-title">
                        ${thanSat.truc.emoji || '📅'} Trực: 
                        <span class="ha-badge badge-green" style="margin-left:auto;">${thanSat.truc.name}</span>
                    </div>
                    <div class="popup-detail-content">
                        <div style="margin-bottom: 6px;">✅ <span class="text-highlight">Tốt:</span> ${thanSat.truc.info.tot || "..."}</div>
                        <div>❌ <span class="text-highlight">Xấu:</span> <span style="color: var(--color-warn);">${thanSat.truc.info.xau || "..."}</span></div>
                    </div>
                </div>`;

        res += `<div class="popup-detail-card">
                    <div class="popup-detail-title">🌟 Ngũ hành Nạp âm</div>
                    <div class="popup-detail-content text-highlight">
                        ${thanSat.napAm}
                    </div>
                </div>`;

        res += `<div class="popup-detail-card">
                    <div class="popup-detail-title">
                        ${thanSat.sao.emoji || '✨'} Nhị Thập Bát Tú: 
                        <span class="ha-badge ${saoBadgeClass}" style="margin-left:auto;">${thanSat.sao.name}</span>
                    </div>
                    <div class="popup-detail-content">
                        <div style="font-style:italic; color: var(--popup-accent); margin-bottom: 12px; font-size: 0.9em;">
                            (${thanSat.sao.info.tenNgay || ""}) - ${danhGiaShort} ${danhGiaDetail} - ${thanSat.sao.info.tuongTinh || ''}
                        </div>
                        <div style="margin-bottom: 8px;">👍 <span class="text-highlight">Nên làm:</span> ${thanSat.sao.info.nenLam}</div>
                        <div style="margin-bottom: 8px;">👎 <span class="text-highlight">Kiêng cữ:</span> <span style="color: var(--color-warn);">${thanSat.sao.info.kiengCu}</span></div>
                        ${thanSat.sao.info.ngoaiLe ? 
                        `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(var(--popup-text-rgb), 0.15);">
                            ✨ <span class="text-highlight">Ngoại lệ:</span><br>
                            <span style="display:block; margin-top:4px; opacity:0.8;">${thanSat.sao.info.ngoaiLe.replace(/\n/g, '<br>')}</span>
                        </div>` : ''}
                        ${thoText ? `<div class="poem-text">${thoText}</div>` : ''}
                    </div>
                </div>`;
        
        res += `<div style="text-align:center; font-size:0.85em; color: rgba(var(--popup-text-rgb), 0.5); margin-top: 20px; margin-bottom: 10px;">
                    Khởi giờ Tý: <span style="color: var(--popup-accent); font-weight: bold;">${khoiGioTy}</span>
                </div>`;
                
        res += `</div>`; 

        const titleEl = document.getElementById('ha-popup-title');
        const contentEl = document.getElementById('ha-popup-content');
        
        if(titleEl) titleEl.innerText = `Chi tiết`;
        if(contentEl) contentEl.innerHTML = res;

        // 1. Hiển thị popup trước (chuyển sang display: flex)
        popup.classList.add('show');

        // 2. Đợi DOM cập nhật xong rồi mới đưa thanh cuộn về trên cùng
        requestAnimationFrame(() => {
            const popupBox = popup.querySelector('.ha-popup-box');
            if (popupBox) {
                popupBox.scrollTop = 0;
            }
        });

    } catch(e) {
        console.error("Lỗi Popup:", e);
        const contentEl = document.getElementById('ha-popup-content');
        if(contentEl) contentEl.innerHTML = `<div style="color:red; padding:15px; text-align:center;">Có lỗi xảy ra: ${e.message}</div>`;
        
        popup.classList.add('show');
        requestAnimationFrame(() => {
            const popupBox = popup.querySelector('.ha-popup-box');
            if (popupBox) {
                popupBox.scrollTop = 0;
            }
        });
    }
}
