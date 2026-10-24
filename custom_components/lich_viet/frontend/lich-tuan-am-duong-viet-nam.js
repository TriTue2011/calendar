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

import { injectPopupDOM, initPopupCore } from './lich-block-am-duong-viet-nam-popup.js?v=20261005';

(function(){
  'use strict';

  const ABOUT = "Âm lịch Việt Nam Home Assistant - Ver 01Jun2026-swipe-fix © 2025-2026 Nguyễn Tiến Khải";

  // ==========================================
  // WEEKLY LUNAR/SOLAR CARD
  // Custom element: lich-tuan-am-duong-viet-nam
  // ==========================================
  const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const LUNAR_MONTH_NAMES = [
    "Tháng Giêng", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Chạp"
  ];

  const WEEKLY_CARD_TAG = "lich-tuan-am-duong-viet-nam";
  const WEEKLY_EDITOR_TAG = "lich-tuan-am-duong-viet-nam-editor";
  const WEEKLY_CARD_TYPE = `custom:${WEEKLY_CARD_TAG}`;
  const WEEKLY_CARD_NAME = "Lịch Tuần Âm Dương";
  const MAIN_BLOCK_CARD_TAG = "lich-block-am-duong-viet-nam";
  let mainBlockCardLoadPromise = null;

  async function ensureMainBlockCardLoaded() {
    if (customElements.get(MAIN_BLOCK_CARD_TAG)) return true;
    if (!mainBlockCardLoadPromise) {
      mainBlockCardLoadPromise = import('./lich-block-am-duong-viet-nam.js?v=20261005')
        .catch((err) => {
          mainBlockCardLoadPromise = null;
          console.warn('Không thể tải thẻ lịch block chính:', err);
          throw err;
        });
    }
    try {
      await mainBlockCardLoadPromise;
    } catch (err) {
      return false;
    }
    return !!customElements.get(MAIN_BLOCK_CARD_TAG);
  }

  const DEFAULT_WEEKLY_CONFIG = {
    text_color: "#000000",
    normal_day_color: "#000000",
    month_solar_color: "#000000",
    month_lunar_color: "#000000",
    weekday_color: "#000000",
    solar_day_color: "#000000",
    lunar_day_color: "#000000",
    center_text_color: "#000000",
    center_month_solar_color: "#000000",
    center_month_lunar_color: "#000000",
    center_weekday_color: "#000000",
    center_solar_day_color: "#000000",
    center_lunar_day_color: "#000000",
    center_background_color: "",
    center_background_opacity: 100,
    saturday_color: "#00a85a",
    sunday_color: "#ef1722",
    arrow_color: "#c7eaff",
    arrow_background_color: "",
    arrow_background_opacity: 0,
    center_gradient_top: "rgba(229, 246, 255, 0.72)",
    center_gradient_bottom: "rgba(136, 191, 225, 0.82)",
    center_gradient: "",
    card_background_color: "",
    card_background_opacity: 0,
    card_background: "transparent",
    popup_theme: "default",
    popup_opacity: 95
  };

  function createDefaultWeeklyConfig(includeType = false) {
    const config = { ...DEFAULT_WEEKLY_CONFIG };
    if (includeType) config.type = WEEKLY_CARD_TYPE;
    return config;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12, 0, 0, 0);
  }

  function sameSolarDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function solarArgs(date) {
    return [date.getDate(), date.getMonth() + 1, date.getFullYear()];
  }

  function formatSolarInWeekHtml(date) {
    const day = date.getDate();
    if (day === 1) {
      return `<span class="wlc-solar-first"><span class="wlc-solar-main">1</span><span class="wlc-solar-month">/${date.getMonth() + 1}</span></span>`;
    }
    return `<span class="wlc-solar-number">${day}</span>`;
  }

  function formatLunarInWeek(lunarDate) {
    return lunarDate.day === 1 ? `${lunarDate.day}/${lunarDate.month}` : `${lunarDate.day}`;
  }

  function getLunarMonthLength(lunarDate) {
    if (!lunarDate || lunarDate.day === 0) return 29;
    const yearInfo = getYearInfo(lunarDate.year);
    const monthIndex = yearInfo.findIndex((item) => item.month === lunarDate.month && item.leap === lunarDate.leap);
    if (monthIndex < 0) return 29;
    const nextMonth = yearInfo[monthIndex + 1] || getYearInfo(lunarDate.year + 1)[0];
    return nextMonth.jd - yearInfo[monthIndex].jd;
  }

  function lunarMonthLengthEmoji(lunarDate) {
    return getLunarMonthLength(lunarDate) === 30 ? "🌕" : "🌙";
  }

  function formatLunarInWeekHtml(lunarDate, showMonthEmoji = false) {
    const lunarText = `<span class="wlc-lunar-text">${escapeHtml(formatLunarInWeek(lunarDate))}</span>`;
    if (!showMonthEmoji) return lunarText;
    const monthLength = getLunarMonthLength(lunarDate);
    return `${lunarText}<span class="wlc-lunar-month-emoji" title="${monthLength} ngày">${lunarMonthLengthEmoji(lunarDate)}</span>`;
  }

  function solarMonthTitle(date) {
    return `Tháng ${date.getMonth() + 1}`;
  }

  function lunarMonthTitle(lunarDate) {
    const monthName = LUNAR_MONTH_NAMES[lunarDate.month - 1] || `Tháng ${lunarDate.month}`;
    return lunarDate.leap ? `${monthName} nhuận` : monthName;
  }

  function clampNumber(value, fallback, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }


  function hasConfigValue(config, name) {
    const value = config && config[name];
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  function optionalCssValue(config, name, fallback = "") {
    const value = config && config[name];
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
    return fallback;
  }

  function cssValue(config, name, fallbackName = "text_color") {
    const value = config && config[name];
    if (value !== undefined && value !== null && String(value).trim() !== "") return String(value).trim();
    const fallback = config && config[fallbackName];
    if (fallback !== undefined && fallback !== null && String(fallback).trim() !== "") return String(fallback).trim();
    return DEFAULT_WEEKLY_CONFIG[name] || DEFAULT_WEEKLY_CONFIG[fallbackName] || "#000000";
  }

  function applyOpacityToCssColor(value, opacityPercent = 100) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.toLowerCase() === "transparent") return "transparent";

    const opacity = clampNumber(opacityPercent, 100, 0, 100) / 100;
    const hex3 = raw.match(/^#([0-9a-fA-F]{3})$/);
    const hex6 = raw.match(/^#([0-9a-fA-F]{6})$/);

    if (hex3) {
      const h = hex3[1].split("").map(ch => ch + ch).join("");
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    if (hex6) {
      const h = hex6[1];
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    const rgb = raw.match(/^rgb\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)$/i);
    if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${opacity})`;

    const rgba = raw.match(/^rgba\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+|[0-9.]+%)\s*\)$/i);
    if (rgba) return `rgba(${rgba[1]}, ${rgba[2]}, ${rgba[3]}, ${opacity})`;

    // Với hsl(), color-mix(), gradient hoặc var(--...), giữ nguyên để người dùng tự kiểm soát opacity trong giá trị CSS.
    return raw;
  }

  function centerBackgroundValue(config) {
    const custom = optionalCssValue(config, "center_gradient", "");
    if (custom) return custom;

    const solid = optionalCssValue(config, "center_background_color", "");
    if (solid) return solid;

    const top = cssValue(config, "center_gradient_top", "center_gradient_top");
    const bottom = cssValue(config, "center_gradient_bottom", "center_gradient_bottom");
    return `linear-gradient(180deg, ${top}, ${bottom})`;
  }

  function cardBackgroundValue(config) {
    const color = optionalCssValue(config, "card_background_color", "");
    if (color) return applyOpacityToCssColor(color, config.card_background_opacity);

    const custom = optionalCssValue(config, "card_background", "");
    if (custom) return custom;

    return "transparent";
  }

  function arrowBackgroundValue(config) {
    return "transparent";
  }

  function hexForColorInput(value, fallback = "#000000") {
    const raw = String(value || "").trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw;
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
      return "#" + raw.slice(1).split("").map(ch => ch + ch).join("");
    }
    return fallback;
  }

  function fireConfigChanged(element, config) {
    element.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true
    }));
  }

  class WeeklyLunarCalendarCardEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = createDefaultWeeklyConfig();
      this._activeColorPicker = null;
      this._colorOutsideHandler = null;
      this._colorKeyHandler = null;
      this._colorPointerDrag = null;
      this._rangeDragField = null;
      this._rangeDragTimer = null;
    }

    set hass(hass) {
      this._hass = hass;
    }

    disconnectedCallback() {
      if (this._colorOutsideHandler) {
        window.removeEventListener("pointerdown", this._colorOutsideHandler, true);
        this._colorOutsideHandler = null;
      }
      if (this._colorKeyHandler) {
        window.removeEventListener("keydown", this._colorKeyHandler, true);
        this._colorKeyHandler = null;
      }
      if (this._rangeDragTimer) {
        clearTimeout(this._rangeDragTimer);
        this._rangeDragTimer = null;
      }
      this._activeColorPicker = null;
      this._colorPointerDrag = null;
      this._rangeDragField = null;
    }

    setConfig(config) {
      const isPickingColor = !!this._activeColorPicker;
      const activeRangeField = this._rangeDragField;
      this._config = { ...createDefaultWeeklyConfig(), ...(config || {}) };
      if (config && config.type) this._config.type = config.type;
      // Khi đang chọn màu hoặc đang kéo slider, Home Assistant sẽ gọi setConfig sau mỗi lần áp thử.
      // Không render lại editor lúc này để bảng màu không bị đóng và slider không bị mất thao tác kéo.
      if (isPickingColor) return;
      if (activeRangeField) {
        this._syncRangeFieldUi(activeRangeField);
        return;
      }
      this._render();
    }

    _get(name) {
      return this._config[name] ?? DEFAULT_WEEKLY_CONFIG[name] ?? "";
    }

    _setValue(name, value) {
      const next = { ...this._config, [name]: value };
      if (!next.type) next.type = WEEKLY_CARD_TYPE;
      this._config = next;
      fireConfigChanged(this, next);
    }

    _syncRangeFieldUi(name, value = this._get(name)) {
      if (!this.shadowRoot || !name) return;
      this.shadowRoot.querySelectorAll(`[data-range-peer="${name}"]`).forEach((peer) => {
        peer.value = value;
      });
    }

    _beginRangeDrag(name) {
      if (this._rangeDragTimer) {
        clearTimeout(this._rangeDragTimer);
        this._rangeDragTimer = null;
      }
      this._rangeDragField = name;
    }

    _endRangeDrag(name) {
      if (this._rangeDragTimer) clearTimeout(this._rangeDragTimer);
      this._rangeDragTimer = setTimeout(() => {
        if (!name || this._rangeDragField === name) this._rangeDragField = null;
        this._rangeDragTimer = null;
      }, 160);
    }



    _clamp01(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return 0;
      return Math.min(1, Math.max(0, n));
    }

    _hexToRgb(hex) {
      const normalized = hexForColorInput(hex, "#000000");
      return {
        r: parseInt(normalized.slice(1, 3), 16),
        g: parseInt(normalized.slice(3, 5), 16),
        b: parseInt(normalized.slice(5, 7), 16)
      };
    }

    _rgbToHex(r, g, b) {
      const toHex = (value) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, "0");
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    _rgbToHsv({ r, g, b }) {
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      const delta = max - min;
      let h = 0;

      if (delta !== 0) {
        if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
        else if (max === gn) h = 60 * (((bn - rn) / delta) + 2);
        else h = 60 * (((rn - gn) / delta) + 4);
      }

      if (h < 0) h += 360;
      return { h, s: max === 0 ? 0 : delta / max, v: max };
    }

    _hsvToHex(h, s, v) {
      const hue = ((Number(h) % 360) + 360) % 360;
      const sat = this._clamp01(s);
      const val = this._clamp01(v);
      const c = val * sat;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = val - c;
      let r1 = 0;
      let g1 = 0;
      let b1 = 0;

      if (hue < 60) [r1, g1, b1] = [c, x, 0];
      else if (hue < 120) [r1, g1, b1] = [x, c, 0];
      else if (hue < 180) [r1, g1, b1] = [0, c, x];
      else if (hue < 240) [r1, g1, b1] = [0, x, c];
      else if (hue < 300) [r1, g1, b1] = [x, 0, c];
      else [r1, g1, b1] = [c, 0, x];

      return this._rgbToHex((r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255);
    }

    _setColorFieldUi(field, value, swatchHex = null) {
      if (!this.shadowRoot) return;
      const fallback = hexForColorInput(DEFAULT_WEEKLY_CONFIG[field], "#000000");
      const hex = swatchHex || hexForColorInput(value, fallback);
      const opener = this.shadowRoot.querySelector(`[data-color-open="${field}"]`);
      const textInput = this.shadowRoot.querySelector(`[data-field="${field}"]`);
      const hexInput = this.shadowRoot.querySelector(`[data-color-hex="${field}"]`);
      const preview = this.shadowRoot.querySelector(`[data-color-preview="${field}"]`);

      if (opener) opener.style.setProperty("--picker-color", hex);
      if (textInput) textInput.value = value ?? "";
      if (hexInput) hexInput.value = hex;
      if (preview) preview.style.background = hex;
    }

    _updateColorPickerUi(field) {
      const state = this._activeColorPicker;
      if (!state || state.field !== field || !this.shadowRoot) return;
      const { h, s, v } = state.hsv;
      const hue = ((h % 360) + 360) % 360;
      const sv = this.shadowRoot.querySelector(`[data-color-sv="${field}"]`);
      const svCursor = this.shadowRoot.querySelector(`[data-color-sv-cursor="${field}"]`);
      const hueCursor = this.shadowRoot.querySelector(`[data-color-hue-cursor="${field}"]`);

      if (sv) sv.style.setProperty("--current-hue", hue);
      if (svCursor) {
        svCursor.style.left = `${s * 100}%`;
        svCursor.style.top = `${(1 - v) * 100}%`;
      }
      if (hueCursor) hueCursor.style.left = `${(hue / 360) * 100}%`;
      this._setColorFieldUi(field, state.currentHex, state.currentHex);
    }

    _previewColorPicker(field) {
      const state = this._activeColorPicker;
      if (!state || state.field !== field) return;
      state.currentHex = this._hsvToHex(state.hsv.h, state.hsv.s, state.hsv.v);
      this._updateColorPickerUi(field);
      this._setValue(field, state.currentHex);
    }

    _openColorPicker(field) {
      if (!this.shadowRoot) return;
      if (this._activeColorPicker && this._activeColorPicker.field !== field) this._closeColorPicker(false);

      const wrapper = this.shadowRoot.querySelector(`[data-color-wrapper="${field}"]`);
      if (!wrapper) return;

      const originalValue = this._get(field);
      const fallback = hexForColorInput(DEFAULT_WEEKLY_CONFIG[field], "#000000");
      const startHex = hexForColorInput(originalValue, fallback);
      this._activeColorPicker = {
        field,
        originalValue,
        currentHex: startHex,
        hsv: this._rgbToHsv(this._hexToRgb(startHex))
      };

      this.shadowRoot.querySelectorAll(".color-field.is-color-open").forEach((item) => item.classList.remove("is-color-open"));
      wrapper.classList.add("is-color-open");
      this._updateColorPickerUi(field);

      if (!this._colorOutsideHandler) {
        this._colorOutsideHandler = (event) => {
          const active = this._activeColorPicker;
          if (!active || !this.shadowRoot) return;
          const path = event.composedPath ? event.composedPath() : [];
          const panel = this.shadowRoot.querySelector(`[data-color-panel="${active.field}"]`);
          const opener = this.shadowRoot.querySelector(`[data-color-open="${active.field}"]`);
          if (path.includes(panel) || path.includes(opener)) return;
          this._closeColorPicker(false);
        };
        window.addEventListener("pointerdown", this._colorOutsideHandler, true);
      }

      if (!this._colorKeyHandler) {
        this._colorKeyHandler = (event) => {
          if (!this._activeColorPicker) return;
          if (event.key === "Escape") {
            event.preventDefault();
            this._closeColorPicker(false);
          } else if (event.key === "Enter") {
            event.preventDefault();
            this._closeColorPicker(true);
          }
        };
        window.addEventListener("keydown", this._colorKeyHandler, true);
      }
    }

    _closeColorPicker(commit) {
      const state = this._activeColorPicker;
      if (!state || !this.shadowRoot) return;
      const wrapper = this.shadowRoot.querySelector(`[data-color-wrapper="${state.field}"]`);
      if (wrapper) wrapper.classList.remove("is-color-open");

      if (commit) {
        this._setValue(state.field, state.currentHex);
        this._setColorFieldUi(state.field, state.currentHex, state.currentHex);
      } else {
        this._setValue(state.field, state.originalValue);
        this._setColorFieldUi(state.field, state.originalValue);
      }

      this._activeColorPicker = null;
      this._colorPointerDrag = null;
      if (this._colorOutsideHandler) {
        window.removeEventListener("pointerdown", this._colorOutsideHandler, true);
        this._colorOutsideHandler = null;
      }
      if (this._colorKeyHandler) {
        window.removeEventListener("keydown", this._colorKeyHandler, true);
        this._colorKeyHandler = null;
      }
    }

    _updateColorFromPointer(field, area, event) {
      const state = this._activeColorPicker;
      if (!state || state.field !== field) return;
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      const x = this._clamp01((event.clientX - rect.left) / Math.max(1, rect.width));
      const y = this._clamp01((event.clientY - rect.top) / Math.max(1, rect.height));

      if (area === "hue") {
        state.hsv.h = x * 360;
      } else {
        state.hsv.s = x;
        state.hsv.v = 1 - y;
      }

      this._previewColorPicker(field);
    }

    _updateColorFromHex(field, value) {
      const state = this._activeColorPicker;
      if (!state || state.field !== field) return;
      const hex = hexForColorInput(value, "");
      if (!hex) return;
      state.currentHex = hex;
      state.hsv = this._rgbToHsv(this._hexToRgb(hex));
      this._updateColorPickerUi(field);
      this._setValue(field, hex);
    }

    _colorField(name, label, help = "") {
      const fallback = hexForColorInput(DEFAULT_WEEKLY_CONFIG[name], "#000000");
      const value = escapeHtml(this._get(name));
      const pickerValue = hexForColorInput(this._get(name), fallback);
      const safeName = escapeHtml(name);
      return `
        <label class="field color-field" data-color-wrapper="${safeName}">
          <span class="label">${escapeHtml(label)}</span>
          ${help ? `<span class="help">${escapeHtml(help)}</span>` : ""}
          <div class="color-row">
            <button class="picker color-swatch-button" type="button" data-color-open="${safeName}" style="--picker-color: ${pickerValue};" aria-label="Ch\u1ecdn m\u00e0u ${escapeHtml(label)}"></button>
            <input class="text" type="text" data-field="${safeName}" value="${value}" placeholder="#000000 ho\u1eb7c var(--primary-text-color)">
          </div>
          <div class="color-picker-panel" data-color-panel="${safeName}">
            <div class="color-picker-preview-row">
              <span class="color-picker-preview" data-color-preview="${safeName}" style="background: ${pickerValue};"></span>
              <input class="text color-picker-hex" type="text" data-color-hex="${safeName}" value="${pickerValue}" aria-label="M\u00e3 m\u00e0u HEX">
            </div>
            <div class="color-picker-sv" data-color-sv="${safeName}" style="--current-hue: 0;">
              <span class="color-picker-sv-cursor" data-color-sv-cursor="${safeName}"></span>
            </div>
            <div class="color-picker-hue" data-color-hue="${safeName}">
              <span class="color-picker-hue-cursor" data-color-hue-cursor="${safeName}"></span>
            </div>
            <div class="color-picker-hint">Nh\u1ea5n ho\u1eb7c k\u00e9o trong b\u1ea3ng m\u00e0u \u0111\u1ec3 \u00e1p th\u1eed, b\u1ea5m OK \u0111\u1ec3 gi\u1eef m\u00e0u.</div>
            <div class="color-picker-actions">
              <button type="button" class="color-picker-action" data-color-cancel="${safeName}">H\u1ee7y</button>
              <button type="button" class="color-picker-action primary" data-color-ok="${safeName}">OK</button>
            </div>
          </div>
        </label>`;
    }

    _textField(name, label, placeholder = "", help = "") {
      return `
        <label class="field">
          <span class="label">${escapeHtml(label)}</span>
          ${help ? `<span class="help">${escapeHtml(help)}</span>` : ""}
          <input class="text full" type="text" data-field="${escapeHtml(name)}" value="${escapeHtml(this._get(name))}" placeholder="${escapeHtml(placeholder)}">
        </label>`;
    }

    _numberField(name, label, min, max, help = "") {
      return `
        <label class="field">
          <span class="label">${escapeHtml(label)}</span>
          ${help ? `<span class="help">${escapeHtml(help)}</span>` : ""}
          <input class="text full" type="number" min="${min}" max="${max}" data-field="${escapeHtml(name)}" value="${escapeHtml(this._get(name))}">
        </label>`;
    }

    _rangeField(name, label, min, max, help = "") {
      const value = clampNumber(this._get(name), DEFAULT_WEEKLY_CONFIG[name] ?? min, min, max);
      return `
        <label class="field">
          <span class="label">${escapeHtml(label)}</span>
          ${help ? `<span class="help">${escapeHtml(help)}</span>` : ""}
          <div class="range-row">
            <input class="range" type="range" min="${min}" max="${max}" data-field="${escapeHtml(name)}" data-range-peer="${escapeHtml(name)}" value="${escapeHtml(value)}">
            <input class="text range-number" type="number" min="${min}" max="${max}" data-field="${escapeHtml(name)}" data-range-peer="${escapeHtml(name)}" value="${escapeHtml(value)}">
          </div>
        </label>`;
    }

    _selectField(name, label, options, help = "") {
      const current = String(this._get(name));
      const opts = options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("");
      return `
        <label class="field">
          <span class="label">${escapeHtml(label)}</span>
          ${help ? `<span class="help">${escapeHtml(help)}</span>` : ""}
          <select class="text full" data-field="${escapeHtml(name)}">${opts}</select>
        </label>`;
    }

    _render() {
      if (!this.shadowRoot) return;
      this.shadowRoot.innerHTML = `
        <style>
          :host { display: block; }
          .editor {
            display: grid;
            gap: 14px;
            color: var(--primary-text-color);
            font-family: var(--paper-font-body1_-_font-family, Roboto, Arial, sans-serif);
          }
          .section {
            border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            border-radius: 12px;
            padding: 12px;
            display: grid;
            gap: 12px;
            background: var(--card-background-color, #fff);
          }
          .section-title {
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.01em;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
          }
          .field {
            display: grid;
            gap: 6px;
            min-width: 0;
          }
          .label {
            font-size: 12px;
            font-weight: 600;
            color: var(--secondary-text-color, #666);
          }
          .help {
            font-size: 11px;
            line-height: 1.35;
            color: var(--secondary-text-color, #777);
          }
          .color-row {
            display: grid;
            grid-template-columns: 44px minmax(0, 1fr);
            gap: 8px;
            align-items: center;
          }
          .picker {
            width: 44px;
            height: 38px;
            padding: 0;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            border-radius: 8px;
            background: transparent;
            cursor: pointer;
          }
          .color-field {
            position: relative;
          }
          .color-swatch-button {
            appearance: none;
            -webkit-appearance: none;
            background: var(--picker-color, #000000);
            box-shadow: inset 0 0 0 2px rgba(255,255,255,0.18);
          }
          .color-picker-panel {
            position: absolute;
            z-index: 50;
            top: calc(100% + 8px);
            left: 0;
            display: none;
            width: min(280px, calc(100vw - 48px));
            box-sizing: border-box;
            padding: 10px;
            gap: 10px;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.18));
            border-radius: 12px;
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color, #111);
            box-shadow: 0 12px 30px rgba(0,0,0,0.35);
          }
          .color-field.is-color-open .color-picker-panel {
            display: grid;
          }
          .color-picker-preview-row {
            display: grid;
            grid-template-columns: 34px minmax(0, 1fr);
            gap: 8px;
            align-items: center;
          }
          .color-picker-preview {
            display: block;
            width: 34px;
            height: 34px;
            border-radius: 8px;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.16));
            box-shadow: inset 0 0 0 2px rgba(255,255,255,0.16);
          }
          .color-picker-hex {
            min-height: 34px;
          }
          .color-picker-sv {
            position: relative;
            height: 150px;
            border-radius: 10px;
            cursor: crosshair;
            overflow: hidden;
            background:
              linear-gradient(to top, #000, rgba(0,0,0,0)),
              linear-gradient(to right, #fff, hsl(var(--current-hue, 0), 100%, 50%));
            border: 1px solid var(--divider-color, rgba(0,0,0,0.14));
            touch-action: none;
          }
          .color-picker-hue {
            position: relative;
            height: 18px;
            border-radius: 999px;
            cursor: crosshair;
            background: linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red);
            border: 1px solid var(--divider-color, rgba(0,0,0,0.14));
            touch-action: none;
          }
          .color-picker-sv-cursor,
          .color-picker-hue-cursor {
            position: absolute;
            pointer-events: none;
            transform: translate(-50%, -50%);
            border: 2px solid #fff;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.65), 0 1px 4px rgba(0,0,0,0.45);
          }
          .color-picker-sv-cursor {
            width: 14px;
            height: 14px;
            border-radius: 50%;
          }
          .color-picker-hue-cursor {
            top: 50%;
            width: 8px;
            height: 24px;
            border-radius: 999px;
          }
          .color-picker-hint {
            font-size: 11px;
            color: var(--secondary-text-color, #777);
            line-height: 1.35;
          }
          .color-picker-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
          }
          .color-picker-action {
            min-height: 32px;
            padding: 0 12px;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            border-radius: 8px;
            color: var(--primary-text-color, #111);
            background: var(--secondary-background-color, #fff);
            cursor: pointer;
            font: inherit;
          }
          .color-picker-action.primary {
            color: var(--text-primary-color, #fff);
            background: var(--primary-color, #03a9f4);
            border-color: var(--primary-color, #03a9f4);
          }
          .text {
            box-sizing: border-box;
            width: 100%;
            min-height: 38px;
            border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
            border-radius: 8px;
            padding: 8px 10px;
            color: var(--primary-text-color, #111);
            background: var(--secondary-background-color, #fff);
            font: inherit;
          }
          .range-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 78px;
            gap: 10px;
            align-items: center;
          }
          .range {
            width: 100%;
            min-width: 0;
            accent-color: var(--primary-color, #03a9f4);
            cursor: pointer;
            touch-action: pan-y;
          }
          .range-number {
            text-align: center;
          }
          .full { width: 100%; }
          .note {
            font-size: 12px;
            color: var(--secondary-text-color, #666);
            line-height: 1.45;
          }
        </style>
        <div class="editor">
          <div class="section">
            <div class="section-title">Màu nội dung ngày thường trong tuần</div>
            <div class="grid">
              ${this._colorField("text_color", "Màu chữ chung")}
              ${this._colorField("normal_day_color", "Màu nhanh T2 - T6", "Nếu đặt màu này, T2-T6 sẽ dùng chung màu cho Thứ, ngày dương và ngày âm.")}
              ${this._colorField("weekday_color", "Thứ trong tuần")}
              ${this._colorField("solar_day_color", "Ngày dương")}
              ${this._colorField("lunar_day_color", "Ngày âm")}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Tiêu đề tháng âm / dương</div>
            <div class="grid">
              ${this._colorField("month_solar_color", "Tiêu đề tháng dương")}
              ${this._colorField("month_lunar_color", "Tiêu đề tháng âm")}
              ${this._colorField("center_month_solar_color", "Tháng dương trong khung hôm nay")}
              ${this._colorField("center_month_lunar_color", "Tháng âm trong khung hôm nay")}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Khung hôm nay ở giữa</div>
            <div class="grid">
              ${this._colorField("center_background_color", "Màu nền khung hôm nay", "Để trống nếu muốn dùng gradient trên/dưới.")}
              ${this._rangeField("center_background_opacity", "Độ trong suốt nền khung hôm nay (%)", 0, 100, "0 là trong suốt, 100 là đậm hoàn toàn.")}
              ${this._colorField("center_text_color", "Màu chữ chung ô giữa")}
              ${this._colorField("center_weekday_color", "Thứ ô giữa")}
              ${this._colorField("center_solar_day_color", "Ngày dương ô giữa")}
              ${this._colorField("center_lunar_day_color", "Ngày âm ô giữa")}
              ${this._colorField("center_gradient_top", "Màu gradient trên", "Có thể nhập rgba(...) hoặc màu CSS trong ô chữ bên cạnh.")}
              ${this._colorField("center_gradient_bottom", "Màu gradient dưới", "Có thể nhập rgba(...) hoặc màu CSS trong ô chữ bên cạnh.")}
            </div>
            ${this._textField("center_gradient", "Gradient CSS tùy chỉnh", "linear-gradient(180deg, #e5f6ff, #88bfe1)", "Nếu nhập mục này, thẻ sẽ ưu tiên dùng gradient này. Độ trong suốt vẫn chỉnh bằng mục phía trên.")}
          </div>

          <div class="section">
            <div class="section-title">Mũi tên di chuyển</div>
            <div class="grid">
              ${this._colorField("arrow_color", "Màu mũi tên")}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Màu cuối tuần</div>
            <div class="grid">
              ${this._colorField("saturday_color", "Màu Thứ 7")}
              ${this._colorField("sunday_color", "Màu Chủ nhật")}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Nền thẻ và popup</div>
            <div class="grid">
              ${this._colorField("card_background_color", "Màu nền thẻ tuần", "Mặc định để trống là trong suốt. Nếu chọn màu này, thẻ sẽ dùng màu và độ trong suốt bên dưới.")}
              ${this._rangeField("card_background_opacity", "Độ trong suốt nền thẻ tuần (%)", 0, 100, "Mặc định 0 là trong suốt, 100 là đậm hoàn toàn.")}
              ${this._textField("card_background", "Nền thẻ CSS tùy chỉnh", "transparent hoặc rgba(255,255,255,0.2)", "Dùng khi mục Màu nền thẻ để trống.")}
              ${this._selectField("popup_theme", "Giao diện popup", [
                ["default", "Default"], ["theme1", "Theme 1"], ["theme2", "Theme 2"], ["theme3", "Theme 3"], ["theme4", "Theme 4"],
                ["theme5", "Theme 5"], ["theme6", "Theme 6"], ["theme7", "Theme 7"], ["theme8", "Theme 8"], ["theme9", "Theme 9"], ["theme10", "Theme 10"]
              ])}
              ${this._rangeField("popup_opacity", "Độ trong suốt popup (%)", 0, 100, "0 là trong suốt, 100 là đậm hoàn toàn.")}
            </div>
          </div>

          <div class="note">Có thể dùng mã màu HEX, rgba(...) hoặc biến CSS của Home Assistant như var(--primary-text-color). Ô chọn màu dùng cho HEX; ô nhập bên cạnh cho phép nhập thủ công giá trị CSS.</div>
        </div>`;

      this.shadowRoot.querySelectorAll("[data-field]").forEach((el) => {
        const eventName = el.type === "range" ? "input" : "change";
        el.addEventListener(eventName, (event) => {
          const target = event.currentTarget;
          const field = target.dataset.field;
          let value = target.value;
          if (target.type === "number" || target.type === "range") value = Number(value);
          if (target.type === "range") this._beginRangeDrag(field);
          if (target.dataset.rangePeer) {
            this.shadowRoot.querySelectorAll(`[data-range-peer="${target.dataset.rangePeer}"]`).forEach((peer) => {
              if (peer !== target) peer.value = value;
            });
          }
          this._setValue(field, value);
          if (target.type === "range") this._syncRangeFieldUi(field, value);
          if (field && this.shadowRoot.querySelector(`[data-color-open="${field}"]`)) {
            const hex = hexForColorInput(value, "");
            this._setColorFieldUi(field, value, hex || null);
          }
        });
      });

      this.shadowRoot.querySelectorAll('input.range[data-field]').forEach((el) => {
        const field = el.dataset.field;
        const begin = () => this._beginRangeDrag(field);
        const end = () => this._endRangeDrag(field);
        el.addEventListener('pointerdown', (event) => {
          begin();
          event.currentTarget.setPointerCapture?.(event.pointerId);
        });
        el.addEventListener('pointerup', end);
        el.addEventListener('pointercancel', end);
        el.addEventListener('change', end);
        el.addEventListener('blur', end);
      });

      this.shadowRoot.querySelectorAll("[data-color-open]").forEach((el) => {
        el.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this._openColorPicker(event.currentTarget.dataset.colorOpen);
        });
      });

      this.shadowRoot.querySelectorAll("[data-color-sv]").forEach((el) => {
        const field = el.dataset.colorSv;
        el.addEventListener("pointerdown", (event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          this._colorPointerDrag = { field, area: "sv", pointerId: event.pointerId };
          this._updateColorFromPointer(field, "sv", event);
        });
        el.addEventListener("pointermove", (event) => {
          const drag = this._colorPointerDrag;
          if (!drag || drag.field !== field || drag.area !== "sv" || drag.pointerId !== event.pointerId) return;
          this._updateColorFromPointer(field, "sv", event);
        });
        const stopDrag = (event) => {
          if (this._colorPointerDrag && this._colorPointerDrag.pointerId === event.pointerId) this._colorPointerDrag = null;
        };
        el.addEventListener("pointerup", stopDrag);
        el.addEventListener("pointercancel", stopDrag);
      });

      this.shadowRoot.querySelectorAll("[data-color-hue]").forEach((el) => {
        const field = el.dataset.colorHue;
        el.addEventListener("pointerdown", (event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          this._colorPointerDrag = { field, area: "hue", pointerId: event.pointerId };
          this._updateColorFromPointer(field, "hue", event);
        });
        el.addEventListener("pointermove", (event) => {
          const drag = this._colorPointerDrag;
          if (!drag || drag.field !== field || drag.area !== "hue" || drag.pointerId !== event.pointerId) return;
          this._updateColorFromPointer(field, "hue", event);
        });
        const stopDrag = (event) => {
          if (this._colorPointerDrag && this._colorPointerDrag.pointerId === event.pointerId) this._colorPointerDrag = null;
        };
        el.addEventListener("pointerup", stopDrag);
        el.addEventListener("pointercancel", stopDrag);
      });

      this.shadowRoot.querySelectorAll("[data-color-hex]").forEach((el) => {
        el.addEventListener("input", (event) => {
          this._updateColorFromHex(event.currentTarget.dataset.colorHex, event.currentTarget.value);
        });
      });

      this.shadowRoot.querySelectorAll("[data-color-ok]").forEach((el) => {
        el.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this._closeColorPicker(true);
        });
      });

      this.shadowRoot.querySelectorAll("[data-color-cancel]").forEach((el) => {
        el.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          this._closeColorPicker(false);
        });
      });
    }
  }

  class WeeklyLunarCalendarCard extends HTMLElement {
    static getStubConfig() {
      // Home Assistant yêu cầu getStubConfig không chứa khóa type.
      return createDefaultWeeklyConfig(false);
    }

    static getConfigElement() {
      return document.createElement(WEEKLY_EDITOR_TAG);
    }

    constructor() {
      super();
      this._offsetDays = 0;
      this._lastTodayKey = "";
      this._timer = null;
      this._cardPopupModal = null;
      this._cardPopupMainCard = null;
      this._dragState = null;
      this._suppressClickUntil = 0;
      this._popupDateSyncRaf = null;
      this._popupDateSyncTimer = null;
      this._popupDomInjected = false;
    }

    _ensurePopupDOM() {
      if (this._popupDomInjected) return;
      injectPopupDOM();
      this._popupDomInjected = true;
    }

    connectedCallback() {
      this._startAutoRefresh();
    }

    disconnectedCallback() {
      if (this._timer) {
        clearTimeout(this._timer);
        this._timer = null;
      }
      if (this._popupDateSyncRaf) {
        window.cancelAnimationFrame(this._popupDateSyncRaf);
        this._popupDateSyncRaf = null;
      }
      if (this._popupDateSyncTimer) {
        clearTimeout(this._popupDateSyncTimer);
        this._popupDateSyncTimer = null;
      }
    }

    setConfig(config) {
      if (config !== undefined && (config === null || typeof config !== "object" || Array.isArray(config))) {
        throw new Error("Cấu hình của lich-tuan-am-duong-viet-nam phải là một object YAML hợp lệ.");
      }
      this.config = { ...createDefaultWeeklyConfig(), ...(config || {}) };
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });
      if (!this.card) {
        this.card = document.createElement("ha-card");
        this.shadowRoot.appendChild(this.card);
      }
      this.card.style.background = cardBackgroundValue(this.config);
      this.card.style.border = this.config.border || "none";
      this.card.style.boxShadow = this.config.box_shadow || "none";
      this.card.style.borderRadius = this.config.border_radius || "var(--ha-card-border-radius, 14px)";
      this._ensurePopupDOM();
      this._render();
      this._startAutoRefresh();
    }

    set hass(hass) {
      this._hass = hass;
      this._ensurePopupDOM();
      if (this._cardPopupMainCard) this._cardPopupMainCard.hass = hass;
      this._syncCardPopupTheme();
      const key = this._todayKey();
      if (key !== this._lastTodayKey) {
        this._lastTodayKey = key;
        this._render();
      }
    }

    getCardSize() {
      return 2;
    }

    getGridOptions() {
      return {
        rows: 2,
        min_rows: 2,
        columns: 12,
        min_columns: 6
      };
    }

    _todayKey(date = new Date()) {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    _startAutoRefresh() {
      if (this._timer) return;
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5, 0);
      const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());
      this._timer = setTimeout(() => {
        this._timer = null;
        const key = this._todayKey();
        if (key !== this._lastTodayKey) {
          this._lastTodayKey = key;
          this._render();
        }
        this._startAutoRefresh();
      }, delay);
    }

    _centerDate() {
      return addDays(new Date(), this._offsetDays);
    }

    _navigateWeeks(direction) {
      this._offsetDays += direction * 7;
      this._render();
    }

    _isSwipeIgnoredTarget(target) {
      return target && target.closest && target.closest(".wlc-nav, .wlc-today-reset");
    }

    _onSwipePointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      if (event.isPrimary === false) return;
      if (this._isSwipeIgnoredTarget(event.target)) return;

      this._dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        active: false,
        captured: false
      };
      // Không capture pointer ngay từ đầu, vì capture ở đây có thể làm click/tap
      // của các nút ngày bị retarget lên .wlc-shell và không mở popup.
    }

    _onSwipePointerMove(event) {
      const drag = this._dragState;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const horizontalIntent = Math.abs(dx) >= 18 && Math.abs(dx) > Math.abs(dy) * 1.4;

      if (horizontalIntent) {
        drag.active = true;
        if (!drag.captured) {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          drag.captured = true;
        }
        event.preventDefault();
      }
    }

    _onSwipePointerUp(event) {
      const drag = this._dragState;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const isSwipe = drag.active && Math.abs(dx) >= 52 && Math.abs(dx) > Math.abs(dy) * 1.35;

      this._dragState = null;
      if (drag.captured) event.currentTarget.releasePointerCapture?.(event.pointerId);

      if (isSwipe) {
        event.preventDefault();
        event.stopPropagation();
        this._suppressClickUntil = Date.now() + 350;
        this._navigateWeeks(dx < 0 ? 1 : -1);
      }
    }

    _onSwipePointerCancel(event) {
      const drag = this._dragState;
      if (!drag || drag.pointerId !== event.pointerId) return;
      this._dragState = null;
      if (drag.captured) event.currentTarget.releasePointerCapture?.(event.pointerId);
    }

    _normalizePopupDate(date) {
      const value = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
      return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0);
    }

    _formatPopupDateValue(date) {
      const fixedDate = this._normalizePopupDate(date);
      const yyyy = fixedDate.getFullYear();
      const mm = String(fixedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(fixedDate.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    _parsePopupDateValue(value) {
      const raw = String(value || "").trim();
      const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return null;
      const yyyy = Number(match[1]);
      const mm = Number(match[2]);
      const dd = Number(match[3]);
      const date = new Date(yyyy, mm - 1, dd, 12, 0, 0, 0);
      if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
      return date;
    }

    _withForcedPopupDate(date, callback) {
      const fixedDate = this._normalizePopupDate(date);
      const RealDate = window.Date;
      const fixedTime = new RealDate(
        fixedDate.getFullYear(),
        fixedDate.getMonth(),
        fixedDate.getDate(),
        12,
        0,
        0,
        0
      ).getTime();

      function FakeDate(...args) {
        if (!(this instanceof FakeDate)) {
          if (args.length === 0) return new RealDate(fixedTime).toString();
          return RealDate(...args);
        }
        if (args.length === 0) return new RealDate(fixedTime);
        return new RealDate(...args);
      }

      Object.setPrototypeOf(FakeDate, RealDate);
      FakeDate.prototype = RealDate.prototype;
      FakeDate.now = () => fixedTime;
      FakeDate.parse = RealDate.parse;
      FakeDate.UTC = RealDate.UTC;

      try {
        window.Date = FakeDate;
        return callback();
      } finally {
        window.Date = RealDate;
      }
    }

    _assignPopupDateToCard(mainCard, popupDate, dateValue = this._formatPopupDateValue(popupDate)) {
      if (!mainCard) return;
      const fixedDate = this._normalizePopupDate(popupDate);
      const [dd, mm, yy] = solarArgs(fixedDate);
      const assignments = {
        _wlcPopupDate: fixedDate,
        _selectedDate: fixedDate,
        selectedDate: fixedDate,
        selected_date: dateValue,
        initialDate: fixedDate,
        initial_date: dateValue,
        currentDate: fixedDate,
        _currentDate: fixedDate,
        displayDate: fixedDate,
        _displayDate: fixedDate,
        date: fixedDate,
        _date: fixedDate,
        displayDay: dd,
        displayMonth: mm,
        displayYear: yy,
        selectedDay: dd,
        selectedMonth: mm,
        selectedYear: yy,
        day: dd,
        month: mm,
        year: yy
      };

      for (const [name, value] of Object.entries(assignments)) {
        try { mainCard[name] = value; } catch (e) { /* Một số custom element dùng readonly property. */ }
      }

      try { mainCard.setAttribute("data-selected-date", dateValue); } catch (e) { /* ignore */ }
      try { mainCard.setAttribute("data-wlc-popup-date", dateValue); } catch (e) { /* ignore */ }
    }

    _lockPopupInitialDate(mainCard, popupDate, durationMs = 220) {
      if (!mainCard) return;
      const fixedDate = this._normalizePopupDate(popupDate);
      mainCard._wlcPopupDate = fixedDate;
      mainCard._wlcPopupDateLockUntil = Date.now() + durationMs;
      if (mainCard._wlcPopupDateLockTimer) clearTimeout(mainCard._wlcPopupDateLockTimer);
      mainCard._wlcPopupDateLockTimer = setTimeout(() => {
        if (!mainCard._wlcPopupDateLockUntil || Date.now() >= mainCard._wlcPopupDateLockUntil) {
          mainCard._wlcPopupDate = null;
          mainCard._wlcPopupDateLockUntil = 0;
          mainCard._wlcPopupDateLockTimer = null;
        }
      }, durationMs + 40);
    }

    _releasePopupInitialDate(mainCard) {
      if (!mainCard) return;
      mainCard._wlcPopupDate = null;
      mainCard._wlcPopupDateLockUntil = 0;
      if (mainCard._wlcPopupDateLockTimer) {
        clearTimeout(mainCard._wlcPopupDateLockTimer);
        mainCard._wlcPopupDateLockTimer = null;
      }
    }

    _isPopupInitialDateLocked(mainCard) {
      return !!(
        mainCard &&
        mainCard._wlcPopupDate instanceof Date &&
        !Number.isNaN(mainCard._wlcPopupDate.getTime()) &&
        Number(mainCard._wlcPopupDateLockUntil || 0) >= Date.now()
      );
    }

    _ensurePopupMainCardDatePatch(mainCard) {
      if (!mainCard || mainCard._wlcPopupDatePatchApplied) return;
      const owner = this;

      const wrapMethod = (name) => {
        const original = mainCard[name];
        if (typeof original !== "function") return;
        mainCard[`_wlcOriginal_${name}`] = original;
        mainCard[name] = function(...args) {
          if (owner._isPopupInitialDateLocked(this)) {
            const popupDate = this._wlcPopupDate;
            owner._assignPopupDateToCard(this, popupDate);
            return owner._withForcedPopupDate(popupDate, () => original.apply(this, args));
          }
          return original.apply(this, args);
        };
      };

      // Chỉ khóa ngày trong nhịp render đầu tiên khi mở popup.
      // Sau đó thả khóa để các nút/vuốt tiến-lùi ngày bên trong lịch block hoạt động bình thường.
      ["connectedCallback", "render", "_render", "updated", "firstUpdated"].forEach(wrapMethod);

      const releaseOnUserAction = () => owner._releasePopupInitialDate(mainCard);
      ["pointerdown", "touchstart", "mousedown", "wheel", "keydown"].forEach((eventName) => {
        try { mainCard.addEventListener(eventName, releaseOnUserAction, true); } catch (e) { /* ignore */ }
      });
      mainCard._wlcPopupDateReleaseHandler = releaseOnUserAction;
      mainCard._wlcPopupDatePatchApplied = true;
    }

    _popupMainCardConfig(dateValue, dd, mm, yy) {
      return {
        type: "custom:lich-block-am-duong-viet-nam",
        selected_date: dateValue,
        initial_date: dateValue,
        date: dateValue,
        day: dd,
        month: mm,
        year: yy,
        popup_theme: this.config?.popup_theme || DEFAULT_WEEKLY_CONFIG.popup_theme,
        popup_opacity: this.config?.popup_opacity ?? DEFAULT_WEEKLY_CONFIG.popup_opacity
      };
    }

    _applyPopupMainCardDate(mainCard, popupDate, cardConfig) {
      if (!mainCard) return;
      const fixedDate = this._normalizePopupDate(popupDate);
      const dateValue = this._formatPopupDateValue(fixedDate);
      this._lockPopupInitialDate(mainCard, fixedDate);
      this._assignPopupDateToCard(mainCard, fixedDate, dateValue);
      this._ensurePopupMainCardDatePatch(mainCard);

      this._withForcedPopupDate(fixedDate, () => {
        this._assignPopupDateToCard(mainCard, fixedDate, dateValue);
        if (typeof mainCard.setConfig === "function") mainCard.setConfig(cardConfig);
        if (this._hass) mainCard.hass = this._hass;
        if (typeof mainCard.requestUpdate === "function") mainCard.requestUpdate();
        if (typeof mainCard._render === "function") mainCard._render();
      });
    }

    _schedulePopupDateResync(mainCard, popupDate, cardConfig) {
      if (!mainCard) return;
      if (this._popupDateSyncRaf) window.cancelAnimationFrame(this._popupDateSyncRaf);
      if (this._popupDateSyncTimer) clearTimeout(this._popupDateSyncTimer);

      const run = () => {
        if (mainCard !== this._cardPopupMainCard) return;
        if (!this._isPopupInitialDateLocked(mainCard)) return;
        this._applyPopupMainCardDate(mainCard, popupDate, cardConfig);
      };

      // Sửa các trường hợp thẻ block tự render lại trong microtask/animation frame sau khi được gắn DOM.
      queueMicrotask(run);
      this._popupDateSyncRaf = window.requestAnimationFrame(() => {
        this._popupDateSyncRaf = null;
        run();
      });
      this._popupDateSyncTimer = setTimeout(() => {
        this._popupDateSyncTimer = null;
        run();
      }, 60);
    }

    _showPopup(date) {
      this._openCalendarCardPopup(date);
    }

    _syncCardPopupTheme() {
      if (!this._cardPopupModal) return;
      if (this._hass && this._hass.themes && this._hass.themes.darkMode === false) {
        this._cardPopupModal.classList.add("is-light-theme");
      } else {
        this._cardPopupModal.classList.remove("is-light-theme");
      }
    }

    _ensureCalendarCardPopup() {
      if (this._cardPopupModal) return;
      if (!this.shadowRoot) this.attachShadow({ mode: "open" });

      const modal = document.createElement("div");
      modal.className = "wlc-card-popup-modal";
      modal.innerHTML = `
        <style>
          .wlc-card-popup-modal {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: none;
            align-items: center;
            justify-content: center;
            width: 100vw;
            height: 100vh;
          }
          .wlc-card-popup-overlay {
            position: absolute;
            inset: 0;
            background: transparent;
          }
          .wlc-card-popup-content {
            position: relative;
            width: 95%;
            max-width: 480px;
            max-height: 85vh;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            animation: wlcCardPopupIn 0.34s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          @keyframes wlcCardPopupIn {
            0% { opacity: 0; transform: scale(0.78) translateY(24px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .wlc-card-popup-content { animation: none !important; }
          }
          .wlc-card-popup-close {
            position: absolute;
            top: 15px;
            right: 15px;
            z-index: 3;
            width: 30px;
            height: 30px;
            border: none;
            border-radius: 50%;
            background: rgba(0,0,0,0.22);
            color: #ffffff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            line-height: 1;
            padding: 0;
          }
          .wlc-card-popup-container {
            max-height: 85vh;
            overflow-y: auto;
            background: var(--card-background-color);
            border-radius: 28px;
          }
          .wlc-card-popup-modal.is-light-theme .wlc-card-popup-container {
            background: rgba(0, 0, 0, 0.75) !important;
            --ha-card-background: transparent !important;
            --card-background-color: transparent !important;
            --paper-card-background-color: transparent !important;
            --primary-background-color: transparent !important;
            --secondary-background-color: transparent !important;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          .wlc-card-popup-message {
            padding: 28px 22px;
            color: var(--primary-text-color, #111);
            background: var(--card-background-color, #fff);
            font-family: var(--paper-font-body1_-_font-family, Roboto, Arial, sans-serif);
            line-height: 1.45;
          }
        </style>
        <div class="wlc-card-popup-overlay"></div>
        <div class="wlc-card-popup-content">
          <button class="wlc-card-popup-close" aria-label="Đóng">✕</button>
          <div class="wlc-card-popup-container"></div>
        </div>`;

      modal.querySelector(".wlc-card-popup-overlay").addEventListener("click", () => this._closeCalendarCardPopup());
      modal.querySelector(".wlc-card-popup-close").addEventListener("click", () => this._closeCalendarCardPopup());
      this.shadowRoot.appendChild(modal);
      this._cardPopupModal = modal;
      this._syncCardPopupTheme();
    }

    async _openCalendarCardPopup(date) {
      this._ensureCalendarCardPopup();
      const openToken = (this._cardPopupOpenToken || 0) + 1;
      this._cardPopupOpenToken = openToken;
      const container = this._cardPopupModal.querySelector(".wlc-card-popup-container");
      const popupDate = this._normalizePopupDate(date || new Date());
      const [dd, mm, yy] = solarArgs(popupDate);
      const dateValue = this._formatPopupDateValue(popupDate);
      const popupConfig = this._popupMainCardConfig(dateValue, dd, mm, yy);

      this._syncCardPopupTheme();
      this._cardPopupModal.style.display = "flex";

      if (!customElements.get(MAIN_BLOCK_CARD_TAG)) {
        container.innerHTML = `<div class="wlc-card-popup-message">Đang tải thẻ lịch block chính...</div>`;
      }

      const isReady = await ensureMainBlockCardLoaded();
      if (openToken !== this._cardPopupOpenToken) return;

      if (!isReady) {
        container.innerHTML = `<div class="wlc-card-popup-message">Chưa tải được thẻ <b>lich-block-am-duong-viet-nam</b>. Hãy kiểm tra file <b>lich-block-am-duong-viet-nam.js</b> có nằm cùng thư mục và được khai báo dưới dạng JavaScript module.</div>`;
        return;
      }

      if (!this._cardPopupMainCard) {
        this._withForcedPopupDate(popupDate, () => {
          this._cardPopupMainCard = document.createElement(MAIN_BLOCK_CARD_TAG);
          this._ensurePopupMainCardDatePatch(this._cardPopupMainCard);
          this._applyPopupMainCardDate(this._cardPopupMainCard, popupDate, popupConfig);
          container.replaceChildren(this._cardPopupMainCard);
        });
        this._schedulePopupDateResync(this._cardPopupMainCard, popupDate, popupConfig);
      } else {
        this._applyPopupMainCardDate(this._cardPopupMainCard, popupDate, popupConfig);
        if (!container.contains(this._cardPopupMainCard)) container.replaceChildren(this._cardPopupMainCard);
        this._schedulePopupDateResync(this._cardPopupMainCard, popupDate, popupConfig);
      }
    }

    _closeCalendarCardPopup() {
      if (this._popupDateSyncRaf) {
        window.cancelAnimationFrame(this._popupDateSyncRaf);
        this._popupDateSyncRaf = null;
      }
      if (this._popupDateSyncTimer) {
        clearTimeout(this._popupDateSyncTimer);
        this._popupDateSyncTimer = null;
      }
      this._releasePopupInitialDate(this._cardPopupMainCard);
      if (this._cardPopupModal) this._cardPopupModal.style.display = "none";
    }

    _cellHtml(date, offsetFromCenter) {
      const [dd, mm, yy] = solarArgs(date);
      const lunar = getLunarDate(dd, mm, yy);
      const dow = date.getDay();
      const isCenter = offsetFromCenter === 0;
      const isToday = sameSolarDate(date, new Date());
      const classNames = ["wlc-day"];
      if (isCenter) classNames.push("is-center");
      if (isToday) classNames.push("is-today");
      if (dow === 6) classNames.push("is-saturday");
      if (dow === 0) classNames.push("is-sunday");
      if (dow >= 1 && dow <= 5 && !isCenter && hasConfigValue(this.config, "normal_day_color")) classNames.push("is-normal");

      const centerTop = isCenter ? `<div class="wlc-month wlc-month-top" title="Bấm để xem chi tiết">${escapeHtml(solarMonthTitle(date))}</div>` : `<div class="wlc-month-spacer"></div>`;
      const lunarMonthName = lunarMonthTitle(lunar);
      const lunarMonthFitClass = lunarMonthName.length >= 12 ? " wlc-month-fit" : "";
      const centerBottom = isCenter ? `<div class="wlc-month wlc-month-bottom${lunarMonthFitClass}" title="Bấm để xem chi tiết">${escapeHtml(lunarMonthName)}</div>` : `<div class="wlc-month-spacer"></div>`;
      const title = `${TUAN[dow]}, ${dd}/${mm}/${yy} - Âm lịch ${lunar.day}/${lunar.month}${lunar.leap ? " nhuận" : ""}`;

      return `
        <button class="${classNames.join(" ")}" data-offset="${offsetFromCenter}" data-date="${this._formatPopupDateValue(date)}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">
          ${centerTop}
          <div class="wlc-weekday">${WEEKDAY_SHORT[dow]}</div>
          <div class="wlc-solar${dd === 1 ? " is-first-solar" : ""}${dd >= 10 ? " is-two-solar" : ""}">${formatSolarInWeekHtml(date)}</div>
          <span class="wlc-today-marker" aria-hidden="true"></span>
          <div class="wlc-lunar">${formatLunarInWeekHtml(lunar, isCenter)}</div>
          ${centerBottom}
        </button>`;
    }

    _render() {
      if (!this.card) return;
      this._lastTodayKey = this._todayKey();

      const center = this._centerDate();
      const centerLunar = getLunarDate(center.getDate(), center.getMonth() + 1, center.getFullYear());
      const days = [];
      for (let i = -3; i <= 3; i++) days.push(this._cellHtml(addDays(center, i), i));

      const styleVars = [
        `--wlc-text-color: ${cssValue(this.config, "text_color")}`,
        `--wlc-normal-day-color: ${cssValue(this.config, "normal_day_color", "text_color")}`,
        `--wlc-month-solar-color: ${cssValue(this.config, "month_solar_color")}`,
        `--wlc-month-lunar-color: ${cssValue(this.config, "month_lunar_color")}`,
        `--wlc-weekday-color: ${cssValue(this.config, "weekday_color")}`,
        `--wlc-solar-day-color: ${cssValue(this.config, "solar_day_color")}`,
        `--wlc-lunar-day-color: ${cssValue(this.config, "lunar_day_color")}`,
        `--wlc-center-text-color: ${cssValue(this.config, "center_text_color")}`,
        `--wlc-center-month-solar-color: ${cssValue(this.config, "center_month_solar_color", "center_text_color")}`,
        `--wlc-center-month-lunar-color: ${cssValue(this.config, "center_month_lunar_color", "center_text_color")}`,
        `--wlc-center-weekday-color: ${cssValue(this.config, "center_weekday_color", "center_text_color")}`,
        `--wlc-center-solar-day-color: ${cssValue(this.config, "center_solar_day_color", "center_text_color")}`,
        `--wlc-center-lunar-day-color: ${cssValue(this.config, "center_lunar_day_color", "center_text_color")}`,
        `--wlc-saturday-color: ${cssValue(this.config, "saturday_color")}`,
        `--wlc-sunday-color: ${cssValue(this.config, "sunday_color")}`,
        `--wlc-arrow-color: ${cssValue(this.config, "arrow_color")}`,
        `--wlc-arrow-bg: ${arrowBackgroundValue(this.config)}`,
        `--wlc-center-bg-opacity: ${clampNumber(this.config.center_background_opacity, 100, 0, 100) / 100}`,
        `--wlc-center-background: ${centerBackgroundValue(this.config)}`
      ].join(";");

      const detailText = `${solarMonthTitle(center)} - ${lunarMonthTitle(centerLunar)}`;

      this.card.innerHTML = `
        <style>
          :host {
            display: block;
            --wlc-text-color: #000000;
            --wlc-normal-day-color: #000000;
            --wlc-month-solar-color: #000000;
            --wlc-month-lunar-color: #000000;
            --wlc-weekday-color: #000000;
            --wlc-solar-day-color: #000000;
            --wlc-lunar-day-color: #000000;
            --wlc-center-text-color: #000000;
            --wlc-center-month-solar-color: #000000;
            --wlc-center-month-lunar-color: #000000;
            --wlc-center-weekday-color: #000000;
            --wlc-center-solar-day-color: #000000;
            --wlc-center-lunar-day-color: #000000;
            --wlc-saturday-color: #00a85a;
            --wlc-sunday-color: #ef1722;
            --wlc-arrow-color: #c7eaff;
            --wlc-arrow-bg: transparent;
            --wlc-center-bg-opacity: 1;
            --wlc-center-background: linear-gradient(180deg, rgba(229, 246, 255, 0.72), rgba(136, 191, 225, 0.82));
          }

          .wlc-shell {
            container-type: inline-size;
            width: 100%;
            box-sizing: border-box;
            overflow: hidden;
            border-radius: inherit;
            background: transparent;
            color: var(--wlc-text-color);
            font-family: Arial, Helvetica, sans-serif;
            user-select: none;
            touch-action: pan-y;
          }

          .wlc-row {
            position: relative;
            display: grid;
            grid-template-columns: clamp(8px, 2cqw, 18px) repeat(7, minmax(0, 1fr)) clamp(8px, 2cqw, 18px);
            align-items: stretch;
            width: 100%;
            min-width: 0;
            min-height: clamp(82px, 21.5cqw, 154px);
            box-sizing: border-box;
            padding: clamp(4px, 1.25cqw, 10px) clamp(0px, 0.35cqw, 4px);
            overflow: hidden;
          }

          .wlc-nav {
            min-width: 0;
            appearance: none;
            -webkit-appearance: none;
            border: 0;
            background: var(--wlc-arrow-bg);
            color: var(--wlc-arrow-color);
            cursor: pointer;
            border-radius: 8px;
            padding: 0;
            margin: 0;
            font-size: clamp(10px, 2.6cqw, 18px);
            line-height: 1;
            width: 100%;
            height: 100%;
            min-height: 100%;
            align-self: stretch;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.92;
            touch-action: manipulation;
            transition: transform 0.18s ease, opacity 0.18s ease, filter 0.18s ease;
          }

          .wlc-nav:hover,
          .wlc-nav:focus-visible {
            opacity: 1;
            transform: scale(1.06);
            filter: drop-shadow(0 0 4px rgba(126, 211, 255, 0.75));
            outline: none;
          }

          .wlc-today-reset {
            appearance: none;
            -webkit-appearance: none;
            position: absolute;
            top: clamp(3px, 0.9cqw, 8px);
            left: 57.14%;
            transform: translate(-50%, 0);
            z-index: 8;
            width: clamp(15px, 4.2cqw, 28px);
            height: clamp(15px, 4.2cqw, 28px);
            border-radius: 999px;
            border: max(1px, 0.11cqw) solid var(--wlc-arrow-color);
            background: var(--wlc-center-background);
            color: var(--wlc-arrow-color);
            box-shadow: 0 1px 4px rgba(0,0,0,0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            margin: clamp(1px, 0.38cqw, 4px) 0 0 0;
            font-size: clamp(9px, 2.55cqw, 16px);
            line-height: 1;
            font-weight: 700;
            cursor: pointer;
            opacity: 0.94;
          }

          .wlc-today-reset:hover,
          .wlc-today-reset:focus-visible {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.08);
            outline: none;
            filter: drop-shadow(0 0 4px color-mix(in srgb, var(--wlc-arrow-color) 60%, transparent));
          }

          .wlc-day {
            appearance: none;
            -webkit-appearance: none;
            border: 0;
            background: transparent;
            position: relative;
            overflow: hidden;
            min-width: 0;
            height: 100%;
            margin: 0;
            padding: 0 2px;
            color: var(--wlc-text-color);
            cursor: pointer;
            display: grid;
            grid-template-rows: minmax(clamp(7px, 2.05cqw, 16px), 1fr) auto auto clamp(4px, 0.95cqw, 8px) auto minmax(clamp(7px, 2.05cqw, 16px), 1fr);
            align-items: center;
            justify-items: center;
            align-content: center;
            row-gap: clamp(0px, 0.12cqw, 2px);
            border-radius: clamp(4px, 1.2cqw, 10px);
            transition: background 0.18s ease, transform 0.18s ease;
            font-family: inherit;
          }

          .wlc-day:hover,
          .wlc-day:focus-visible {
            outline: none;
            transform: translateY(-1px);
          }

          @media (prefers-reduced-motion: reduce) {
            .wlc-day, .wlc-nav, .wlc-today-reset { transition: none !important; animation: none !important; }
            .wlc-day:hover, .wlc-day:focus-visible { transform: none; }
          }

          .wlc-day.is-center::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 0;
            border-radius: inherit;
            background: var(--wlc-center-background);
            opacity: var(--wlc-center-bg-opacity);
            pointer-events: none;
          }

          .wlc-day.is-center::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 0;
            box-sizing: border-box;
            border-radius: inherit;
            border: max(1px, 0.12cqw) solid var(--wlc-arrow-color);
            opacity: 0.42;
            pointer-events: none;
          }

          .wlc-day > * {
            position: relative;
            z-index: 1;
          }

          .wlc-day.is-normal .wlc-weekday,
          .wlc-day.is-normal .wlc-solar,
          .wlc-day.is-normal .wlc-lunar {
            color: var(--wlc-normal-day-color);
          }

          .wlc-day.is-saturday .wlc-weekday,
          .wlc-day.is-saturday .wlc-solar,
          .wlc-day.is-saturday .wlc-lunar {
            color: var(--wlc-saturday-color);
          }

          .wlc-day.is-sunday .wlc-weekday,
          .wlc-day.is-sunday .wlc-solar,
          .wlc-day.is-sunday .wlc-lunar {
            color: var(--wlc-sunday-color);
          }

          .wlc-today-marker {
            width: clamp(12px, 34%, 34px);
            height: 1px;
            min-height: 1px;
            max-height: 1px;
            border-radius: 999px;
            background: var(--wlc-arrow-color);
            opacity: 0;
            align-self: center;
            justify-self: center;
            transform: scaleX(0.86);
            box-shadow: none;
            pointer-events: none;
          }

          .wlc-day.is-today:not(.is-center) .wlc-today-marker {
            opacity: 0.9;
            box-shadow: 0 0 3px color-mix(in srgb, var(--wlc-arrow-color) 72%, transparent);
          }

          .wlc-month,
          .wlc-month-spacer {
            max-width: 100%;
            overflow: hidden;
            text-overflow: clip;
            min-height: 1em;
            font-size: clamp(8px, 2.25cqw, 16px);
            line-height: 1.08;
            font-weight: 500;
            white-space: nowrap;
          }

          .wlc-month-top {
            color: var(--wlc-month-solar-color);
          }

          .wlc-month-bottom {
            color: var(--wlc-month-lunar-color);
          }

          .wlc-month-fit {
            font-size: clamp(5px, 1.55cqw, 12px);
            letter-spacing: -0.06em;
          }

          .wlc-day.is-center .wlc-month-top {
            margin-top: clamp(2px, 0.55cqw, 6px);
          }

          .wlc-day.is-center .wlc-month-bottom {
            margin-bottom: clamp(2px, 0.55cqw, 6px);
          }

          .wlc-weekday {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            color: var(--wlc-weekday-color);
            font-size: clamp(12px, 4.15cqw, 30px);
            line-height: 1.02;
            font-weight: 500;
            letter-spacing: -0.03em;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .wlc-solar {
            width: 100%;
            color: var(--wlc-solar-day-color);
            font-size: clamp(26px, 9.1cqw, 74px);
            line-height: 0.92;
            height: clamp(28px, 9.2cqw, 78px);
            font-weight: 400;
            letter-spacing: 0;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum" 1, "lnum" 1;
            max-width: 100%;
            min-width: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            overflow: visible;
          }

          .wlc-solar-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.22em;
            height: 1em;
            text-align: center;
            line-height: 0.92;
            transform: translateX(0);
          }

          .wlc-solar-first {
            display: inline-flex;
            align-items: flex-start;
            justify-content: center;
            max-width: 100%;
            min-width: 1.22em;
            line-height: 0.92;
            letter-spacing: 0;
          }

          .wlc-solar-main {
            display: inline-block;
          }

          .wlc-solar-month {
            display: inline-block;
            font-size: 0.34em;
            line-height: 1;
            letter-spacing: -0.02em;
            margin-left: 0.04em;
            margin-top: 0.12em;
            font-weight: 400;
          }

          .wlc-lunar {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow: visible;
            position: relative;
            color: var(--wlc-lunar-day-color);
            font-size: clamp(13px, 3.9cqw, 29px);
            line-height: 1.04;
            font-weight: 400;
            letter-spacing: -0.02em;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum" 1, "lnum" 1;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .wlc-lunar-text {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 1.3em;
            line-height: inherit;
          }

          .wlc-lunar-month-emoji {
            position: absolute;
            left: calc(50% + 1.62em);
            top: 0.02em;
            transform: none;
            font-size: 0.42em;
            line-height: 1;
            pointer-events: none;
          }

          .wlc-day.is-center {
            color: var(--wlc-center-text-color);
            padding-top: clamp(3px, 0.9cqw, 8px);
            padding-bottom: clamp(3px, 0.9cqw, 8px);
          }

          .wlc-day.is-center .wlc-month-top {
            color: var(--wlc-center-month-solar-color);
          }

          .wlc-day.is-center .wlc-month-bottom {
            color: var(--wlc-center-month-lunar-color);
          }

          .wlc-day.is-center .wlc-weekday {
            color: var(--wlc-center-weekday-color);
          }

          .wlc-day.is-center .wlc-solar {
            color: var(--wlc-center-solar-day-color);
          }

          .wlc-day.is-center .wlc-lunar {
            color: var(--wlc-center-lunar-day-color);
          }

          .wlc-day.is-center.is-saturday .wlc-weekday,
          .wlc-day.is-center.is-saturday .wlc-solar,
          .wlc-day.is-center.is-saturday .wlc-lunar {
            color: var(--wlc-saturday-color);
          }

          .wlc-day.is-center.is-sunday .wlc-weekday,
          .wlc-day.is-center.is-sunday .wlc-solar,
          .wlc-day.is-center.is-sunday .wlc-lunar {
            color: var(--wlc-sunday-color);
          }

          .wlc-day.is-center .wlc-weekday,
          .wlc-day.is-center .wlc-solar,
          .wlc-day.is-center .wlc-lunar {
            font-weight: 800;
          }

          .wlc-day.is-center .wlc-solar {
            font-size: clamp(30px, 9.8cqw, 82px);
            height: clamp(32px, 9.9cqw, 84px);
          }

          @container (max-width: 420px) {
            .wlc-row {
              grid-template-columns: clamp(3px, 1.25cqw, 8px) repeat(7, minmax(0, 1fr)) clamp(3px, 1.25cqw, 8px);
              min-height: clamp(70px, 22cqw, 94px);
              padding-left: 0;
              padding-right: 0;
            }
            .wlc-day {
              padding: 0 1px;
              grid-template-rows: minmax(clamp(5px, 1.9cqw, 10px), 1fr) auto auto clamp(4px, 0.9cqw, 6px) auto minmax(clamp(5px, 1.9cqw, 10px), 1fr);
              row-gap: 0;
            }
            .wlc-day.is-center {
              padding-top: clamp(2px, 0.7cqw, 5px);
              padding-bottom: clamp(2px, 0.7cqw, 5px);
            }
            .wlc-weekday { font-size: clamp(10px, 3.95cqw, 17px); }
            .wlc-solar { font-size: clamp(22px, 8.45cqw, 38px); height: clamp(24px, 8.55cqw, 40px); letter-spacing: 0; }
            .wlc-day.is-center .wlc-solar { font-size: clamp(25px, 9.05cqw, 42px); height: clamp(27px, 9.15cqw, 44px); }
            .wlc-solar-number, .wlc-solar-first { width: 1.22em; min-width: 1.22em; }
            .wlc-today-marker { height: 1px; max-height: 1px; width: clamp(12px, 34%, 24px); }
            .wlc-lunar { font-size: clamp(11px, 3.7cqw, 17px); }
            .wlc-month,
            .wlc-month-spacer { font-size: clamp(7px, 2.25cqw, 10px); }
            .wlc-month-fit { font-size: clamp(5px, 1.55cqw, 8px); letter-spacing: -0.07em; }
            .wlc-day.is-center .wlc-month-top { margin-top: clamp(1px, 0.35cqw, 3px); }
            .wlc-day.is-center .wlc-month-bottom { margin-bottom: clamp(1px, 0.35cqw, 3px); }
            .wlc-nav { font-size: clamp(9px, 2.5cqw, 14px); border-radius: 6px; }
            .wlc-today-reset { width: clamp(14px, 4.3cqw, 20px); height: clamp(14px, 4.3cqw, 20px); font-size: clamp(8px, 2.5cqw, 12px); }
          }

          @container (max-width: 300px) {
            .wlc-row {
              grid-template-columns: 3px repeat(7, minmax(0, 1fr)) 3px;
              min-height: 64px;
            }
            .wlc-day { padding: 0; }
            .wlc-month,
            .wlc-month-spacer { font-size: 7px; }
            .wlc-month-fit { font-size: 5px; letter-spacing: -0.08em; }
            .wlc-day.is-center .wlc-month-top { margin-top: 1px; }
            .wlc-day.is-center .wlc-month-bottom { margin-bottom: 1px; }
            .wlc-weekday { font-size: 10px; }
            .wlc-solar { font-size: clamp(18px, 7.8cqw, 24px); height: clamp(20px, 8cqw, 26px); }
            .wlc-day.is-center .wlc-solar { font-size: clamp(20px, 8.4cqw, 27px); height: clamp(22px, 8.6cqw, 29px); }
            .wlc-solar-number, .wlc-solar-first { width: 1.22em; min-width: 1.22em; }
            .wlc-today-marker { height: 1px; max-height: 1px; width: 34%; }
            .wlc-lunar { font-size: 10px; }
            .wlc-nav { font-size: 9px; }
            .wlc-today-reset { width: 13px; height: 13px; font-size: 8px; }
          }
        </style>

        <div class="wlc-shell" style="${styleVars}" title="${escapeHtml(detailText)}">
          <div class="wlc-row">
            <button class="wlc-nav wlc-prev" aria-label="Lùi 1 tuần">◀</button>
            ${days.join("")}
            ${this._offsetDays !== 0 ? `<button class="wlc-today-reset" title="Quay về hôm nay" aria-label="Quay về hôm nay">↺</button>` : ""}
            <button class="wlc-nav wlc-next" aria-label="Tiến 1 tuần">▶</button>
          </div>
        </div>`;

      const prev = this.card.querySelector(".wlc-prev");
      const next = this.card.querySelector(".wlc-next");
      const resetToday = this.card.querySelector(".wlc-today-reset");
      if (prev) prev.addEventListener("click", (event) => {
        event.stopPropagation();
        this._navigateWeeks(-1);
      });
      if (next) next.addEventListener("click", (event) => {
        event.stopPropagation();
        this._navigateWeeks(1);
      });
      if (resetToday) resetToday.addEventListener("click", (event) => {
        event.stopPropagation();
        this._offsetDays = 0;
        this._render();
      });

      const swipeShell = this.card.querySelector(".wlc-shell");
      if (swipeShell) {
        swipeShell.addEventListener("click", (event) => {
          if (Date.now() < this._suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
          }
        }, true);
        swipeShell.addEventListener("pointerdown", (event) => this._onSwipePointerDown(event));
        swipeShell.addEventListener("pointermove", (event) => this._onSwipePointerMove(event));
        swipeShell.addEventListener("pointerup", (event) => this._onSwipePointerUp(event));
        swipeShell.addEventListener("pointercancel", (event) => this._onSwipePointerCancel(event));
      }

      this.card.querySelectorAll(".wlc-day").forEach((el) => {
        const open = () => {
          const popupDate = this._parsePopupDateValue(el.dataset.date) || addDays(center, Number(el.dataset.offset || 0));
          this._showPopup(popupDate);
        };
        el.addEventListener("click", (event) => {
          if (Date.now() < this._suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          open();
        });
        el.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        });
      });
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
    if (!customElements.get(WEEKLY_EDITOR_TAG)) {
      customElements.define(WEEKLY_EDITOR_TAG, WeeklyLunarCalendarCardEditor);
    }

    if (!customElements.get(WEEKLY_CARD_TAG)) {
      customElements.define(WEEKLY_CARD_TAG, WeeklyLunarCalendarCard);
    }

    const weeklyCardDescriptor = {
      type: WEEKLY_CARD_TAG,
      name: WEEKLY_CARD_NAME,
      description: "Thẻ tuần Âm Dương Việt Nam: hôm nay ở giữa, mũi tên hoặc kéo ngang để tiến/lùi từng tuần, bấm ngày để xem popup chi tiết, có trình chỉnh màu trong UI.",
      documentationURL: "https://github.com/khaisilk1910/am-lich-viet-nam",
      preview: true,
      // Thẻ này không gắn với entity cụ thể, nên không tự gợi ý trong picker theo entity để tránh làm rối UI Home Assistant 2026.6+.
      getEntitySuggestion: () => null
    };
    window.customCards = window.customCards || [];
    const existingWeeklyCard = window.customCards.find((card) => card && card.type === WEEKLY_CARD_TAG);
    if (existingWeeklyCard) Object.assign(existingWeeklyCard, weeklyCardDescriptor);
    else window.customCards.push(weeklyCardDescriptor);
  });

  // Truyền lõi tính toán cho popup dùng chung với thẻ lịch block âm dương.
  initPopupCore(getLichAmDuongHelpers());

})();
