// Lấy code âm dương từ HO NGOC DUC và https://www.xemlicham.com/
// Phát triển thẻ dành cho Home Assistant của Nguyễn Tiến Khải - khaisilk1910
// Lunar Calendar Custom Card for Home Assistant

import {
  CA_DAO_TUC_NGU,
  CAN,
  CHI,
  CHI_EMOJI,
  TUAN,
  TUAN_EN,
  TIETKHI,
  NGAY_LE_DL,
  NGAY_LE_DL_STRING,
  NGAY_LE_AL,
  NGAY_LE_AL_STRING,
  getUniqueDailyContent,
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
  getLichAmDuongHelpers
} from './lich-am-duong-viet-nam-core.js?v=20261005';

import { injectPopupDOM, initPopupCore, showDayPopup } from './lich-block-am-duong-viet-nam-popup.js?v=20261005';

(function(){
  'use strict';

  const ABOUT = "Âm lịch Việt Nam Home Assistant - Ver 20Aug2025 © 2025 Nguyễn Tiến Khải";

  // ===== SVG Tết Config =====
  const basePath = "/local/images/lich-block-am-duong-viet-nam";
  const styleIMG = 'style="width:100%; height:100%;"';
  const getImg = (path) => `<img src="${basePath}/${path}" ${styleIMG}>`;
  const svg_tet = [getImg("dao.png"), getImg("mai.png")];
  const generateList = (side, count) => Array.from({ length: count }, (_, i) => getImg(`${side}/${side} (${i + 1}).png`));
  const svg_tet_left = generateList("left", 24);
  const svg_tet_right = generateList("right", 24);

  const DAYNAMES = ["T2","T3","T4","T5","T6","T7","CN"];
  const PRINT_OPTS = { fontSize: "13pt", tableWidth: "100%" };

  function escapeHtmlAttr(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }


  const WEATHER_CONDITION_EMOJI = {
    "sunny": { emoji: "☀️", label: "Nắng", anim: "sunny" },
    "clear": { emoji: "☀️", label: "Trời quang", anim: "sunny" },
    "clear-night": { emoji: "🌙", label: "Đêm quang", anim: "night" },
    "partlycloudy": { emoji: "⛅", label: "Có mây", anim: "cloudy" },
    "partly-cloudy": { emoji: "⛅", label: "Có mây", anim: "cloudy" },
    "mostlycloudy": { emoji: "🌥️", label: "Nhiều mây", anim: "cloudy" },
    "mostly-cloudy": { emoji: "🌥️", label: "Nhiều mây", anim: "cloudy" },
    "có-mây": { emoji: "⛅", label: "Có mây", anim: "cloudy" },
    "nhiều-mây": { emoji: "☁️", label: "Nhiều mây", anim: "cloudy" },
    "nắng": { emoji: "☀️", label: "Nắng", anim: "sunny" },
    "trời-quang": { emoji: "☀️", label: "Trời quang", anim: "sunny" },
    "cloudy": { emoji: "☁️", label: "Nhiều mây", anim: "cloudy" },
    "overcast": { emoji: "☁️", label: "Âm u", anim: "cloudy" },
    "rainy": { emoji: "🌧️", label: "Mưa", anim: "rain" },
    "rain": { emoji: "🌧️", label: "Mưa", anim: "rain" },
    "mưa": { emoji: "🌧️", label: "Mưa", anim: "rain" },
    "mưa-lớn": { emoji: "🌧️", label: "Mưa lớn", anim: "rain-heavy" },
    "pouring": { emoji: "🌧️", label: "Mưa lớn", anim: "rain-heavy" },
    "drizzle": { emoji: "🌦️", label: "Mưa phùn", anim: "rain" },
    "lightning": { emoji: "⚡", label: "Sấm sét", anim: "thunder" },
    "lightning-rainy": { emoji: "⛈️", label: "Mưa dông", anim: "thunder" },
    "lightning_rainy": { emoji: "⛈️", label: "Mưa dông", anim: "thunder" },
    "thunderstorm": { emoji: "⛈️", label: "Dông bão", anim: "thunder" },
    "dông-bão": { emoji: "⛈️", label: "Dông bão", anim: "thunder" },
    "mưa-dông": { emoji: "⛈️", label: "Mưa dông", anim: "thunder" },
    "storm": { emoji: "🌩️", label: "Bão", anim: "thunder" },
    "snowy": { emoji: "❄️", label: "Tuyết", anim: "snow" },
    "snow": { emoji: "❄️", label: "Tuyết", anim: "snow" },
    "snowy-rainy": { emoji: "🌨️", label: "Mưa tuyết", anim: "snow" },
    "snowy_rainy": { emoji: "🌨️", label: "Mưa tuyết", anim: "snow" },
    "hail": { emoji: "🌨️", label: "Mưa đá", anim: "snow" },
    "fog": { emoji: "🌫️", label: "Sương mù", anim: "fog" },
    "sương-mù": { emoji: "🌫️", label: "Sương mù", anim: "fog" },
    "mist": { emoji: "🌫️", label: "Sương mù", anim: "fog" },
    "windy": { emoji: "💨", label: "Có gió", anim: "wind" },
    "windy-variant": { emoji: "🌬️", label: "Gió mạnh", anim: "wind" },
    "windy_variant": { emoji: "🌬️", label: "Gió mạnh", anim: "wind" },
    "exceptional": { emoji: "⚠️", label: "Thời tiết xấu", anim: "alert" },
    "unknown": { emoji: "🌤️", label: "Không rõ", anim: "cloudy" },
    "unavailable": { emoji: "🌤️", label: "Không khả dụng", anim: "cloudy" }
  };

  function normalizeWeatherCondition(condition) {
    return String(condition ?? "")
      .trim()
      .toLowerCase()
      .normalize('NFC')
      .replace(/\s+/g, "-");
  }

  function getWeatherConditionInfo(condition) {
    const raw = String(condition ?? "").trim();
    const key = normalizeWeatherCondition(raw);
    const info = WEATHER_CONDITION_EMOJI[key] || WEATHER_CONDITION_EMOJI[key.replace(/_/g, "-")] || null;
    if (info) return info;
    if (!raw) return WEATHER_CONDITION_EMOJI.unknown;
    return { emoji: "🌤️", label: raw, anim: "cloudy" };
  }

  function parseWeatherNumber(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const cleaned = String(value).replace(",", ".").match(/-?\d+(\.\d+)?/);
    if (!cleaned) return null;
    const num = parseFloat(cleaned[0]);
    return Number.isFinite(num) ? num : null;
  }

  function formatWeatherNumber(value, decimals = 0) {
    const num = parseWeatherNumber(value);
    if (num === null) {
      const safe = escapeHtmlAttr(value ?? "").trim();
      return safe || "—";
    }
    const rounded = decimals > 0 ? num.toFixed(decimals) : String(Math.round(num));
    return rounded.replace(/\.0+$/, "");
  }

  function formatWeatherTemp(value) {
    if (value === undefined || value === null || value === "") return "—";
    return `${formatWeatherNumber(value)}°`;
  }

  function formatWeatherHumidity(value) {
    if (value === undefined || value === null || value === "") return "—";
    return `${formatWeatherNumber(value)}%`;
  }

  function formatWeatherWind(value, unit) {
    if (value === undefined || value === null || value === "") return "—";
    const cleanUnit = escapeHtmlAttr(unit || "km/h");
    return `${formatWeatherNumber(value)} ${cleanUnit}`;
  }

  function getWeatherAttrValue(entity, names) {
    if (!entity || !entity.attributes) return undefined;
    for (const name of names) {
      if (entity.attributes[name] !== undefined && entity.attributes[name] !== null && entity.attributes[name] !== "") {
        return entity.attributes[name];
      }
    }
    return undefined;
  }

  function getTodayForecastValue(entity, names) {
    const forecast = entity && entity.attributes && Array.isArray(entity.attributes.forecast) ? entity.attributes.forecast : null;
    if (!forecast || !forecast.length) return undefined;
    const first = forecast[0] || {};
    for (const name of names) {
      if (first[name] !== undefined && first[name] !== null && first[name] !== "") return first[name];
    }
    return undefined;
  }

  function getHumidityComfortInfo(humidityValue, temperatureValue) {
    const humidity = parseWeatherNumber(humidityValue);
    const temperature = parseWeatherNumber(temperatureValue);
    if (humidity === null && temperature === null) {
      return { emoji: "💧", anim: "humidity-normal", label: "Độ ẩm" };
    }
    if (humidity !== null && humidity <= 35) {
      return { emoji: "🏜️", anim: "humidity-dry", label: "Khô" };
    }

    // Chỉ số cảm nhận đơn giản: nhiệt độ càng cao và độ ẩm càng lớn thì nhịp hiệu ứng càng mạnh.
    let discomfort = 0;
    if (temperature !== null) discomfort += Math.max(0, temperature - 24) * 1.15;
    if (humidity !== null) discomfort += Math.max(0, humidity - 55) * 0.38;
    if (temperature !== null && humidity !== null && temperature >= 30 && humidity >= 60) discomfort += 6;

    if (discomfort >= 22 || (temperature !== null && temperature >= 35 && humidity !== null && humidity >= 60)) {
      return { emoji: "🥵", anim: "humidity-extreme", label: "Rất oi bức" };
    }
    if (discomfort >= 14 || (humidity !== null && humidity >= 75 && temperature !== null && temperature >= 30)) {
      return { emoji: "😓", anim: "humidity-muggy", label: "Oi bức" };
    }
    if (humidity !== null && humidity >= 70) {
      return { emoji: "💦", anim: "humidity-humid", label: "Ẩm cao" };
    }
    if (humidity !== null && humidity >= 55) {
      return { emoji: "💧", anim: "humidity-normal", label: "Độ ẩm" };
    }
    return { emoji: "💧", anim: "humidity-normal", label: "Dễ chịu" };
  }

  function buildWeatherInfoHtml(weatherInfo, side) {
    if (!weatherInfo || !weatherInfo.show) return "";
    if (side === "right") {
      return `<div class="weather-card-mini weather-card-humidity" title="${escapeHtmlAttr(weatherInfo.humidityComfortLabel)} - độ ẩm và tốc độ gió">`+
        `<div class="weather-icon weather-humidity-icon weather-${weatherInfo.humidityAnim}"><span class="weather-icon-inner">${weatherInfo.humidityEmoji}</span></div>`+
        `<div class="weather-main-value weather-humidity-value">${weatherInfo.humidityDisplay}</div>`+
        `<div class="weather-sub-row"><span class="weather-wind-emoji">💨</span><span class="weather-wind">${weatherInfo.windDisplay}</span></div>`+
      `</div>`;
    }
    return `<div class="weather-card-mini weather-card-condition" title="${escapeHtmlAttr(weatherInfo.conditionLabel)}">`+
      `<div class="weather-icon weather-condition-icon weather-anim-${weatherInfo.conditionAnim}"><span class="weather-icon-inner">${weatherInfo.conditionEmoji}</span></div>`+
      `<div class="weather-main-value weather-temp-value">${weatherInfo.temperatureDisplay}</div>`+
      `<div class="weather-sub-row"><span class="weather-high">↑ ${weatherInfo.highDisplay}</span><span class="weather-low">↓ ${weatherInfo.lowDisplay}</span></div>`+
    `</div>`;
  }

  // ==========================================
  // HÀM PRINTSTYLE
  // ==========================================
  function printStyle(){
    let res = "";
    res += '<style>\n';
    res += `
      :host { 
        display: block; 
        --lc-text-main: var(--user-text-main, #ffffff);          
        --lc-text-accent: var(--user-text-accent, #ffff99);        
        --lc-saturday-color: var(--user-saturday-color, #00e600);     
        --lc-sunday-color: var(--user-sunday-color, #ff3333);       
        --lc-holiday-color: var(--user-holiday-color, var(--user-sunday-color));
        --lc-cadao-color: var(--user-cadao-color, var(--user-text-accent));
        --lc-bg-overlay: var(--user-bg-overlay, rgba(255, 255, 255, 0.18)); 
        --lc-bg-overlay-hover: var(--user-bg-overlay-hover, rgba(255, 255, 255, 0.25));
        --lc-border-color: rgba(255, 255, 255, 0.15);
        --lc-text-shadow-heavy: var(--user-text-shadow-heavy, 0 6px 10px rgba(0,0,0,0.28));
        --lc-text-shadow-light: var(--user-text-shadow-light, 0 1px 3px rgba(0,0,0,0.3));
        --lc-tet-bg: #ff3333;             
        --lc-tet-text-solar: #ffffff;     
        --lc-tet-text-lunar: #ffff99;     
        --lc-today-bg: rgba(255, 255, 255, 0.15);
        --lc-element-shadow: var(--user-element-shadow, 0 2px 8px rgba(0,0,0,0.12), inset 0 0.4px 0 rgba(255,255,255,0.35));
      }
      
      .lunar-card { position: relative; isolation: isolate; container-type: inline-size; border-radius: 16px; overflow: hidden; padding-bottom: clamp(45px, 12cqi, 55px); touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: grab; }
      
      .td_tet_left { line-height: 0.9; align-items: flex-end; justify-content: center; position: relative; overflow: visible; }
      .show_left_tet { position: absolute; left: 50%; transform: translateX(-50%); bottom: -11px; display: flex; width: 85%; align-items: flex-end; justify-content: center; z-index: 3; }
      .td_tet_right { line-height: 0.9; align-items: flex-end; justify-content: center; position: relative; overflow: visible; }
      .show_right_tet { position: absolute; left: 50%; transform: translateX(-50%); bottom: -11px; display: flex; width: 75%; align-items: flex-end; justify-content: center; z-index: 3; }
      
      .show_mai_tet { position: absolute; top: 0; left: 0; display: flex; text-align: center; width: clamp(40px, 15cqi, 140px); align-items: center; justify-content: center; z-index: 3; }
      .show_dao_tet { position: absolute; top: 0; right: 0; display: flex; text-align: center; width: clamp(40px, 15cqi, 140px); align-items: center; justify-content: center; z-index: 3; }
      .show_dao_tet { transform-box: fill-box; transform-origin: 100px 20px; animation: lanternSwingSoft 4s ease-in-out infinite; }
      .show_mai_tet { transform-box: fill-box; transform-origin: 0% 35%; animation: lanternSwingSoft 4s ease-in-out infinite; }
      .show_mai_tet img, .show_dao_tet img, .show_right_tet img, .show_left_tet img { margin: 0 auto; display: block; height: auto !important; max-height: 70vh !important; max-width: 100% !important; width: auto !important; }
      
      .thang { font-size:${PRINT_OPTS.fontSize}; padding: 0; line-height: 1.2; font-family:Tahoma,Verdana,Arial; table-layout:fixed; background-color:transparent; border-collapse: collapse; border-spacing: 0; }
      .thang td { padding: 0; }
      
      .ngan_cach { font-family: 'Be Vietnam Pro', sans-serif; color: var(--user-element-base-color, #ffffff); opacity: 0.9; font-size: clamp(8px, 3cqi, 16px); text-align:center; padding: 0; }

      .thang_top, .thang_top_EN { font-family: 'Be Vietnam Pro', sans-serif; color: var(--lc-text-main); font-size: clamp(11px, 4cqi, 20px); line-height:120%; border-top-left-radius: 16px; border-top-right-radius: 16px; padding-top: 3cqi; position: relative; overflow: visible; }

      .thang_top { text-align:right; }
      .thang_top_EN { text-align:left; }

      .nam_top { font-family: 'Bebas Neue', sans-serif; padding: 10px 1cqi 1px 1cqi; color: var(--lc-text-main); font-size: clamp(16px, 6cqi, 32px); font-weight:bold; text-align:center; text-shadow: var(--lc-text-shadow-light); }

      .phan_cach { font-family: 'Be Vietnam Pro', sans-serif; color: var(--user-element-base-color, #ffffff); opacity: 0.9; vertical-align: middle; text-align:center; font-size: clamp(8px, 3cqi, 16px); padding: 0; }

      .todayduonglich { color: var(--lc-text-main); font-family:'Bebas Neue', sans-serif; text-align:center; font-size: clamp(70px, 35cqi, 180px); line-height: 0.85; letter-spacing: 2px; font-weight: 600; text-shadow: var(--lc-text-shadow-heavy); position: relative; overflow: visible; cursor: pointer; padding: 5px 0; }
      
      .weather-slot { position: relative; vertical-align: middle; overflow: visible; height: clamp(72px, 20cqi, 118px); }
      .weather-card-mini { width: 100%; height: 100%; min-height: clamp(72px, 20cqi, 118px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(2px, 0.9cqi, 6px); box-sizing: border-box; padding: 0 clamp(2px, 0.9cqi, 6px); color: var(--lc-text-main); text-align: center; background: transparent !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; text-shadow: var(--lc-text-shadow-light); }
      .weather-card-mini .weather-icon { font-size: clamp(20px, 5.7cqi, 34px); line-height: 1; filter: drop-shadow(0 3px 7px rgba(0,0,0,0.35)); transform-origin: center; will-change: transform, filter, opacity; }
      .weather-card-mini .weather-icon-inner { display: inline-block; transform-origin: center; will-change: transform, filter, opacity; }
      .weather-card-mini .weather-main-value { font-family:'Be Vietnam Pro', sans-serif; font-size: clamp(20px, 6.4cqi, 36px); line-height: 0.95; font-weight: 800; letter-spacing: -0.8px; color: var(--lc-text-main); }
      .weather-card-mini .weather-sub-row { display: flex; align-items: center; justify-content: center; gap: clamp(4px, 1.3cqi, 9px); font-family:'Be Vietnam Pro', sans-serif; font-size: clamp(8.5px, 2.8cqi, 13.5px); line-height: 1.1; opacity: 0.95; white-space: nowrap; }
      .weather-card-mini .weather-high { color: var(--lc-sunday-color); font-weight: 700; }
      .weather-card-mini .weather-low { color: var(--lc-saturday-color); font-weight: 700; }
      .weather-card-mini .weather-wind { color: var(--lc-text-main); font-weight: 700; }
      .weather-card-mini .weather-wind-emoji { color: var(--lc-saturday-color); filter: drop-shadow(0 2px 5px rgba(0,0,0,0.25)); animation: weatherWindFlow 2.6s ease-in-out infinite; }
      .weather-anim-sunny .weather-icon-inner { animation: weatherSunPulse 2.2s ease-in-out infinite; }
      .weather-anim-night .weather-icon-inner { animation: weatherNightTwinkle 2.8s ease-in-out infinite; }
      .weather-anim-cloudy .weather-icon-inner { animation: weatherCloudFloat 3.4s ease-in-out infinite; }
      .weather-anim-rain .weather-icon-inner { animation: weatherRainDrop 1.35s ease-in-out infinite; }
      .weather-anim-rain-heavy .weather-icon-inner { animation: weatherRainHeavy 0.95s ease-in-out infinite; }
      .weather-anim-thunder .weather-icon-inner { animation: weatherThunderFlash 1.15s steps(2, end) infinite; }
      .weather-anim-snow .weather-icon-inner { animation: weatherSnowDrift 3.2s ease-in-out infinite; }
      .weather-anim-fog .weather-icon-inner { animation: weatherFogDrift 4s ease-in-out infinite; }
      .weather-anim-wind .weather-icon-inner { animation: weatherWindFlow 1.8s ease-in-out infinite; }
      .weather-anim-alert .weather-icon-inner { animation: weatherAlertShake 0.95s ease-in-out infinite; }
      .weather-humidity-icon { position: relative; isolation: isolate; }
      .weather-humidity-icon::after { content: ""; position: absolute; inset: -10%; border-radius: 999px; z-index: -1; opacity: 0; pointer-events: none; transform-origin: center; }
      .weather-humidity-normal .weather-icon-inner { animation: humidityCalmFloat 3.2s ease-in-out infinite; }
      .weather-humidity-normal::after { background: radial-gradient(circle, rgba(120,190,255,0.22) 0%, rgba(120,190,255,0.08) 45%, transparent 72%); animation: humidityAuraCalm 3.2s ease-in-out infinite; }
      .weather-humidity-dry .weather-icon-inner { animation: humidityDryShimmer 1.85s ease-in-out infinite; }
      .weather-humidity-dry::after { background: radial-gradient(circle, rgba(255,190,80,0.28) 0%, rgba(255,135,45,0.11) 48%, transparent 74%); animation: humidityAuraDry 1.85s ease-in-out infinite; }
      .weather-humidity-humid .weather-icon-inner { animation: humidityWetRipple 1.75s ease-in-out infinite; }
      .weather-humidity-humid::after { border: 1px solid rgba(90,190,255,0.36); animation: humidityAuraHumid 1.75s ease-out infinite; }
      .weather-humidity-muggy .weather-icon-inner { animation: humidityMuggyHeavy 1.18s ease-in-out infinite; }
      .weather-humidity-muggy::after { background: radial-gradient(circle, rgba(255,170,70,0.28) 0%, rgba(90,190,255,0.12) 50%, transparent 76%); animation: humidityAuraMuggy 1.18s ease-in-out infinite; }
      .weather-humidity-extreme .weather-icon-inner { animation: humidityExtremeStress 0.72s ease-in-out infinite; }
      .weather-humidity-extreme::after { background: radial-gradient(circle, rgba(255,75,55,0.38) 0%, rgba(255,170,35,0.16) 50%, transparent 78%); animation: humidityAuraExtreme 0.72s ease-in-out infinite; }
      @keyframes weatherSunPulse { 0%,100%{ transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 2px rgba(255,210,60,0.35)); } 50%{ transform: scale(1.08) rotate(8deg); filter: drop-shadow(0 0 10px rgba(255,210,60,0.75)); } }
      @keyframes weatherNightTwinkle { 0%,100%{ transform: translateY(0) scale(1); opacity: 0.9; } 50%{ transform: translateY(-2px) scale(1.05); opacity: 1; filter: drop-shadow(0 0 8px rgba(180,210,255,0.7)); } }
      @keyframes weatherCloudFloat { 0%,100%{ transform: translateX(-2px); } 50%{ transform: translateX(3px) translateY(-1px); } }
      @keyframes weatherRainDrop { 0%,100%{ transform: translateY(-1px); } 50%{ transform: translateY(4px); filter: drop-shadow(0 5px 7px rgba(80,170,255,0.55)); } }
      @keyframes weatherRainHeavy { 0%,100%{ transform: translateY(-2px) rotate(-1deg); } 50%{ transform: translateY(5px) rotate(1deg); filter: drop-shadow(0 7px 8px rgba(80,170,255,0.65)); } }
      @keyframes weatherThunderFlash { 0%,100%{ transform: scale(1); filter: drop-shadow(0 0 2px rgba(255,255,120,0.35)); } 50%{ transform: scale(1.12); filter: drop-shadow(0 0 13px rgba(255,255,120,0.95)); } }
      @keyframes weatherSnowDrift { 0%,100%{ transform: translate(0,0) rotate(0deg); } 50%{ transform: translate(2px,3px) rotate(12deg); filter: drop-shadow(0 0 8px rgba(210,240,255,0.75)); } }
      @keyframes weatherFogDrift { 0%,100%{ transform: translateX(-3px); opacity: 0.72; } 50%{ transform: translateX(4px); opacity: 1; } }
      @keyframes weatherWindFlow { 0%,100%{ transform: translateX(-2px); opacity: 0.85; } 50%{ transform: translateX(5px); opacity: 1; } }
      @keyframes weatherAlertShake { 0%,100%{ transform: rotate(0deg); } 25%{ transform: rotate(-8deg); } 75%{ transform: rotate(8deg); } }
      @keyframes humidityCalmFloat { 0%,100%{ transform: translateY(0) scale(1); filter: drop-shadow(0 0 3px rgba(120,190,255,0.26)); } 50%{ transform: translateY(-2px) scale(1.035); filter: drop-shadow(0 0 8px rgba(120,190,255,0.46)); } }
      @keyframes humidityAuraCalm { 0%,100%{ opacity: .18; transform: scale(.82); } 50%{ opacity: .42; transform: scale(1.08); } }
      @keyframes humidityDryShimmer { 0%,100%{ transform: translateY(0) skewX(0deg) scale(1); filter: drop-shadow(0 0 3px rgba(255,180,80,0.34)); } 25%{ transform: translateY(-1px) skewX(-3deg) scale(1.035); } 50%{ transform: translateY(-3px) skewX(3deg) scale(1.06); filter: drop-shadow(0 0 10px rgba(255,165,65,0.72)); } 75%{ transform: translateY(-1px) skewX(-2deg) scale(1.035); } }
      @keyframes humidityAuraDry { 0%,100%{ opacity: .12; transform: scale(.72); filter: blur(.5px); } 50%{ opacity: .52; transform: scale(1.16); filter: blur(1.8px); } }
      @keyframes humidityWetRipple { 0%,100%{ transform: translateY(0) scale(1); filter: drop-shadow(0 0 3px rgba(80,180,255,0.34)); } 50%{ transform: translateY(1px) scale(1.085); filter: drop-shadow(0 0 11px rgba(80,180,255,0.7)); } }
      @keyframes humidityAuraHumid { 0%{ opacity: .52; transform: scale(.62); } 70%{ opacity: .12; transform: scale(1.32); } 100%{ opacity: 0; transform: scale(1.45); } }
      @keyframes humidityMuggyHeavy { 0%,100%{ transform: translateY(0) scale(1) rotate(0deg); filter: drop-shadow(0 0 4px rgba(255,175,80,0.38)); } 35%{ transform: translateY(3px) scale(1.06) rotate(-2deg); } 65%{ transform: translateY(5px) scale(1.095) rotate(2deg); filter: drop-shadow(0 0 13px rgba(255,145,70,0.76)); } }
      @keyframes humidityAuraMuggy { 0%,100%{ opacity: .2; transform: scale(.78); filter: blur(.3px); } 50%{ opacity: .58; transform: scale(1.22); filter: blur(1.5px); } }
      @keyframes humidityExtremeStress { 0%,100%{ transform: translate(0,0) scale(1) rotate(0deg); filter: drop-shadow(0 0 5px rgba(255,70,55,0.48)); } 20%{ transform: translate(-1px,2px) scale(1.08) rotate(-5deg); } 40%{ transform: translate(1px,4px) scale(1.14) rotate(4deg); filter: drop-shadow(0 0 16px rgba(255,65,55,0.92)); } 60%{ transform: translate(-1px,3px) scale(1.1) rotate(-3deg); } 80%{ transform: translate(1px,1px) scale(1.06) rotate(3deg); } }
      @keyframes humidityAuraExtreme { 0%,100%{ opacity: .28; transform: scale(.76); filter: blur(.5px); } 45%{ opacity: .68; transform: scale(1.28); filter: blur(2px); } 70%{ opacity: .35; transform: scale(1.08); } }
      @container (max-width: 330px) { .weather-slot { height: clamp(58px, 18cqi, 92px); } .weather-card-mini { min-height: clamp(58px, 18cqi, 92px); gap: 1px; } .weather-card-mini .weather-icon { font-size: clamp(17px, 5.2cqi, 28px); } .weather-card-mini .weather-main-value { font-size: clamp(18px, 5.8cqi, 30px); } .weather-card-mini .weather-sub-row { font-size: clamp(8px, 2.5cqi, 12px); gap: 4px; } }
      
      .thongtin_letet { font-family: 'Playfair Display', serif; color: var(--lc-holiday-color); line-height: 1.35; padding: clamp(4px, 1.2cqi, 8px) clamp(10px, 3cqi, 20px); margin: 2px 30px; text-align:center; font-size: clamp(12px, 3.8cqi, 18px); letter-spacing: 0.5px; background: var(--lc-bg-overlay); border-radius:14px; border:0.4px solid var(--lc-border-color); box-shadow: var(--lc-element-shadow); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); text-shadow: var(--lc-text-shadow-light); font-weight: 600; width: max-width: 90%; }
      .cadaotucngu { font-family: 'Playfair Display', serif; font-style:italic; color: var(--lc-cadao-color); line-height: 1.35; padding: clamp(4px, 1.2cqi, 8px) clamp(10px, 3cqi, 20px); margin: 6px 30px 10px 30px; text-align:center; font-size: clamp(12px, 3.8cqi, 18px); letter-spacing: 0.5px; background: var(--lc-bg-overlay); border-radius:14px; border:0.4px solid var(--lc-border-color); box-shadow: var(--lc-element-shadow); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); text-shadow: var(--lc-text-shadow-light); font-weight: 500; width: max-width: 95%; }
      
      .thutrongtuan, .thutrongtuan_EN { font-family: 'Playfair Display', serif; color: var(--lc-text-main); background: var(--lc-bg-overlay); box-shadow: var(--lc-element-shadow); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); text-align:center; vertical-align: middle; font-size: clamp(11px, 4.5cqi, 22px); line-height: 1.2; font-weight:bold; padding: clamp(4px, 1.5cqi, 10px); text-shadow: var(--lc-text-shadow-light); position: relative; z-index: 1;}
      .thutrongtuan { margin-right: 12px; border-bottom-right-radius: 16px; border-top-right-radius: 16px; }
      .thutrongtuan_EN { margin-left: 12px; border-bottom-left-radius: 16px; border-top-left-radius: 16px; }
      
      .svg_td { text-align:center; width:clamp(35px, 12cqi, 70px); position: relative; z-index: 5; transition: z-index 0.1s; }
      .svg_td:hover { z-index: 50; }
      .svg_circle_divider { width: 100%; aspect-ratio: 1/1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; background: var(--lc-bg-overlay); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); border: 1px solid var(--lc-border-color); box-shadow: var(--lc-element-shadow); position: relative; z-index: 2; overflow: visible; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); }
      .svg-cell { width: 90%; height: 90%; object-fit: contain; display: flex; align-items: center; justify-content: center; transform-origin: bottom center; will-change: transform; transition: scale 0.3s ease; scale: 1; animation: popup-bouncy 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, wiggle-continuous 3s ease-in-out 0.8s infinite; position: relative; z-index: 3;}
      
      [data-hover="neon"] .svg_circle_divider:hover { transform: scale(1.08); background: rgba(255, 200, 0, 0.15); border-color: rgba(255, 200, 0, 0.9); box-shadow: 0 0 15px rgba(255, 200, 0, 0.6), 0 0 30px rgba(255, 200, 0, 0.4), inset 0 0 12px rgba(255, 200, 0, 0.4); z-index: 10; }
      [data-hover="glass"] .svg_circle_divider:hover { transform: translateY(-4px) scale(1.05); background: var(--lc-bg-overlay-hover); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8); z-index: 10; }
      [data-hover="aura"] .svg_circle_divider:hover { transform: scale(1.05); background: rgba(255, 255, 255, 0.25); border-color: #ffca28; box-shadow: 0 0 0 4px rgba(255, 200, 0, 0.25), 0 0 20px rgba(255, 200, 0, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.5); z-index: 10; }
      [data-hover="cyber"] .svg_circle_divider:hover { transform: scale(1.1); background: var(--lc-bg-overlay-hover); border: 2px solid #00f2fe; box-shadow: 0 0 15px #00f2fe, inset 0 0 10px rgba(0, 242, 254, 0.5); z-index: 10; }
      [data-hover="spin"] .svg_circle_divider:hover { transform: scale(1.1) rotate(360deg); background: rgba(255, 200, 0, 0.1); border-color: #ff9800; box-shadow: 0 0 20px rgba(255, 152, 0, 0.6); z-index: 10; }
      @keyframes heartbeatHover { 0% { transform: scale(1); } 25% { transform: scale(1.15); box-shadow: 0 0 20px #ff3333; } 50% { transform: scale(1.05); } 75% { transform: scale(1.15); box-shadow: 0 0 25px #ff3333; } 100% { transform: scale(1.1); box-shadow: 0 0 15px #ff3333; } }
      [data-hover="pulse"] .svg_circle_divider:hover { animation: heartbeatHover 1s infinite alternate; border-color: #ff3333; background: rgba(255, 51, 51, 0.1); z-index: 10; }
      @keyframes floatHover { 0% { transform: translateY(0px) scale(1.05); } 50% { transform: translateY(-6px) scale(1.05); box-shadow: 0 10px 15px rgba(0,255,255,0.4); } 100% { transform: translateY(0px) scale(1.05); } }
      [data-hover="float"] .svg_circle_divider:hover { animation: floatHover 2s infinite ease-in-out; border-color: #00f2fe; background: var(--lc-bg-overlay-hover); z-index: 10; }
      [data-hover="ring"] .svg_circle_divider:hover { transform: scale(1.05); box-shadow: 0 0 0 3px var(--lc-bg-overlay), 0 0 0 6px #ff9800, 0 0 15px rgba(255, 152, 0, 0.5); border-color: transparent; background: var(--lc-bg-overlay-hover); z-index: 10; }
      [data-hover="morph"] .svg_circle_divider:hover { transform: scale(1.1); border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; background: linear-gradient(135deg, rgba(255,200,0,0.3), rgba(255,100,0,0.3)); border-color: #ff9800; box-shadow: 0 5px 15px rgba(255,152,0,0.5); z-index: 10; }
      [data-hover="flash"] .svg_circle_divider:hover { transform: scale(1.12); background: rgba(255, 255, 255, 0.4); border: 2px solid #fff; box-shadow: 0 0 25px #fff, 0 0 40px #fff; transition: all 0.15s ease-out; z-index: 10; }
      
      @keyframes popup-bouncy { 0% { transform: translateY(110%); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      @keyframes wiggle-continuous { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
      
      .thang_am_lich, .nam_am_lich { position: relative; overflow: visible; color: var(--lc-text-accent); width: clamp(120px, 40%, 200px); font-family: 'Playfair Display', serif; background: var(--lc-bg-overlay); box-shadow: var(--lc-element-shadow); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); text-align:center; vertical-align: middle; font-size: clamp(11px, 4cqi, 18px); line-height: 1.2; font-weight:bold; padding: clamp(4px, 1.5cqi, 10px); margin: 10px auto; border-radius: 8px; text-shadow: var(--lc-text-shadow-light); }
      
      .ngayamlich { color: var(--lc-text-accent); font-family: 'Playfair Display', serif; text-align:center; vertical-align: middle; font-size: clamp(60px, 30cqi, 140px); letter-spacing: 2px; line-height: 0.6; font-weight: 600; text-shadow: var(--lc-text-shadow-heavy); margin: 10px auto; cursor: pointer; }
      
      .ThangNgayGioTiet_before { font-family:'Bebas Neue', sans-serif; font-style:italic; color: var(--lc-text-main); text-align:center; font-size: clamp(8px, 2.5cqi, 12px); padding: 0; margin: 2px auto; opacity: 0.85; text-shadow: var(--lc-text-shadow-light); text-transform: uppercase; letter-spacing: 0.5px;}
      .ThangNgayGioTiet_after { font-family: 'Playfair Display', serif; color: var(--lc-text-accent); text-align:center; font-size: clamp(10px, 3.5cqi, 18px); font-weight:bold; padding: 0; margin: 4px auto clamp(8px, 2.5cqi, 16px) auto; text-shadow: var(--lc-text-shadow-light);}
      
      .tab-bar { position: absolute; bottom: 0; left: 0; width: 100%; height: clamp(45px, 12cqi, 55px); display: flex; gap: 10px; justify-content: center; align-items: center; padding: 0 15px; box-sizing: border-box; z-index: 11; background: transparent; }
      .tab-btn { flex: 1; padding: clamp(6px, 2cqi, 10px) 0; border-radius: 8px; border: 0.4px solid var(--lc-border-color); background: var(--lc-bg-overlay); color: var(--lc-text-main); font-weight: bold; cursor: pointer; transition: all 0.3s ease; box-shadow: var(--lc-element-shadow); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); font-size: clamp(10px, 3cqi, 14px); text-shadow: var(--lc-text-shadow-light); }
      .tab-btn:hover { background: var(--lc-bg-overlay-hover); transform: translateY(-1px); }
      .tab-btn.active { background: var(--lc-bg-overlay-hover); border-color: var(--lc-text-accent); color: var(--lc-text-accent); box-shadow: 0 0 15px rgba(255, 255, 0, 0.2); }
      
      .tab-overlay { display: flex; flex-direction: column; position: absolute; top: 0; left: 0; width: 100%; height: calc(100% - clamp(45px, 12cqi, 55px)); background: var(--lc-bg-overlay); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); z-index: 10; overflow-y: auto; overflow-x: hidden; border-radius: 16px 16px 0 0; box-sizing: border-box; padding: clamp(8px, 2cqi, 15px); animation: slideUpOverlay 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; box-shadow: inset 0 0 30px rgba(0,0,0,0.1); }
      @keyframes slideUpOverlay { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      .tab-overlay::-webkit-scrollbar { width: 6px; }
      .tab-overlay::-webkit-scrollbar-track { background: transparent; }
      .tab-overlay::-webkit-scrollbar-thumb { background: var(--lc-text-accent); border-radius: 4px; opacity: 0.5; }

      #tab-content-cal { flex-grow: 1; display: block; overflow-y: auto; padding-bottom: 20px; } 
      
      .grid-month { width: 100%; border-collapse: separate; border-spacing: clamp(4px, 1.5cqi, 8px); table-layout: fixed; margin: 0; }
      
      .grid-month .navi-l { text-align: right; }
      .grid-month .navi-r { text-align: left; }
      .grid-month .tenthang { text-align: center; vertical-align: middle; }
      .grid-month .navi-l, .grid-month .navi-r, .grid-month .tenthang { background: transparent !important; border: none !important; box-shadow: none !important; border-bottom: none !important; padding-bottom: 5px; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
      
      /* UPDATE BORDER RADIUS, PADDING AND FONT SIZE CHO NÚT ĐIỀU HƯỚNG */
      .grid-month .nav-btn { font-size: clamp(12px, 3.5cqi, 16px); padding: 4px 12px; background: rgba(255,255,255,0.1) !important; border: 1px solid rgba(255,255,255,0.3) !important; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.3); transition: all 0.25s; color: var(--lc-text-main); font-weight: bold; cursor: pointer; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
      .grid-month .nav-btn:hover { background: rgba(255,255,255,0.25) !important; transform: translateY(-2px); border-color: var(--lc-text-accent) !important; color: var(--lc-text-accent) !important; box-shadow: 0 8px 20px rgba(0,0,0,0.2), 0 0 12px rgba(255,255,255,0.2); }
      .grid-month .tenthang .nav-btn { font-size: clamp(14px, 4cqi, 18px); padding: 4px 16px; border-radius: 12px; letter-spacing: 1px; }

      .grid-month .ngaytuan, .grid-month .ngaytuan_t7, .grid-month .ngaytuan_cn { background: transparent !important; border: none !important; box-shadow: none !important; border-bottom: 2px solid rgba(255,255,255,0.15) !important; font-size: clamp(12px, 4cqi, 16px); text-transform: uppercase; letter-spacing: 1px; padding: clamp(6px, 2cqi, 10px) 0; font-weight: 800; text-align: center; border-radius: 0; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; text-shadow: var(--lc-text-shadow-light); }
      .grid-month .ngaytuan_t7 { color: var(--lc-saturday-color); }
      .grid-month .ngaytuan_cn { color: var(--lc-sunday-color); }
      .grid-month .ngaytuan { color: var(--lc-text-main); }

      .grid-month td.ngaythang { background: var(--lc-bg-overlay); border-radius: 12px; border: 1px solid var(--lc-border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.2); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); height: clamp(40px, 11cqi, 65px); padding: 0; position: relative; cursor: pointer; vertical-align: middle; }
      .grid-month .cell-content { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; box-sizing: border-box; padding: 2px; }
      
      .grid-month td.ngaythang:hover { transform: translateY(-5px) scale(1.05); background: rgba(255,255,255,0.25) !important; border-color: rgba(255,255,255,0.8); box-shadow: 0 12px 25px rgba(0,0,0,0.25), 0 0 15px rgba(255,255,255,0.3), inset 0 1px 2px rgba(255,255,255,0.9); z-index: 10; }
      
      .grid-month .t2t6, .grid-month .t7, .grid-month .cn { font-size: clamp(16px, 5cqi, 24px) !important; font-weight: 800 !important; line-height: 1 !important; margin-bottom: 2px; text-align: center; }
      .grid-month .t2t6 { color: var(--lc-text-main); }
      .grid-month .t7 { color: var(--lc-saturday-color); }
      .grid-month .cn { color: var(--lc-sunday-color); }
      .grid-month .am, .grid-month .am2 { font-size: clamp(9px, 3cqi, 13px) !important; font-weight: 600 !important; color: var(--lc-text-accent); opacity: 0.9; text-align: center; padding: 0 !important; line-height: 1; }
      
      .grid-month td.homnay { border: 2px solid var(--lc-text-accent) !important; background: rgba(255,255,255,0.15) !important; box-shadow: 0 0 20px rgba(255,255,0,0.15), inset 0 0 15px rgba(255,255,255,0.2); }
      .grid-month td.homnay .t2t6, .grid-month td.homnay .t7, .grid-month td.homnay .cn { text-shadow: 0 0 10px rgba(255,255,255,0.5); }

      .grid-month td.tet_cell { background: linear-gradient(135deg, #e53935, #b71c1c) !important; border-color: #ffcdd2 !important; box-shadow: 0 4px 15px rgba(229, 57, 53, 0.4); }
      .grid-month td.tet_cell .t2t6, .grid-month td.tet_cell .t7, .grid-month td.tet_cell .cn { color: #ffffff !important; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
      .grid-month td.tet_cell .am, .grid-month td.tet_cell .am2 { color: #fff59d !important; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

      .grid-month .empty-cell { background: transparent !important; border-color: transparent !important; box-shadow: none !important; pointer-events: none; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
      .grid-month .empty-cell .cell-content { display: none; }

      .year-svg-container { position: absolute; top: -36px; width: 35px; height: 35px; animation: marquee-horizontal 8s ease-in-out infinite; overflow: visible; }
      .year-svg-container::after { content: ''; position: absolute; bottom: -2px; left: 15%; width: 70%; height: 4px; background: rgba(0, 0, 0, 0.25); border-radius: 50%; filter: blur(2px); z-index: -1; animation: shadow-pulse 0.5s infinite alternate; }
      .year-svg-container::before { content: ''; position: absolute; bottom: 2px; right: -5px; width: 4px; height: 4px; border-radius: 50%; background: rgba(255, 255, 255, 0.6); box-shadow: -5px -2px 0 -1px rgba(255, 255, 255, 0.4), -3px 5px 0 -1px rgba(255, 255, 255, 0.5); animation: dust-trail 0.6s infinite linear; z-index: -2; opacity: 0; }
      @keyframes marquee-horizontal { 0% { left: 0%; transform: scaleX(-1); } 49.9% { left: calc(100% - 35px); transform: scaleX(-1); } 50% { left: calc(100% - 35px); transform: scaleX(1); } 100% { left: 0%; transform: scaleX(1); } }
      @keyframes dust-trail { 0% { transform: translate(0, 0) scale(1); opacity: 0.8; } 100% { transform: translate(15px, -5px) scale(0.2); opacity: 0; } }
      @keyframes shadow-pulse { from { transform: scaleX(1); opacity: 0.25; } to { transform: scaleX(1.2); opacity: 0.15; } }
      
      .lunar-card > div:first-child, .thang_top, .giohoangdao, .viecnenlam, .viecnentranh,
      .cat_tinh, .hung_tinh, .tenthang, .navi-l, .navi-r, .ngaytuan, .ngaytuan_t7,
      .ngaytuan_cn, .ngaythang, .tet, .tab-btn { background: transparent !important; }
      .thang_top, .t2t6, .tenthang, .navi-r, .ngaytuan, .tab-btn, .viecnenlam b, .viecnentranh b,
      .cat_tinh b, .hung_tinh b, .giohoangdao { color: var(--lc-text-main) !important; }
      .ngaythang:hover { background-color: var(--lc-bg-overlay-hover) !important; border-radius: 8px;}
      .todayduonglich:hover, .ngayamlich:hover { color: rgba(255, 255, 0, 1) !important; text-shadow: 0 8px 16px rgba(255, 200, 0, 0.5)!important; }
      .svg-cell:hover { scale: 1.9; }
      .show_dao_tet:hover, .show_mai_tet:hover { animation: lanternSwingStrong 1.2s ease-in-out infinite; }
      @keyframes lanternSwingSoft { 0% { transform: rotate(0deg); } 25% { transform: rotate(1.5deg); } 50% { transform: rotate(-1.5deg); }75% { transform: rotate(1deg); } 100% { transform: rotate(0deg); } }
      @keyframes lanternSwingStrong { 0% { transform: rotate(0deg); } 20% { transform: rotate(6deg); } 40% { transform: rotate(-5deg); } 60% { transform: rotate(4deg); } 80% { transform: rotate(-3deg); } 100% { transform: rotate(0deg); } }
      :host([data-paused]) * { animation-play-state: paused !important; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
      }
    `;
    res += '</style>';
    return res;
  }

  function printHead(mm, yy){
    let res = "";
    const monthName = mm+" ◦ "+yy;
    res += `<tr><td colspan="2" class="navi-l"><button id="prev-year" class="nav-btn">&laquo;</button>  <button id="prev-month" class="nav-btn">&lsaquo;</button></td>`;
    res += `<td colspan="3" class="tenthang"><button id="reset-today" class="nav-btn">${monthName}</button></td>`;
    res += `<td colspan="2" class="navi-r"><button id="next-month" class="nav-btn">&rsaquo;</button>  <button id="next-year" class="nav-btn">&raquo;</button></td></tr>`;
    
    // Đã thay đổi kích thước các nút ĐI ĐẾN (Goto month/year) nhỏ gọn hơn
    res += `<tr><td colspan="7" style="text-align: center; padding-bottom: 8px;">
      <input id="goto-month" type="number" min="1" max="12" placeholder="Tháng" value="${mm}" style="width: clamp(40px, 10cqi, 50px); background: var(--lc-bg-overlay); color: var(--lc-text-main); border: 1px solid var(--lc-border-color); border-radius: 6px; padding: 3px; text-align: center; font-size: clamp(11px, 3cqi, 13px); outline: none;">
      <span style="color: var(--lc-text-main); font-weight: bold; margin: 0 2px;">/</span>
      <input id="goto-year" type="number" min="1800" max="2199" placeholder="Năm" value="${yy}" style="width: clamp(50px, 12cqi, 60px); background: var(--lc-bg-overlay); color: var(--lc-text-main); border: 1px solid var(--lc-border-color); border-radius: 6px; padding: 3px; text-align: center; font-size: clamp(11px, 3cqi, 13px); outline: none;">
      <button id="goto-btn" class="nav-btn" style="padding: 3px 8px; font-size: clamp(11px, 3cqi, 13px); margin-left: 5px; border-radius: 6px;">ĐI ĐẾN</button>
    </td></tr>`;

    res += `<tr>`;
    for (let i=0;i<=6;i++){
      if (DAYNAMES[i]==='CN') res += '<td class="ngaytuan_cn">CN</td>';
      else if (DAYNAMES[i]==='T7') res += '<td class="ngaytuan_t7">T7</td>';
      else res += `<td class="ngaytuan">${DAYNAMES[i]}</td>`;
    }
    res += '</tr>';
    return res;
  }

  function printEmptyCell(){
    return '<td class="ngaythang empty-cell"><div class="cell-content"></div></td>';
  }

  function printCell(lunarDate, solarDate, solarMonth, solarYear, today, config){
    let cellClasses = ["ngaythang"];
    let solarClass = "t2t6";
    let lunarClass = "am";

    const dow = (lunarDate.jd + 1) % 7;
    if (dow === 0){ solarClass = "cn"; }
    else if (dow === 6){ solarClass = "t7"; }

    if (solarDate === today.getDate() && solarMonth === (today.getMonth()+1) && solarYear === today.getFullYear()){
      cellClasses.push("homnay");
    }
    if (lunarDate.month === 1 && lunarDate.day >= 1 && lunarDate.day <= 3){
      cellClasses.push("tet_cell");
    }
    if (lunarDate.leap === 1){ lunarClass = "am2"; }

    let lunar = lunarDate.day;
    if (solarDate === 1 || lunar === 1){ lunar = `${lunarDate.day}/${lunarDate.month}`; }

    let title = getDayName(lunarDate);
    let finalCellClass = cellClasses.join(" ");

    const pTheme = config.popup_theme || 'default';
    const pOpacity = config.popup_opacity !== undefined ? config.popup_opacity : 95;

    return `<td class="${finalCellClass} lunar-day-cell" title="${escapeHtmlAttr(title)}" `+
      `data-solar-date="${solarDate}" data-solar-month="${solarMonth}" data-solar-year="${solarYear}" `+
      `data-popup-theme="${escapeHtmlAttr(pTheme)}" data-popup-opacity="${escapeHtmlAttr(pOpacity)}">`+
      `<div class="cell-content">`+
      `<div class="${solarClass}">${solarDate}</div>`+
      `<div class="${lunarClass}">${lunar}</div>`+
      `</div></td>`;
  }

  function printTable(mm, yy, today, config, activeLunarTab = 'none'){
    const jd = jdn(today.getDate(), mm, yy);
    const currentMonthArr = getMonth(mm, yy);
    if (currentMonthArr.length === 0) return "";
    const ld1 = currentMonthArr[0];
    const emptyCells = (ld1.jd + 0) % 7;

    const currentLunarDate = getLunarDate(today.getDate(), mm, yy);
    let res = "";

    const pTheme = config.popup_theme || 'default';
    const pOpacity = config.popup_opacity !== undefined ? config.popup_opacity : 95;

    res += `<div id="main-view">`;
    res += `<table class="thang" border="0" width="${PRINT_OPTS.tableWidth}">`;

    const showthangarray_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const monthNameEN = showthangarray_EN[mm - 1];
    res += `<tr><td colspan="7">`;
	res += `<div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; width: 100%;">`;
    res += `<div class="thang_top" style="text-align: right; padding-right: 8px;">Tháng ${mm} <span class="ngan_cach">❖</span>`;
    if ((currentLunarDate.month === 12 && currentLunarDate.day >= 23) || (currentLunarDate.month === 1 && currentLunarDate.day <= 3)) {
        const maiImg = svg_tet[1];
        if (maiImg) res += `<div class="show_mai_tet">${maiImg}</div>`;
    }
    res += `</div>`;
    res += `<div class="nam_top">${yy}</div>`;
    res += `<div class="thang_top_EN" style="text-align: left; padding-left: 8px;"><span class="ngan_cach">❖</span> ${monthNameEN}`;
    if ((currentLunarDate.month === 12 && currentLunarDate.day >= 23) || (currentLunarDate.month === 1 && currentLunarDate.day <= 3)) {
        const tetFlower = svg_tet[0];
        if (tetFlower) res += `<div class="show_dao_tet">${tetFlower}</div>`;
    }
	res += `</div></div></td></tr>`;

    res += `<tr><td colspan="7" class="phan_cach">─────  ⟡  ─────</td></tr>`;

    res += `<tr>`;
    let res_left = "";
    let res_right = "";
    if (mm === 2 && today.getDate() === 26) {
      res_right = `<div class="show_right_tet"><img src="/local/images/lich-block-am-duong-viet-nam/thantai_right.png" style="width:100%; height:100%;"></div>`;
      res_left = `<div class="show_left_tet"><img src="/local/images/lich-block-am-duong-viet-nam/thantai_left.png" style="width:100%; height:100%;"></div>`;
    }
    if ((currentLunarDate.month === 12 && currentLunarDate.day >= 23) || (currentLunarDate.month === 1 && currentLunarDate.day <= 3)) {
      const idxLeft = Math.floor(Math.random() * svg_tet_left.length);
      const imgLeft = svg_tet_left[idxLeft];
      if (imgLeft) res_left = `<div class="show_left_tet">${imgLeft}</div>`;
      const idxRight = Math.floor(Math.random() * svg_tet_right.length);
      const imgRight = svg_tet_right[idxRight];
      if (imgRight) res_right = `<div class="show_right_tet">${imgRight}</div>`;
    }
    const weatherInfo = config && config._weatherInfo ? config._weatherInfo : null;
    const showWeatherInfo = !!(weatherInfo && weatherInfo.show);
    if (showWeatherInfo) {
      res_left = buildWeatherInfoHtml(weatherInfo, 'left');
      res_right = buildWeatherInfoHtml(weatherInfo, 'right');
    }
    res += `<td colspan="2" class="td_tet_left${showWeatherInfo ? ' weather-slot weather-slot-left' : ''}">${res_left}</td>`;
    res += `<td colspan="3"><div class="todayduonglich" title="Nhấp xem thêm chi tiết">${today.getDate()}</div></td>`;
    res += `<td colspan="2" class="td_tet_right${showWeatherInfo ? ' weather-slot weather-slot-right' : ''}">${res_right}</td>`;
    res += `</tr>`;

    let noiDungLe = "";
    if (currentLunarDate.day === 1) noiDungLe = `Mùng Một`;
    else if (currentLunarDate.day === 15) noiDungLe = `Ngày Rằm`;

    const d_m = `${today.getDate()}/${mm}`;
    const idxDL = NGAY_LE_DL.indexOf(d_m);
    const infoDL = idxDL !== -1 ? NGAY_LE_DL_STRING[idxDL] : "";

    const d_m_al = `${currentLunarDate.day}/${currentLunarDate.month}`;
    const idxAL = NGAY_LE_AL.indexOf(d_m_al);
    const infoAL = idxAL !== -1 ? NGAY_LE_AL_STRING[idxAL] : "";

    let displayArray = [];
    if (noiDungLe) displayArray.push(noiDungLe);
    if (infoDL) displayArray.push(infoDL);
    if (infoAL) displayArray.push(infoAL);

    if (displayArray.length > 0) {
        res += `<tr><td colspan="7"><div align="center"><div class="thongtin_letet">${displayArray.join(" | ")}</div></div></td></tr>`;
    }

    res += `<tr><td colspan="7"><div align="center"><div class="cadaotucngu" data-cadao-text></div></div></td></tr>`;

    const lunarDayIndex = (currentLunarDate.jd + 1) % 12;
    const lunarMonthIndex = (currentLunarDate.month + 1) % 12;
    const lunarYearIndex = (currentLunarDate.year + 8) % 12;
    const svgNgay = getSvgConGiap(lunarDayIndex);
    const svgThang = getSvgConGiap(lunarMonthIndex);
    const svgNam = getSvgConGiap(lunarYearIndex);

    const dayIndex = (currentLunarDate.jd + 1) % 7;
    let styleColor = "";
    if (dayIndex === 0) styleColor = 'style="color: var(--lc-sunday-color);"'; 
    else if (dayIndex === 6) styleColor = 'style="color: var(--lc-saturday-color);"'; 

    res += `<tr>
      <td colspan="3"><div class="thutrongtuan" ${styleColor}>${TUAN[(currentLunarDate.jd + 1) % 7]}</div></td>
      <td class="svg_td" >
        <div class="svg_circle_divider"><span class="svg-cell" title="Ngày ${CAN[(jd + 9) % 10]} ${CHI[(jd+1)%12]}">${svgNgay}</span></div>
      </td>
      <td colspan="3"><div class="thutrongtuan_EN" ${styleColor}>${TUAN_EN[(currentLunarDate.jd + 1) % 7]}</div></td>
    </tr>`;

    const showthangarray = ["Tháng Giêng","Tháng Hai","Tháng Ba","Tháng Tư","Tháng Năm","Tháng Sáu","Tháng Bảy","Tháng Tám","Tháng Chín","Tháng Mười","Tháng Mười Một","Tháng Chạp"];
    let thangAm = showthangarray[currentLunarDate.month-1] || ("Tháng " + currentLunarDate.month);
    if (currentLunarDate.leap===1) thangAm += " (Nhuận)";
    const ly = getYearInfo(currentLunarDate.year);
    let daysInLunarMonth = 0;
    for (let i = 0; i < ly.length; i++) {
      if (ly[i].month === currentLunarDate.month && ly[i].leap === currentLunarDate.leap) {
          if (i < ly.length - 1) daysInLunarMonth = ly[i+1].jd - ly[i].jd;
          else {
              const lyNext = getYearInfo(currentLunarDate.year + 1);
              if (lyNext && lyNext.length > 0) daysInLunarMonth = lyNext[0].jd - ly[i].jd;
              else daysInLunarMonth = 30; 
          }
          break;
      }
    }
    if (daysInLunarMonth === 29) { thangAm += " (T)"; } else if (daysInLunarMonth === 30) { thangAm += " (Đ)"; }
    res += `<tr><td colspan="7"><div class="thang_am_lich"> ${thangAm}</div></td></tr>`;

    res += `<tr>`;
    res += `<td width="25%" colspan="2">`;
    res += `<div class="ThangNgayGioTiet_before">─⟡ Ngày ⟡─</div><div class="ThangNgayGioTiet_after">${CAN[(jd + 9) % 10]} ${CHI[(jd+1)%12]}</div>`;
    res += `<div class="ThangNgayGioTiet_before">─⟡ Tháng ⟡─</div><div class="ThangNgayGioTiet_after">${getMonthCanChi(currentLunarDate)}</div>`;
    res += `</td>`;

    res += `<td width="50%" colspan="3" >`;
    res += `<div class="ngayamlich" title="Nhấp xem thêm chi tiết">${currentLunarDate.day}</div>`;
    res += `</td>`;

    res += `<td width="25%" colspan="2">`;
    res += `<div class="ThangNgayGioTiet_before">─⟡ Giờ đầu ⟡─</div><div class="ThangNgayGioTiet_after">${getCanHour0(jd)} ${CHI[0]}</div>`;
    res += `<div class="ThangNgayGioTiet_before">─⟡ Tiết ⟡─</div><div class="ThangNgayGioTiet_after">${TIETKHI[getSunLongitude(jd+1, 7.0)]}</div>`;
    res += `</td>`;
    res += `</tr>`;

    res += `<tr><td colspan="7"><div class="thang_am_lich">${getYearCanChi(currentLunarDate.year)}<span class="year-svg-container">${svgNam}</span></div></td></tr>`;
    res += `</table></div>`; 

    let overlayDisplay = (activeLunarTab !== 'none') ? 'flex' : 'none';
    res += `<div id="tab-overlay" class="tab-overlay" style="display: ${overlayDisplay};">`;

    let calShowStyle = activeLunarTab === 'cal' ? 'block' : 'none';
    res += `<div id="tab-content-cal" style="display: ${calShowStyle};">`;
    res += `<table class="grid-month" border="0">`;
    res += printHead(mm, yy); 
    for (let i=0;i<6;i++){
      res += `<tr>`;
      for (let j=0;j<7;j++){
        let k = 7*i + j;
        if (k < emptyCells || k >= emptyCells + currentMonthArr.length){
          res += printEmptyCell();
        } else {
          let solar = k - emptyCells + 1;
          let ld1c = currentMonthArr[k - emptyCells];
          res += printCell(ld1c, solar, mm, yy, today, config);
        }
      }
      res += '</tr>';
    }
    res += `</table></div>`;

    let convShowStyle = activeLunarTab === 'conv' ? 'block' : 'none';
    res += `<div id="tab-content-conv" style="display: ${convShowStyle};"></div>`; 
    
    res += `</div>`; 

    let calActive = activeLunarTab === 'cal' ? 'active' : '';
    let convActive = activeLunarTab === 'conv' ? 'active' : '';

    res += `
      <div class="tab-bar">
        <button id="tab-btn-cal" class="tab-btn ${calActive}">📅 Lịch Tháng</button>
        <button id="tab-btn-conv" class="tab-btn ${convActive}">🔄 Tra Cứu</button>
      </div>
    `;

    return res;
  }

  function getMonth(mm, yy){
    let mm1, yy1;
    if (mm < 12){ mm1 = mm+1; yy1 = yy; } else { mm1 = 1; yy1 = yy+1; }
    let jd1 = jdn(1, mm, yy);
    let jd2 = jdn(1, mm1, yy1);
    let ly1 = getYearInfo(yy);
    let tet1 = ly1[0].jd;
    let result = [];
    if (tet1 <= jd1){
      for (let i=jd1;i<jd2;i++) result.push(findLunarDate(i, ly1));
    } else if (jd1 < tet1 && jd2 < tet1){
      ly1 = getYearInfo(yy - 1);
      for (let i=jd1;i<jd2;i++) result.push(findLunarDate(i, ly1));
    } else if (jd1 < tet1 && tet1 <= jd2){
      let ly2 = getYearInfo(yy - 1);
      for (let i=jd1;i<tet1;i++) result.push(findLunarDate(i, ly2));
      for (let i=tet1;i<jd2;i++) result.push(findLunarDate(i, ly1));
    }
    return result;
  }

  function getMonthCanChi(currentLunarDate){
    const year = currentLunarDate.year;
    const month = currentLunarDate.month;
    return CAN[(year*12 + month + 3) % 10] + " " + CHI[(month+1)%12];
  }

  class LunarCalendarCardEditor extends HTMLElement {
    setConfig(config) {
      this._config = config || {};
      if (this._rendered) {
         this.updateUI();
      }
    }

    set hass(hass) {
      this._hass = hass;
      if (this._rendered) this._updateWeatherEntityList();
    }

    connectedCallback() {
      if (this._rendered) return;
      this._config = this._config || {}; 
      this._rendered = true;

      this.innerHTML = `
        <style>
          .editor-container { padding: 12px 0; font-family: var(--paper-font-body1_-_font-family, sans-serif); }
          .row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
          .row:last-child { margin-bottom: 0; }
          .label { font-weight: 500; color: var(--primary-text-color); font-size: 14px; }
          .input-group { display: flex; align-items: center; gap: 12px; }
          input[type=color] { cursor: pointer; border: 1px solid var(--divider-color, #e0e0e0); border-radius: 6px; padding: 2px; width: 40px; height: 32px; background: transparent; }
          input[type=range] { flex-grow: 1; cursor: pointer; }
          .val-badge { background: var(--primary-color); color: var(--text-primary-color, white); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; min-width: 48px; text-align: center; }
          select.ha-select { background: var(--card-background-color, transparent); color: var(--primary-text-color); border: 1px solid var(--divider-color, #e0e0e0); padding: 6px 8px; border-radius: 6px; font-family: inherit; font-size: 14px; flex-grow: 1; max-width: 200px; cursor: pointer; }
          
          .weather-row { align-items: center; gap: 12px; }
          .weather-row .label { flex: 0 0 150px; min-width: 0 !important; }
          .weather-entity-input { flex: 1 1 auto; width: 100%; min-width: 0; max-width: 280px; box-sizing: border-box; background: var(--card-background-color, transparent); color: var(--primary-text-color); border: 1px solid var(--divider-color, #e0e0e0); border-radius: 6px; padding: 8px 10px; font-family: inherit; font-size: 14px; outline: none; }
          .weather-entity-input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 1px var(--primary-color); }
          .weather-note { font-size: 12px; color: var(--secondary-text-color); line-height: 1.45; margin: 4px 0 14px 0; }
          .weather-row-disabled { opacity: 0.45; pointer-events: none; }
          
          /* CSS CHO TÍNH NĂNG ẨN/HIỆN KHỐI */
          .section { border: 1px solid var(--divider-color, #e0e0e0); border-radius: 12px; padding: 16px; margin-bottom: 16px; background: var(--card-background-color, transparent); box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: padding 0.3s ease; }
          .section.collapsed { padding-bottom: 16px; }
          .section-title { font-weight: 600; display: flex; align-items: center; justify-content: space-between; font-size: 16px; color: var(--primary-text-color); border-bottom: 1px solid var(--divider-color, #e0e0e0); padding-bottom: 8px; margin-bottom: 16px; cursor: pointer; user-select: none; }
          .section-title:hover { opacity: 0.8; }
          .section.collapsed .section-title { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
          .section-content { display: block; overflow: hidden; animation: slideDown 0.3s ease-out forwards; }
          .section.collapsed .section-content { display: none; }
          .section-icon { font-size: 12px; opacity: 0.6; transition: transform 0.3s ease; }
          .section.collapsed .section-icon { transform: rotate(-90deg); }
          .title-left { display: flex; align-items: center; gap: 8px; pointer-events: none; }
          .title-right { display: flex; align-items: center; gap: 12px; }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        </style>

        <div class="editor-container">
          
          <div class="section">
            <div class="section-title">
              <div class="title-left">🎨 Nền (Background)</div>
              <div class="title-right"><span class="section-icon">▼</span></div>
            </div>
            <div class="section-content">
              <div class="row">
                <span class="label" style="min-width: 120px;">Loại nền</span>
                <select id="bg_type" class="ha-select">
                  <option value="solid">Màu đơn sắc (Solid)</option>
                  <option value="gradient">Màu dải (Gradient)</option>
                </select>
              </div>

              <div class="row">
                <span class="label" style="min-width: 120px;">Độ trong suốt (%)</span>
                <input type="range" id="bg_opacity" min="0" max="100">
                <span class="val-badge" id="bg_opacity_val"></span>
              </div>

              <div id="solid_settings">
                <div class="row" style="margin-top: 16px; border-top: 1px dashed var(--divider-color, #e0e0e0); padding-top: 16px;">
                  <span class="label">Màu nền</span>
                  <div class="input-group">
                    <input type="color" id="bg_color">
                    <span class="val-badge" id="bg_color_val"></span>
                  </div>
                </div>
              </div>

              <div id="gradient_settings" style="display:none;">
                <div class="row" style="margin-top: 16px; border-top: 1px dashed var(--divider-color, #e0e0e0); padding-top: 16px;">
                  <span class="label" style="min-width: 120px;">Mẫu Gradient</span>
                  <select id="bg_gradient_preset" class="ha-select">
                    <option value="linear-gradient(135deg, #141e30, #243b55)">🌌 Royal Night (Đêm hoàng gia)</option>
                    <option value="linear-gradient(135deg, #0f2027, #203a43, #2c5364)">🌊 Deep Ocean (Đại dương sâu)</option>
                    <option value="linear-gradient(135deg, #232526, #414345)">🏙️ Midnight City (Thành phố đêm)</option>
                    <option value="linear-gradient(135deg, #1a1a1a, #000000)">⚫ Dark Elegance (Đen thanh lịch)</option>
                    <option value="linear-gradient(135deg, #ff0099, #493240)">🔮 Cosmic Fusion (Vũ trụ)</option>
                    <option value="linear-gradient(135deg, #ff512f, #dd2476)">🌅 Sunset Vibes (Hoàng hôn)</option>
                    <option value="linear-gradient(135deg, #134e5e, #71b280)">🌲 Forest Mist (Sương rừng)</option>
                    <option value="linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))">🪟 Glassmorphism (Kính mờ)</option>
                    <option value="linear-gradient(135deg, #0f0c29, #302b63, #24243e)">🚀 Deep Space (Không gian rực rỡ)</option>
                    <option value="linear-gradient(135deg, #667eea, #764ba2)">💜 Plum Plate (Tím khói)</option>
                    <option value="linear-gradient(135deg, #ff9a9e, #fecfef)">🌸 Cherry Blossom (Hoa anh đào)</option>
                    <option value="linear-gradient(135deg, #f12711, #f5af19)">🔥 Fire Glow (Rực lửa)</option>
                    <option value="linear-gradient(135deg, #11998e, #38ef7d)">🌿 Neon Life (Sức sống Neon)</option>
                    <option value="linear-gradient(135deg, #00c6ff, #0072ff)">❄️ Winter Sky (Bầu trời mùa đông)</option>
                    <option value="linear-gradient(135deg, #f6d365, #fda085)">🍑 Sunrise Peach (Bình minh quả đào)</option>
                    <option value="linear-gradient(135deg, #9D50BB, #6E48AA)">💎 Amethyst (Đá thạch anh tím)</option>
                    <option value="linear-gradient(135deg, #2b5876, #4e4376)">🌠 Starry Night (Đêm đầy sao)</option>
                    <option value="linear-gradient(135deg, #ff758c, #ff7eb3)">🍉 Sweet Pink (Hồng ngọt ngào)</option>
                    <option value="linear-gradient(135deg, #4facfe, #00f2fe)">🏝️ Tropical Blue (Xanh nhiệt đới)</option>
                    <option value="linear-gradient(135deg, #870000, #190a05)">🍷 Blood Moon (Trăng máu)</option>
                    <option value="custom">✍️ Tùy chỉnh (Custom)</option>
                  </select>
                </div>

                <div id="custom_gradient_row" style="display:none; flex-direction: column; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--divider-color, #e0e0e0);">
                  <div class="row" style="width: 100%;">
                    <span class="label">Màu 1</span>
                    <div class="input-group">
                      <input type="color" id="bg_gradient_color1">
                      <span class="val-badge" id="bg_gradient_color1_val"></span>
                    </div>
                  </div>
                  <div class="row" style="width: 100%;">
                    <span class="label">Màu 2</span>
                    <div class="input-group">
                      <input type="color" id="bg_gradient_color2">
                      <span class="val-badge" id="bg_gradient_color2_val"></span>
                    </div>
                  </div>
                  <div class="row" style="width: 100%;">
                    <span class="label" style="min-width: 120px;">Góc độ (°)</span>
                    <input type="range" id="bg_gradient_angle" min="0" max="360" step="1">
                    <span class="val-badge" id="bg_gradient_angle_val"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">
              <div class="title-left">🪟 Giao diện Popup Chi tiết</div>
              <div class="title-right"><span class="section-icon">▼</span></div>
            </div>
            <div class="section-content">
              <div class="row">
                <span class="label" style="min-width: 120px;">Màu Popup</span>
                <select id="popup_theme" class="ha-select">
                  <option value="default">Mặc định (Đen mờ)</option>
                  <option value="theme1">1. Đen tuyền / Trắng</option>
                  <option value="theme2">2. Trắng ngà / Xanh đen</option>
                  <option value="theme3">3. Xanh Navy / Trắng ngọc</option>
                  <option value="theme4">4. Đỏ rượu / Vàng Gold</option>
                  <option value="theme5">5. Xanh Rêu / Kem sáng</option>
                  <option value="theme6">6. Nâu gỗ / Trắng sữa</option>
                  <option value="theme7">7. Tím khói / Trắng</option>
                  <option value="theme8">8. Vàng cát / Nâu cháy</option>
                  <option value="theme9">9. Xám xi măng / Đen</option>
                  <option value="theme10">10. Xanh Cyan / Cyan nhạt</option>
                </select>
              </div>
              <div class="row">
                <span class="label" style="min-width: 120px;">Độ trong suốt (%)</span>
                <input type="range" id="popup_opacity" min="0" max="100" step="1">
                <span class="val-badge" id="popup_opacity_val"></span>
              </div>
            </div>
          </div>

          <div class="section collapsed">
            <div class="section-title">
              <div class="title-left">🖋️ Tùy chỉnh Nội dung & Hiệu ứng</div>
              <div class="title-right">
                <input type="checkbox" id="auto_contrast" style="transform: scale(1.2); cursor: pointer;" title="Tự động tương phản màu chữ theo Nền">
                <span class="section-icon">▼</span>
              </div>
            </div>
            <div class="section-content">
              <div id="custom_colors_settings">
                <div class="row">
                  <span class="label">Màu chữ chính</span>
                  <div class="input-group">
                    <input type="color" id="text_main_color">
                    <span class="val-badge" id="text_main_color_val"></span>
                  </div>
                </div>
                <div class="row">
                  <span class="label">Màu chữ phụ (Highlight)</span>
                  <div class="input-group">
                    <input type="color" id="text_accent_color">
                    <span class="val-badge" id="text_accent_color_val"></span>
                  </div>
                </div>

                <div class="row" style="margin-top: 16px; border-top: 1px dashed var(--divider-color, #e0e0e0); padding-top: 16px;">
                  <span class="label">Màu nền các khối</span>
                  <div class="input-group">
                    <input type="color" id="element_bg_color">
                    <span class="val-badge" id="element_bg_color_val"></span>
                  </div>
                </div>
                <div class="row">
                  <span class="label" style="min-width: 120px;">Độ trong suốt khối</span>
                  <input type="range" id="element_bg_opacity" min="0" max="100">
                  <span class="val-badge" id="element_bg_opacity_val"></span>
                </div>

                <div class="row" style="margin-top: 16px; border-top: 1px dashed var(--divider-color, #e0e0e0); padding-top: 16px;">
                  <span class="label">Màu Thứ 7 (T7)</span>
                  <div class="input-group">
                    <input type="color" id="saturday_color">
                    <span class="val-badge" id="saturday_color_val"></span>
                  </div>
                </div>
                <div class="row">
                  <span class="label">Màu Chủ Nhật (CN)</span>
                  <div class="input-group">
                    <input type="color" id="sunday_color">
                    <span class="val-badge" id="sunday_color_val"></span>
                  </div>
                </div>
                <div class="row">
                  <span class="label">Màu Thông báo Lễ/Tết</span>
                  <div class="input-group">
                    <input type="color" id="holiday_color">
                    <span class="val-badge" id="holiday_color_val"></span>
                  </div>
                </div>
                <div class="row">
                  <span class="label">Màu Ca dao tục ngữ</span>
                  <div class="input-group">
                    <input type="color" id="cadao_color">
                    <span class="val-badge" id="cadao_color_val"></span>
                  </div>
                </div>
              </div> 
              <div class="row" style="margin-top: 16px; border-top: 1px dashed var(--divider-color, #e0e0e0); padding-top: 16px;">
                <span class="label" style="min-width: 120px;">Hiệu ứng Hover Emoji</span>
                <select id="hover_effect" class="ha-select">
                  <option value="none">Không có</option>
                  <option value="neon">1. Neon Glow (Phát sáng)</option>
                  <option value="glass">2. 3D Glass (Kính nổi khối)</option>
                  <option value="aura">3. Sunny Aura (Hào quang)</option>
                  <option value="cyber">4. Cyberpunk (Viền sáng)</option>
                  <option value="spin">5. Spin & Glow (Xoay)</option>
                  <option value="pulse">6. Heartbeat (Nhịp đập)</option>
                  <option value="float">7. Floating (Trôi nổi)</option>
                  <option value="ring">8. Double Ring (Vòng tròn kép)</option>
                  <option value="morph">9. Shape Morph (Biến dạng)</option>
                  <option value="flash">10. Flash Shine (Chớp lóe)</option>
                </select>
              </div>

              <button id="reset_colors_btn" style="width: 100%; margin-top: 16px; padding: 8px; border-radius: 6px; border: 1px solid var(--primary-color); background: transparent; color: var(--primary-text-color); cursor: pointer; font-weight: bold; transition: background 0.2s;">
                🔄 Đặt lại màu mặc định
              </button>
            </div>
          </div>
          
          <div class="section collapsed">
            <div class="section-title">
              <div class="title-left">🔲 Viền (Border)</div>
              <div class="title-right"><span class="section-icon">▼</span></div>
            </div>
            <div class="section-content">
              <div class="row">
                <span class="label">Màu viền</span>
                <div class="input-group">
                  <input type="color" id="border_color">
                  <span class="val-badge" id="border_color_val"></span>
                </div>
              </div>
              <div class="row">
                <span class="label" style="min-width: 120px;">Độ dày viền (px)</span>
                <input type="range" id="border_width" min="0" max="10" step="1">
                <span class="val-badge" id="border_width_val"></span>
              </div>
              <div class="row">
                <span class="label" style="min-width: 120px;">Độ trong suốt (%)</span>
                <input type="range" id="border_opacity" min="0" max="100">
                <span class="val-badge" id="border_opacity_val"></span>
              </div>
            </div>
          </div>

          <div class="section collapsed">
            <div class="section-title">
              <div class="title-left">🌤️ Thời tiết</div>
              <div class="title-right">
                <input type="checkbox" id="weather_show" style="transform: scale(1.2); cursor: pointer;" title="Bật/Tắt hiển thị thông tin thời tiết">
                <span class="section-icon">▼</span>
              </div>
            </div>
            <div class="section-content">
              <div class="weather-note">Bật tính năng này để hiển thị thời tiết ở hai bên ngày dương lịch. Bạn có thể nhập hoặc chọn entity cho từng thông tin; nếu chọn entity dạng weather ở mục Điều kiện thời tiết thì thẻ sẽ tự lấy thêm nhiệt độ, độ ẩm và tốc độ gió từ attributes khi các sensor tương ứng đang để trống.</div>
              <div id="weather_settings">
                <div class="row weather-row">
                  <span class="label">Nhiệt độ hiện tại</span>
                  <input type="text" id="weather_temperature_entity" class="weather-entity-input" list="weather_entity_list" autocomplete="off" placeholder="sensor.nhiet_do">
                </div>
                <div class="row weather-row">
                  <span class="label">Điều kiện thời tiết</span>
                  <input type="text" id="weather_condition_entity" class="weather-entity-input" list="weather_entity_list" autocomplete="off" placeholder="weather.home hoặc sensor.dieu_kien">
                </div>
                <div class="row weather-row">
                  <span class="label">Nhiệt độ cao nhất</span>
                  <input type="text" id="weather_temp_high_entity" class="weather-entity-input" list="weather_entity_list" autocomplete="off" placeholder="sensor.nhiet_do_cao_nhat">
                </div>
                <div class="row weather-row">
                  <span class="label">Nhiệt độ thấp nhất</span>
                  <input type="text" id="weather_temp_low_entity" class="weather-entity-input" list="weather_entity_list" autocomplete="off" placeholder="sensor.nhiet_do_thap_nhat">
                </div>
                <div class="row weather-row">
                  <span class="label">Độ ẩm</span>
                  <input type="text" id="weather_humidity_entity" class="weather-entity-input" list="weather_entity_list" autocomplete="off" placeholder="sensor.do_am">
                </div>
                <div class="row weather-row">
                  <span class="label">Tốc độ gió</span>
                  <input type="text" id="weather_wind_entity" class="weather-entity-input" list="weather_entity_list" autocomplete="off" placeholder="sensor.toc_do_gio">
                </div>
                <datalist id="weather_entity_list"></datalist>
              </div>
            </div>
          </div>

          <div class="section collapsed">
            <div class="section-title">
              <div class="title-left">☁️ Đổ bóng (Shadow)</div>
              <div class="title-right">
                <input type="checkbox" id="shadow_enable" style="transform: scale(1.2); cursor: pointer;" title="Bật/Tắt hiệu ứng đổ bóng">
                <span class="section-icon">▼</span>
              </div>
            </div>
            <div class="section-content">
              <div id="shadow_settings">
                <div class="row">
                  <span class="label">Màu đổ bóng</span>
                  <div class="input-group">
                    <input type="color" id="shadow_color">
                    <span class="val-badge" id="shadow_color_val"></span>
                  </div>
                </div>
                <div class="row">
                  <span class="label" style="min-width: 120px;">Độ trong suốt (%)</span>
                  <input type="range" id="shadow_opacity" min="0" max="100">
                  <span class="val-badge" id="shadow_opacity_val"></span>
                </div>
                <div class="row">
                  <span class="label" style="min-width: 120px;">Độ nhòe (Blur)</span>
                  <input type="range" id="shadow_blur" min="0" max="100">
                  <span class="val-badge" id="shadow_blur_val"></span>
                </div>
                <div class="row">
                  <span class="label" style="min-width: 120px;">Khoảng cách (X)</span>
                  <input type="range" id="shadow_offset_x" min="-50" max="50">
                  <span class="val-badge" id="shadow_offset_x_val"></span>
                </div>
                <div class="row">
                  <span class="label" style="min-width: 120px;">Khoảng cách (Y)</span>
                  <input type="range" id="shadow_offset_y" min="-50" max="50">
                  <span class="val-badge" id="shadow_offset_y_val"></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      `;

      this.updateUI();
      this.addListeners();
    }

    get _bg_type() { return this._config.bg_type || 'solid'; }
    get _bg_color() { return this._config.bg_color || '#000000'; }
    get _bg_opacity() { return this._config.bg_opacity !== undefined ? this._config.bg_opacity : 50; }
    get _bg_gradient_preset() { return this._config.bg_gradient_preset || 'linear-gradient(135deg, #141e30, #243b55)'; }
    
    get _bg_gradient_color1() { return this._config.bg_gradient_color1 || '#ff0000'; }
    get _bg_gradient_color2() { return this._config.bg_gradient_color2 || '#0000ff'; }
    get _bg_gradient_angle() { return this._config.bg_gradient_angle !== undefined ? this._config.bg_gradient_angle : 135; }
    
    get _auto_contrast() { return this._config.auto_contrast !== undefined ? this._config.auto_contrast : false; }
    get _text_main_color() { return this._config.text_main_color || '#ffffff'; }
    get _text_accent_color() { return this._config.text_accent_color || '#ffff99'; }
    get _element_bg_color() { return this._config.element_bg_color || '#ffffff'; }
    get _element_bg_opacity() { return this._config.element_bg_opacity !== undefined ? this._config.element_bg_opacity : 18; }
    
    get _popup_theme() { return this._config.popup_theme || 'default'; }
    get _popup_opacity() { return this._config.popup_opacity !== undefined ? this._config.popup_opacity : 95; }

    get _saturday_color() { return this._config.saturday_color || '#00e600'; }
    get _sunday_color() { return this._config.sunday_color || '#ff3333'; }
    get _holiday_color() { return this._config.holiday_color || '#ff3333'; }
    get _cadao_color() { return this._config.cadao_color || '#ffff99'; }
    
    get _hover_effect() { return this._config.hover_effect || 'neon'; }

    get _weather_show() { return this._config.weather_show !== undefined ? this._config.weather_show : true; }
    get _weather_temperature_entity() { return this._config.weather_temperature_entity || ''; }
    get _weather_humidity_entity() { return this._config.weather_humidity_entity || ''; }
    get _weather_condition_entity() { return this._config.weather_condition_entity || ''; }
    get _weather_temp_high_entity() { return this._config.weather_temp_high_entity || ''; }
    get _weather_temp_low_entity() { return this._config.weather_temp_low_entity || ''; }
    get _weather_wind_entity() { return this._config.weather_wind_entity || ''; }

    get _border_color() { return this._config.border_color || '#ffffff'; }
    get _border_width() { return this._config.border_width !== undefined ? this._config.border_width : 1; }
    get _border_opacity() { return this._config.border_opacity !== undefined ? this._config.border_opacity : 0; }
    
    get _shadow_enable() { return this._config.shadow_enable || false; }
    get _shadow_color() { return this._config.shadow_color || '#000000'; }
    get _shadow_opacity() { return this._config.shadow_opacity !== undefined ? this._config.shadow_opacity : 50; }
    get _shadow_blur() { return this._config.shadow_blur !== undefined ? this._config.shadow_blur : 16; }
    get _shadow_offset_x() { return this._config.shadow_offset_x !== undefined ? this._config.shadow_offset_x : 0; }
    get _shadow_offset_y() { return this._config.shadow_offset_y !== undefined ? this._config.shadow_offset_y : 4; }

    _updateWeatherEntityList() {
      const entityList = this.querySelector('#weather_entity_list');
      if (!entityList || !this._hass || !this._hass.states) return;
      const weatherDomains = new Set(['weather', 'sensor', 'number', 'input_number']);
      const options = Object.keys(this._hass.states)
        .filter((entityId) => weatherDomains.has(String(entityId).split('.')[0]))
        .sort()
        .map((entityId) => {
          const stateObj = this._hass.states[entityId];
          const friendly = stateObj && stateObj.attributes && stateObj.attributes.friendly_name ? ` - ${stateObj.attributes.friendly_name}` : '';
          return `<option value="${escapeHtmlAttr(entityId)}">${escapeHtmlAttr(entityId + friendly)}</option>`;
        })
        .join('');
      entityList.innerHTML = options;
    }

    _getEntityInputValue(id) {
      const input = this.querySelector('#' + id);
      return input ? input.value.trim() : '';
    }

    updateUI() {
      if (!this.querySelector('#bg_color')) return;

      this.querySelector('#bg_type').value = this._bg_type;
      this.querySelector('#bg_opacity').value = this._bg_opacity;
      this.querySelector('#bg_opacity_val').textContent = this._bg_opacity + '%';

      if (this._bg_type === 'gradient') {
        this.querySelector('#solid_settings').style.display = 'none';
        this.querySelector('#gradient_settings').style.display = 'block';
      } else {
        this.querySelector('#solid_settings').style.display = 'block';
        this.querySelector('#gradient_settings').style.display = 'none';
      }

      this.querySelector('#bg_color').value = this._bg_color;
      this.querySelector('#bg_color_val').textContent = this._bg_color.toUpperCase();

      this.querySelector('#bg_gradient_preset').value = this._bg_gradient_preset;
      
      if (this._bg_gradient_preset === 'custom') {
        this.querySelector('#custom_gradient_row').style.display = 'flex';
      } else {
        this.querySelector('#custom_gradient_row').style.display = 'none';
      }
      
      this.querySelector('#bg_gradient_color1').value = this._bg_gradient_color1;
      this.querySelector('#bg_gradient_color1_val').textContent = this._bg_gradient_color1.toUpperCase();
      
      this.querySelector('#bg_gradient_color2').value = this._bg_gradient_color2;
      this.querySelector('#bg_gradient_color2_val').textContent = this._bg_gradient_color2.toUpperCase();
      
      this.querySelector('#bg_gradient_angle').value = this._bg_gradient_angle;
      this.querySelector('#bg_gradient_angle_val').textContent = this._bg_gradient_angle + '°';

      this.querySelector('#popup_theme').value = this._popup_theme;
      this.querySelector('#popup_opacity').value = this._popup_opacity;
      this.querySelector('#popup_opacity_val').textContent = this._popup_opacity + '%';

      this.querySelector('#auto_contrast').checked = this._auto_contrast;
      this.querySelector('#text_main_color').value = this._text_main_color;
      this.querySelector('#text_main_color_val').textContent = this._text_main_color.toUpperCase();
      this.querySelector('#text_accent_color').value = this._text_accent_color;
      this.querySelector('#text_accent_color_val').textContent = this._text_accent_color.toUpperCase();
      this.querySelector('#element_bg_color').value = this._element_bg_color;
      this.querySelector('#element_bg_color_val').textContent = this._element_bg_color.toUpperCase();
      this.querySelector('#element_bg_opacity').value = this._element_bg_opacity;
      this.querySelector('#element_bg_opacity_val').textContent = this._element_bg_opacity + '%';

      this.querySelector('#saturday_color').value = this._saturday_color;
      this.querySelector('#saturday_color_val').textContent = this._saturday_color.toUpperCase();
      this.querySelector('#sunday_color').value = this._sunday_color;
      this.querySelector('#sunday_color_val').textContent = this._sunday_color.toUpperCase();
      this.querySelector('#holiday_color').value = this._holiday_color;
      this.querySelector('#holiday_color_val').textContent = this._holiday_color.toUpperCase();
      this.querySelector('#cadao_color').value = this._cadao_color;
      this.querySelector('#cadao_color_val').textContent = this._cadao_color.toUpperCase();

      this.querySelector('#hover_effect').value = this._hover_effect;

      if (this._auto_contrast) {
          this.querySelector('#custom_colors_settings').style.opacity = '0.4';
          this.querySelector('#custom_colors_settings').style.pointerEvents = 'none';
      } else {
          this.querySelector('#custom_colors_settings').style.opacity = '1';
          this.querySelector('#custom_colors_settings').style.pointerEvents = 'auto';
      }

      this.querySelector('#border_color').value = this._border_color;
      this.querySelector('#border_color_val').textContent = this._border_color.toUpperCase();
      this.querySelector('#border_width').value = this._border_width;
      this.querySelector('#border_width_val').textContent = this._border_width + 'px';
      this.querySelector('#border_opacity').value = this._border_opacity;
      this.querySelector('#border_opacity_val').textContent = this._border_opacity + '%';

      this.querySelector('#shadow_enable').checked = this._shadow_enable;
      this.querySelector('#shadow_settings').style.display = this._shadow_enable ? 'block' : 'none';
      
      this.querySelector('#shadow_color').value = this._shadow_color;
      this.querySelector('#shadow_color_val').textContent = this._shadow_color.toUpperCase();
      this.querySelector('#shadow_opacity').value = this._shadow_opacity;
      this.querySelector('#shadow_opacity_val').textContent = this._shadow_opacity + '%';
      
      this.querySelector('#shadow_blur').value = this._shadow_blur;
      this.querySelector('#shadow_blur_val').textContent = this._shadow_blur + 'px';
      
      this.querySelector('#shadow_offset_x').value = this._shadow_offset_x;
      this.querySelector('#shadow_offset_x_val').textContent = this._shadow_offset_x + 'px';
      
      this.querySelector('#shadow_offset_y').value = this._shadow_offset_y;
      this.querySelector('#shadow_offset_y_val').textContent = this._shadow_offset_y + 'px';

      this._updateWeatherEntityList();
      this.querySelector('#weather_show').checked = this._weather_show;
      const weatherSettings = this.querySelector('#weather_settings');
      if (weatherSettings) weatherSettings.classList.toggle('weather-row-disabled', !this._weather_show);
      this.querySelector('#weather_temperature_entity').value = this._weather_temperature_entity;
      this.querySelector('#weather_condition_entity').value = this._weather_condition_entity;
      this.querySelector('#weather_temp_high_entity').value = this._weather_temp_high_entity;
      this.querySelector('#weather_temp_low_entity').value = this._weather_temp_low_entity;
      this.querySelector('#weather_humidity_entity').value = this._weather_humidity_entity;
      this.querySelector('#weather_wind_entity').value = this._weather_wind_entity;
    }

    addListeners() {
      const dispatchUpdate = () => {
        const newConfig = { 
            ...this._config, 
            bg_type: this.querySelector('#bg_type').value,
            bg_color: this.querySelector('#bg_color').value,
            bg_opacity: parseInt(this.querySelector('#bg_opacity').value, 10),
            bg_gradient_preset: this.querySelector('#bg_gradient_preset').value,
            bg_gradient_color1: this.querySelector('#bg_gradient_color1').value,
            bg_gradient_color2: this.querySelector('#bg_gradient_color2').value,
            bg_gradient_angle: parseInt(this.querySelector('#bg_gradient_angle').value, 10),

            popup_theme: this.querySelector('#popup_theme').value,
            popup_opacity: parseInt(this.querySelector('#popup_opacity').value, 10),

            auto_contrast: this.querySelector('#auto_contrast').checked,
            text_main_color: this.querySelector('#text_main_color').value,
            text_accent_color: this.querySelector('#text_accent_color').value,
            element_bg_color: this.querySelector('#element_bg_color').value,
            element_bg_opacity: parseInt(this.querySelector('#element_bg_opacity').value, 10),
            
            saturday_color: this.querySelector('#saturday_color').value,
            sunday_color: this.querySelector('#sunday_color').value,
            holiday_color: this.querySelector('#holiday_color').value,
            cadao_color: this.querySelector('#cadao_color').value,

            hover_effect: this.querySelector('#hover_effect').value,

            border_color: this.querySelector('#border_color').value,
            border_width: parseInt(this.querySelector('#border_width').value, 10),
            border_opacity: parseInt(this.querySelector('#border_opacity').value, 10),
            shadow_enable: this.querySelector('#shadow_enable').checked,
            shadow_color: this.querySelector('#shadow_color').value,
            shadow_opacity: parseInt(this.querySelector('#shadow_opacity').value, 10),
            shadow_blur: parseInt(this.querySelector('#shadow_blur').value, 10),
            shadow_offset_x: parseInt(this.querySelector('#shadow_offset_x').value, 10),
            shadow_offset_y: parseInt(this.querySelector('#shadow_offset_y').value, 10),

            weather_show: this.querySelector('#weather_show').checked,
            weather_temperature_entity: this._getEntityInputValue('weather_temperature_entity'),
            weather_humidity_entity: this._getEntityInputValue('weather_humidity_entity'),
            weather_condition_entity: this._getEntityInputValue('weather_condition_entity'),
            weather_temp_high_entity: this._getEntityInputValue('weather_temp_high_entity'),
            weather_temp_low_entity: this._getEntityInputValue('weather_temp_low_entity'),
            weather_wind_entity: this._getEntityInputValue('weather_wind_entity')
        };
        
        if (newConfig.background_color !== undefined) delete newConfig.background_color;
        if (newConfig.background !== undefined) delete newConfig.background;
        if (newConfig.bg_gradient_custom !== undefined) delete newConfig.bg_gradient_custom; 

        const event = new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
        this.updateUI();
      };

      this.querySelectorAll('input, select').forEach(el => {
        if (el.id === 'reset_colors_btn') return; 
        el.addEventListener('input', dispatchUpdate);
        el.addEventListener('change', dispatchUpdate); 
      });

      this.querySelector('#reset_colors_btn').addEventListener('click', (e) => {
        e.preventDefault();
        const newConfig = { ...this._config };
        delete newConfig.auto_contrast;
        delete newConfig.text_main_color;
        delete newConfig.text_accent_color;
        delete newConfig.element_bg_color;
        delete newConfig.element_bg_opacity;
        delete newConfig.saturday_color;
        delete newConfig.sunday_color;
        delete newConfig.holiday_color;
        delete newConfig.cadao_color;
        delete newConfig.hover_effect;
        delete newConfig.popup_theme;
        delete newConfig.popup_opacity;
        
        const event = new CustomEvent("config-changed", {
          detail: { config: newConfig },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
        this.updateUI();
      });

      this.querySelectorAll('.section-title').forEach(titleEl => {
        const inputs = titleEl.querySelectorAll('input, select, button');
        inputs.forEach(input => {
          input.addEventListener('click', (e) => e.stopPropagation());
        });

        titleEl.addEventListener('click', () => {
          const section = titleEl.closest('.section');
          section.classList.toggle('collapsed');
        });
      });
    }
  }

  // ====== Home Assistant Card ======
  class LunarCalendarCard extends HTMLElement{
    static getConfigElement() { return document.createElement('lich-block-am-duong-viet-nam-editor'); }
    static getStubConfig() { 
      return { bg_type: 'solid', bg_color: '#000000', bg_opacity: 0, border_width: 1, border_opacity: 0, shadow_enable: false, weather_show: true }; 
    }

		constructor(){
			super();
			const today = new Date();
			this.displayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			this.displayMonth = this.displayDate.getMonth() + 1;
			this.displayYear = this.displayDate.getFullYear();
			this._userNavigatedDate = false;
			this._viewingSwipeDate = false;
			this._ignoreNextSwipeClickUntil = 0;
			this._activeLunarTab = 'none';
			this._isPageVisible = !document.hidden;
			this._isIntersecting = true;
			this._visibilityObserver = null;
			this._visibilityChangeHandler = null;
		}

    _parseConfigDateValue(value) {
      if (value instanceof Date && !isNaN(value.getTime())) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
      }
      if (value === undefined || value === null || value === '') return null;
      const raw = String(value).trim();
      let match = raw.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
      if (match) {
        const yy = Number(match[1]);
        const mm = Number(match[2]);
        const dd = Number(match[3]);
        const date = new Date(yy, mm - 1, dd);
        return (date.getFullYear() === yy && date.getMonth() === mm - 1 && date.getDate() === dd) ? date : null;
      }
      match = raw.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (match) {
        const dd = Number(match[1]);
        const mm = Number(match[2]);
        const yy = Number(match[3]);
        const date = new Date(yy, mm - 1, dd);
        return (date.getFullYear() === yy && date.getMonth() === mm - 1 && date.getDate() === dd) ? date : null;
      }
      return null;
    }

    _resolveInitialDisplayDateFromConfig(config = {}) {
      const candidates = [
        this._wlcPopupDate,
        this.selectedDate,
        this.initialDate,
        this.currentDate,
        this.date,
        config.selected_date,
        config.initial_date,
        config.display_date,
        config.date,
        this.getAttribute && this.getAttribute('data-wlc-popup-date'),
        this.getAttribute && this.getAttribute('data-selected-date'),
        this.displayDate
      ];
      for (const candidate of candidates) {
        const parsed = this._parseConfigDateValue(candidate);
        if (parsed) return parsed;
      }

      const day = Number(config.day ?? this.day ?? this.selectedDay ?? this.displayDay);
      const month = Number(config.month ?? this.month ?? this.selectedMonth ?? this.displayMonth);
      const year = Number(config.year ?? this.year ?? this.selectedYear ?? this.displayYear);
      if (Number.isInteger(day) && Number.isInteger(month) && Number.isInteger(year)) {
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) return date;
      }
      return null;
    }

    _applyInitialDisplayDateFromConfig(config = {}) {
      const initialDate = this._resolveInitialDisplayDateFromConfig(config);
      if (!initialDate) return false;
      return this._setDisplayDate(initialDate, false);
    }

    connectedCallback() {
      if (!this._clickOutsideBound) {
        this._clickOutsideBound = this._handleClickOutside.bind(this);
      }
      if (!this._outsideDateResetBound) {
        this._outsideDateResetBound = this._handleOutsideDateReset.bind(this);
      }
      document.addEventListener('click', this._clickOutsideBound);
      document.addEventListener('pointerdown', this._outsideDateResetBound, true);
      document.addEventListener('touchstart', this._outsideDateResetBound, true);
      if (!this._visibilityChangeHandler) {
        this._visibilityChangeHandler = () => {
          this._isPageVisible = !document.hidden;
          this._applyAnimationVisibility();
        };
        document.addEventListener('visibilitychange', this._visibilityChangeHandler, { passive: true });
      }
      this._isPageVisible = !document.hidden;
      if (!this._visibilityObserver && typeof IntersectionObserver !== 'undefined') {
        this._visibilityObserver = new IntersectionObserver((entries) => {
          this._isIntersecting = entries.some((entry) => entry.isIntersecting);
          this._applyAnimationVisibility();
        }, { rootMargin: '80px' });
        this._visibilityObserver.observe(this);
      }
      this._applyAnimationVisibility();
    }

    disconnectedCallback() {
      if (this._clickOutsideBound) {
        document.removeEventListener('click', this._clickOutsideBound);
      }
      if (this._outsideDateResetBound) {
        document.removeEventListener('pointerdown', this._outsideDateResetBound, true);
        document.removeEventListener('touchstart', this._outsideDateResetBound, true);
      }
      if (this._visibilityChangeHandler) {
        document.removeEventListener('visibilitychange', this._visibilityChangeHandler);
        this._visibilityChangeHandler = null;
      }
      if (this._visibilityObserver) {
        this._visibilityObserver.disconnect();
        this._visibilityObserver = null;
      }
    }

    _applyAnimationVisibility() {
      const active = this.isConnected && this._isPageVisible && this._isIntersecting;
      this.toggleAttribute('data-paused', !active);
    }

    _handleClickOutside(e) {
      if (this._activeLunarTab !== 'none') {
        const path = (e && typeof e.composedPath === 'function') ? e.composedPath() : [];
        if (!path.includes(this)) {
          const closingCalendarTab = this._activeLunarTab === 'cal';
          this._closeActiveLunarTab({ resetCalendarToToday: closingCalendarTab });
        }
      }
    }

    _closeActiveLunarTab(options = {}) {
      const resetCalendarToToday = !!options.resetCalendarToToday;
      this._activeLunarTab = 'none';

      if (resetCalendarToToday) {
        const today = new Date();
        this._userNavigatedDate = false;
        this._viewingSwipeDate = false;
        if (!this._isSameSolarDay(this.displayDate, today)) {
          if (this._setDisplayDate(today, false)) {
            this._render();
            return true;
          }
        }
      }

      const overlay = this.card ? this.card.querySelector('#tab-overlay') : null;
      const btnCal = this.card ? this.card.querySelector('#tab-btn-cal') : null;
      const btnConv = this.card ? this.card.querySelector('#tab-btn-conv') : null;
      const contentCal = this.card ? this.card.querySelector('#tab-content-cal') : null;
      const contentConv = this.card ? this.card.querySelector('#tab-content-conv') : null;
      if (overlay) overlay.style.display = 'none';
      if (contentCal) contentCal.style.display = 'none';
      if (contentConv) contentConv.style.display = 'none';
      if (btnCal) btnCal.classList.remove('active');
      if (btnConv) btnConv.classList.remove('active');
      return false;
    }

    _handleOutsideDateReset(e) {
      // Tren thiet bi cam ung khong co su kien mouseleave như desktop.
      // Neu dang xem ngay do vuot trai/phai, cham ra ngoai card se quay ve hom nay.
      if (!this._viewingSwipeDate) return;
      const path = (e && typeof e.composedPath === 'function') ? e.composedPath() : [];
      const isInsideCard = path.includes(this) || (this.card && path.includes(this.card)) || (this.shadowRoot && path.includes(this.shadowRoot));
      if (isInsideCard) return;
      this._resetDisplayDateToToday();
    }

    _normalizeDisplayDate(date) {
      const base = (date instanceof Date && !isNaN(date.getTime())) ? date : new Date();
      return new Date(base.getFullYear(), base.getMonth(), base.getDate());
    }

    _setDisplayDate(date, markUserNavigation = true) {
      const nextDate = this._normalizeDisplayDate(date);
      const year = nextDate.getFullYear();
      if (year < 1800 || year > 2199) return false;
      this.displayDate = nextDate;
      this.displayMonth = nextDate.getMonth() + 1;
      this.displayYear = nextDate.getFullYear();
      if (markUserNavigation) this._userNavigatedDate = true;
      return true;
    }

    _setDisplayMonthYear(month, year, markUserNavigation = true) {
      const base = this.displayDate || new Date();
      const safeDay = Math.min(base.getDate(), new Date(year, month, 0).getDate());
      return this._setDisplayDate(new Date(year, month - 1, safeDay), markUserNavigation);
    }

    _isSameSolarDay(a, b) {
      const da = this._normalizeDisplayDate(a);
      const db = this._normalizeDisplayDate(b);
      return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
    }

    _resetDisplayDateToToday() {
      const today = new Date();
      if (this._isSameSolarDay(this.displayDate, today)) return false;
      this._userNavigatedDate = false;
      this._viewingSwipeDate = false;
      if (this._setDisplayDate(today, false)) {
        this._render();
        return true;
      }
      return false;
    }

    _shiftDisplayDate(days, fromSwipe = false) {
      const base = this.displayDate || new Date();
      const nextDate = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
      if (this._setDisplayDate(nextDate, true)) {
        this._viewingSwipeDate = !!fromSwipe;
        this._render();
      }
    }

    _ensureCard() {
      if (!this.shadowRoot) this.attachShadow({mode:'open'});
      if (!this.card) {
        this.card = document.createElement('ha-card');
        this.shadowRoot.appendChild(this.card);
      }
      return this.card;
    }

    _bindSwipeNavigation() {
      const root = this.card ? this.card.querySelector('.lunar-card') : null;
      if (!root) return;

      let startX = 0;
      let startY = 0;
      let lastX = 0;
      let lastY = 0;
      let startTime = 0;
      let activePointerId = null;
      let hasMovedEnough = false;
      const minSwipeDistance = 55;

      const ignoreSwipeTarget = (target) => {
        return !!(target && target.closest && target.closest('.tab-overlay, button, input, select, textarea, a'));
      };

      const beginSwipe = (clientX, clientY, pointerId = null) => {
        startX = clientX;
        startY = clientY;
        lastX = clientX;
        lastY = clientY;
        startTime = Date.now();
        activePointerId = pointerId;
        hasMovedEnough = false;
      };

      const moveSwipe = (clientX, clientY) => {
        if (!startTime) return;
        lastX = clientX;
        lastY = clientY;
        const dx = lastX - startX;
        const dy = lastY - startY;
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.1) {
          hasMovedEnough = true;
        }
      };

      const finishSwipe = (clientX = lastX, clientY = lastY) => {
        if (!startTime) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const dt = Date.now() - startTime;
        startTime = 0;
        activePointerId = null;

        if (dt > 1200 || Math.abs(dx) < minSwipeDistance || Math.abs(dx) < Math.abs(dy) * 1.25) return;

        // Chặn click/popup phát sinh ngay sau thao tác kéo-vuốt.
        this._ignoreNextSwipeClickUntil = Date.now() + 450;

        // Kéo/vuốt trái: sang ngày sau. Kéo/vuốt phải: lùi về ngày trước.
        this._shiftDisplayDate(dx < 0 ? 1 : -1, true);
      };

      root.addEventListener('click', (ev) => {
        if (this._ignoreNextSwipeClickUntil && Date.now() < this._ignoreNextSwipeClickUntil) {
          ev.preventDefault();
          ev.stopPropagation();
          if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        }
      }, true);

      const resetAfterMouseLeavesCard = (ev) => {
        // Chi reset khi ngay dang xem duoc doi bang thao tac vuot chuot;
        // khong anh huong cac nut thang/nam hay thao tac cam ung.
        if (!this._viewingSwipeDate) return;
        if (ev && ev.pointerType && ev.pointerType !== 'mouse') return;
        this._resetDisplayDateToToday();
      };

      const pointInsideRoot = (clientX, clientY) => {
        const rect = root.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      };

      if (window.PointerEvent) {
        root.addEventListener('pointerdown', (ev) => {
          if (!ev.isPrimary || ignoreSwipeTarget(ev.target)) return;
          if (ev.pointerType === 'mouse' && ev.button !== 0) return;
          beginSwipe(ev.clientX, ev.clientY, ev.pointerId);
        }, { passive: true });

        root.addEventListener('pointermove', (ev) => {
          if (activePointerId !== ev.pointerId) return;
          moveSwipe(ev.clientX, ev.clientY);
          if (hasMovedEnough && ev.cancelable) ev.preventDefault();
        }, { passive: false });

        root.addEventListener('pointerup', (ev) => {
          if (activePointerId !== ev.pointerId) return;
          const endedInsideCard = pointInsideRoot(ev.clientX, ev.clientY);
          finishSwipe(ev.clientX, ev.clientY);
          if (ev.pointerType === 'mouse' && !endedInsideCard) resetAfterMouseLeavesCard(ev);
        }, { passive: true });

        root.addEventListener('pointercancel', () => {
          startTime = 0;
          activePointerId = null;
        }, { passive: true });

        root.addEventListener('pointerleave', resetAfterMouseLeavesCard, { passive: true });

        return;
      }

      // Fallback cho trình duyệt cũ không hỗ trợ Pointer Events.
      root.addEventListener('mousedown', (ev) => {
        if (ev.button !== 0 || ignoreSwipeTarget(ev.target)) return;
        beginSwipe(ev.clientX, ev.clientY, 'mouse');
      }, { passive: true });

      root.addEventListener('mousemove', (ev) => {
        if (activePointerId !== 'mouse') return;
        moveSwipe(ev.clientX, ev.clientY);
        if (hasMovedEnough && ev.cancelable) ev.preventDefault();
      }, { passive: false });

      window.addEventListener('mouseup', (ev) => {
        if (activePointerId !== 'mouse') return;
        const endedInsideCard = pointInsideRoot(ev.clientX, ev.clientY);
        finishSwipe(ev.clientX, ev.clientY);
        if (!endedInsideCard) resetAfterMouseLeavesCard(ev);
      }, { passive: true });

      root.addEventListener('mouseleave', resetAfterMouseLeavesCard, { passive: true });

      root.addEventListener('touchstart', (ev) => {
        if (!ev.touches || ev.touches.length !== 1 || ignoreSwipeTarget(ev.target)) return;
        const touch = ev.touches[0];
        beginSwipe(touch.clientX, touch.clientY, 'touch');
      }, { passive: true });

      root.addEventListener('touchmove', (ev) => {
        if (activePointerId !== 'touch' || !ev.touches || ev.touches.length !== 1) return;
        const touch = ev.touches[0];
        moveSwipe(touch.clientX, touch.clientY);
        if (hasMovedEnough && ev.cancelable) ev.preventDefault();
      }, { passive: false });

      root.addEventListener('touchend', (ev) => {
        if (activePointerId !== 'touch' || !ev.changedTouches || ev.changedTouches.length !== 1) return;
        const touch = ev.changedTouches[0];
        finishSwipe(touch.clientX, touch.clientY);
      }, { passive: true });
    }

    _getWeatherEntity(entityId) {
      if (!entityId || !this._hass || !this._hass.states) return null;
      return this._hass.states[entityId] || null;
    }

    _getWeatherStateValue(entityId) {
      const entity = this._getWeatherEntity(entityId);
      if (!entity || entity.state === undefined || entity.state === null) return undefined;
      const state = String(entity.state);
      if (state === 'unknown' || state === 'unavailable') return undefined;
      return entity.state;
    }

    _buildWeatherInfo() {
      const cfg = this.config || {};
      const weatherEnabled = cfg.weather_show !== undefined ? !!cfg.weather_show : true;
      if (!weatherEnabled) return { show: false };

      const conditionEntity = this._getWeatherEntity(cfg.weather_condition_entity);
      const isWeatherDomain = !!(cfg.weather_condition_entity && String(cfg.weather_condition_entity).split('.')[0] === 'weather');
      const weatherEntity = isWeatherDomain ? conditionEntity : null;

      const conditionRaw = this._getWeatherStateValue(cfg.weather_condition_entity);
      const conditionInfo = getWeatherConditionInfo(conditionRaw);

      const temperatureValue = this._getWeatherStateValue(cfg.weather_temperature_entity)
        ?? getWeatherAttrValue(weatherEntity, ['temperature', 'native_temperature', 'current_temperature']);
      const humidityValue = this._getWeatherStateValue(cfg.weather_humidity_entity)
        ?? getWeatherAttrValue(weatherEntity, ['humidity', 'relative_humidity']);
      const windValue = this._getWeatherStateValue(cfg.weather_wind_entity)
        ?? getWeatherAttrValue(weatherEntity, ['wind_speed', 'wind_speed_value', 'wind']);
      const highValue = this._getWeatherStateValue(cfg.weather_temp_high_entity)
        ?? getWeatherAttrValue(weatherEntity, ['temperature_high', 'high_temperature', 'temperature_max', 'max_temp'])
        ?? getTodayForecastValue(weatherEntity, ['temperature', 'temperature_high', 'high_temperature', 'temp_high']);
      const lowValue = this._getWeatherStateValue(cfg.weather_temp_low_entity)
        ?? getWeatherAttrValue(weatherEntity, ['temperature_low', 'low_temperature', 'temperature_min', 'min_temp'])
        ?? getTodayForecastValue(weatherEntity, ['templow', 'temperature_low', 'low_temperature', 'temp_low']);

      const windUnit = (this._getWeatherEntity(cfg.weather_wind_entity)?.attributes?.unit_of_measurement)
        || getWeatherAttrValue(weatherEntity, ['wind_speed_unit', 'native_wind_speed_unit'])
        || 'km/h';

      const hasAnyData = [conditionRaw, temperatureValue, humidityValue, windValue, highValue, lowValue].some(v => v !== undefined && v !== null && v !== '');
      if (!hasAnyData) return { show: false };

      const humidityComfort = getHumidityComfortInfo(humidityValue, temperatureValue);
      return {
        show: true,
        conditionEmoji: conditionInfo.emoji,
        conditionLabel: conditionInfo.label,
        conditionAnim: conditionInfo.anim || 'cloudy',
        temperatureDisplay: formatWeatherTemp(temperatureValue),
        highDisplay: formatWeatherTemp(highValue),
        lowDisplay: formatWeatherTemp(lowValue),
        humidityDisplay: formatWeatherHumidity(humidityValue),
        humidityEmoji: humidityComfort.emoji,
        humidityAnim: humidityComfort.anim,
        humidityComfortLabel: humidityComfort.label,
        windDisplay: formatWeatherWind(windValue, windUnit)
      };
    }

    _getWeatherSignature(weatherInfo) {
      return JSON.stringify(weatherInfo || { show: false });
    }

    setConfig(config){
      if (config !== undefined && (config === null || typeof config !== 'object' || Array.isArray(config))) {
        throw new Error('Cấu hình của lich-block-am-duong-viet-nam phải là một object YAML hợp lệ.');
      }
      this.config = { weather_show: true, ...(config || {}) };
      this._applyInitialDisplayDateFromConfig(this.config);
      this._ensureCard();
      this.card.style.borderRadius = 'var(--ha-card-border-radius, 16px)';
      
      this._applyTheme(); 
      this._render();
    }

    set hass(hass){
      const oldTheme = this._hass && this._hass.themes ? this._hass.themes.darkMode : null;
      this._hass = hass || {};
      this._ensureCard();
      
      injectPopupDOM();

      const weatherInfo = this._buildWeatherInfo();
      const weatherSignature = this._getWeatherSignature(weatherInfo);
      const weatherChanged = this._lastWeatherSignature !== weatherSignature;
      this._lastWeatherSignature = weatherSignature;
      this._weatherInfo = weatherInfo;

      const newTheme = this._hass.themes && this._hass.themes.darkMode !== undefined ? this._hass.themes.darkMode : null;
      const now = new Date();
      const todayStr = now.toDateString();
      
      if (oldTheme !== newTheme || this._lastDateStr !== todayStr || weatherChanged || !this._renderedHass) {
        if (this._lastDateStr !== todayStr && !this._userNavigatedDate) {
          this._setDisplayDate(now, false);
        }
        this._lastDateStr = todayStr;
        this._renderedHass = true;
        this._applyTheme();
        this._render();
      }
    }

    _applyTheme() {
        if (!this.config) return;

        const hexToRgba = (hex, opacity) => {
            let c;
            if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
                c= hex.substring(1).split('');
                if(c.length === 3) c= [c[0], c[0], c[1], c[1], c[2], c[2]];
                c= '0x'+c.join('');
                return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+(opacity/100)+')';
            }
            return hex; 
        };

        const applyOpacityToGradientStr = (str, opacity) => {
            return str.replace(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/gi, (match) => hexToRgba(match, opacity));
        };

        const oldBg = this.config.background_color || this.config.background;
        const bgType = this.config.bg_type || 'solid';
        const bgOpacity = this.config.bg_opacity !== undefined ? this.config.bg_opacity : 50;

        if (bgType === 'gradient') {
            const preset = this.config.bg_gradient_preset || 'linear-gradient(135deg, #141e30, #243b55)';
            if (preset === 'custom') {
                const color1 = this.config.bg_gradient_color1 || '#ff0000';
                const color2 = this.config.bg_gradient_color2 || '#0000ff';
                const angle = this.config.bg_gradient_angle !== undefined ? this.config.bg_gradient_angle : 135;
                this.card.style.background = `linear-gradient(${angle}deg, ${hexToRgba(color1, bgOpacity)}, ${hexToRgba(color2, bgOpacity)})`;
            } else {
                this.card.style.background = applyOpacityToGradientStr(preset, bgOpacity);
            }
        } else {
            if (this.config.bg_color || this.config.bg_opacity !== undefined) {
                const bgColor = this.config.bg_color || '#000000';
                this.card.style.background = hexToRgba(bgColor, bgOpacity);
            } else if (oldBg) {
                this.card.style.background = oldBg;
            } else {
                this.card.style.background = 'transparent';
            }
        }

        const borderWidth = this.config.border_width !== undefined ? this.config.border_width : 1;
        if (this.config.border_opacity !== undefined && this.config.border_opacity > 0 && borderWidth > 0) {
            const borderColor = this.config.border_color || '#ffffff';
            const borderOpacity = this.config.border_opacity;
            this.card.style.border = `${borderWidth}px solid ${hexToRgba(borderColor, borderOpacity)}`;
        } else {
            this.card.style.border = 'none';
        }

        if (this.config.shadow_enable) {
            const shadowColor = this.config.shadow_color || '#000000';
            const shadowOpacity = this.config.shadow_opacity !== undefined ? this.config.shadow_opacity : 50;
            const blur = this.config.shadow_blur !== undefined ? this.config.shadow_blur : 16;
            const offsetX = this.config.shadow_offset_x !== undefined ? this.config.shadow_offset_x : 0;
            const offsetY = this.config.shadow_offset_y !== undefined ? this.config.shadow_offset_y : 4;
            this.card.style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${hexToRgba(shadowColor, shadowOpacity)}`;
        } else {
            this.card.style.boxShadow = 'none';
        }

        let textMain = this.config.text_main_color || '#ffffff';
        let textAccent = this.config.text_accent_color || '#ffff99';
        let elemBg = this.config.element_bg_color || '#ffffff';
        let elemOpacity = this.config.element_bg_opacity !== undefined ? this.config.element_bg_opacity : 18;
        let elemShadow = '0 2px 8px rgba(0,0,0,0.12), inset 0 0.4px 0 rgba(255,255,255,0.35)';

        let satColor = this.config.saturday_color || '#00e600';
        let sunColor = this.config.sunday_color || '#ff3333';
        let holColor = this.config.holiday_color || '#ff3333';
        let cadaoColor = this.config.cadao_color || '#ffff99';

        let shadowHeavy = '0 6px 10px rgba(0,0,0,0.28)';
        let shadowLight = '0 1px 3px rgba(0,0,0,0.3)';

        // ==========================================
        // THUẬT TOÁN TƯƠNG PHẢN THÔNG MINH BẢN V2
        // TRÁNH TRÙNG LẶP MÀU TEXT VỚI MÀU NỀN
        // ==========================================
        if (this.config.auto_contrast) {
            let strToExtract = "";
            if (bgType === 'solid' && this.config.bg_color) {
                strToExtract = this.config.bg_color;
            } else if (bgType === 'gradient') {
                const preset = this.config.bg_gradient_preset || 'linear-gradient(135deg, #141e30, #243b55)';
                if (preset === 'custom') {
                    strToExtract = (this.config.bg_gradient_color1 || '#ff0000') + " " + (this.config.bg_gradient_color2 || '#0000ff');
                } else strToExtract = preset;
            }

            const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/gi;
            let match;
            let colorsToCheck = [];
            while ((match = hexRegex.exec(strToExtract)) !== null) {
                let hex = match[1];
                if (hex.length === 3) hex = hex.split('').map(x => x+x).join('');
                colorsToCheck.push({ r: parseInt(hex.substring(0,2), 16), g: parseInt(hex.substring(2,4), 16), b: parseInt(hex.substring(4,6), 16) });
            }
            const rgbRegex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi;
            while ((match = rgbRegex.exec(strToExtract)) !== null) {
                colorsToCheck.push({ r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) });
            }

            if (colorsToCheck.length > 0) {
                let avgR = 0, avgG = 0, avgB = 0;
                colorsToCheck.forEach(c => { avgR += c.r; avgG += c.g; avgB += c.b; });
                avgR = Math.round(avgR / colorsToCheck.length);
                avgG = Math.round(avgG / colorsToCheck.length);
                avgB = Math.round(avgB / colorsToCheck.length);

                let isDarkTheme = false; 
                if (this._hass && this._hass.themes && this._hass.themes.darkMode !== undefined) {
                    isDarkTheme = this._hass.themes.darkMode;
                } else {
                    isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                }

                const op = bgOpacity / 100;
                const baseBg = isDarkTheme ? 30 : 245; 
                
                const effR = Math.round(avgR * op + baseBg * (1 - op));
                const effG = Math.round(avgG * op + baseBg * (1 - op));
                const effB = Math.round(avgB * op + baseBg * (1 - op));

                const yiq = ((effR * 299) + (effG * 587) + (effB * 114)) / 1000;
                const isLightBackground = yiq >= 135; 

                let r = effR / 255, g = effG / 255, b = effB / 255;
                let max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;
                if (max == min) { h = s = 0; }
                else {
                    let d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch(max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
                let hue = Math.round(h * 360);

                if (isLightBackground) {
                    textMain = '#1a1a1a';   
                    elemBg = '#000000';     
                    elemOpacity = Math.max(10, op * 20); 
                    elemShadow = '0 2px 4px rgba(0,0,0,0.08), inset 0 0.5px 0 rgba(0,0,0,0.05)';
                    shadowHeavy = '0 2px 4px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.5)';
                    shadowLight = '0 1px 3px rgba(255,255,255,0.8)';

                    if (s < 0.15) { 
                        textAccent = '#1565C0'; cadaoColor = '#E65100'; satColor = '#2E7D32'; sunColor = '#C62828'; holColor = '#C62828';
                    } else if (hue >= 330 || hue < 30) { // Nền Tone Đỏ/Hồng -> Đổi Lễ/CN thành Tím/Xanh thay vì Đỏ
                        textAccent = '#004D40'; cadaoColor = '#0D47A1'; satColor = '#1B5E20'; sunColor = '#311B92'; holColor = '#311B92';
                    } else if (hue >= 30 && hue < 90) { // Nền Cam/Vàng
                        textAccent = '#0D47A1'; cadaoColor = '#4A148C'; satColor = '#006064'; sunColor = '#B71C1C'; holColor = '#B71C1C';
                    } else if (hue >= 90 && hue < 170) { // Nền Xanh lá
                        textAccent = '#4A148C'; cadaoColor = '#B71C1C'; satColor = '#004D40'; sunColor = '#880E4F'; holColor = '#880E4F';
                    } else if (hue >= 170 && hue < 260) { // Nền Xanh biển
                        textAccent = '#C2185B'; cadaoColor = '#E65100'; satColor = '#2E7D32'; sunColor = '#B71C1C'; holColor = '#B71C1C';
                    } else { // Nền Tím
                        textAccent = '#004D40'; cadaoColor = '#E64A19'; satColor = '#33691E'; sunColor = '#D84315'; holColor = '#D84315';
                    }
                } 
                else {
                    textMain = '#ffffff';
                    elemBg = '#ffffff';
                    elemOpacity = Math.max(15, op * 25);
                    elemShadow = '0 2px 8px rgba(0,0,0,0.15), inset 0 0.5px 0 rgba(255,255,255,0.3)';
                    shadowHeavy = '0 3px 6px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.5)';
                    shadowLight = '0 1px 3px rgba(0,0,0,0.6)';

                    if (s < 0.15) { 
                        textAccent = '#29B6F6'; cadaoColor = '#FFCA28'; satColor = '#00E676'; sunColor = '#FF5252'; holColor = '#FF5252';
                    } else if (hue >= 330 || hue < 30) { // Nền Tone Đỏ/Hồng đậm -> Đổi Lễ/CN thành Vàng sáng thay vì Đỏ
                        textAccent = '#00E5FF'; cadaoColor = '#FFEA00'; satColor = '#69F0AE'; sunColor = '#FFD54F'; holColor = '#FFD54F';
                    } else if (hue >= 30 && hue < 90) { // Nền Cam/Vàng sẫm
                        textAccent = '#40C4FF'; cadaoColor = '#69F0AE'; satColor = '#B2FF59'; sunColor = '#FF5252'; holColor = '#FF5252';
                    } else if (hue >= 90 && hue < 170) { // Nền Xanh lá đậm
                        textAccent = '#FF4081'; cadaoColor = '#FF9100'; satColor = '#00E5FF'; sunColor = '#FF5252'; holColor = '#FF5252';
                    } else if (hue >= 170 && hue < 260) { // Nền Xanh biển sẫm
                        textAccent = '#FFAB40'; cadaoColor = '#C6FF00'; satColor = '#69F0AE'; sunColor = '#FF4081'; holColor = '#FF4081';
                    } else { // Nền Tím sẫm
                        textAccent = '#69F0AE'; cadaoColor = '#FFD54F'; satColor = '#B2FF59'; sunColor = '#FF5252'; holColor = '#FF5252';
                    }
                }
            }
        }

        this.style.setProperty('--user-text-main', textMain);
        this.style.setProperty('--user-text-accent', textAccent);
        this.style.setProperty('--user-element-base-color', elemBg);
        this.style.setProperty('--user-bg-overlay', hexToRgba(elemBg, elemOpacity));
        this.style.setProperty('--user-bg-overlay-hover', hexToRgba(elemBg, Math.min(100, elemOpacity + 15)));
        this.style.setProperty('--user-element-shadow', elemShadow);
        this.style.setProperty('--user-saturday-color', satColor);
        this.style.setProperty('--user-sunday-color', sunColor);
        this.style.setProperty('--user-holiday-color', holColor);
        this.style.setProperty('--user-cadao-color', cadaoColor);
        this.style.setProperty('--user-text-shadow-heavy', shadowHeavy);
        this.style.setProperty('--user-text-shadow-light', shadowLight);
    }


    _updateCadaoTucNgu(){
      // Chỉ cập nhật riêng ô ca dao/tục ngữ, không render lại toàn bộ thẻ.
      if (!this.card) return;
      const cadaoEl = this.card.querySelector('[data-cadao-text]');
      if (!cadaoEl) return;

      const displayDate = this._normalizeDisplayDate(this.displayDate || new Date());
      const newContent = getUniqueDailyContent(CA_DAO_TUC_NGU, 'cadao_tracker', displayDate);
      if (cadaoEl.innerHTML !== newContent) {
        cadaoEl.innerHTML = newContent;
      }
    }

    _render(){
      if (!this.displayDate) this._setDisplayDate(new Date(), false);
      const today = this._normalizeDisplayDate(this.displayDate);
      this.displayMonth = today.getMonth() + 1;
      this.displayYear = today.getFullYear();
      const mm = this.displayMonth;
      const yy = this.displayYear;

      const renderConfig = { ...(this.config || {}), _weatherInfo: this._weatherInfo || this._buildWeatherInfo() };
      const html = [ printStyle(), printTable(mm, yy, today, renderConfig, this._activeLunarTab) ].join('');
      const hoverEffect = this.config.hover_effect || 'neon';

      const convHtml = `
      <style>
        .conv-input { background: rgba(0,0,0,0.15) !important; color: var(--lc-text-main) !important; border: 1px solid var(--lc-border-color) !important; outline: none; transition: all 0.2s; text-shadow: var(--lc-text-shadow-light); }
        .conv-input:focus { background: var(--lc-bg-overlay-hover) !important; border-color: var(--lc-text-accent) !important; box-shadow: 0 0 5px var(--lc-text-accent); }
        .conv-input::placeholder { color: var(--lc-text-main); opacity: 0.6; }
        .conv-input option { background: #333; color: #fff; text-shadow: none; }
        #conv-btn:hover { background: var(--lc-bg-overlay-hover) !important; transform: scale(1.01); border-color: var(--lc-text-accent) !important; }
      </style>
      <div style="padding: clamp(5px, 2cqi, 10px); box-sizing: border-box;">
        <h3 style="text-align: center; color: var(--lc-text-accent); margin-top: 0; font-family: 'Be Vietnam Pro', sans-serif; text-shadow: var(--lc-text-shadow-light);">Tra cứu / Quy đổi</h3>
        <select id="conv-type" class="conv-input" style="width: 100%; margin-bottom: clamp(8px, 3cqi, 12px); padding: clamp(6px, 2.5cqi, 10px); border-radius: 6px; cursor: pointer; font-size: clamp(9px, 3.8cqi, 14px); box-sizing: border-box;">
          <option value="solar_to_lunar">☀️ Dương lịch ➡️ 🌙 Âm lịch</option>
          <option value="lunar_to_solar">🌙 Âm lịch ➡️ ☀️ Dương lịch</option>
        </select>
        
        <div style="display: flex; gap: clamp(4px, 2cqi, 8px); margin-bottom: clamp(10px, 4cqi, 15px);">
          <input id="conv-day" class="conv-input" type="number" placeholder="Ngày" min="1" max="31" style="flex: 1; padding: clamp(6px, 2.5cqi, 10px); border-radius: 6px; text-align: center; font-size: clamp(9px, 3.8cqi, 14px); min-width: 0;">
          <input id="conv-month" class="conv-input" type="number" placeholder="Tháng" min="1" max="12" style="flex: 1; padding: clamp(6px, 2.5cqi, 10px); border-radius: 6px; text-align: center; font-size: clamp(9px, 3.8cqi, 14px); min-width: 0;">
          <input id="conv-year" class="conv-input" type="number" placeholder="Năm" min="1800" max="2199" style="flex: 1.2; padding: clamp(6px, 2.5cqi, 10px); border-radius: 6px; text-align: center; font-size: clamp(9px, 3.8cqi, 14px); min-width: 0;">
        </div>

        <button id="conv-btn" style="width: 100%; background: var(--lc-bg-overlay); color: var(--lc-text-accent); text-shadow: var(--lc-text-shadow-light); font-weight: bold; border-radius: 6px; padding: clamp(6px, 2.5cqi, 10px); border: 1px solid var(--lc-border-color); cursor: pointer; font-size: clamp(10px, 4.2cqi, 15px); transition: all 0.2s; box-shadow: var(--lc-element-shadow);">TÍNH TOÁN QUY ĐỔI</button>
        
        <div id="conv-result" style="display: none; margin-top: clamp(10px, 4cqi, 15px); padding: clamp(10px, 4cqi, 15px); background: var(--lc-bg-overlay); border-radius: 8px; border-left: 4px solid var(--lc-text-accent); color: var(--lc-text-main); box-shadow: var(--lc-element-shadow); text-shadow: var(--lc-text-shadow-light); font-size: clamp(9px, 3.8cqi, 15px);"></div>
      </div>`;

      this.card.innerHTML = `<div class="lunar-card" data-hover="${hoverEffect}">${html}</div>`;
      this._updateCadaoTucNgu();
      
      const tabConvElement = this.card.querySelector('#tab-content-conv');
      if (tabConvElement) tabConvElement.innerHTML = convHtml;

      const popupTheme = this.config.popup_theme || 'default';
      const popupOpacity = this.config.popup_opacity !== undefined ? this.config.popup_opacity : 95;
      let mainDayPointerPopupUntil = 0;
      const showMainDayPopup = (ev, source = 'click') => {
          if (source === 'click' && mainDayPointerPopupUntil && Date.now() < mainDayPointerPopupUntil) {
              ev.preventDefault();
              ev.stopPropagation();
              if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
              return;
          }
          if (this._ignoreNextSwipeClickUntil && Date.now() < this._ignoreNextSwipeClickUntil) {
              ev.preventDefault();
              ev.stopPropagation();
              if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
              return;
          }
          const currentDate = this._normalizeDisplayDate(this.displayDate || new Date());
          ev.preventDefault();
          ev.stopPropagation();
          if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
          showDayPopup(
              currentDate.getDate(),
              currentDate.getMonth() + 1,
              currentDate.getFullYear(),
              popupTheme,
              popupOpacity
          );
      };
      this.card.querySelectorAll('.todayduonglich, .ngayamlich').forEach((el) => {
          el.removeAttribute('onclick');
          el.addEventListener('click', (ev) => showMainDayPopup(ev, 'click'));
          el.addEventListener('pointerup', (ev) => {
              // Desktop fallback: mở popup ngay khi nhả chuột, nhưng không mở nếu vừa kéo/vuốt.
              if (ev.pointerType === 'mouse') {
                  mainDayPointerPopupUntil = Date.now() + 350;
                  showMainDayPopup(ev, 'pointer');
              }
          });
      });

      this.card.querySelectorAll('.lunar-day-cell').forEach((el) => {
          el.removeAttribute('onclick');
          el.addEventListener('click', (ev) => {
              if (this._ignoreNextSwipeClickUntil && Date.now() < this._ignoreNextSwipeClickUntil) {
                  ev.preventDefault();
                  ev.stopPropagation();
                  if (ev.stopImmediatePropagation) ev.stopImmediatePropagation();
                  return;
              }
              ev.preventDefault();
              ev.stopPropagation();
              const day = parseInt(el.dataset.solarDate, 10);
              const month = parseInt(el.dataset.solarMonth, 10);
              const year = parseInt(el.dataset.solarYear, 10);
              const opacity = parseInt(el.dataset.popupOpacity, 10);
              showDayPopup(day, month, year, el.dataset.popupTheme || 'default', Number.isFinite(opacity) ? opacity : 95);
          });
      });

      const btnCal = this.card.querySelector('#tab-btn-cal');
      const btnConv = this.card.querySelector('#tab-btn-conv');
      const contentCal = this.card.querySelector('#tab-content-cal');
      const contentConv = this.card.querySelector('#tab-content-conv');
      const overlay = this.card.querySelector('#tab-overlay');

      const toggleTab = (tabName) => {
          const currentTab = this._activeLunarTab;
          if (currentTab === tabName) {
              this._closeActiveLunarTab({ resetCalendarToToday: tabName === 'cal' });
              return;
          }

          const leavingCalendarTab = currentTab === 'cal' && tabName !== 'cal';
          this._activeLunarTab = tabName;

          if (leavingCalendarTab) {
              const today = new Date();
              this._userNavigatedDate = false;
              this._viewingSwipeDate = false;
              if (!this._isSameSolarDay(this.displayDate, today)) {
                  if (this._setDisplayDate(today, false)) {
                      this._render();
                      return;
                  }
              }
          }

          overlay.style.display = 'flex'; 
          
          if (tabName === 'cal') {
              contentCal.style.display = 'block'; 
              contentConv.style.display = 'none';
              btnCal.classList.add('active');
              btnConv.classList.remove('active');
          } else {
              contentConv.style.display = 'block';
              contentCal.style.display = 'none';
              btnConv.classList.add('active');
              btnCal.classList.remove('active');
          }
      };

      if (btnCal) btnCal.addEventListener('click', () => toggleTab('cal'));
      if (btnConv) btnConv.addEventListener('click', () => toggleTab('conv'));

      const gotoBtn = this.card.querySelector('#goto-btn');
      if (gotoBtn) {
          gotoBtn.addEventListener('click', () => {
              const m = parseInt(this.card.querySelector('#goto-month').value, 10);
              const y = parseInt(this.card.querySelector('#goto-year').value, 10);
              if (m >= 1 && m <= 12 && y >= 1800 && y <= 2199) {
                  if (this._setDisplayMonthYear(m, y, true)) this._render();
              }
          });
      }

      const convBtn = this.card.querySelector('#conv-btn');
      if (convBtn) {
          convBtn.addEventListener('click', () => {
              const type = this.card.querySelector('#conv-type').value;
              const dStr = this.card.querySelector('#conv-day').value;
              const mStr = this.card.querySelector('#conv-month').value;
              const yStr = this.card.querySelector('#conv-year').value;
              const resDiv = this.card.querySelector('#conv-result');

              if (!dStr || !mStr || !yStr) {
                  resDiv.style.display = 'block';
                  resDiv.innerHTML = '<span style="color: var(--lc-holiday-color); text-shadow: var(--lc-text-shadow-light);">⚠️ Vui lòng nhập đầy đủ Ngày, Tháng, Năm!</span>';
                  return;
              }

              const d = parseInt(dStr, 10);
              const m = parseInt(mStr, 10);
              const y = parseInt(yStr, 10);

              if (y < 1800 || y > 2199) {
                  resDiv.style.display = 'block';
                  resDiv.innerHTML = '<span style="color: var(--lc-holiday-color); text-shadow: var(--lc-text-shadow-light);">⚠️ Chỉ hỗ trợ tra cứu năm từ 1800 đến 2199!</span>';
                  return;
              }

              // ---- HÀM TẠO HTML CHI TIẾT DỰA TRÊN NGÀY DƯƠNG LỊCH ----
              const buildDetailHtml = (sD, sM, sY, jd) => {
                  const lunar = getLunarDate(sD, sM, sY);
                  const tietKhiStr = TIETKHI[getSunLongitude(jd + 1, 7.0)];
                  const gioHD = getGioHoangDao(jd);
                  const gioHacDao = getGioHacDao(jd);
                  const huongXH = getHuongXuatHanh(jd);
                  const thanSat = getThanSat(lunar);

                  // Phân tách object Trực 
                  let trucHtml = "";
                  if (thanSat.truc.info) {
                      let info = thanSat.truc.info;
                      if (info.tot) trucHtml += `<div style="margin-bottom:6px;">✅ <b style="color:var(--color-good, #4caf50);">Tốt:</b> ${info.tot}</div>`;
                      if (info.xau) trucHtml += `<div style="margin-bottom:6px;">❌ <b style="color:var(--color-warn, #f44336);">Xấu:</b> ${info.xau}</div>`;
                  } else {
                      trucHtml = "Không có thông tin";
                  }

                  // Phân tách object Sao (Nhị Thập Bát Tú)
                  let saoHtml = "";
                  if (thanSat.sao.info) {
                      let info = thanSat.sao.info;
                      if (info.tieuDe) saoHtml += `<div style="margin-bottom:8px; font-weight:bold; color:var(--lc-text-accent);">${info.tieuDe}</div>`;
                      if (info.nenLam) saoHtml += `<div style="margin-bottom:6px;">👍 <b style="color:var(--lc-text-accent);">Nên làm:</b> ${info.nenLam}</div>`;
                      if (info.kiengCu) saoHtml += `<div style="margin-bottom:6px;">👎 <b style="color:var(--lc-text-accent);">Kiêng cữ:</b> ${info.kiengCu}</div>`;
                      if (info.ngoaiLe) saoHtml += `<div style="margin-bottom:6px;">⚠️ <b style="color:var(--lc-text-accent);">Ngoại lệ:</b> ${info.ngoaiLe}</div>`;
                      if (info.baiTho) {
                          saoHtml += `<div style="margin-top:12px; font-style:italic; text-align:center; opacity:0.9; color:var(--lc-text-main); font-family:serif; line-height:1.6;">${info.baiTho.replace(/\n/g, '<br>')}</div>`;
                      }
                  } else {
                      saoHtml = "Không có thông tin";
                  }

                  return `
                  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--lc-border-color); color: var(--lc-text-main);">
                      <div style="text-align: center; color: var(--lc-text-accent); font-weight: bold; margin-bottom: 15px; font-size: clamp(14px, 4.5cqi, 18px); text-transform: uppercase; text-shadow: var(--lc-text-shadow-light);">Thông tin chi tiết</div>
                      
                      <div style="display: flex; flex-direction: column; gap: 10px; font-size: clamp(11px, 3.8cqi, 14px);">
                          
                          <div style="background: var(--lc-bg-overlay); padding: 12px; border-radius: 8px; border: 1px solid var(--lc-border-color); box-shadow: var(--lc-element-shadow);">
                              <div style="color: var(--lc-text-accent); font-weight: bold; margin-bottom: 8px; font-size: 1.1em; border-bottom: 1px dashed var(--lc-border-color); padding-bottom: 6px;">🧭 Hướng & Giờ</div>
                              <div style="margin-bottom: 6px;"><b>Giờ Hoàng Đạo (Tốt):</b><br> ${gioHD}</div>
                              <div style="margin-bottom: 6px;"><b>Giờ Hắc Đạo (Xấu):</b><br> ${gioHacDao}</div>
                              <div style="margin-bottom: 6px;"><b>Xuất hành:</b><br> ${huongXH}</div>
                              <div style="margin-top: 6px;"><b>Tiết khí:</b> ${tietKhiStr}</div>
                          </div>

                          <div style="background: var(--lc-bg-overlay); padding: 12px; border-radius: 8px; border: 1px solid var(--lc-border-color); box-shadow: var(--lc-element-shadow);">
                              <div style="color: var(--lc-text-accent); font-weight: bold; margin-bottom: 8px; font-size: 1.1em; border-bottom: 1px dashed var(--lc-border-color); padding-bottom: 6px;">📌 Trực ${thanSat.truc.name} ${thanSat.truc.emoji}</div>
                              <div style="line-height: 1.5;">${trucHtml}</div>
                          </div>

                          <div style="background: var(--lc-bg-overlay); padding: 12px; border-radius: 8px; border: 1px solid var(--lc-border-color); box-shadow: var(--lc-element-shadow);">
                              <div style="color: var(--lc-text-accent); font-weight: bold; margin-bottom: 8px; font-size: 1.1em; border-bottom: 1px dashed var(--lc-border-color); padding-bottom: 6px;">🎵 Ngũ hành Nạp âm</div>
                              <div style="line-height: 1.5;">${thanSat.napAm}</div>
                          </div>

                          <div style="background: var(--lc-bg-overlay); padding: 12px; border-radius: 8px; border: 1px solid var(--lc-border-color); box-shadow: var(--lc-element-shadow);">
                              <div style="color: var(--lc-text-accent); font-weight: bold; margin-bottom: 8px; font-size: 1.1em; border-bottom: 1px dashed var(--lc-border-color); padding-bottom: 6px;">✨ Nhị Thập Bát Tú: Sao ${thanSat.sao.name} ${thanSat.sao.emoji}</div>
                              <div style="line-height: 1.5;">${saoHtml}</div>
                          </div>

                      </div>
                  </div>`;
              };

              try {
                  let outHtml = "";
                  if (type === 'solar_to_lunar') {
                      const jd = jdn(d, m, y);
                      const checkDate = jdn2dateFunc(jd);
                      if (checkDate[0] !== d || checkDate[1] !== m || checkDate[2] !== y) {
                          resDiv.style.display = 'block';
                          resDiv.innerHTML = '<span style="color: var(--lc-holiday-color); text-shadow: var(--lc-text-shadow-light);">⚠️ Ngày dương lịch không tồn tại!</span>';
                          return;
                      }

                      const lunar = getLunarDate(d, m, y);
                      const canChi = getYearCanChi(lunar.year);
                      const thuStr = TUAN[(jd + 1) % 7];
                      
                      let ly = getYearInfo(lunar.year);
                      let leapMonth = 0;
                      for(let i=0; i<ly.length; i++) { if(ly[i].leap === 1) leapMonth = ly[i].month; }
                      
                      let leapMsg = leapMonth > 0 ? `Năm âm lịch ${canChi} (${lunar.year}) có nhuận tháng ${leapMonth}.` : `Năm âm lịch ${canChi} (${lunar.year}) không có tháng nhuận.`;
                      if(lunar.leap === 1) leapMsg += " (Tháng kết quả đang là tháng nhuận!)";

                      outHtml += `<div style="margin-bottom: 8px;">☀️ Ngày Dương Lịch: <b style="color: var(--lc-text-main); font-size: 1.1em;">${d}/${m}/${y} (${thuStr})</b></div>`;
                      outHtml += `<div style="margin-bottom: 8px;">🌙 Ngày Âm Lịch: <b style="color: var(--lc-text-accent); font-size: 1.1em;">${lunar.day}/${lunar.month}/${lunar.year}${lunar.leap===1 ? ' (Nhuận)' : ''}</b></div>`;
                      outHtml += `<div style="margin-bottom: 8px;">🐲 Năm Can Chi: <b style="color: var(--lc-text-main); font-size: 1.1em;">${canChi}</b></div>`;
                      outHtml += `<div style="margin-top: 10px; font-style: italic; opacity: 0.8; font-size: 0.9em;">ℹ️ ${leapMsg}</div>`;

                      // -- THÊM PHẦN CHI TIẾT ---
                      outHtml += buildDetailHtml(d, m, y, jd);

                  } 
                  else {
                      let ly = getYearInfo(y);
                      let results = {};
                      let leapMonth = 0;

                      for (let i = 0; i < ly.length; i++) {
                          let m_info = ly[i];
                          if (m_info.leap === 1) leapMonth = m_info.month;

                          if (m_info.month === m) {
                              let m_len = 30;
                              if (i + 1 < ly.length) {
                                  m_len = ly[i+1].jd - m_info.jd;
                              } else {
                                  let next_ly = getYearInfo(y + 1);
                                  if (next_ly && next_ly.length > 0) m_len = next_ly[0].jd - m_info.jd;
                              }

                              if (d >= 1 && d <= m_len) {
                                  let target_jd = m_info.jd + d - 1;
                                  let sDate = jdn2dateFunc(target_jd);
                                  let key = m_info.leap === 1 ? "leap" : "regular";
                                  results[key] = {
                                      ngay: sDate[0], thang: sDate[1], nam: sDate[2], 
                                      thu: TUAN[(target_jd + 1) % 7],
                                      jd: target_jd
                                  };
                              }
                          }
                      }

                      if (Object.keys(results).length === 0) {
                          resDiv.style.display = 'block';
                          resDiv.innerHTML = `<span style="color: var(--lc-holiday-color); text-shadow: var(--lc-text-shadow-light);">⚠️ Ngày âm lịch ${d}/${m}/${y} không tồn tại! (Ví dụ: Tra ngày 30 nhưng tháng đó thiếu chỉ có 29 ngày)</span>`;
                          return;
                      }

                      const canChi = getYearCanChi(y);
                      let leapMsg = leapMonth > 0 ? `Năm âm lịch ${canChi} (${y}) có nhuận tháng ${leapMonth}.` : `Năm âm lịch ${canChi} (${y}) không có tháng nhuận.`;
                      
                      // Hiển thị thông tin chính cho kết quả đầu tiên tìm thấy
                      let defRes = results["regular"] || results["leap"];
                      
                      outHtml += `<div style="margin-bottom: 8px;">☀️ Ngày Dương Lịch: <b style="color: var(--lc-text-main); font-size: 1.1em;">${defRes.ngay}/${defRes.thang}/${defRes.nam} (${defRes.thu})</b></div>`;
                      outHtml += `<div style="margin-bottom: 8px;">🌙 Ngày Âm Lịch: <b style="color: var(--lc-text-accent); font-size: 1.1em;">${d}/${m}/${y}</b></div>`;
                      outHtml += `<div style="margin-bottom: 8px;">🐲 Năm Can Chi: <b style="color: var(--lc-text-main); font-size: 1.1em;">${canChi}</b></div>`;
                      outHtml += `<div style="margin-top: 10px; font-style: italic; opacity: 0.8; font-size: 0.9em;">ℹ️ ${leapMsg}</div>`;

                      if (Object.keys(results).length > 1) {
                          outHtml += `<div style="margin-top: 10px; border-top: 1px dashed var(--lc-border-color); padding-top: 10px;">`;
                          outHtml += `<div style="color: var(--lc-text-accent); margin-bottom: 5px; font-size:0.9em;">📌 Lưu ý: Vì tháng tra cứu là tháng Nhuận, hệ thống trả về 2 kết quả Dương Lịch:</div>`;
                          if(results["regular"]) outHtml += `<div style="opacity: 0.9; font-size: 0.9em; margin-bottom: 4px;">🔹 Nếu là tháng âm thường: <b>${results["regular"].ngay}/${results["regular"].thang}/${results["regular"].nam} (${results["regular"].thu})</b></div>`;
                          if(results["leap"]) outHtml += `<div style="opacity: 0.9; font-size: 0.9em;">🔹 Nếu là tháng âm nhuận: <b>${results["leap"].ngay}/${results["leap"].thang}/${results["leap"].nam} (${results["leap"].thu})</b></div>`;
                          outHtml += `<div style="margin-top: 5px; opacity: 0.75; font-size: 0.85em;">(Chi tiết hiển thị bên dưới áp dụng cho kết quả Dương lịch: ${defRes.ngay}/${defRes.thang}/${defRes.nam})</div>`;
                          outHtml += `</div>`;
                      }

                      // -- THÊM PHẦN CHI TIẾT ---
                      outHtml += buildDetailHtml(defRes.ngay, defRes.thang, defRes.nam, defRes.jd);
                  }
                  resDiv.innerHTML = outHtml;
                  resDiv.style.display = 'block';
              } catch (error) {
                  resDiv.style.display = 'block';
                  resDiv.innerHTML = `<span style="color: var(--lc-holiday-color); text-shadow: var(--lc-text-shadow-light);">❌ Đã xảy ra lỗi hệ thống: ${error.message}</span>`;
              }
          });
      }

      const prevBtn = this.card.querySelector('#prev-month');
      if (prevBtn){
          prevBtn.addEventListener('click', () => {
              let m = this.displayMonth - 1;
              let y = this.displayYear;
              if (m < 1){ m = 12; y--; }
              if (this._setDisplayMonthYear(m, y, true)) this._render();
          });
      }

      const nextBtn = this.card.querySelector('#next-month');
      if (nextBtn){
          nextBtn.addEventListener('click', () => {
              let m = this.displayMonth + 1;
              let y = this.displayYear;
              if (m > 12){ m = 1; y++; }
              if (this._setDisplayMonthYear(m, y, true)) this._render();
          });
      }

      const prevYearBtn = this.card.querySelector('#prev-year');
      if (prevYearBtn){ prevYearBtn.addEventListener('click', () => { if (this._setDisplayMonthYear(this.displayMonth, this.displayYear - 1, true)) this._render(); }); }

      const nextYearBtn = this.card.querySelector('#next-year');
      if (nextYearBtn){ nextYearBtn.addEventListener('click', () => { if (this._setDisplayMonthYear(this.displayMonth, this.displayYear + 1, true)) this._render(); }); }

      const resetBtn = this.card.querySelector('#reset-today');
      if (resetBtn){
          resetBtn.addEventListener('click', () => {
              const today = new Date();
              this._userNavigatedDate = false;
              if (this._setDisplayDate(today, false)) this._render();
          });
      }

      this._bindSwipeNavigation();
    }

    getCardSize(){ return 8; }

    getGridOptions(){
      return {
        columns: 12,
        min_columns: 6,
        rows: 8,
        min_rows: 6
      };
    }
  }

  // HA frontend issue #53890: extra_js_url can execute BEFORE its scoped
  // CustomElementRegistry polyfill. Defining a card into the old registry
  // makes it permanently invisible to Lovelace even if the JS loaded fine.
  // Wait for the registered HA app element in the CURRENT registry; it is
  // defined by the app bundle AFTER the polyfill was imported.
  // Check only while bootstrapping; do not block rendering or the HA event loop.
  const registerAfterHomeAssistant = (register) => {
    const check = () => {
      if (window.customElements.get('home-assistant')) {
        register();
      } else {
        window.requestAnimationFrame(check);
      }
    };
    check();
  };

  registerAfterHomeAssistant(() => {
    // Đăng ký Element
    if (!customElements.get('lich-block-am-duong-viet-nam-editor')) customElements.define('lich-block-am-duong-viet-nam-editor', LunarCalendarCardEditor);
    if (!customElements.get('lich-block-am-duong-viet-nam')) customElements.define('lich-block-am-duong-viet-nam', LunarCalendarCard);

    const mainCardDescriptor = {
      type: "lich-block-am-duong-viet-nam",
      name: "Lịch Âm Dương",
      description: "Thẻ Lịch Âm Dương Việt Nam có thể tùy chỉnh màu nền.",
      documentationURL: "https://github.com/khaisilk1910/am-lich-viet-nam",
      preview: true,
      // Thẻ lịch tổng hợp không đại diện cho một entity duy nhất; tránh đề xuất sai trong picker mới.
      getEntitySuggestion: () => null
    };
    window.customCards = window.customCards || [];
    const existingMainCard = window.customCards.find((card) => card && card.type === mainCardDescriptor.type);
    if (existingMainCard) Object.assign(existingMainCard, mainCardDescriptor);
    else window.customCards.push(mainCardDescriptor);
  });

  // ---- TRUYỀN HÀM TÍNH TOÁN CORE CHO POPUP LÀM VIỆC ----
  initPopupCore(getLichAmDuongHelpers());

})();