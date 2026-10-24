// ==========================================
// LUNAR CALENDAR FLOATING SVG BUBBLE
// Custom card: lich-am-duong-bubble
// ==========================================

import { getSvgItemCount, loadSvgItem, svg_12congiap_names, svg_12congiap_viewboxes } from './lich-block-am-duong-viet-nam-bubble-data.js?v=20261005';
import { getLichAmDuongHelpers } from './lich-am-duong-viet-nam-core.js?v=20261005';
import { getLichAmDuongTodayInfo, initPopupCore } from './lich-block-am-duong-viet-nam-popup.js?v=20261005';

const SVG_COUNT = getSvgItemCount();
const SVG_NAMES = Array.isArray(svg_12congiap_names) ? svg_12congiap_names : [];
const SVG_VIEWBOXES = Array.isArray(svg_12congiap_viewboxes) ? svg_12congiap_viewboxes : [];
const HA_LICH_AM_DUONG_HELPERS = getLichAmDuongHelpers();
initPopupCore(HA_LICH_AM_DUONG_HELPERS);

const MAIN_BLOCK_CARD_TAG = 'lich-block-am-duong-viet-nam';
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

function formatDateValueForMainBlock(date = new Date()) {
    const fixed = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yyyy = fixed.getFullYear();
    const mm = String(fixed.getMonth() + 1).padStart(2, '0');
    const dd = String(fixed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

const CHAT_FONT_OPTIONS = [
    { value: 'system', label: 'Hiện đại / System', family: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    { value: 'segoe', label: 'Segoe UI mềm mại', family: '"Segoe UI", Arial, sans-serif' },
    { value: 'arial', label: 'Arial rõ nét', family: 'Arial, Helvetica, sans-serif' },
    { value: 'verdana', label: 'Verdana dễ đọc', family: 'Verdana, Geneva, sans-serif' },
    { value: 'tahoma', label: 'Tahoma gọn gàng', family: 'Tahoma, Geneva, sans-serif' },
    { value: 'trebuchet', label: 'Trebuchet MS hiện đại', family: '"Trebuchet MS", Arial, sans-serif' },
    { value: 'georgia', label: 'Georgia sang trọng', family: 'Georgia, "Times New Roman", serif' },
    { value: 'times', label: 'Times New Roman cổ điển', family: '"Times New Roman", Times, serif' },
    { value: 'courier', label: 'Courier New công nghệ', family: '"Courier New", Courier, monospace' },
    { value: 'comic', label: 'Comic Sans vui vẻ', family: '"Comic Sans MS", "Comic Sans", cursive' }
];

const CHAT_FONT_MAP = CHAT_FONT_OPTIONS.reduce((acc, item) => {
    acc[item.value] = item.family;
    return acc;
}, {});


const CHAT_STYLE_OPTIONS = [
    {
        value: 'glass_light',
        label: 'K\u00ednh tr\u1eafng hi\u1ec7n \u0111\u1ea1i',
        background: 'linear-gradient(135deg, CHAT_BG 0%, rgba(255,255,255,0.74) 100%)',
        border: 'rgba(255,255,255,0.82)',
        shadow: '0 18px 44px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.54)',
        rowBg: 'rgba(255,255,255,0.28)',
        rowBorder: 'rgba(255,255,255,0.26)',
        headerBg: 'rgba(255,255,255,0.34)',
        iconBg: 'rgba(255,255,255,0.58)',
        iconColor: 'inherit',
        beforeBg: 'linear-gradient(135deg, rgba(255,255,255,0.42), rgba(255,255,255,0.04))',
        accent: 'rgba(59,130,246,0.18)'
    },
    {
        value: 'rose_soft',
        label: 'H\u1ed3ng pastel d\u1ecbu m\u1eaft',
        background: 'linear-gradient(135deg, rgba(255,228,230,0.95), CHAT_BG 58%, rgba(254,205,211,0.82))',
        border: 'rgba(255,255,255,0.68)',
        shadow: '0 20px 46px rgba(190,24,93,0.18), inset 0 1px 0 rgba(255,255,255,0.48)',
        rowBg: 'rgba(255,255,255,0.30)',
        rowBorder: 'rgba(255,255,255,0.22)',
        headerBg: 'linear-gradient(135deg, rgba(255,255,255,0.44), rgba(251,113,133,0.14))',
        iconBg: 'rgba(255,255,255,0.62)',
        iconColor: 'inherit',
        beforeBg: 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.52), transparent 42%)',
        accent: 'rgba(244,63,94,0.22)'
    },
    {
        value: 'sky_blue',
        label: 'Xanh b\u1ea7u tr\u1eddi glass',
        background: 'linear-gradient(135deg, rgba(224,242,254,0.94), CHAT_BG 52%, rgba(186,230,253,0.82))',
        border: 'rgba(125,211,252,0.44)',
        shadow: '0 20px 48px rgba(14,165,233,0.20), inset 0 1px 0 rgba(255,255,255,0.50)',
        rowBg: 'rgba(255,255,255,0.30)',
        rowBorder: 'rgba(125,211,252,0.22)',
        headerBg: 'linear-gradient(135deg, rgba(255,255,255,0.46), rgba(56,189,248,0.16))',
        iconBg: 'rgba(255,255,255,0.62)',
        iconColor: 'inherit',
        beforeBg: 'linear-gradient(160deg, rgba(255,255,255,0.48), rgba(56,189,248,0.08))',
        accent: 'rgba(14,165,233,0.22)'
    },
    {
        value: 'midnight_neon',
        label: 'T\u1ed1i neon n\u1ed5i b\u1eadt',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))',
        border: 'rgba(129,140,248,0.58)',
        shadow: '0 22px 56px rgba(30,41,59,0.38), 0 0 22px rgba(129,140,248,0.24)',
        rowBg: 'rgba(255,255,255,0.08)',
        rowBorder: 'rgba(255,255,255,0.10)',
        headerBg: 'linear-gradient(135deg, rgba(129,140,248,0.24), rgba(34,211,238,0.12))',
        iconBg: 'rgba(255,255,255,0.12)',
        iconColor: '#f8fafc',
        beforeBg: 'radial-gradient(circle at 18% 0%, rgba(129,140,248,0.28), transparent 38%)',
        accent: 'rgba(129,140,248,0.32)'
    },
    {
        value: 'sunset_orange',
        label: 'Ho\u00e0ng h\u00f4n cam \u1ea5m',
        background: 'linear-gradient(135deg, rgba(255,237,213,0.96), rgba(254,215,170,0.90), CHAT_BG)',
        border: 'rgba(253,186,116,0.50)',
        shadow: '0 22px 48px rgba(249,115,22,0.20), inset 0 1px 0 rgba(255,255,255,0.52)',
        rowBg: 'rgba(255,255,255,0.30)',
        rowBorder: 'rgba(251,146,60,0.18)',
        headerBg: 'linear-gradient(135deg, rgba(255,255,255,0.46), rgba(251,146,60,0.14))',
        iconBg: 'rgba(255,255,255,0.64)',
        iconColor: 'inherit',
        beforeBg: 'radial-gradient(circle at 15% 0%, rgba(255,255,255,0.50), transparent 42%)',
        accent: 'rgba(249,115,22,0.22)'
    },
    {
        value: 'mint_fresh',
        label: 'Xanh mint trong tr\u1ebb',
        background: 'linear-gradient(135deg, rgba(220,252,231,0.95), rgba(187,247,208,0.84), CHAT_BG)',
        border: 'rgba(74,222,128,0.38)',
        shadow: '0 20px 46px rgba(34,197,94,0.18), inset 0 1px 0 rgba(255,255,255,0.52)',
        rowBg: 'rgba(255,255,255,0.30)',
        rowBorder: 'rgba(74,222,128,0.20)',
        headerBg: 'linear-gradient(135deg, rgba(255,255,255,0.48), rgba(74,222,128,0.14))',
        iconBg: 'rgba(255,255,255,0.62)',
        iconColor: 'inherit',
        beforeBg: 'linear-gradient(145deg, rgba(255,255,255,0.44), rgba(74,222,128,0.08))',
        accent: 'rgba(34,197,94,0.22)'
    },
    {
        value: 'royal_purple',
        label: 'T\u00edm royal sang tr\u1ecdng',
        background: 'linear-gradient(135deg, rgba(250,245,255,0.94), rgba(233,213,255,0.86), CHAT_BG)',
        border: 'rgba(192,132,252,0.46)',
        shadow: '0 22px 54px rgba(147,51,234,0.20), inset 0 1px 0 rgba(255,255,255,0.50)',
        rowBg: 'rgba(255,255,255,0.28)',
        rowBorder: 'rgba(192,132,252,0.20)',
        headerBg: 'linear-gradient(135deg, rgba(255,255,255,0.46), rgba(168,85,247,0.16))',
        iconBg: 'rgba(255,255,255,0.62)',
        iconColor: 'inherit',
        beforeBg: 'radial-gradient(circle at 18% 0%, rgba(255,255,255,0.52), transparent 40%)',
        accent: 'rgba(147,51,234,0.22)'
    },
    {
        value: 'clean_card',
        label: 'T\u1ed1i gi\u1ea3n card s\u1ea1ch',
        background: 'CHAT_BG',
        border: 'rgba(226,232,240,0.90)',
        shadow: '0 14px 36px rgba(15,23,42,0.16), inset 0 1px 0 rgba(255,255,255,0.52)',
        rowBg: 'rgba(248,250,252,0.74)',
        rowBorder: 'rgba(226,232,240,0.74)',
        headerBg: 'rgba(248,250,252,0.82)',
        iconBg: 'rgba(255,255,255,0.92)',
        iconColor: 'inherit',
        beforeBg: 'linear-gradient(135deg, rgba(255,255,255,0.22), transparent)',
        accent: 'rgba(100,116,139,0.12)'
    },
    {
        value: 'bubble_cute',
        label: 'Bong b\u00f3ng cute vui v\u1ebb',
        background: 'linear-gradient(135deg, rgba(254,243,199,0.96), rgba(252,231,243,0.92), CHAT_BG)',
        border: 'rgba(255,255,255,0.78)',
        shadow: '0 22px 48px rgba(236,72,153,0.16), 0 8px 20px rgba(251,191,36,0.14)',
        rowBg: 'rgba(255,255,255,0.38)',
        rowBorder: 'rgba(255,255,255,0.32)',
        headerBg: 'linear-gradient(135deg, rgba(255,255,255,0.54), rgba(251,191,36,0.14))',
        iconBg: 'rgba(255,255,255,0.72)',
        iconColor: 'inherit',
        beforeBg: 'radial-gradient(circle at 16% 12%, rgba(255,255,255,0.60), transparent 36%)',
        accent: 'rgba(236,72,153,0.20)'
    },
    {
        value: 'crystal_aqua',
        label: 'Pha l\u00ea aqua cao c\u1ea5p',
        background: 'linear-gradient(135deg, rgba(236,254,255,0.94), rgba(207,250,254,0.78), CHAT_BG)',
        border: 'rgba(103,232,249,0.48)',
        shadow: '0 24px 58px rgba(6,182,212,0.18), inset 0 1px 0 rgba(255,255,255,0.58)',
        rowBg: 'rgba(255,255,255,0.26)',
        rowBorder: 'rgba(103,232,249,0.20)',
        headerBg: 'linear-gradient(135deg, rgba(255,255,255,0.50), rgba(34,211,238,0.14))',
        iconBg: 'rgba(255,255,255,0.62)',
        iconColor: 'inherit',
        beforeBg: 'linear-gradient(120deg, rgba(255,255,255,0.50), rgba(255,255,255,0.06) 36%, rgba(34,211,238,0.08))',
        accent: 'rgba(6,182,212,0.22)'
    }
];

const CHAT_STYLE_MAP = CHAT_STYLE_OPTIONS.reduce((acc, item) => {
    acc[item.value] = item;
    return acc;
}, {});

// One preset per SVG. The card still falls back to automatic placement if a new SVG is added.
const CHAT_PLACEMENTS = [
    { left: '-238px', top: '8px', tail: 'right', origin: 'right top' },
    { left: '-232px', top: '4px', tail: 'right', origin: 'right top' },
    { left: '-232px', top: '0px', tail: 'right', origin: 'right top' },
    { left: '-225px', top: '4px', tail: 'right', origin: 'right top' },
    { left: '-220px', top: '-2px', tail: 'right', origin: 'right top' },
    { left: '-232px', top: '0px', tail: 'right', origin: 'right top' },
    { left: '-246px', top: '18px', tail: 'right', origin: 'right top' },
    { left: '-238px', top: '18px', tail: 'right', origin: 'right top' },
    { left: '50%', top: '-106px', tail: 'bottom', origin: 'center bottom', x: '-50%' },
    { left: '50%', top: '-106px', tail: 'bottom', origin: 'center bottom', x: '-50%' },
    { left: '-238px', top: '10px', tail: 'right', origin: 'right top' },
    { left: '-248px', top: '12px', tail: 'right', origin: 'right top' },
    { left: '-248px', top: '12px', tail: 'right', origin: 'right top' },
    { left: '-235px', top: '16px', tail: 'right', origin: 'right top' },
    { left: '-238px', top: '8px', tail: 'right', origin: 'right top' },
    { left: '-245px', top: '18px', tail: 'right', origin: 'right top' },
    { left: '-246px', top: '20px', tail: 'right', origin: 'right top' },
    { left: '50%', top: '-114px', tail: 'bottom', origin: 'center bottom', x: '-50%' },
    { left: '50%', top: '-114px', tail: 'bottom', origin: 'center bottom', x: '-50%' },
    { left: '-246px', top: '12px', tail: 'right', origin: 'right top' },
    { left: '-246px', top: '10px', tail: 'right', origin: 'right top' },
    { left: '-240px', top: '18px', tail: 'right', origin: 'right top' },
    { left: '-240px', top: '18px', tail: 'right', origin: 'right top' },
    { left: '-244px', top: '10px', tail: 'right', origin: 'right top' },
    { left: '-244px', top: '10px', tail: 'right', origin: 'right top' },
    { left: '-238px', top: '12px', tail: 'right', origin: 'right top' },
    { left: '-238px', top: '12px', tail: 'right', origin: 'right top' }
];

class LunarCalendarBubbleCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._greetingTimer = null;
        this._greetingHideTimer = null;
        this._greetingRepeatTimer = null;
        this._typingTimers = [];
        this._isTypingGreeting = false;
        this._isHovering = false;
        this._isTouchHolding = false;
        this._touchHoldTimer = null;
        this._didLongPress = false;
        this._suppressNextClick = false;
        this._systemMonitorPinned = false;
        this._systemMonitorCycleIndex = 0;
        this._systemMonitorCycleTimer = null;
        this._systemMonitorCycleAppliedIndex = -1;
        this._resizeHandler = null;
        this._placementRaf = null;
        this._systemMonitorUpdateRaf = null;
        this._systemMonitorStateSignature = '';
        this._lastThemeDarkMode = undefined;
        this._lastDateKey = '';
        this._selectedSvg = '';
        this._selectedSvgIndex = -1;
        this._svgLoadToken = 0;
        this._documentVisibilityHandler = null;
        this._intersectionObserver = null;
        this._isPageVisible = !document.hidden;
        this._isIntersecting = true;
    }

    connectedCallback() {
        this.attachVisibilityHandlers();
        this.setupVisibilityObserver();
    }

    static getStubConfig() {
        return {
            position: 'bottom-right',
            offset_x: 20,
            offset_y: 200,
            svg_style: 0,
            svg_size: 80,
            greeting_enabled: true,
            greeting_delay: 850,
            greeting_timeout: 15000,
            greeting_timeout_s: 15,
            greeting_repeat_enabled: false,
            greeting_user: '',
            chat_width: 245,
            chat_bg_color: '#ffffff',
            chat_bg_opacity: 0.96,
            chat_font_family: 'system',
            chat_style: 'glass_light',
            chat_text_color: '#111827',
            chat_border_color: '#ffffff',
            chat_shadow_opacity: 0.22,
            animation_type: 'float',
            compact_mode: false,
            bg_color: '#ffffff',
            bg_opacity: 0.9,
            color_primary: '#03a9f4',
            color_secondary: '#757575',
            border_width: 2,
            border_color: '#03a9f4',
            border_opacity: 0.8,
            shadow_color: '#000000',
            shadow_opacity: 0.3,
            shadow_size: 15,
            divider_color: '#388e3c',
            divider_thickness: 1.5,
            system_monitor_enabled: true,
            system_monitor_button_enabled: true,
            system_monitor_hover_enabled: true,
            system_monitor_initial_visible: true,
            system_monitor_cycle_enabled: true,
            system_monitor_cycle_seconds: 3,
            system_monitor_display_style: 'ring',
            system_monitor_temp_max: 100,
            system_sensor_cpu: 'sensor.system_monitor_processor_use',
            system_sensor_ram: 'sensor.system_monitor_memory_usage',
            system_sensor_temp: 'sensor.system_monitor_processor_temperature',
            system_sensor_disk: 'sensor.system_monitor_disk_usage'
        };
    }

    static getConfigElement() {
        return document.createElement('lich-am-duong-bubble-editor');
    }

    getCardSize() {
        return 1;
    }

    getGridOptions() {
        return {
            rows: 1,
            columns: 3,
            min_rows: 1,
            max_rows: 1,
            min_columns: 3,
            max_columns: 3
        };
    }

    setConfig(config) {
        if (!config || typeof config !== 'object' || Array.isArray(config)) {
            throw new Error('Cấu hình của lich-am-duong-bubble phải là một object YAML hợp lệ.');
        }
        const mergedConfig = { ...LunarCalendarBubbleCard.getStubConfig(), ...config };
        if (config.greeting_timeout_s === undefined && config.greeting_timeout !== undefined) {
            const legacyTimeout = Number(config.greeting_timeout) || 0;
            mergedConfig.greeting_timeout_s = legacyTimeout > 120 ? Math.round(legacyTimeout / 1000) : legacyTimeout;
        }
        mergedConfig.system_monitor_cycle_seconds = this.clamp(Number(mergedConfig.system_monitor_cycle_seconds) || 3, 0.5, 120);
        mergedConfig.system_monitor_display_style = ['ring', 'bar'].includes(mergedConfig.system_monitor_display_style) ? mergedConfig.system_monitor_display_style : 'ring';
        this.config = mergedConfig;
        this._systemMonitorPinned = !!mergedConfig.system_monitor_initial_visible;
        this._systemMonitorCycleIndex = 0;
        this._systemMonitorCycleAppliedIndex = -1;
        this._systemMonitorStateSignature = '';
        this._lastDateKey = '';
        const selectedIndex = this.getSelectedSvgIndex();
        if (selectedIndex !== this._selectedSvgIndex) {
            this._selectedSvgIndex = selectedIndex;
            this._selectedSvg = '';
        }
        this.render();
        this.loadSelectedSvg();
    }

    set hass(hass) {
        this._hass = hass;
        if (this.mainCard) this.mainCard.hass = hass;
        this.updateDates();

        const monitorSignature = this.getSystemMonitorStateSignature();
        if (monitorSignature !== this._systemMonitorStateSignature) {
            this._systemMonitorStateSignature = monitorSignature;
            this.requestSystemMonitorUpdate();
        }


        const modal = this.shadowRoot.getElementById('modal');
        const darkMode = hass?.themes?.darkMode;
        if (modal && darkMode !== this._lastThemeDarkMode) {
            this._lastThemeDarkMode = darkMode;
            if (darkMode === false) {
                modal.classList.add('is-light-theme');
            } else {
                modal.classList.remove('is-light-theme');
            }
        }
    }

    disconnectedCallback() {
        window.clearTimeout(this._greetingTimer);
        window.clearTimeout(this._greetingHideTimer);
        window.clearTimeout(this._greetingRepeatTimer);
        window.clearTimeout(this._touchHoldTimer);
        this.stopSystemMonitorCycle();
        this.clearTypingTimers();
        if (this._resizeHandler) {
            window.removeEventListener('resize', this._resizeHandler);
            this._resizeHandler = null;
        }
        if (this._placementRaf) {
            window.cancelAnimationFrame(this._placementRaf);
            this._placementRaf = null;
        }
        if (this._systemMonitorUpdateRaf) {
            window.cancelAnimationFrame(this._systemMonitorUpdateRaf);
            this._systemMonitorUpdateRaf = null;
        }
        if (this._documentVisibilityHandler) {
            document.removeEventListener('visibilitychange', this._documentVisibilityHandler);
            this._documentVisibilityHandler = null;
        }
        if (this._intersectionObserver) {
            this._intersectionObserver.disconnect();
            this._intersectionObserver = null;
        }
    }

    attachVisibilityHandlers() {
        if (!this._documentVisibilityHandler) {
            this._documentVisibilityHandler = () => {
                this._isPageVisible = !document.hidden;
                this.applyVisibilityState();
            };
            document.addEventListener('visibilitychange', this._documentVisibilityHandler, { passive: true });
        }
        this._isPageVisible = !document.hidden;
        this.applyVisibilityState();
    }

    setupVisibilityObserver() {
        if (this._intersectionObserver) this._intersectionObserver.disconnect();
        const target = this.shadowRoot?.getElementById('wrapper');
        if (!target || typeof IntersectionObserver === 'undefined') {
            this._isIntersecting = true;
            return;
        }
        this._intersectionObserver = new IntersectionObserver((entries) => {
            this._isIntersecting = entries.some((entry) => entry.isIntersecting);
            this.applyVisibilityState();
        }, { rootMargin: '80px' });
        this._intersectionObserver.observe(target);
    }

    isCardActive() {
        return this.isConnected && this._isPageVisible && this._isIntersecting;
    }

    applyVisibilityState() {
        const active = this.isCardActive();
        this.toggleAttribute('data-paused', !active);
        if (!active) {
            this.stopSystemMonitorCycle();
            window.clearTimeout(this._greetingTimer);
            window.clearTimeout(this._greetingHideTimer);
            window.clearTimeout(this._greetingRepeatTimer);
            this.clearTypingTimers();
            return;
        }
        this.requestSystemMonitorUpdate();
        this.startSystemMonitorCycle();
    }

    async loadSelectedSvg() {
        const index = this.getSelectedSvgIndex();
        const token = ++this._svgLoadToken;
        try {
            const svg = this.sanitizeSvg(await loadSvgItem(index));
            if (token !== this._svgLoadToken || index !== this.getSelectedSvgIndex()) return;
            this._selectedSvgIndex = index;
            this._selectedSvg = svg;
            const avatar = this.shadowRoot?.getElementById('svgAvatar');
            if (avatar) avatar.innerHTML = svg;
            this.requestChatPlacementUpdate();
        } catch (error) {
            console.warn('Không thể tải SVG bubble:', error);
        }
    }

    getRGBA(hex, opacity) {
        const safeHex = /^#[0-9a-fA-F]{6}$/.test(hex || '') ? hex : '#000000';
        const r = parseInt(safeHex.slice(1, 3), 16) || 0;
        const g = parseInt(safeHex.slice(3, 5), 16) || 0;
        const b = parseInt(safeHex.slice(5, 7), 16) || 0;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    sanitizeSvg(svg) {
        return String(svg || '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/\son\w+=("[^"]*"|'[^']*')/gi, '')
            .replace(/javascript:/gi, '');
    }

    getSelectedSvgIndex() {
        const count = SVG_COUNT || 1;
        const parsed = Number.parseInt(this.config.svg_style, 10);
        if (Number.isNaN(parsed)) return 0;
        return Math.max(0, Math.min(count - 1, parsed));
    }

    getSvgViewBox(index) {
        const box = SVG_VIEWBOXES[index];
        return {
            width: Math.abs(Number(box?.width)) || 1,
            height: Math.abs(Number(box?.height)) || 1
        };
    }

    getChatPlacement(index) {
        const preset = CHAT_PLACEMENTS[index];
        if (preset) return { x: '0px', y: '0px', ...preset };

        const box = this.getSvgViewBox(index);
        const ratio = box.width / box.height;
        if (ratio > 1.15) {
            return { left: '50%', top: '-108px', tail: 'bottom', origin: 'center bottom', x: '-50%', y: '0px' };
        }
        return { left: '-238px', top: '10px', tail: 'right', origin: 'right top', x: '0px', y: '0px' };
    }

    getCanChi(year) {
        if (!year || Number.isNaN(year)) return '';
        const cans = ['Canh', 'T\u00e2n', 'Nh\u00e2m', 'Qu\u00fd', 'Gi\u00e1p', '\u1ea4t', 'B\u00ednh', '\u0110inh', 'M\u1eadu', 'K\u1ef7'];
        const chis = ['Th\u00e2n', 'D\u1eadu', 'Tu\u1ea5t', 'H\u1ee3i', 'T\u00fd', 'S\u1eedu', 'D\u1ea7n', 'M\u00e3o', 'Th\u00ecn', 'T\u1ef5', 'Ng\u1ecd', 'M\u00f9i'];
        const can = cans[year % 10];
        const chi = chis[year % 12];
        return `${can} ${chi}`;
    }

    getDateInfo() {
        try {
            const exactInfo = getLichAmDuongTodayInfo(HA_LICH_AM_DUONG_HELPERS);
            if (exactInfo && exactInfo.solarLine && exactInfo.lunarLine) {
                return {
                    solarLine: exactInfo.solarLine,
                    lunarLine: exactInfo.lunarLine,
                    source: exactInfo.source || 'popup_today'
                };
            }
        } catch (err) {
            console.warn('Cannot calculate Vietnamese lunar date from popup module:', err);
        }

        return {
            solarLine: '-- - -- - ----',
            lunarLine: '-- Tháng --',
            source: 'unavailable'
        };
    }

    getGreetingName() {
        const configured = String(this.config.greeting_user || '').trim();
        if (configured) return configured;
        return this._hass?.user?.name || this._hass?.user?.displayName || 'b\u1ea1n';
    }

    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    getPx(value, fallback = 0) {
        const parsed = Number.parseFloat(String(value || '').replace('px', ''));
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    getFloatingPanelScale() {
        const svgSize = Math.max(40, Number(this.config?.svg_size) || 80);
        const viewportW = window.innerWidth || document.documentElement.clientWidth || 1024;
        const svgScale = this.clamp(svgSize / 170, 0.55, 1.22);
        const screenScale = viewportW <= 360 ? 0.72 : viewportW <= 430 ? 0.80 : viewportW <= 600 ? 0.88 : 1;
        return this.clamp(svgScale * screenScale, 0.48, 1.18);
    }

    applySystemMonitorResponsiveVars(panel) {
        if (!panel) return 1;
        const scale = this.getFloatingPanelScale();
        const cycle = this.isSystemMonitorCycleMode();
        const ring = cycle && this.getSystemMonitorDisplayStyle() === 'ring';
        panel.style.setProperty('--monitor-scale', String(scale));
        const cycleBase = ring ? 96 : 74;
        const ringLayout = this.getSystemMonitorRingLayout();
        const cycleSize = ring
            ? ringLayout.cycleSize
            : Math.round(this.clamp((cycle ? cycleBase : 80) * scale, cycle ? 62 : 68, cycle ? 90 : 96));
        const ringSize = ring ? ringLayout.ringSize : Math.round(this.clamp(cycleSize - 34, 48, 78));
        panel.style.setProperty('--monitor-metric-min', `${Math.round((cycle ? (ring ? 56 : 50) : 64) * scale)}px`);
        panel.style.setProperty('--monitor-col-gap', `${Math.round((cycle ? 0 : 14) * scale)}px`);
        panel.style.setProperty('--monitor-row-gap', `${Math.round((cycle ? 0 : 10) * scale)}px`);
        panel.style.setProperty('--monitor-pad-y', `${Math.max(4, Math.round((cycle ? (ring ? 7 : 4) : 12) * scale))}px`);
        panel.style.setProperty('--monitor-pad-x', `${Math.max(5, Math.round((cycle ? (ring ? 7 : 5) : 15) * scale))}px`);
        panel.style.setProperty('--monitor-cycle-inner-gap', `${Math.max(3, Math.round((ring ? 5 : 3) * scale))}px`);
        panel.style.setProperty('--monitor-radius', `${Math.round((cycle ? 11 : 24) * scale)}px`);
        panel.style.setProperty('--monitor-icon-size', `${Math.max(14, Math.round((cycle ? (ring ? 14 : 18) : 18) * scale))}px`);
        panel.style.setProperty('--monitor-label-size', `${Math.max(8, Math.round((cycle ? 9 : 10) * scale))}px`);
        panel.style.setProperty('--monitor-value-size', `${Math.max(17, Math.round((cycle ? (ring ? 19 : 21) : 18) * scale))}px`);
        panel.style.setProperty('--monitor-track-h', `${Math.max(3, Math.round((cycle ? 4 : 5) * scale))}px`);
        panel.style.setProperty('--monitor-track-w', `${Math.round(this.clamp(cycleSize - 26, 42, 70))}px`);
        panel.style.setProperty('--monitor-cycle-size', `${cycleSize}px`);
        panel.style.setProperty('--monitor-ring-size', `${ringSize}px`);
        panel.style.setProperty('--monitor-ring-thickness', `${ring ? ringLayout.thickness : Math.max(5, Math.round(7 * scale))}px`);
        panel.style.setProperty('--monitor-ring-content-size', `${ring ? ringLayout.contentSize : Math.max(24, ringSize - (Math.max(5, Math.round(7 * scale)) * 2) - 8)}px`);
        panel.style.setProperty('--monitor-empty-min', `${Math.round(148 * scale)}px`);
        return scale;
    }

    applyChatResponsiveVars(chat) {
        if (!chat || !this.config) return 1;
        const svgSize = Math.max(40, Number(this.config.svg_size) || 80);
        const viewportW = window.innerWidth || document.documentElement.clientWidth || 1024;
        const svgScale = this.clamp(svgSize / 170, 0.48, 1.55);
        const screenScale = viewportW <= 360 ? 0.72 : viewportW <= 430 ? 0.80 : viewportW <= 600 ? 0.88 : 1;
        const scale = this.clamp(svgScale * screenScale, 0.44, 1.45);
        const maxWidth = Math.max(132, viewportW - (viewportW <= 600 ? 20 : 32));
        const width = Math.min(Math.round(Math.max(170, Number(this.config.chat_width) || 245) * scale), maxWidth);
        chat.style.setProperty('--chat-width', `${width}px`);
        chat.style.setProperty('--chat-font-size', `${Math.round(this.clamp(16 * scale, 9, 24))}px`);
        chat.style.setProperty('--chat-padding-y', `${Math.round(this.clamp(12 * scale, 5, 20))}px`);
        chat.style.setProperty('--chat-padding-x', `${Math.round(this.clamp(16 * scale, 7, 26))}px`);
        chat.style.setProperty('--chat-radius', `${Math.round(this.clamp(22 * scale, 9, 32))}px`);
        return scale;
    }

    getGreetingLines() {
        const info = this.getDateInfo();
        return {
            main: `Xin chào ${this.getGreetingName()}`,
            date: info.solarLine,
            lunar: info.lunarLine
        };
    }


    getChatStyleVars(chatBg) {
        const selected = CHAT_STYLE_MAP[this.config.chat_style] || CHAT_STYLE_MAP.glass_light;
        const opacity = this.clamp(Number(this.config.chat_bg_opacity), 0, 1);
        const multiplyRgbaOpacity = (value, factor = opacity) => String(value || '').replace(
            /rgba\((\s*\d+\s*),(\s*\d+\s*),(\s*\d+\s*),(\s*(?:0|1|0?\.\d+)\s*)\)/gi,
            (match, r, g, b, a) => {
                const alpha = Math.max(0, Math.min(1, Number.parseFloat(a) || 0));
                return `rgba(${r.trim()}, ${g.trim()}, ${b.trim()}, ${Math.max(0, Math.min(1, alpha * factor)).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')})`;
            }
        );
        const replaceBg = (value, useOpacity = true) => {
            const replaced = String(value || '').replace(/CHAT_BG/g, chatBg);
            return useOpacity ? multiplyRgbaOpacity(replaced) : replaced;
        };
        return {
            background: replaceBg(selected.background),
            border: replaceBg(selected.border, false),
            shadow: replaceBg(selected.shadow, false),
            rowBg: replaceBg(selected.rowBg),
            rowBorder: replaceBg(selected.rowBorder, false),
            headerBg: replaceBg(selected.headerBg),
            iconBg: replaceBg(selected.iconBg),
            iconColor: replaceBg(selected.iconColor, false),
            beforeBg: replaceBg(selected.beforeBg),
            accent: replaceBg(selected.accent)
        };
    }


    escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    getMetricIconSvg(type) {
        const icons = {
            cpu: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 9h3M4 15h3M17 9h3M17 15h3M9 4v3M15 4v3M9 17v3M15 17v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            ram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10v4M11 10v4M15 10v4M8 17v3M12 17v3M16 17v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            temp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 9v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            disk: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 15h.01M12 15h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
            monitor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 20h6M12 16v4M7 11l2 2 3-5 2 6 2-3h1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
        return icons[type] || icons.monitor;
    }

    normalizeEntityId(entityId) {
        return String(entityId ?? '')
            .trim()
            .replace(/[​-‍﻿]/g, '')
            .replace(/^['"]|['"]$/g, '')
            .replace(/\s+/g, '')
            .toLowerCase();
    }

    getHassObject() {
        if (this._hass) return this._hass;
        const homeAssistant = document.querySelector('home-assistant');
        if (homeAssistant?.hass) return homeAssistant.hass;
        const candidates = [
            document.querySelector('home-assistant-main'),
            document.querySelector('ha-panel-lovelace'),
            document.querySelector('hui-root')
        ];
        for (const candidate of candidates) {
            if (candidate?.hass) return candidate.hass;
        }
        return null;
    }

    getAllStatesMap() {
        return this.getHassObject()?.states || {};
    }



    findStateByExactId(states, entityId) {
        const normalized = this.normalizeEntityId(entityId);
        if (!normalized) return null;
        const stateObj = states?.[normalized] || null;
        return stateObj ? { entityId: normalized, stateObj } : null;
    }


    getStateObjForEntity(entityId, key = '', statesOverride = null) {
        const normalizedId = this.normalizeEntityId(entityId);
        const states = statesOverride || this.getAllStatesMap();
        if (!normalizedId) return { entityId: '', stateObj: null };
        const exact = this.findStateByExactId(states, normalizedId);
        return exact || { entityId: normalizedId, stateObj: null };
    }

    getSystemMonitorItems() {
        return [
            { key: 'ram', label: 'RAM', entity: this.normalizeEntityId(this.config.system_sensor_ram), color: '#74e83b', fallbackUnit: '%', max: 100, icon: this.getMetricIconSvg('ram') },
            { key: 'cpu', label: 'CPU', entity: this.normalizeEntityId(this.config.system_sensor_cpu), color: '#18a8ff', fallbackUnit: '%', max: 100, icon: this.getMetricIconSvg('cpu') },
            { key: 'disk', label: 'DISK', entity: this.normalizeEntityId(this.config.system_sensor_disk), color: '#a78bfa', fallbackUnit: '%', max: 100, icon: this.getMetricIconSvg('disk') },
            { key: 'temp', label: 'TEMP', entity: this.normalizeEntityId(this.config.system_sensor_temp), color: '#ff8a00', fallbackUnit: '°C', max: Number(this.config.system_monitor_temp_max) || 100, icon: this.getMetricIconSvg('temp') }
        ].filter((item) => item.entity);
    }

    getSensorDisplayInfo(item, statesOverride = null) {
        const { entityId: resolvedEntityId, stateObj } = this.getStateObjForEntity(item.entity, item.key, statesOverride);
        const rawState = stateObj?.state;
        const normalized = String(rawState ?? '').trim().toLowerCase();
        const unavailable = !stateObj || rawState === undefined || rawState === null || ['unknown', 'unavailable', 'none', 'null', ''].includes(normalized);
        const unit = stateObj?.attributes?.unit_of_measurement || item.fallbackUnit || '';
        const numeric = Number.parseFloat(String(rawState ?? '').replace(',', '.'));
        const hasNumber = Number.isFinite(numeric);
        const max = Math.max(1, Number(item.max) || 100);
        const percent = hasNumber ? this.clamp((numeric / max) * 100, 0, 100) : 0;
        let value = '--';

        if (!unavailable) {
            if (hasNumber) {
                const rounded = Math.abs(numeric) >= 100 || Number.isInteger(numeric)
                    ? Math.round(numeric).toString()
                    : numeric.toFixed(1).replace(/\.0$/, '');
                value = `${rounded}${unit}`;
            } else {
                value = `${rawState}${unit ? ` ${unit}` : ''}`;
            }
        }

        return { value, percent, unavailable, resolvedEntityId: resolvedEntityId || item.entity };
    }

    getSystemMonitorStateSignature() {
        if (!this.config?.system_monitor_enabled) return 'disabled';
        const states = this.getAllStatesMap();
        return this.getSystemMonitorItems().map((item) => {
            const { stateObj } = this.getStateObjForEntity(item.entity, item.key, states);
            const unit = stateObj?.attributes?.unit_of_measurement ?? '';
            return `${item.key}:${item.entity}:${stateObj?.state ?? ''}:${unit}`;
        }).join('|');
    }

    requestSystemMonitorUpdate() {
        if (this._systemMonitorUpdateRaf) return;
        this._systemMonitorUpdateRaf = window.requestAnimationFrame(() => {
            this._systemMonitorUpdateRaf = null;
            this.updateSystemMonitor();
        });
    }

    getSystemMonitorCycleSeconds() {
        const seconds = Number(this.config?.system_monitor_cycle_seconds);
        return Number.isFinite(seconds) ? this.clamp(seconds, 0.5, 120) : 3;
    }

    isSystemMonitorCycleMode() {
        return !!this.config?.system_monitor_cycle_enabled;
    }

    getSystemMonitorDisplayStyle() {
        const style = String(this.config?.system_monitor_display_style || 'ring').trim().toLowerCase();
        return ['ring', 'bar'].includes(style) ? style : 'ring';
    }

    getSystemMonitorRingLayout() {
        const scale = this.getFloatingPanelScale();
        const cycleSize = Math.round(this.clamp(96 * scale, 82, 116));
        const ringSize = Math.round(this.clamp(cycleSize - 34, 48, 78));
        const thickness = Math.max(5, Math.round(7 * scale));
        const contentSize = Math.max(24, ringSize - (thickness * 2) - Math.round(8 * scale));
        return { scale, cycleSize, ringSize, thickness, contentSize };
    }

    getSystemMonitorRingValueFontSize(value) {
        const text = String(value ?? '--').trim() || '--';
        const { scale, contentSize } = this.getSystemMonitorRingLayout();
        const base = Math.max(15, Math.round(19 * scale));
        const len = text.length;
        let size = base;

        if (len >= 6) size = Math.floor(contentSize * 0.38);
        else if (len === 5) size = Math.floor(contentSize * 0.44);
        else if (len === 4) size = Math.floor(contentSize * 0.52);
        else size = Math.floor(contentSize * 0.58);

        return this.clamp(size, Math.max(10, Math.round(12 * scale)), base);
    }

    stopSystemMonitorCycle() {
        if (this._systemMonitorCycleTimer) {
            window.clearTimeout(this._systemMonitorCycleTimer);
            window.clearInterval(this._systemMonitorCycleTimer);
            this._systemMonitorCycleTimer = null;
        }
    }

    startSystemMonitorCycle() {
        this.stopSystemMonitorCycle();
        this.applySystemMonitorCycleState({ restartProgress: true });
        if (!this.isCardActive()) return;
        if (!this.config?.system_monitor_enabled || !this.isSystemMonitorCycleMode()) return;
        if (this.getSystemMonitorItems().length <= 1) return;

        const tick = () => {
            if (!this.config?.system_monitor_enabled || !this.isSystemMonitorCycleMode()) {

                this.stopSystemMonitorCycle();
                return;
            }
            const itemCount = this.getSystemMonitorItems().length;
            if (itemCount <= 1) {
                this.applySystemMonitorCycleState({ restartProgress: false });
                this.stopSystemMonitorCycle();
                return;
            }
            this._systemMonitorCycleIndex = (this._systemMonitorCycleIndex + 1) % itemCount;
            this.applySystemMonitorCycleState({ restartProgress: true, direction: 'next' });
            this._systemMonitorCycleTimer = window.setTimeout(tick, Math.round(this.getSystemMonitorCycleSeconds() * 1000));
        };

        this._systemMonitorCycleTimer = window.setTimeout(tick, Math.round(this.getSystemMonitorCycleSeconds() * 1000));
    }

    resetSystemMonitorProgressAnimation(panel) {
        // The rotating single-sensor view no longer shows dots or countdown bars.
    }

    applySystemMonitorCycleState(options = {}) {
        const panel = this.shadowRoot?.getElementById('systemMonitorPanel');
        if (!panel) return;
        const items = this.getSystemMonitorItems();
        const itemCount = items.length;
        const cycleMode = this.isSystemMonitorCycleMode() && itemCount > 0;
        panel.classList.toggle('cycle-mode', cycleMode);
        panel.classList.toggle('display-ring', this.getSystemMonitorDisplayStyle() === 'ring');
        panel.classList.toggle('display-bar', this.getSystemMonitorDisplayStyle() === 'bar');
        panel.style.setProperty('--cycle-duration', `${this.getSystemMonitorCycleSeconds()}s`);
        if (!cycleMode) {
            this._systemMonitorCycleAppliedIndex = -1;
            panel.querySelectorAll('.system-monitor-metric').forEach((metric) => metric.classList.remove('is-active'));
            return;
        }
        this._systemMonitorCycleIndex = itemCount ? this._systemMonitorCycleIndex % itemCount : 0;
        const activeItem = items[this._systemMonitorCycleIndex];
        if (activeItem?.color) panel.style.setProperty('--active-metric-color', activeItem.color);
        panel.dataset.activeSystemIndex = String(this._systemMonitorCycleIndex);
        panel.querySelectorAll('.system-monitor-metric').forEach((metric, index) => {
            metric.classList.toggle('is-active', index === this._systemMonitorCycleIndex);
        });
        const indexChanged = this._systemMonitorCycleAppliedIndex !== this._systemMonitorCycleIndex;
        this._systemMonitorCycleAppliedIndex = this._systemMonitorCycleIndex;
        if (options.restartProgress !== false && indexChanged) {
            this.resetSystemMonitorProgressAnimation(panel);
        }
        this.updateSystemMonitorPlacement();
    }

    getSystemMonitorPanelMarkup() {
        if (!this.config.system_monitor_enabled) return '';
        const items = this.getSystemMonitorItems();
        const showClass = this._systemMonitorPinned ? ' show' : '';
        const cycleMode = this.isSystemMonitorCycleMode() && items.length > 0;
        const cycleClass = cycleMode ? ' cycle-mode' : '';
        const displayStyleClass = ` display-${this.getSystemMonitorDisplayStyle()}`;
        const activeIndex = items.length ? this._systemMonitorCycleIndex % items.length : 0;
        const states = this.getAllStatesMap();
        const metrics = items.map((item, index) => {
            const info = this.getSensorDisplayInfo(item, states);
            const title = info.resolvedEntityId && info.resolvedEntityId !== item.entity ? `${item.label}: ${item.entity} → ${info.resolvedEntityId}` : `${item.label}: ${item.entity}`;
            const activeClass = cycleMode && index === activeIndex ? ' is-active' : '';
            return `
                        <div class="system-monitor-metric ${info.unavailable ? 'is-unavailable' : ''}${activeClass}" data-system-key="${this.escapeHtml(item.key)}" data-system-index="${index}" title="${this.escapeHtml(title)}" style="--metric-color: ${item.color}; --metric-percent: ${info.percent}%; --metric-deg: ${Math.round(info.percent * 3.6)}deg; --metric-ring-font-size: ${this.getSystemMonitorRingValueFontSize(info.value)}px;">
                            <div class="system-monitor-head"><span class="system-monitor-icon">${item.icon}</span><span class="system-monitor-label">${this.escapeHtml(item.label)}</span></div>
                            <div class="system-monitor-value">${this.escapeHtml(info.value)}</div>
                            <div class="system-monitor-ring"><span class="system-monitor-ring-value">${this.escapeHtml(info.value)}</span></div>
                            <div class="system-monitor-track"><span class="system-monitor-fill"></span></div>
                        </div>`;
        }).join('');
        const empty = '<div class="system-monitor-empty">Chưa chọn sensor</div>';

        return `<div class="system-monitor-panel${showClass}${cycleClass}${displayStyleClass}" id="systemMonitorPanel" aria-live="polite" style="--cycle-duration: ${this.getSystemMonitorCycleSeconds()}s; --monitor-scale: ${this.getFloatingPanelScale()};">
                        ${metrics || empty}
                    </div>`;
    }

    getSystemMonitorToggleMarkup() {
        if (!this.config.system_monitor_enabled || !this.config.system_monitor_button_enabled) return '';
        return `<div class="system-monitor-button-row" id="systemMonitorButtonRow">
                    <button class="system-monitor-toggle ${this._systemMonitorPinned ? 'active' : ''}" id="systemMonitorToggle" title="Ẩn/hiện thông tin hệ thống" aria-label="Ẩn/hiện thông tin hệ thống" type="button">${this.getMetricIconSvg('monitor')}</button>
                </div>`;
    }

    updateSystemMonitor() {
        if (!this.config?.system_monitor_enabled) return;
        const panel = this.shadowRoot?.getElementById('systemMonitorPanel');
        if (!panel) return;
        const states = this.getAllStatesMap();
        this.getSystemMonitorItems().forEach((item) => {
            const metric = panel.querySelector(`[data-system-key="${item.key}"]`);
            if (!metric) return;
            const info = this.getSensorDisplayInfo(item, states);
            const valueEl = metric.querySelector('.system-monitor-value');
            const fillEl = metric.querySelector('.system-monitor-fill');
            if (valueEl) valueEl.textContent = info.value;
            const ringValueEl = metric.querySelector('.system-monitor-ring-value');
            if (ringValueEl) ringValueEl.textContent = info.value;
            if (fillEl) fillEl.style.width = `${info.percent}%`;
            metric.style.setProperty('--metric-percent', `${info.percent}%`);
            metric.style.setProperty('--metric-deg', `${Math.round(info.percent * 3.6)}deg`);
            metric.style.setProperty('--metric-ring-font-size', `${this.getSystemMonitorRingValueFontSize(info.value)}px`);
            metric.classList.toggle('is-unavailable', !!info.unavailable);
            metric.title = info.resolvedEntityId && info.resolvedEntityId !== item.entity ? `${item.label}: ${item.entity} → ${info.resolvedEntityId}` : `${item.label}: ${item.entity}`;
        });
        this.applySystemMonitorCycleState({ restartProgress: false });
        this.updateSystemMonitorPlacement();
    }

    showSystemMonitor(pin = false) {
        if (!this.config?.system_monitor_enabled) return;
        const panel = this.shadowRoot.getElementById('systemMonitorPanel');
        const toggle = this.shadowRoot.getElementById('systemMonitorToggle');
        if (!panel) return;
        if (pin) this._systemMonitorPinned = true;
        panel.classList.add('show');
        toggle?.classList.add('active');
        this.updateSystemMonitor();
        if (this.isSystemMonitorCycleMode() && !this._systemMonitorCycleTimer) this.startSystemMonitorCycle();
        this.updateSystemMonitorPlacement();
    }

    hideSystemMonitor(force = false) {
        const panel = this.shadowRoot.getElementById('systemMonitorPanel');
        const toggle = this.shadowRoot.getElementById('systemMonitorToggle');
        if (!panel) return;
        if (this._systemMonitorPinned && !force) return;
        this._systemMonitorPinned = false;
        panel.classList.remove('show');
        toggle?.classList.remove('active');
    }

    toggleSystemMonitor() {
        const panel = this.shadowRoot.getElementById('systemMonitorPanel');
        if (!panel) return;
        if (panel.classList.contains('show') && this._systemMonitorPinned) {
            this.hideSystemMonitor(true);
        } else {
            this.showSystemMonitor(true);
        }
    }

    getRectOverlapArea(a, b, margin = 0) {
        if (!a || !b) return 0;
        const left = Math.max(a.left, b.left - margin);
        const right = Math.min(a.right, b.right + margin);
        const top = Math.max(a.top, b.top - margin);
        const bottom = Math.min(a.bottom, b.bottom + margin);
        return Math.max(0, right - left) * Math.max(0, bottom - top);
    }

    updateSystemMonitorPlacement() {
        const panel = this.shadowRoot?.getElementById('systemMonitorPanel');
        const bubble = this.shadowRoot?.getElementById('bubble');
        if (!panel || !bubble) return;

        this.applySystemMonitorResponsiveVars(panel);

        const viewportW = window.innerWidth || document.documentElement.clientWidth || 1024;
        const viewportH = window.innerHeight || document.documentElement.clientHeight || 768;
        const safe = viewportW <= 600 ? 10 : 14;
        const gap = Math.round((viewportW <= 600 ? 10 : 12) * this.getFloatingPanelScale());
        const bubbleRect = bubble.getBoundingClientRect();
        const rectForMeasure = panel.getBoundingClientRect();
        const panelW = Math.min(rectForMeasure.width || panel.offsetWidth || 236, Math.max(120, viewportW - safe * 2));
        const panelH = Math.min(rectForMeasure.height || panel.offsetHeight || 118, Math.max(56, viewportH - safe * 2));
        const centerX = bubbleRect.left + (bubbleRect.width / 2);

        const clampLeft = (left) => this.clamp(left, safe, Math.max(safe, viewportW - safe - panelW));
        const clampTop = (top) => this.clamp(top, safe, Math.max(safe, viewportH - safe - panelH));

        // Sensor panel is fixed above the SVG. When the SVG is close to the screen edge,
        // the panel remains above it but shifts left/right so no content is cut off.
        const preferredLeft = centerX - (panelW / 2);
        const preferredTop = bubbleRect.top - panelH - gap;
        const left = clampLeft(preferredLeft);
        const top = clampTop(preferredTop);
        const anchorX = this.clamp(centerX - left, 16, Math.max(16, panelW - 16));

        panel.style.left = `${Math.round(left)}px`;
        panel.style.top = `${Math.round(top)}px`;
        panel.style.maxWidth = `${Math.max(120, viewportW - safe * 2)}px`;
        panel.style.maxHeight = `${Math.max(56, viewportH - safe * 2)}px`;
        panel.style.transformOrigin = `${Math.round(anchorX)}px bottom`;
        panel.style.setProperty('--monitor-hide-transform', 'translateY(-8px) scale(0.96)');
        panel.style.setProperty('--monitor-show-transform', 'translate(0, 0) scale(1)');
        panel.dataset.placement = 'top';
    }

    setupSystemMonitorControls() {
        const button = this.shadowRoot.getElementById('systemMonitorToggle');
        const panel = this.shadowRoot.getElementById('systemMonitorPanel');
        const stopBubble = (event) => {
            event.stopPropagation();
        };
        if (panel) {
            panel.addEventListener('mousedown', stopBubble);
            panel.addEventListener('touchstart', stopBubble, { passive: true });
            panel.addEventListener('click', stopBubble);
        }
        if (!button) return;
        button.addEventListener('mousedown', stopBubble);
        button.addEventListener('touchstart', stopBubble, { passive: true });
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            this.toggleSystemMonitor();
        });
    }


    getGreetingTimeoutSeconds() {
        if (this.config && this.config.greeting_timeout_s !== undefined) {
            const seconds = Number(this.config.greeting_timeout_s);
            return Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
        }
        const legacy = Number(this.config?.greeting_timeout) || 0;
        return legacy > 120 ? Math.round(legacy / 1000) : Math.max(0, legacy);
    }

    getGreetingTimeoutMs() {
        return Math.round(this.getGreetingTimeoutSeconds() * 1000);
    }

    clearTypingTimers() {
        (this._typingTimers || []).forEach((timer) => window.clearTimeout(timer));
        this._typingTimers = [];
        this._isTypingGreeting = false;
    }

    setGreetingFullText() {
        const main = this.shadowRoot.getElementById('greetingMain');
        const date = this.shadowRoot.getElementById('greetingDate');
        const lunar = this.shadowRoot.getElementById('greetingLunar');
        if (!main || !date || !lunar) return;
        const lines = this.getGreetingLines();
        main.textContent = lines.main;
        date.textContent = lines.date;
        lunar.textContent = lines.lunar;
    }

    typeText(element, text, speed, done) {
        if (!element) {
            if (typeof done === 'function') done();
            return;
        }
        element.textContent = '';
        let index = 0;
        const write = () => {
            if (!this._isTypingGreeting) return;
            element.textContent = text.slice(0, index);
            if (index <= text.length) {
                index += 1;
                const timer = window.setTimeout(write, speed);
                this._typingTimers.push(timer);
            } else if (typeof done === 'function') {
                done();
            }
        };
        write();
    }

    typeGreetingText() {
        const main = this.shadowRoot.getElementById('greetingMain');
        const date = this.shadowRoot.getElementById('greetingDate');
        const lunar = this.shadowRoot.getElementById('greetingLunar');
        const chat = this.shadowRoot.getElementById('chatBubble');
        if (!main || !date || !lunar || !chat) return;

        this.clearTypingTimers();
        this._isTypingGreeting = true;
        chat.dataset.typed = '0';
        const lines = this.getGreetingLines();
        main.textContent = '';
        date.textContent = '';
        lunar.textContent = '';

        const speed = this.clamp(Math.round(30 * (170 / Math.max(40, Number(this.config.svg_size) || 80))), 14, 42);
        this.typeText(main, lines.main, speed, () => {
            const pause1 = window.setTimeout(() => {
                this.typeText(date, lines.date, speed, () => {
                    const pause2 = window.setTimeout(() => {
                        this.typeText(lunar, lines.lunar, speed, () => {
                            chat.dataset.typed = '1';
                            this._isTypingGreeting = false;
                        });
                    }, 110);
                    this._typingTimers.push(pause2);
                });
            }, 120);
            this._typingTimers.push(pause1);
        });
    }

    showGreeting(options = {}) {
        if (!this.config.greeting_enabled) return;
        const chat = this.shadowRoot.getElementById('chatBubble');
        if (!chat) return;
        this.updateChatPlacement();
        chat.classList.add('show');
        if (options.restartTyping || chat.dataset.typed !== '1') {
            this.typeGreetingText();
        } else {
            this.setGreetingFullText();
        }
        if (this.shadowRoot.getElementById('systemMonitorPanel')?.classList.contains('show')) {
            window.requestAnimationFrame(() => this.updateSystemMonitorPlacement());
        }
    }

    hideGreeting() {
        const chat = this.shadowRoot.getElementById('chatBubble');
        if (!chat) return;
        chat.classList.remove('show');
        this.clearTypingTimers();
    }

    updateChatPlacement() {
        const wrapper = this.shadowRoot.getElementById('wrapper');
        const bubble = this.shadowRoot.getElementById('bubble');
        const chat = this.shadowRoot.getElementById('chatBubble');
        if (!wrapper || !bubble || !chat) return;

        const scale = this.applyChatResponsiveVars(chat);
        const viewportW = window.innerWidth || document.documentElement.clientWidth || 1024;
        const viewportH = window.innerHeight || document.documentElement.clientHeight || 768;
        const safeMargin = viewportW <= 600 ? 10 : 16;
        const gap = Math.round((viewportW <= 600 ? 8 : 12) * scale);
        const rect = bubble.getBoundingClientRect();
        const chatRect = chat.getBoundingClientRect();
        const fallbackWidth = Math.round((Number(this.config.chat_width) || 245) * scale);
        const fallbackHeight = Math.round(88 * scale);
        const chatWidth = Math.min(chatRect.width || chat.offsetWidth || fallbackWidth, Math.max(120, viewportW - (safeMargin * 2)));
        const chatHeight = Math.min(chatRect.height || chat.offsetHeight || fallbackHeight, Math.max(60, viewportH - (safeMargin * 2)));
        const bubbleCenterX = rect.left + (rect.width / 2);
        const bubbleCenterY = rect.top + (rect.height / 2);
        const tailInset = this.clamp(Math.round(22 * scale), 12, Math.max(14, Math.round(chatWidth / 2)));
        const tailTopInset = this.clamp(Math.round(22 * scale), 12, Math.max(14, Math.round(chatHeight / 2)));

        const leftSpace = rect.left - safeMargin - gap;
        const rightSpace = viewportW - safeMargin - rect.right - gap;
        let side = rightSpace >= chatWidth || rightSpace >= leftSpace ? 'right' : 'left';
        if (leftSpace >= chatWidth && rightSpace < chatWidth) side = 'left';

        const clampAbsLeft = (left) => this.clamp(left, safeMargin, Math.max(safeMargin, viewportW - safeMargin - chatWidth));
        const clampAbsTop = (top) => this.clamp(top, safeMargin, Math.max(safeMargin, viewportH - safeMargin - chatHeight));
        let absLeft = side === 'right' ? rect.right + gap : rect.left - chatWidth - gap;
        absLeft = clampAbsLeft(absLeft);
        const absTop = clampAbsTop(bubbleCenterY - (chatHeight / 2));

        wrapper.style.setProperty('--chat-left', `${Math.round(absLeft - rect.left)}px`);
        wrapper.style.setProperty('--chat-top', `${Math.round(absTop - rect.top)}px`);
        wrapper.style.setProperty('--chat-x', '0px');
        wrapper.style.setProperty('--chat-y', '0px');
        wrapper.style.setProperty('--tail-top', `${Math.round(this.clamp(bubbleCenterY - absTop, tailTopInset, Math.max(tailTopInset, chatHeight - tailTopInset)))}px`);
        wrapper.style.setProperty('--tail-left', `${Math.round(this.clamp(bubbleCenterX - absLeft, tailInset, Math.max(tailInset, chatWidth - tailInset)))}px`);

        chat.classList.remove('tail-left', 'tail-right', 'tail-bottom', 'tail-top');
        chat.classList.add(side === 'right' ? 'tail-left' : 'tail-right');
        chat.style.transformOrigin = side === 'right' ? 'left center' : 'right center';
        chat.dataset.placement = side;
        this.updateSystemMonitorPlacement();
    }

    requestChatPlacementUpdate() {
        if (this._placementRaf) return;
        this._placementRaf = window.requestAnimationFrame(() => {
            this._placementRaf = null;
            this.updateChatPlacement();
        });
    }

    render() {
        if (!this.config) return;
        this.stopSystemMonitorCycle();
        this.style.display = 'block';

        const posCSS = this.config.position === 'top-right'
            ? `top: ${Number(this.config.offset_y) || 0}px; right: ${Number(this.config.offset_x) || 0}px;`
            : `bottom: ${Number(this.config.offset_y) || 0}px; right: ${Number(this.config.offset_x) || 0}px;`;

        const animations = {
            none: 'none',
            breathe: 'anim-breathe 3s ease-in-out infinite',
            float: 'anim-float 3s ease-in-out infinite',
            pulse_glow: 'anim-pulse_glow 2s ease-in-out infinite',
            swing: 'anim-swing 4s ease-in-out infinite',
            heartbeat: 'anim-heartbeat 2s ease-in-out infinite',
            bounce: 'anim-bounce 2.5s ease-in-out infinite',
            jelly: 'anim-jelly 2.5s ease-in-out infinite',
            wobble: 'anim-wobble 3.5s ease-in-out infinite',
            squeeze: 'anim-squeeze 2s ease-in-out infinite',
            rubber_band: 'anim-rubber_band 3s ease-in-out infinite'
        };

        const index = this.getSelectedSvgIndex();
        const selectedSvg = this._selectedSvgIndex === index ? this._selectedSvg : '';
        const box = this.getSvgViewBox(index);
        const svgSize = Math.max(40, Number(this.config.svg_size) || 80);
        const stageHeight = Math.max(svgSize, Math.min(svgSize * 1.75, svgSize * (box.height / Math.max(box.width, 1))));
        const placement = this.getChatPlacement(index);
        const shadowSize = Math.max(0, Number(this.config.shadow_size) || 15);
        const shadowColor = this.getRGBA(this.config.shadow_color, this.config.shadow_opacity);
        const glowColor = this.getRGBA(this.config.chat_border_color, 0.65);
        const chatBgBase = this.getRGBA(this.config.chat_bg_color || '#ffffff', 1);
        const chatStyle = this.getChatStyleVars(chatBgBase);
        const chatBg = chatStyle.background;
        const chatText = this.config.chat_text_color || '#111827';
        const chatFontFamily = CHAT_FONT_MAP[this.config.chat_font_family] || CHAT_FONT_MAP.system;
        const chatScale = this.clamp(svgSize / 170, 0.48, 1.55);
        const chatWidth = Math.round(Math.max(170, Number(this.config.chat_width) || 245) * chatScale);
        const chatFontSize = Math.round(this.clamp(16 * chatScale, 10, 24));
        const chatPaddingY = Math.round(this.clamp(12 * chatScale, 6, 20));
        const chatPaddingX = Math.round(this.clamp(16 * chatScale, 8, 26));
        const chatRadius = Math.round(this.clamp(22 * chatScale, 10, 32));
        const mobileSvgWidth = Math.round(this.clamp(svgSize * 0.58, 40, 120));
        const mobileStageHeight = Math.round(this.clamp(stageHeight * 0.58, 52, 190));
        const mobileChatWidth = Math.round(this.clamp(chatWidth * 0.78, 150, 238));
        const mobileChatFontSize = Math.round(this.clamp(chatFontSize * 0.78, 10, 14));
        const mobileChatPaddingY = Math.round(this.clamp(chatPaddingY * 0.72, 6, 10));
        const mobileChatPaddingX = Math.round(this.clamp(chatPaddingX * 0.72, 8, 12));

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: fixed;
                    z-index: 999;
                    width: 0;
                    height: 0;
                    --chat-bg: ${chatBg};
                    --chat-border-color: ${chatStyle.border};
                    --chat-shadow: ${chatStyle.shadow};
                    --chat-row-bg: ${chatStyle.rowBg};
                    --chat-row-border: ${chatStyle.rowBorder};
                    --chat-header-bg: ${chatStyle.headerBg};
                    --chat-icon-bg: ${chatStyle.iconBg};
                    --chat-icon-color: ${chatStyle.iconColor};
                    --chat-before-bg: ${chatStyle.beforeBg};
                    --chat-accent: ${chatStyle.accent};
                    --chat-text-color: ${chatText};
                }

                .bubble-wrapper {
                    position: fixed;
                    ${posCSS}
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transform: translate3d(0, 0, 0);
                    --chat-bg: ${chatBg};
                    --chat-border-color: ${chatStyle.border};
                    --chat-shadow: ${chatStyle.shadow};
                    --chat-row-bg: ${chatStyle.rowBg};
                    --chat-row-border: ${chatStyle.rowBorder};
                    --chat-header-bg: ${chatStyle.headerBg};
                    --chat-icon-bg: ${chatStyle.iconBg};
                    --chat-icon-color: ${chatStyle.iconColor};
                    --chat-before-bg: ${chatStyle.beforeBg};
                    --chat-accent: ${chatStyle.accent};
                    --chat-left: ${placement.left};
                    --chat-top: ${placement.top};
                    --chat-x: ${placement.x || '0px'};
                    --chat-y: ${placement.y || '0px'};
                    --chat-width: ${chatWidth}px;
                    --chat-font-size: ${chatFontSize}px;
                    --chat-padding-y: ${chatPaddingY}px;
                    --chat-padding-x: ${chatPaddingX}px;
                    --chat-radius: ${chatRadius}px;
                    --tail-top: ${Math.round(32 * chatScale)}px;
                    --tail-left: 50%;
                }

                .tooltip {
                    background: rgba(0, 0, 0, 0.78);
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 999px;
                    font-size: 11px;
                    margin-top: 7px;
                    margin-bottom: 0;
                    opacity: 0;
                    transform: translateY(-8px);
                    transition: all 0.25s ease;
                    white-space: nowrap;
                    pointer-events: none;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.28);
                    order: 3;
                    z-index: 7;
                }

                @keyframes anim-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
                @keyframes anim-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                @keyframes anim-pulse_glow { 0%, 100% { filter: drop-shadow(0 8px ${shadowSize}px ${shadowColor}); } 50% { filter: drop-shadow(0 10px ${shadowSize + 10}px ${glowColor}); } }
                @keyframes anim-swing { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(4deg); } 75% { transform: rotate(-4deg); } }
                @keyframes anim-heartbeat { 0%, 100%, 70% { transform: scale(1); } 14%, 42% { transform: scale(1.05); } 28% { transform: scale(1.02); } }
                @keyframes anim-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                @keyframes anim-jelly { 0%, 100% { transform: scale(1, 1); } 25% { transform: scale(1.03, 0.97); } 50% { transform: scale(0.97, 1.03); } 75% { transform: scale(1.01, 0.99); } }
                @keyframes anim-wobble { 0%, 100% { transform: translateX(0%) rotate(0deg); } 15% { transform: translateX(-3px) rotate(-3deg); } 30% { transform: translateX(2px) rotate(2deg); } 45% { transform: translateX(-2px) rotate(-1deg); } 60% { transform: translateX(1px) rotate(1deg); } }
                @keyframes anim-squeeze { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(0.96, 1.04); } }
                @keyframes anim-rubber_band { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.06, 0.94); } 40% { transform: scale(0.94, 1.06); } 50% { transform: scale(1.03, 0.97); } 65% { transform: scale(0.98, 1.02); } 75% { transform: scale(1.01, 0.99); } }
                @keyframes chatIn { from { opacity: 0; transform: translate(var(--chat-x), 14px) scale(0.96); } to { opacity: 1; transform: translate(var(--chat-x), var(--chat-y)) scale(1); } }

                .avatar-stage {
                    position: relative;
                    width: ${svgSize}px;
                    min-height: ${stageHeight}px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-end;
                    cursor: grab;
                    user-select: none;
                    animation: ${animations[this.config.animation_type] || animations.float};
                    transform-origin: center bottom;
                    transition: transform 0.25s ease, filter 0.25s ease;
                    filter: drop-shadow(0 10px ${shadowSize}px ${shadowColor});
                }

                .avatar-stage:active { cursor: grabbing; }
                .bubble-wrapper:hover .avatar-stage { transform: scale(1.05) !important; animation-play-state: paused; }
                .bubble-wrapper:hover .tooltip { opacity: 1; transform: translateY(0); }

                .svg-avatar {
                    width: ${svgSize}px;
                    max-width: ${svgSize}px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    pointer-events: none;
                }

                .svg-avatar svg {
                    width: 100%;
                    height: auto;
                    max-height: ${stageHeight}px;
                    overflow: visible;
                    display: block;
                }

                .chat-bubble {
                    position: absolute;
                    left: var(--chat-left);
                    top: var(--chat-top);
                    width: var(--chat-width);
                    max-width: calc(100vw - 24px);
                    box-sizing: border-box;
                    background: var(--chat-bg);
                    color: ${chatText};
                    font-family: ${chatFontFamily};
                    border: 1px solid var(--chat-border-color);
                    border-radius: var(--chat-radius);
                    padding: var(--chat-padding-y) var(--chat-padding-x);
                    font-size: var(--chat-font-size);
                    line-height: 1.34;
                    font-weight: 520;
                    text-align: left;
                    box-shadow: var(--chat-shadow);
                    opacity: 0;
                    transform: translate(var(--chat-x), 14px) scale(0.96);
                    transform-origin: ${placement.origin || 'right top'};
                    pointer-events: none;
                    transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), left 0.2s ease, top 0.2s ease;
                    backdrop-filter: blur(14px) saturate(1.16);
                    -webkit-backdrop-filter: blur(14px) saturate(1.16);
                    overflow-wrap: anywhere;
                    letter-spacing: -0.01em;
                }

                .chat-bubble::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: var(--chat-before-bg);
                    pointer-events: none;
                }

                .chat-bubble > * { position: relative; z-index: 1; }

                .chat-bubble.show {
                    opacity: 1;
                    transform: translate(var(--chat-x), var(--chat-y)) scale(1);
                    animation: chatIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .chat-bubble::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 0;
                }

                .chat-bubble.tail-right::after {
                    right: -12px;
                    top: var(--tail-top);
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-left: 13px solid var(--chat-bg);
                }

                .chat-bubble.tail-left::after {
                    left: -12px;
                    top: var(--tail-top);
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-right: 13px solid var(--chat-bg);
                }

                .chat-bubble.tail-bottom::after {
                    left: var(--tail-left, 50%);
                    bottom: -12px;
                    transform: translateX(-50%);
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 13px solid var(--chat-bg);
                }

                .chat-bubble.tail-top::after {
                    left: var(--tail-left, 50%);
                    top: -12px;
                    transform: translateX(-50%);
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 13px solid var(--chat-bg);
                }

                .greeting-main {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.04em;
                    font-weight: 850;
                    margin-bottom: 7px;
                    letter-spacing: -0.02em;
                }

                .greeting-main.greeting-row {
                    background: var(--chat-header-bg);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.26);
                    margin-top: 0;
                    margin-bottom: 6px;
                }

                .greeting-dot {
                    width: 0.58em;
                    height: 0.58em;
                    border-radius: 999px;
                    flex: 0 0 auto;
                    background: currentColor;
                    opacity: 0.72;
                    box-shadow: 0 0 0 4px rgba(255,255,255,0.28);
                }

                .greeting-row {
                    display: grid;
                    grid-template-columns: 1.55em 1fr;
                    align-items: start;
                    gap: 8px;
                    margin-top: 5px;
                    padding: 0.42em 0.52em;
                    border-radius: calc(var(--chat-radius) * 0.55);
                    background: var(--chat-row-bg);
                    border: 1px solid var(--chat-row-border);
                    opacity: 0.96;
                }

                .chat-icon {
                    width: 1.62em;
                    height: 1.62em;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 999px;
                    background: var(--chat-icon-bg);
                    color: var(--chat-icon-color);
                    box-shadow: inset 0 0 0 1px var(--chat-row-border), 0 5px 14px rgba(0,0,0,0.08);
                    font-size: 0.9em;
                    line-height: 1;
                    filter: saturate(1.15);
                }

                .emoji-icon {
                    font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
                }

                .greeting-date, .greeting-lunar { min-height: 1.28em; }
                .greeting-lunar { font-weight: 700; }


                .system-monitor-button-row {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 4px;
                    pointer-events: none;
                    position: relative;
                    z-index: 8;
                }

                .system-monitor-toggle {
                    position: relative;
                    width: 24px;
                    height: 24px;
                    border: 1px solid rgba(255,255,255,0.24);
                    border-radius: 999px;
                    color: #dbeafe;
                    background: linear-gradient(145deg, rgba(15,23,42,0.92), rgba(51,65,85,0.78));
                    box-shadow: 0 7px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.16);
                    backdrop-filter: blur(10px) saturate(1.15);
                    -webkit-backdrop-filter: blur(10px) saturate(1.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transform: translate(0, 0);
                    cursor: pointer;
                    pointer-events: auto;
                    z-index: 8;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
                }

                .system-monitor-toggle svg { width: 14px; height: 14px; display: block; }
                .system-monitor-toggle:hover, .system-monitor-toggle.active {
                    transform: translate(0, 0) scale(1.08);
                    background: linear-gradient(145deg, rgba(14,165,233,0.95), rgba(37,99,235,0.82));
                    box-shadow: 0 12px 28px rgba(14,165,233,0.28), inset 0 1px 0 rgba(255,255,255,0.22);
                }

                .system-monitor-panel {
                    position: fixed;
                    left: 14px;
                    top: 14px;
                    display: grid;
                    grid-template-columns: repeat(2, minmax(var(--monitor-metric-min, 64px), 1fr));
                    align-items: center;
                    column-gap: var(--monitor-col-gap, 14px);
                    row-gap: var(--monitor-row-gap, 10px);
                    width: max-content;
                    max-width: min(260px, calc(100vw - 28px));
                    max-height: calc(100vh - 28px);
                    overflow: visible;
                    padding: var(--monitor-pad-y, 12px) var(--monitor-pad-x, 15px);
                    border-radius: var(--monitor-radius, 24px);
                    color: var(--chat-text-color, #f8fafc);
                    background: var(--chat-bg);
                    border: 1px solid var(--chat-border-color);
                    box-shadow: var(--chat-shadow);
                    backdrop-filter: blur(15px) saturate(1.22);
                    -webkit-backdrop-filter: blur(15px) saturate(1.22);
                    opacity: 0;
                    transform: var(--monitor-hide-transform, translateY(10px) scale(0.96));
                    transform-origin: center top;
                    transition: opacity 0.26s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), left 0.18s ease, top 0.18s ease;
                    pointer-events: none;
                    z-index: 10020;
                    box-sizing: border-box;
                }

                .system-monitor-panel::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: var(--chat-before-bg);
                    pointer-events: none;
                    z-index: 0;
                }

                .system-monitor-panel > * {
                    position: relative;
                    z-index: 1;
                }

                .system-monitor-panel.show {
                    opacity: 1;
                    transform: var(--monitor-show-transform, translate(0, 0) scale(1));
                    pointer-events: auto;
                }

                .system-monitor-metric {
                    min-width: var(--monitor-metric-min, 64px);
                    display: grid;
                    grid-template-rows: auto auto auto;
                    gap: 5px;
                    opacity: 0.98;
                    padding: 0.42em 0.52em;
                    border-radius: calc(var(--monitor-radius, 24px) * 0.55);
                    background: var(--chat-row-bg);
                    border: 1px solid var(--chat-row-border);
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
                    box-sizing: border-box;
                }

                .system-monitor-metric.is-unavailable { opacity: 0.52; }
                .system-monitor-head { display: flex; align-items: center; gap: 5px; min-height: var(--monitor-icon-size, 18px); }
                .system-monitor-icon { width: var(--monitor-icon-size, 18px); height: var(--monitor-icon-size, 18px); color: var(--metric-color); filter: drop-shadow(0 0 5px var(--metric-color)); overflow: visible; flex: 0 0 auto; }
                .system-monitor-icon svg { width: var(--monitor-icon-size, 18px); height: var(--monitor-icon-size, 18px); display: block; overflow: visible; }
                .system-monitor-label { font-size: var(--monitor-label-size, 10px); line-height: 1; font-weight: 800; letter-spacing: 0.04em; color: currentColor; opacity: 0.78; }
                .system-monitor-value { font-size: var(--monitor-value-size, 18px); line-height: 1; font-weight: 850; letter-spacing: -0.03em; color: currentColor; text-shadow: 0 1px 8px rgba(0,0,0,0.12); }
                .system-monitor-track { width: 100%; height: var(--monitor-track-h, 5px); border-radius: 999px; overflow: hidden; background: var(--chat-row-border); box-shadow: inset 0 1px 2px rgba(0,0,0,0.14); }
                .system-monitor-fill { display: block; width: var(--metric-percent); height: 100%; border-radius: inherit; background: var(--metric-color); box-shadow: 0 0 10px var(--metric-color); transition: width 0.35s ease; }
                .system-monitor-ring {
                    display: none;
                    position: relative;
                    width: var(--monitor-ring-size, 58px);
                    height: var(--monitor-ring-size, 58px);
                    border-radius: 999px;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    box-shadow: none;
                    isolation: isolate;
                    overflow: visible;
                }

                .system-monitor-ring::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: conic-gradient(
                        var(--metric-color) 0deg var(--metric-deg, 0deg),
                        var(--monitor-ring-rest, rgba(148, 163, 184, 0.24)) var(--metric-deg, 0deg) 360deg
                    );
                    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - var(--monitor-ring-thickness, 6px)), #000 0);
                    mask: radial-gradient(farthest-side, transparent calc(100% - var(--monitor-ring-thickness, 6px)), #000 0);
                    filter: drop-shadow(0 0 6px var(--metric-color));
                    z-index: 0;
                }

                .system-monitor-ring::after {
                    content: '';
                    position: absolute;
                    inset: calc(var(--monitor-ring-thickness, 6px) + 2px);
                    border-radius: inherit;
                    background: transparent;
                    box-shadow: inset 0 0 10px rgba(15, 23, 42, 0.10);
                    z-index: 0;
                    pointer-events: none;
                }

                .system-monitor-ring-value {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: calc(var(--monitor-ring-size, 58px) - (var(--monitor-ring-thickness, 6px) * 2) - 8px);
                    height: calc(var(--monitor-ring-size, 58px) - (var(--monitor-ring-thickness, 6px) * 2) - 8px);
                    max-width: calc(var(--monitor-ring-size, 58px) - (var(--monitor-ring-thickness, 6px) * 2) - 8px);
                    max-height: calc(var(--monitor-ring-size, 58px) - (var(--monitor-ring-thickness, 6px) * 2) - 8px);
                    color: currentColor;
                    font-size: var(--metric-ring-font-size, var(--monitor-value-size, 18px));
                    line-height: 0.92;
                    font-weight: 900;
                    letter-spacing: -0.065em;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-shadow: 0 1px 9px rgba(0,0,0,0.30), 0 0 8px rgba(0,0,0,0.18);
                }
                .system-monitor-empty { min-width: var(--monitor-empty-min, 148px); font-size: var(--monitor-label-size, 12px); color: currentColor; opacity: 0.74; }

                .system-monitor-panel.cycle-mode {
                    display: block;
                    width: min(var(--monitor-cycle-size, 74px), calc(100vw - 28px));
                    height: min(var(--monitor-cycle-size, 74px), calc(100vh - 28px));
                    min-width: min(62px, calc(100vw - 28px));
                    min-height: min(62px, calc(100vh - 28px));
                    overflow: hidden;
                    padding: var(--monitor-pad-y, 4px) var(--monitor-pad-x, 5px);
                    border-radius: var(--monitor-radius, 10px);
                    aspect-ratio: 1 / 1;
                }

                .system-monitor-panel.cycle-mode .system-monitor-metric {
                    display: none;
                    min-width: 0;
                    width: 100%;
                    height: 100%;
                    grid-template-rows: auto auto auto;
                    align-content: center;
                    align-items: center;
                    justify-items: center;
                    justify-content: center;
                    text-align: center;
                    gap: var(--monitor-cycle-inner-gap, 3px);
                    will-change: transform, opacity, filter;
                    padding: 0;
                    background: transparent;
                    border: 0;
                    box-shadow: none;
                }

                .system-monitor-panel.cycle-mode .system-monitor-metric.is-active {
                    display: grid;
                    animation: monitorMetricIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                .system-monitor-panel.cycle-mode .system-monitor-head {
                    min-height: calc(var(--monitor-icon-size, 18px) + 1px);
                    gap: 5px;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    overflow: visible;
                }
                .system-monitor-panel.cycle-mode .system-monitor-icon,
                .system-monitor-panel.cycle-mode .system-monitor-icon svg { width: var(--monitor-icon-size, 18px); height: var(--monitor-icon-size, 18px); overflow: visible; }
                .system-monitor-panel.cycle-mode .system-monitor-label { font-size: var(--monitor-label-size, 10px); letter-spacing: 0.04em; line-height: 1; }
                .system-monitor-panel.cycle-mode .system-monitor-value { font-size: var(--monitor-value-size, 21px); line-height: 0.96; letter-spacing: -0.04em; align-self: center; justify-self: center; margin: 0; }
                .system-monitor-panel.cycle-mode .system-monitor-track { height: var(--monitor-track-h, 4px); width: var(--monitor-track-w, 54px); max-width: 100%; align-self: center; justify-self: center; margin-top: 0; }

                .system-monitor-panel.cycle-mode.display-ring .system-monitor-metric {
                    grid-template-rows: auto 1fr;
                    gap: var(--monitor-cycle-inner-gap, 5px);
                    align-content: center;
                    justify-items: center;
                    --monitor-ring-inner-bg: transparent;
                }

                .system-monitor-panel.cycle-mode.display-ring .system-monitor-head {
                    justify-content: flex-start;
                    justify-self: stretch;
                    min-height: var(--monitor-icon-size, 14px);
                    gap: 4px;
                    padding: 0 1px;
                    box-sizing: border-box;
                }

                .system-monitor-panel.cycle-mode.display-ring .system-monitor-icon,
                .system-monitor-panel.cycle-mode.display-ring .system-monitor-icon svg {
                    width: var(--monitor-icon-size, 14px);
                    height: var(--monitor-icon-size, 14px);
                }

                .system-monitor-panel.cycle-mode.display-ring .system-monitor-value,
                .system-monitor-panel.cycle-mode.display-ring .system-monitor-track { display: none; }
                .system-monitor-panel.cycle-mode.display-ring .system-monitor-ring { display: flex; }

                .system-monitor-cycle-footer,
                .system-monitor-cycle-dots,
                .system-monitor-cycle-dot,
                .system-monitor-cycle-progress,
                .system-monitor-cycle-progress span { display: none !important; }

                @keyframes monitorMetricIn {
                    0% { opacity: 0; transform: translateX(8px) translateY(4px) scale(0.96); filter: blur(4px); }
                    62% { opacity: 1; transform: translateX(-1px) translateY(0) scale(1.015); filter: blur(0); }
                    100% { opacity: 1; transform: translateX(0) translateY(0) scale(1); filter: blur(0); }
                }

                @keyframes monitorCycleProgress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }

                .modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 10000; display: none; align-items: center; justify-content: center; }
                .modal-overlay { position: absolute; width: 100%; height: 100%; background: transparent; }
                .modal-content { position: relative; width: 95%; max-width: 480px; max-height: 85vh; border-radius: 28px; animation: popInModal 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; box-shadow: 0 25px 50px rgba(0,0,0,0.5); overflow: hidden; background: #000000; color-scheme: dark; }
                @keyframes popInModal { 0% { opacity: 0; transform: scale(0.7) translateY(30px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
                .close-btn { position: absolute; top: 15px; right: 15px; z-index: 101; background: rgba(255,255,255,0.18); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; }

                #card-container {
                    overflow-y: auto;
                    background: #000000 !important;
                    border-radius: 28px;
                    color-scheme: dark;
                    --ha-card-background: #000000 !important;
                    --card-background-color: #000000 !important;
                    --paper-card-background-color: #000000 !important;
                    --primary-background-color: #000000 !important;
                    --secondary-background-color: #000000 !important;
                    --primary-text-color: #ffffff !important;
                    --secondary-text-color: rgba(255,255,255,0.82) !important;
                    --text-primary-color: #ffffff !important;
                    --divider-color: rgba(255,255,255,0.18) !important;
                    --ha-card-box-shadow: none !important;
                }
                #card-container > * {
                    background: transparent !important;
                    color-scheme: dark;
                    --ha-card-background: #000000 !important;
                    --card-background-color: #000000 !important;
                    --paper-card-background-color: #000000 !important;
                    --primary-background-color: #000000 !important;
                    --secondary-background-color: #000000 !important;
                    --primary-text-color: #ffffff !important;
                    --secondary-text-color: rgba(255,255,255,0.82) !important;
                    --text-primary-color: #ffffff !important;
                    --divider-color: rgba(255,255,255,0.18) !important;
                    --ha-card-box-shadow: none !important;
                }

                :host([data-paused]) .avatar-stage,
                :host([data-paused]) .system-monitor-metric,
                :host([data-paused]) .chat-bubble { animation-play-state: paused !important; }

                @media (prefers-reduced-motion: reduce) {
                    .avatar-stage, .system-monitor-metric, .chat-bubble, .modal-content {
                        animation: none !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                @media (max-width: 600px) {
                    .bubble-wrapper { align-items: center; }
                    .tooltip { display: none; }
                    .avatar-stage {
                        width: ${mobileSvgWidth}px;
                        min-height: ${mobileStageHeight}px;
                        filter: drop-shadow(0 6px ${Math.max(6, Math.round(shadowSize * 0.55))}px ${shadowColor});
                    }
                    .bubble-wrapper:hover .avatar-stage { transform: scale(1.02) !important; }
                    .svg-avatar { width: ${mobileSvgWidth}px; max-width: ${mobileSvgWidth}px; }
                    .svg-avatar svg { max-height: ${mobileStageHeight}px; }
                    .chat-bubble {
                        width: min(${mobileChatWidth}px, calc(100vw - 24px));
                        max-width: calc(100vw - 24px);
                        font-size: ${mobileChatFontSize}px;
                        padding: ${mobileChatPaddingY}px ${mobileChatPaddingX}px;
                        border-radius: ${Math.max(10, Math.round(chatRadius * 0.62))}px;
                        transform: translate(var(--chat-x), 12px) scale(0.96);
                        line-height: 1.25;
                    }
                    .chat-bubble.show { transform: translate(var(--chat-x), var(--chat-y)) scale(1); }
                    .greeting-main { margin-bottom: 4px; }
                    .greeting-row {
                        gap: 5px;
                        padding: 0.30em 0.40em;
                        margin-top: 3px;
                        grid-template-columns: 1.35em 1fr;
                    }
                    .chat-icon { width: 1.35em; height: 1.35em; font-size: 0.78em; }
                    .system-monitor-button-row { margin-top: 4px; }
                    .system-monitor-toggle {
                        width: 22px;
                        height: 22px;
                    }
                    .system-monitor-toggle:hover, .system-monitor-toggle.active { transform: translate(0, 0) scale(1.06); }
                    .system-monitor-panel {
                        grid-template-columns: repeat(2, minmax(var(--monitor-metric-min, 56px), 1fr));
                        column-gap: var(--monitor-col-gap, 10px);
                        row-gap: var(--monitor-row-gap, 8px);
                        max-width: calc(100vw - 20px);
                        padding: var(--monitor-pad-y, 10px) var(--monitor-pad-x, 12px);
                        border-radius: var(--monitor-radius, 20px);
                        overflow: visible;
                    }
                    .system-monitor-metric { min-width: var(--monitor-metric-min, 48px); }
                    .system-monitor-value { font-size: var(--monitor-value-size, 16px); }
                    .system-monitor-label { font-size: var(--monitor-label-size, 9px); }
                    .system-monitor-panel.cycle-mode {
                        width: min(var(--monitor-cycle-size, 72px), calc(100vw - 20px));
                        height: min(var(--monitor-cycle-size, 72px), calc(100vh - 20px));
                        min-width: min(62px, calc(100vw - 20px));
                        min-height: min(62px, calc(100vh - 20px));
                        padding: var(--monitor-pad-y, 4px) var(--monitor-pad-x, 5px);
                        border-radius: var(--monitor-radius, 10px);
                        aspect-ratio: 1 / 1;
                    }
                    .system-monitor-panel.cycle-mode .system-monitor-metric { gap: var(--monitor-cycle-inner-gap, 3px); align-content: center; justify-items: center; }
                    .system-monitor-panel.cycle-mode .system-monitor-head { justify-content: center; min-height: calc(var(--monitor-icon-size, 18px) + 1px); overflow: visible; }
                    .system-monitor-panel.cycle-mode .system-monitor-value { font-size: var(--monitor-value-size, 20px); line-height: 0.96; align-self: center; justify-self: center; margin: 0; }
                    .system-monitor-panel.cycle-mode .system-monitor-icon,
                    .system-monitor-panel.cycle-mode .system-monitor-icon svg { width: var(--monitor-icon-size, 18px); height: var(--monitor-icon-size, 18px); overflow: visible; }
                    .system-monitor-panel.cycle-mode .system-monitor-track { height: var(--monitor-track-h, 4px); width: var(--monitor-track-w, 54px); max-width: 100%; align-self: center; justify-self: center; margin-top: 0; }
                    .system-monitor-panel.cycle-mode.display-ring .system-monitor-value,
                    .system-monitor-panel.cycle-mode.display-ring .system-monitor-track { display: none; }
                    .system-monitor-panel.cycle-mode.display-ring .system-monitor-ring { display: flex; }
                }
            </style>

            <div class="bubble-wrapper" id="wrapper">
                <div class="avatar-stage" id="bubble" aria-label="Lunar calendar SVG bubble">
                    <div class="svg-avatar" id="svgAvatar">${selectedSvg}</div>
                    <div class="chat-bubble tail-${placement.tail}" id="chatBubble" aria-live="polite">
                        <div class="greeting-main greeting-row"><span class="chat-icon emoji-icon">👑</span><span id="greetingMain"></span></div>
                        <div class="greeting-row"><span class="chat-icon emoji-icon">☀️</span><span class="greeting-date" id="greetingDate"></span></div>
                        <div class="greeting-row"><span class="chat-icon emoji-icon">🌙</span><span class="greeting-lunar" id="greetingLunar"></span></div>
                    </div>
                </div>
                ${this.getSystemMonitorToggleMarkup()}
                <div class="tooltip">Nh&#7845;n &#273;&#7875; xem / K&#233;o &#273;&#7875; di chuy&#7875;n</div>
            </div>
            ${this.getSystemMonitorPanelMarkup()}

            <div class="modal" id="modal">
                <div class="modal-overlay" id="overlay"></div>
                <div class="modal-content">
                    <button class="close-btn" id="close">&#10005;</button>
                    <div id="card-container"></div>
                </div>
            </div>
        `;

        this.setupDragAndDrop();
        this.setupSystemMonitorControls();
        this.setupVisibilityObserver();
        this.updateSystemMonitor();
        this.startSystemMonitorCycle();
        this.shadowRoot.getElementById('overlay')?.addEventListener('click', () => this.closeModal());
        this.shadowRoot.getElementById('close')?.addEventListener('click', () => this.closeModal());
        if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
        this._resizeHandler = () => this.requestChatPlacementUpdate();
        window.addEventListener('resize', this._resizeHandler, { passive: true });
        this.updateDates(true);
        this.requestChatPlacementUpdate();
        this.scheduleGreeting();
    }

    getGreetingRepeatIntervalMs() {
        return 5 * 60 * 1000;
    }

    scheduleGreetingHide(options = {}) {
        window.clearTimeout(this._greetingHideTimer);
        const timeout = this.getGreetingTimeoutMs();
        if (timeout <= 0) return;

        const tryHide = () => {
            if (this._isHovering || this._isTouchHolding) {
                this._greetingHideTimer = window.setTimeout(tryHide, 500);
                return;
            }
            this.hideGreeting();
            if (options.thenRepeat) this.scheduleNextRepeatedGreeting();
        };

        this._greetingHideTimer = window.setTimeout(tryHide, timeout);
    }

    scheduleNextRepeatedGreeting() {
        window.clearTimeout(this._greetingRepeatTimer);
        if (!this.isCardActive()) return;
        if (!this.config.greeting_enabled || !this.config.greeting_repeat_enabled) return;
        if (this.getGreetingTimeoutMs() <= 0) return;

        this._greetingRepeatTimer = window.setTimeout(() => {
            if (!this.isConnected || !this.config.greeting_enabled || !this.config.greeting_repeat_enabled) return;
            this.showGreeting({ restartTyping: true });
            this.scheduleGreetingHide({ thenRepeat: true });
        }, this.getGreetingRepeatIntervalMs());
    }

    scheduleGreeting() {
        window.clearTimeout(this._greetingTimer);
        window.clearTimeout(this._greetingHideTimer);
        window.clearTimeout(this._greetingRepeatTimer);
        window.clearTimeout(this._touchHoldTimer);
        this.clearTypingTimers();
        const chat = this.shadowRoot.getElementById('chatBubble');
        if (!chat) return;
        chat.classList.remove('show');
        chat.dataset.typed = '0';
        this.setGreetingFullText();
        if (!this.isCardActive()) return;
        if (!this.config.greeting_enabled) return;

        const delay = Math.max(0, Number(this.config.greeting_delay) || 0);
        this._greetingTimer = window.setTimeout(() => {
            this.showGreeting({ restartTyping: true });
            this.scheduleGreetingHide({ thenRepeat: !!this.config.greeting_repeat_enabled });
        }, delay);
    }

    setupDragAndDrop() {
        const wrapper = this.shadowRoot.getElementById('wrapper');
        const bubble = this.shadowRoot.getElementById('bubble');
        if (!wrapper || !bubble) return;

        let isDragging = false;
        let initialX = 0;
        let initialY = 0;
        let currentX = 0;
        let currentY = 0;
        let xOffset = 0;
        let yOffset = 0;
        let hasDragged = false;

        const dragStart = (e) => {
            const point = e.type === 'touchstart' ? e.touches[0] : e;
            initialX = point.clientX - xOffset;
            initialY = point.clientY - yOffset;
            isDragging = true;
            hasDragged = false;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', dragEnd);
        };

        const drag = (e) => {
            if (!isDragging) return;
            const point = e.type === 'touchmove' ? e.touches[0] : e;
            currentX = point.clientX - initialX;
            currentY = point.clientY - initialY;

            if (Math.abs(currentX - xOffset) > 5 || Math.abs(currentY - yOffset) > 5) {
                hasDragged = true;
            }

            xOffset = currentX;
            yOffset = currentY;
            wrapper.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            this.requestChatPlacementUpdate();
            if (e.cancelable) e.preventDefault();
        };

        const dragEnd = () => {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', dragEnd);
        };

        const startTouchHoldTimer = (e) => {
            const point = e.touches && e.touches[0] ? e.touches[0] : null;
            if (!point) return;
            const startX = point.clientX;
            const startY = point.clientY;
            this._didLongPress = false;
            this._isTouchHolding = false;
            window.clearTimeout(this._touchHoldTimer);
            this._touchHoldTimer = window.setTimeout(() => {
                this._didLongPress = true;
                this._isTouchHolding = true;
                this._isHovering = true;
                this.requestChatPlacementUpdate();
                window.clearTimeout(this._greetingHideTimer);
                window.clearTimeout(this._greetingRepeatTimer);
                if (this.config.greeting_enabled) {
                    this.showGreeting({ restartTyping: true });
                }
                if (this.config.system_monitor_hover_enabled) {
                    this.showSystemMonitor(false);
                }
            }, 450);

            const cancelIfMoved = (moveEvent) => {
                const movePoint = moveEvent.touches && moveEvent.touches[0] ? moveEvent.touches[0] : null;
                if (!movePoint || this._didLongPress) return;
                if (Math.abs(movePoint.clientX - startX) > 10 || Math.abs(movePoint.clientY - startY) > 10) {
                    window.clearTimeout(this._touchHoldTimer);
                    document.removeEventListener('touchmove', cancelIfMoved);
                }
            };
            document.addEventListener('touchmove', cancelIfMoved, { passive: true });
            document.addEventListener('touchend', () => document.removeEventListener('touchmove', cancelIfMoved), { once: true });
            document.addEventListener('touchcancel', () => document.removeEventListener('touchmove', cancelIfMoved), { once: true });
        };

        const finishTouchHold = () => {
            window.clearTimeout(this._touchHoldTimer);
            if (this._didLongPress || this._isTouchHolding) {
                this._isTouchHolding = false;
                this._isHovering = false;
                this.hideGreeting();
                if (this.config.system_monitor_hover_enabled) this.hideSystemMonitor();
                this._suppressNextClick = true;
                window.setTimeout(() => { this._suppressNextClick = false; }, 450);
                if (this.config.greeting_repeat_enabled) this.scheduleNextRepeatedGreeting();
            }
        };

        bubble.addEventListener('mousedown', dragStart);
        bubble.addEventListener('touchstart', (e) => {
            startTouchHoldTimer(e);
            dragStart(e);
            document.addEventListener('touchend', finishTouchHold, { once: true });
            document.addEventListener('touchcancel', finishTouchHold, { once: true });
        }, { passive: false });
        bubble.addEventListener('mouseenter', () => {
            if (this._isTouchHolding) return;
            this._isHovering = true;
            this.requestChatPlacementUpdate();
            window.clearTimeout(this._greetingHideTimer);
            window.clearTimeout(this._greetingRepeatTimer);
            this.showGreeting({ restartTyping: true });
            if (this.config.system_monitor_hover_enabled) this.showSystemMonitor(false);
        });
        bubble.addEventListener('mouseleave', () => {
            this._isHovering = false;
            if (!isDragging && !this._isTouchHolding) {
                this.hideGreeting();
                if (this.config.system_monitor_hover_enabled) this.hideSystemMonitor();
                if (this.config.greeting_repeat_enabled) this.scheduleNextRepeatedGreeting();
            }
        });
        bubble.addEventListener('click', (e) => {
            if (this._suppressNextClick) {
                e.preventDefault();
                e.stopPropagation();
                this._suppressNextClick = false;
                return;
            }
            if (hasDragged) {
                e.preventDefault();
                e.stopPropagation();
                hasDragged = false;
                return;
            }
            this.openModal();
        });
    }

    getDateRenderKey() {
        const now = new Date();
        return [
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            this.config?.greeting_user || '',
            this._hass?.user?.name || '',
            this._hass?.user?.displayName || ''
        ].join('|');
    }

    updateDates(force = false) {
        if (this._isTypingGreeting) return;
        const dateKey = this.getDateRenderKey();
        if (!force && this._lastDateKey === dateKey) return;
        this._lastDateKey = dateKey;
        this.setGreetingFullText();
    }

    applyMainBlockPopupDarkTheme(card = this.mainCard) {
        const container = this.shadowRoot?.getElementById('card-container');
        const darkVars = {
            '--ha-card-background': '#000000',
            '--card-background-color': '#000000',
            '--paper-card-background-color': '#000000',
            '--primary-background-color': '#000000',
            '--secondary-background-color': '#000000',
            '--primary-text-color': '#ffffff',
            '--secondary-text-color': 'rgba(255,255,255,0.82)',
            '--text-primary-color': '#ffffff',
            '--divider-color': 'rgba(255,255,255,0.18)',
            '--ha-card-box-shadow': 'none'
        };
        const applyVars = (el) => {
            if (!el?.style) return;
            Object.entries(darkVars).forEach(([name, value]) => {
                el.style.setProperty(name, value, 'important');
            });
            el.style.colorScheme = 'dark';
        };

        applyVars(container);
        applyVars(card);
        if (container) container.style.setProperty('background', '#000000', 'important');
        if (card) card.style.setProperty('background', 'transparent', 'important');
    }

    async openModal() {
        const container = this.shadowRoot.getElementById('card-container');
        const modal = this.shadowRoot.getElementById('modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('force-dark-calendar-popup');
        }
        this.applyMainBlockPopupDarkTheme();
        if (!container) return;

        const openToken = (this._mainBlockOpenToken || 0) + 1;
        this._mainBlockOpenToken = openToken;

        if (!customElements.get(MAIN_BLOCK_CARD_TAG) && !this.mainCard) {
            container.innerHTML = '<div style="padding: 22px; color: var(--primary-text-color);">Đang tải lịch block chính...</div>';
        }

        const isReady = await ensureMainBlockCardLoaded();
        if (openToken !== this._mainBlockOpenToken) return;

        if (!isReady) {
            container.innerHTML = '<div style="padding: 22px; color: var(--primary-text-color);">Chưa tải được thẻ <b>lich-block-am-duong-viet-nam</b>. Hãy kiểm tra file lịch block chính nằm cùng thư mục và được khai báo dạng JavaScript module.</div>';
            return;
        }

        if (!this.mainCard) {
            this.mainCard = document.createElement(MAIN_BLOCK_CARD_TAG);
            const today = new Date();
            const dateValue = formatDateValueForMainBlock(today);
            this.mainCard.setConfig({
                type: 'custom:lich-block-am-duong-viet-nam',
                bg_type: 'solid',
                bg_color: '#000000',
                bg_opacity: 100,
                border_opacity: 0,
                shadow_enable: false,
                text_main_color: '#ffffff',
                text_accent_color: '#ffff99',
                selected_date: dateValue,
                initial_date: dateValue,
                date: dateValue,
                day: today.getDate(),
                month: today.getMonth() + 1,
                year: today.getFullYear()
            });
            if (this._hass) this.mainCard.hass = this._hass;
            this.applyMainBlockPopupDarkTheme(this.mainCard);
            container.replaceChildren(this.mainCard);
        } else if (!container.contains(this.mainCard)) {
            container.replaceChildren(this.mainCard);
            if (this._hass) this.mainCard.hass = this._hass;
            this.applyMainBlockPopupDarkTheme(this.mainCard);
        } else {
            this.applyMainBlockPopupDarkTheme(this.mainCard);
        }
    }

    closeModal() {
        const modal = this.shadowRoot.getElementById('modal');
        if (modal) modal.style.display = 'none';
    }
}

class LunarCalendarBubbleEditor extends HTMLElement {
    constructor() {
        super();
        this._registrySensorIds = [];
        this._registryRequested = false;
        this._entityInputDispatchTimer = null;
    }

    disconnectedCallback() {
        window.clearTimeout(this._entityInputDispatchTimer);
    }

    set hass(hass) {
        this._hass = hass;
        this.updateEntityPickers();
    }

    escapeAttribute(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    normalizeEntityId(entityId) {
        return String(entityId ?? '')
            .trim()
            .replace(/[​-‍﻿]/g, '')
            .replace(/^['"]|['"]$/g, '')
            .replace(/\s+/g, '')
            .toLowerCase();
    }

    getDefaultSystemSensorMap() {
        return {
            system_sensor_ram: 'sensor.system_monitor_memory_usage',
            system_sensor_cpu: 'sensor.system_monitor_processor_use',
            system_sensor_disk: 'sensor.system_monitor_disk_usage',
            system_sensor_temp: 'sensor.system_monitor_processor_temperature'
        };
    }

    getMetricKeyForInput(id) {
        return ({ system_sensor_ram: 'ram', system_sensor_cpu: 'cpu', system_sensor_disk: 'disk', system_sensor_temp: 'temp' })[id] || '';
    }

    getHassObject() {
        if (this._hass) return this._hass;
        const homeAssistant = document.querySelector('home-assistant');
        if (homeAssistant?.hass) return homeAssistant.hass;
        const candidates = [
            document.querySelector('home-assistant-main'),
            document.querySelector('ha-panel-lovelace'),
            document.querySelector('hui-root')
        ];
        for (const candidate of candidates) {
            if (candidate?.hass) return candidate.hass;
        }
        return null;
    }

    getAllStatesMap() {
        return this.getHassObject()?.states || {};
    }

    async loadSensorRegistryOnce() {
        if (!this._hass?.callWS || this._registryRequested) return;
        this._registryRequested = true;
        try {
            const entities = await this._hass.callWS({ type: 'config/entity_registry/list' });
            if (Array.isArray(entities)) {
                this._registrySensorIds = entities
                    .map((entity) => this.normalizeEntityId(entity?.entity_id))
                    .filter((entityId) => entityId.startsWith('sensor.'));
                this.updateEntityPickers();
            }
        } catch (err) {
            console.warn('Cannot load entity registry for sensor selector:', err);
        }
    }

    updateSensorDatalist() {
        const datalist = this.querySelector('#system_sensor_entities');
        if (datalist) datalist.innerHTML = this.getSensorOptions();
    }

    getSensorEntityIds() {
        const ids = new Set(Object.values(this.getDefaultSystemSensorMap()).map((id) => this.normalizeEntityId(id)));
        ['system_sensor_ram', 'system_sensor_cpu', 'system_sensor_disk', 'system_sensor_temp'].forEach((key) => {
            const value = this.normalizeEntityId(this.config?.[key]);
            if (value) ids.add(value);
        });

        const stateIds = Object.keys(this.getAllStatesMap());
        const entityRegistryIds = Object.keys(this._hass?.entities || {});
        [...stateIds, ...entityRegistryIds, ...(this._registrySensorIds || [])].forEach((entityId) => {
            const normalized = this.normalizeEntityId(entityId);
            if (normalized.startsWith('sensor.')) ids.add(normalized);
        });

        const preferred = Object.values(this.getDefaultSystemSensorMap()).map((id) => this.normalizeEntityId(id));
        return Array.from(ids)
            .filter((entityId) => entityId.startsWith('sensor.'))
            .sort((a, b) => {
                const aPreferred = preferred.includes(a) ? 0 : 1;
                const bPreferred = preferred.includes(b) ? 0 : 1;
                if (aPreferred !== bPreferred) return aPreferred - bPreferred;
                const aSystem = a.includes('system_monitor') ? 0 : 1;
                const bSystem = b.includes('system_monitor') ? 0 : 1;
                if (aSystem !== bSystem) return aSystem - bSystem;
                return a.localeCompare(b);
            });
    }

    getSystemMonitorAliasCandidates(key) {
        const map = {
            ram: ['sensor.system_monitor_memory_usage', 'sensor.system_monitor_memory_use_percent', 'sensor.system_monitor_memory_use', 'sensor.memory_use_percent', 'sensor.memory_usage', 'sensor.ram_usage'],
            cpu: ['sensor.system_monitor_processor_use', 'sensor.system_monitor_cpu_usage', 'sensor.processor_use', 'sensor.cpu_usage', 'sensor.cpu_use_percent'],
            disk: ['sensor.system_monitor_disk_usage', 'sensor.system_monitor_disk_use_percent', 'sensor.disk_use_percent', 'sensor.disk_usage', 'sensor.disk_use'],
            temp: ['sensor.system_monitor_processor_temperature', 'sensor.processor_temperature', 'sensor.cpu_temperature', 'sensor.system_monitor_cpu_temperature', 'sensor.temperature_cpu']
        };
        return (map[key] || []).map((entityId) => this.normalizeEntityId(entityId));
    }

    findStateByExactId(states, entityId) {
        const normalized = this.normalizeEntityId(entityId);
        if (!normalized) return null;
        if (states[normalized]) return { entityId: normalized, stateObj: states[normalized] };
        for (const [id, stateObj] of Object.entries(states || {})) {
            const normalizedKey = this.normalizeEntityId(id);
            const normalizedStateEntityId = this.normalizeEntityId(stateObj?.entity_id);
            if (normalizedKey === normalized || normalizedStateEntityId === normalized) {
                return { entityId: normalizedStateEntityId || normalizedKey || normalized, stateObj };
            }
        }
        return null;
    }

    findStateByMetricKey(states, key) {
        const rules = {
            ram: [['memory', 'ram'], ['usage', 'use', 'percent', 'used']],
            cpu: [['processor', 'cpu'], ['usage', 'use', 'percent', 'load']],
            disk: [['disk', 'storage'], ['usage', 'use', 'percent', 'used']],
            temp: [['temperature', 'temp'], ['processor', 'cpu']]
        };
        const groups = rules[key];
        if (!groups) return null;
        const candidates = Object.keys(states)
            .filter((id) => id.startsWith('sensor.'))
            .map((id) => {
                const friendly = states[id]?.attributes?.friendly_name || '';
                const unit = states[id]?.attributes?.unit_of_measurement || '';
                const text = `${id} ${friendly} ${unit}`.toLowerCase();
                const matched = groups.every((group) => group.some((token) => text.includes(token)));
                const systemScore = text.includes('system_monitor') ? -4 : 0;
                const unitScore = key === 'temp' && (unit.includes('°') || unit.toLowerCase().includes('c')) ? -2 : 0;
                return { id, matched, score: systemScore + unitScore + text.length / 1000 };
            })
            .filter((item) => item.matched)
            .sort((a, b) => a.score - b.score);
        const best = candidates[0]?.id;
        return best ? { entityId: best, stateObj: states[best] } : null;
    }

    getEntityStateResult(entityId, inputId = '') {
        const normalized = this.normalizeEntityId(entityId);
        const states = this.getAllStatesMap();
        if (!normalized) return { entityId: '', stateObj: null };
        const exact = this.findStateByExactId(states, normalized);
        return exact || { entityId: normalized, stateObj: null };
    }

    getEntityState(entityId, inputId = '') {
        return this.getEntityStateResult(entityId, inputId).stateObj;
    }

    getSensorLabel(entityId) {
        const stateObj = this.getEntityState(entityId);
        const friendly = stateObj?.attributes?.friendly_name || '';
        return friendly && friendly !== entityId ? `${friendly} (${entityId})` : entityId;
    }

    getSensorOptions() {
        return this.getSensorEntityIds()
            .slice(0, 5000)
            .map((entityId) => `<option value="${this.escapeAttribute(entityId)}" label="${this.escapeAttribute(this.getSensorLabel(entityId))}"></option>`)
            .join('');
    }

    getSensorSelectOptions(currentValue = '') {
        const current = this.normalizeEntityId(currentValue || '');
        const ids = this.getSensorEntityIds();
        const hasCurrent = current && ids.includes(current);
        const first = '<option value="">-- Chọn nhanh / hoặc gõ để tìm --</option>';
        const missing = current && !hasCurrent
            ? `<option value="${this.escapeAttribute(current)}" selected>${this.escapeAttribute(current)} (đang nhập)</option>`
            : '';
        const options = ids.slice(0, 300).map((entityId) => {
            const selected = entityId === current ? ' selected' : '';
            return `<option value="${this.escapeAttribute(entityId)}"${selected}>${this.escapeAttribute(this.getSensorLabel(entityId))}</option>`;
        }).join('');
        return `${first}${missing}${options}`;
    }

    getEntityPickerMarkup(id, value, placeholder) {
        const defaultEntity = this.normalizeEntityId(placeholder || this.getDefaultSystemSensorMap()[id] || 'sensor.entity_id');
        const currentValue = this.normalizeEntityId(value || defaultEntity);
        const safeValue = this.escapeAttribute(currentValue || '');
        const safePlaceholder = this.escapeAttribute(defaultEntity || 'sensor.entity_id');
        return `<input class="entity-input system-sensor-input" type="text" id="${id}" placeholder="${safePlaceholder}" value="${safeValue}" autocomplete="off" autocapitalize="off" spellcheck="false">
                        <div class="entity-state-preview" id="${id}_state"></div>`;
    }

    getMatchingSensorEntityIds(query = '') {
        const normalizedQuery = String(query || '').trim().toLowerCase();
        const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
        const ids = this.getSensorEntityIds();
        if (!tokens.length) {
            const defaults = Object.values(this.getDefaultSystemSensorMap()).map((id) => this.normalizeEntityId(id));
            return ids.filter((id) => defaults.includes(id) || id.includes('system_monitor')).slice(0, 80);
        }
        return ids.filter((entityId) => {
            const friendly = this.getEntityState(entityId)?.attributes?.friendly_name || '';
            const haystack = `${entityId} ${friendly}`.toLowerCase();
            return tokens.every((token) => haystack.includes(token));
        }).slice(0, 100);
    }

    updateEntitySuggestions(id) {
        const input = this.querySelector(`#${id}`);
        const box = this.querySelector(`#${id}_suggestions`);
        if (!input || !box) return;
        const searchText = String(input.value || '').replace(/^sensor\./, '').replace(/_/g, ' ');
        const matches = this.getMatchingSensorEntityIds(searchText);
        if (!matches.length) {
            box.innerHTML = '<div class="entity-suggestion-empty">Không thấy sensor phù hợp. Có thể nhập trực tiếp entity_id rồi lưu.</div>';
            return;
        }
        box.innerHTML = matches.map((entityId) => {
            const stateObj = this.getEntityState(entityId);
            const stateText = stateObj ? `${stateObj.state}${stateObj.attributes?.unit_of_measurement || ''}` : 'chưa có state';
            return `<button type="button" class="entity-suggestion-item" data-input-id="${id}" data-entity="${this.escapeAttribute(entityId)}">
                        <span>${this.escapeAttribute(this.getSensorLabel(entityId))}</span>
                        <small>${this.escapeAttribute(stateText)}</small>
                    </button>`;
        }).join('');
    }

    updateAllEntitySuggestions() {
        ['system_sensor_ram', 'system_sensor_cpu', 'system_sensor_disk', 'system_sensor_temp'].forEach((id) => this.updateEntitySuggestions(id));
    }

    updateEntityPickerStates() {
        ['system_sensor_ram', 'system_sensor_cpu', 'system_sensor_disk', 'system_sensor_temp'].forEach((id) => {
            const input = this.querySelector(`#${id}`);
            const preview = this.querySelector(`#${id}_state`);
            if (!input || !preview) return;
            const entityId = this.normalizeEntityId(input.value);
            const result = this.getEntityStateResult(entityId, id);
            const stateObj = result.stateObj;
            if (!entityId) {
                preview.textContent = 'Chưa nhập entity_id.';
                preview.classList.remove('ok');
                preview.classList.add('missing');
            } else if (stateObj) {
                const unit = stateObj.attributes?.unit_of_measurement || '';
                const resolved = result.entityId && result.entityId !== entityId ? ` qua ${result.entityId}` : '';
                preview.textContent = `Đã nhận state${resolved}: ${stateObj.state}${unit ? ` ${unit}` : ''}`;
                preview.classList.add('ok');
                preview.classList.remove('missing');
            } else {
                const total = Object.keys(this.getAllStatesMap()).length;
                preview.textContent = `Chưa lấy được state cho ${entityId} (${total} state đã tải). Kiểm tra lại entity_id trong Developer Tools > States.`;
                preview.classList.remove('ok');
                preview.classList.add('missing');
            }
        });
    }

    updateEntityPickers() {
        ['system_sensor_ram', 'system_sensor_cpu', 'system_sensor_disk', 'system_sensor_temp'].forEach((id) => {
            const input = this.querySelector(`#${id}`);
            const current = this.normalizeEntityId(input?.value || this.config?.[id] || this.getDefaultSystemSensorMap()[id] || '');
            if (input && current && !input.value) input.value = current;
        });
        this.updateEntityPickerStates();
    }

    getEntityPickerValue(id) {
        const input = this.querySelector(`#${id}`);
        const value = this.normalizeEntityId(input?.value || this.getDefaultSystemSensorMap()[id] || '');
        return value;
    }

    setConfig(config) {
        const mergedConfig = { ...LunarCalendarBubbleCard.getStubConfig(), ...config };
        if (config.greeting_timeout_s === undefined && config.greeting_timeout !== undefined) {
            const legacyTimeout = Number(config.greeting_timeout) || 0;
            mergedConfig.greeting_timeout_s = legacyTimeout > 120 ? Math.round(legacyTimeout / 1000) : legacyTimeout;
        }
        mergedConfig.system_monitor_cycle_seconds = Math.min(120, Math.max(0.5, Number(mergedConfig.system_monitor_cycle_seconds) || 3));
        mergedConfig.system_monitor_display_style = ['ring', 'bar'].includes(mergedConfig.system_monitor_display_style) ? mergedConfig.system_monitor_display_style : 'ring';
        this.config = mergedConfig;
        this.render();
    }

    getFontOptions() {
        const current = this.config.chat_font_family || 'system';
        return CHAT_FONT_OPTIONS.map((item) => `<option value="${item.value}" ${current === item.value ? 'selected' : ''}>${item.label}</option>`).join('');
    }


    getChatStyleOptions() {
        const current = this.config.chat_style || 'glass_light';
        return CHAT_STYLE_OPTIONS.map((item) => `<option value="${item.value}" ${current === item.value ? 'selected' : ''}>${item.label}</option>`).join('');
    }

    getSvgOptions() {
        const count = SVG_COUNT || 1;
        const current = Number.parseInt(this.config.svg_style, 10) || 0;
        return Array.from({ length: count }, (_, index) => {
            const name = SVG_NAMES[index] || `Mau SVG ${String(index + 1).padStart(2, '0')}`;
            return `<option value="${index}" ${current === index ? 'selected' : ''}>${name}</option>`;
        }).join('');
    }

    render() {
        if (!this.config) return;
        this.innerHTML = `
            <style>
                .config-container { display: flex; flex-direction: column; gap: 12px; padding: 10px 0; }
                .section { border: 1px solid var(--divider-color); padding: 12px; border-radius: 12px; background: var(--secondary-background-color); }
                .section-title { font-weight: 700; margin-bottom: 12px; color: var(--primary-color); font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; }
                .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
                .field label { font-size: 12px; font-weight: 700; color: var(--primary-text-color); }
                .input-group { display: flex; align-items: center; gap: 10px; }
                input[type="color"] { width: 38px; height: 38px; border: none; border-radius: 50%; cursor: pointer; padding: 0; background: none; }
                input[type="number"], input[type="range"], select, .entity-input { padding: 8px; border-radius: 6px; border: 1px solid var(--divider-color); flex: 1; color: var(--primary-text-color); background: var(--card-background-color); }
                input[type="text"], .entity-input { padding: 8px; border-radius: 6px; border: 1px solid var(--divider-color); color: var(--primary-text-color); background: var(--card-background-color); }
                .entity-input { width: 100%; box-sizing: border-box; min-width: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
                .entity-state-preview { margin-top: 5px; font-size: 11px; line-height: 1.35; color: var(--secondary-text-color); overflow-wrap: anywhere; }
                .entity-state-preview.ok { color: var(--success-color, #138a36); font-weight: 700; }
                .entity-state-preview.missing { color: var(--warning-color, #9a6700); }
                .value-badge { font-family: monospace; font-size: 11px; background: var(--divider-color); padding: 3px 7px; border-radius: 5px; min-width: 48px; text-align: center; color: var(--primary-text-color); }
                .checkbox-group { display: flex; align-items: center; gap: 8px; cursor: pointer; margin-bottom: 6px; }
                .checkbox-group input { width: 16px; height: 16px; accent-color: var(--primary-color); cursor: pointer; }
                .checkbox-group label { cursor: pointer; font-size: 13px; font-weight: 400; color: var(--primary-text-color); }
                .hint { color: var(--secondary-text-color); font-size: 12px; line-height: 1.35; margin-top: 4px; }
                .hint a { color: var(--primary-color); font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
                .hint a:hover { text-decoration: underline; }
            </style>
            <div class="config-container">
                <div class="section">
                    <div class="section-title">M&#7851;u SVG &amp; khung chat</div>
                    <div class="field">
                        <label>Ch&#7885;n m&#7851;u SVG hi&#7875;n th&#7883;</label>
                        <select id="svg_style">${this.getSvgOptions()}</select>
                        <div class="hint">M&#7895;i SVG ch&#7881; &#273;&#432;&#7907;c t&#7843;i khi b&#7841;n ch&#7885;n, gi&#250;p dashboard kh&#7903;i &#273;&#7897;ng nhanh h&#417;n.</div>
                    </div>
                    <div class="field">
                        <label>K&#237;ch th&#432;&#7899;c SVG</label>
                        <div class="input-group">
                            <input type="range" id="svg_size" min="40" max="280" step="5" value="${this.config.svg_size}">
                            <span class="value-badge">${this.config.svg_size}px</span>
                        </div>
                    </div>
                    <div class="field">
                        <div class="checkbox-group">
                            <input type="checkbox" id="greeting_enabled" ${this.config.greeting_enabled ? 'checked' : ''}>
                            <label for="greeting_enabled">Hi&#7879;n khung chat ch&#224;o sau khi SVG load</label>
                        </div>
                    </div>
                    <div class="field">
                        <label>T&#234;n hi&#7875;n th&#7883; trong c&#226;u ch&#224;o (b&#7887; tr&#7889;ng = user Home Assistant)</label>
                        <input type="text" id="greeting_user" value="${String(this.config.greeting_user || '').replace(/"/g, '&quot;')}">
                    </div>
                    <div class="field">
                        <label>&#272;&#7897; tr&#7877; hi&#7879;n khung chat</label>
                        <div class="input-group">
                            <input type="number" id="greeting_delay" min="0" step="50" value="${this.config.greeting_delay}">
                            <span class="value-badge">ms</span>
                        </div>
                    </div>
                    <div class="field">
                        <label>T&#7921; &#7849;n khung chat sau (0 = kh&#244;ng t&#7921; &#7849;n)</label>
                        <div class="input-group">
                            <input type="number" id="greeting_timeout_s" min="0" step="1" value="${this.config.greeting_timeout_s}">
                            <span class="value-badge">s</span>
                        </div>
                        <div class="hint">M&#7863;c &#273;&#7883;nh 15 gi&#226;y. V&#237; d&#7909;: 15 = t&#7921; &#7849;n sau 15 gi&#226;y.</div>
                    </div>
                    <div class="field">
                        <div class="checkbox-group">
                            <input type="checkbox" id="greeting_repeat_enabled" ${this.config.greeting_repeat_enabled ? 'checked' : ''}>
                            <label for="greeting_repeat_enabled">T&#7921; hi&#7879;n l&#7841;i khung chat sau m&#7895;i 5 ph&#250;t</label>
                        </div>
                        <div class="hint">Khi b&#7853;t: khung chat s&#7869; hi&#7879;n, &#7849;n theo s&#7889; gi&#226;y b&#234;n tr&#234;n, r&#7891;i ch&#7901; 5 ph&#250;t &#273;&#7875; t&#7921; hi&#7879;n l&#7841;i.</div>
                    </div>
                </div>


                <div class="section">
                    <div class="section-title">System monitor</div>
                    <div class="field">
                        <div class="checkbox-group">
                            <input type="checkbox" id="system_monitor_enabled" ${this.config.system_monitor_enabled ? 'checked' : ''}>
                            <label for="system_monitor_enabled">Hiển thị bảng thông tin sensor cạnh SVG</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="checkbox-group">
                            <input type="checkbox" id="system_monitor_button_enabled" ${this.config.system_monitor_button_enabled ? 'checked' : ''}>
                            <label for="system_monitor_button_enabled">Bật nút ẩn/hiện cạnh SVG</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="checkbox-group">
                            <input type="checkbox" id="system_monitor_hover_enabled" ${this.config.system_monitor_hover_enabled ? 'checked' : ''}>
                            <label for="system_monitor_hover_enabled">Di chuột / nhấn giữ SVG để hiện bảng</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="checkbox-group">
                            <input type="checkbox" id="system_monitor_initial_visible" ${this.config.system_monitor_initial_visible ? 'checked' : ''}>
                            <label for="system_monitor_initial_visible">Mở sẵn bảng khi tải card</label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="checkbox-group">
                            <input type="checkbox" id="system_monitor_cycle_enabled" ${this.config.system_monitor_cycle_enabled ? 'checked' : ''}>
                            <label for="system_monitor_cycle_enabled">Hiện từng sensor luân phiên</label>
                        </div>
                        <div class="hint">Bỏ chọn để hiện đủ 4 sensor thành 2 hàng RAM - CPU / Disk - Temp.</div>
                    </div>
                    <div class="field">
                        <label>Thời gian chuyển sensor</label>
                        <div class="input-group">
                            <input type="number" id="system_monitor_cycle_seconds" min="0.5" max="120" step="0.5" value="${this.config.system_monitor_cycle_seconds}">
                            <span class="value-badge">${this.config.system_monitor_cycle_seconds}s</span>
                        </div>
                        <div class="hint">Mặc định 3 giây. Khi bật, thẻ sẽ tự quay vòng RAM → CPU → Disk → Temp liên tục với hiệu ứng trượt/mờ mượt.</div>
                    </div>
                    <div class="field">
                        <label>Kiểu hiển thị sensor</label>
                        <select id="system_monitor_display_style">
                            <option value="ring" ${this.config.system_monitor_display_style === 'ring' ? 'selected' : ''}>Vòng tròn hiện đại</option>
                            <option value="bar" ${this.config.system_monitor_display_style === 'bar' ? 'selected' : ''}>Thanh ngang gọn</option>
                        </select>
                        <div class="hint">Kiểu vòng tròn giống ảnh đính kèm và là mặc định. Kiểu thanh ngang là giao diện cũ.</div>
                    </div>
                    <div class="field">
                        <label>Sensor RAM</label>
                        ${this.getEntityPickerMarkup('system_sensor_ram', this.config.system_sensor_ram, 'sensor.system_monitor_memory_usage')}
                    </div>
                    <div class="field">
                        <label>Sensor CPU</label>
                        ${this.getEntityPickerMarkup('system_sensor_cpu', this.config.system_sensor_cpu, 'sensor.system_monitor_processor_use')}
                    </div>
                    <div class="field">
                        <label>Sensor Disk</label>
                        ${this.getEntityPickerMarkup('system_sensor_disk', this.config.system_sensor_disk, 'sensor.system_monitor_disk_usage')}
                    </div>
                    <div class="field">
                        <label>Sensor nhiệt độ CPU</label>
                        ${this.getEntityPickerMarkup('system_sensor_temp', this.config.system_sensor_temp, 'sensor.system_monitor_processor_temperature')}
                    </div>
                    <div class="hint">Chỉ nhập trực tiếp entity_id của sensor, ví dụ <b>sensor.system_monitor_memory_usage</b>. Thẻ sẽ lấy state từ <b>hass.states</b> theo đúng entity_id đã nhập.</div>
                    <div class="hint">Tham khảo Tích Hợp System monitor: <a href="https://www.home-assistant.io/integrations/systemmonitor/" target="_blank" rel="noopener noreferrer">https://www.home-assistant.io/integrations/systemmonitor/</a></div>
                    <div class="field">
                        <label>Mốc tối đa cho thanh nhiệt độ</label>
                        <div class="input-group">
                            <input type="number" id="system_monitor_temp_max" min="40" max="150" step="1" value="${this.config.system_monitor_temp_max}">
                            <span class="value-badge">°C</span>
                        </div>
                        <div class="hint">Các sensor CPU/RAM/Disk dùng thang 0-100%. Sensor nhiệt độ dùng mốc này để vẽ thanh màu.</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">V&#7883; tr&#237; &amp; hi&#7879;u &#7913;ng</div>
                    <div class="field">
                        <label>Hi&#7879;u &#7913;ng SVG</label>
                        <select id="animation_type">
                            <option value="none" ${this.config.animation_type === 'none' ? 'selected' : ''}>T&#297;nh</option>
                            <option value="breathe" ${this.config.animation_type === 'breathe' ? 'selected' : ''}>Nh&#7883;p th&#7903;</option>
                            <option value="float" ${this.config.animation_type === 'float' ? 'selected' : ''}>Tr&#244;i n&#7893;i</option>
                            <option value="pulse_glow" ${this.config.animation_type === 'pulse_glow' ? 'selected' : ''}>T&#7887;a s&#225;ng</option>
                            <option value="swing" ${this.config.animation_type === 'swing' ? 'selected' : ''}>L&#7855;c l&#432;</option>
                            <option value="heartbeat" ${this.config.animation_type === 'heartbeat' ? 'selected' : ''}>Nh&#7883;p tim</option>
                            <option value="bounce" ${this.config.animation_type === 'bounce' ? 'selected' : ''}>N&#7843;y nh&#7865;</option>
                            <option value="jelly" ${this.config.animation_type === 'jelly' ? 'selected' : ''}>Kh&#7889;i th&#7841;ch</option>
                            <option value="wobble" ${this.config.animation_type === 'wobble' ? 'selected' : ''}>Chao &#273;&#7843;o</option>
                            <option value="squeeze" ${this.config.animation_type === 'squeeze' ? 'selected' : ''}>Co gi&#227;n</option>
                            <option value="rubber_band" ${this.config.animation_type === 'rubber_band' ? 'selected' : ''}>D&#226;y thun</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>V&#7883; tr&#237; hi&#7875;n th&#7883; m&#7863;c &#273;&#7883;nh</label>
                        <select id="position">
                            <option value="bottom-right" ${this.config.position === 'bottom-right' ? 'selected' : ''}>D&#432;&#7899;i c&#249;ng b&#234;n ph&#7843;i</option>
                            <option value="top-right" ${this.config.position === 'top-right' ? 'selected' : ''}>Tr&#234;n c&#249;ng b&#234;n ph&#7843;i</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Kho&#7843;ng c&#225;ch l&#234;n/xu&#7889;ng</label>
                        <div class="input-group">
                            <input type="range" id="offset_y" min="20" max="600" step="10" value="${this.config.offset_y}">
                            <span class="value-badge">${this.config.offset_y}px</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">M&#224;u khung chat &amp; sensor</div>
                    <div class="field">
                        <label>M&#7851;u khung chat / sensor</label>
                        <select id="chat_style">${this.getChatStyleOptions()}</select>
                        <div class="hint">M&#7851;u n&#224;y &#225;p d&#7909;ng chung cho khung ng&#224;y th&#225;ng v&#224; khung sensor. G&#7891;m 10 m&#7851;u: glass, pastel, neon, sunset, mint, royal, clean, cute, aqua...</div>
                    </div>
                    <div class="field">
                        <label>N&#7873;n khung chat</label>
                        <div class="input-group">
                            <input type="color" id="chat_bg_color" value="${this.config.chat_bg_color}">
                            <span class="value-badge">${String(this.config.chat_bg_color).toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="field">
                        <label>&#272;&#7897; trong su&#7889;t n&#7873;n khung chat</label>
                        <div class="input-group">
                            <input type="range" id="chat_bg_opacity" min="0" max="1" step="0.05" value="${this.config.chat_bg_opacity}">
                            <span class="value-badge">${this.config.chat_bg_opacity}</span>
                        </div>
                    </div>
                    <div class="field">
                        <label>Font ch&#7919; n&#7897;i dung chat</label>
                        <select id="chat_font_family">${this.getFontOptions()}</select>
                        <div class="hint">G&#7891;m 10 ki&#7875;u font, d&#249;ng font c&#243; s&#7861;n tr&#234;n tr&#236;nh duy&#7879;t/thi&#7871;t b&#7883;.</div>
                    </div>

                    <div class="field">
                        <label>M&#224;u ch&#7919;</label>
                        <div class="input-group">
                            <input type="color" id="chat_text_color" value="${this.config.chat_text_color}">
                            <span class="value-badge">${String(this.config.chat_text_color).toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="field">
                        <label>&#272;&#7897; r&#7897;ng khung chat</label>
                        <div class="input-group">
                            <input type="range" id="chat_width" min="180" max="360" step="5" value="${this.config.chat_width}">
                            <span class="value-badge">${this.config.chat_width}px</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const dispatchConfig = () => {
            const newConfig = {
                ...this.config,
                svg_style: Number.parseInt(this.querySelector('#svg_style').value, 10) || 0,
                svg_size: Number.parseInt(this.querySelector('#svg_size').value, 10) || 80,
                greeting_enabled: this.querySelector('#greeting_enabled').checked,
                greeting_user: this.querySelector('#greeting_user').value || '',
                greeting_delay: Number.parseInt(this.querySelector('#greeting_delay').value, 10) || 0,
                greeting_timeout_s: Number.parseFloat(this.querySelector('#greeting_timeout_s').value) || 0,
                greeting_timeout: Math.round((Number.parseFloat(this.querySelector('#greeting_timeout_s').value) || 0) * 1000),
                greeting_repeat_enabled: this.querySelector('#greeting_repeat_enabled').checked,
                system_monitor_enabled: this.querySelector('#system_monitor_enabled').checked,
                system_monitor_button_enabled: this.querySelector('#system_monitor_button_enabled').checked,
                system_monitor_hover_enabled: this.querySelector('#system_monitor_hover_enabled').checked,
                system_monitor_initial_visible: this.querySelector('#system_monitor_initial_visible').checked,
                system_monitor_cycle_enabled: this.querySelector('#system_monitor_cycle_enabled').checked,
                system_monitor_cycle_seconds: Math.min(120, Math.max(0.5, Number.parseFloat(this.querySelector('#system_monitor_cycle_seconds').value) || 3)),
                system_monitor_display_style: this.querySelector('#system_monitor_display_style')?.value || 'ring',
                system_monitor_temp_max: Number.parseFloat(this.querySelector('#system_monitor_temp_max').value) || 100,
                system_sensor_cpu: this.getEntityPickerValue('system_sensor_cpu'),
                system_sensor_ram: this.getEntityPickerValue('system_sensor_ram'),
                system_sensor_temp: this.getEntityPickerValue('system_sensor_temp'),
                system_sensor_disk: this.getEntityPickerValue('system_sensor_disk'),
                animation_type: this.querySelector('#animation_type').value,
                position: this.querySelector('#position').value,
                offset_y: Number.parseInt(this.querySelector('#offset_y').value, 10) || 200,
                chat_style: this.querySelector('#chat_style').value,
                chat_bg_color: this.querySelector('#chat_bg_color').value,
                chat_bg_opacity: Number.parseFloat(this.querySelector('#chat_bg_opacity').value),
                chat_font_family: this.querySelector('#chat_font_family').value,
                chat_text_color: this.querySelector('#chat_text_color').value,
                chat_width: Number.parseInt(this.querySelector('#chat_width').value, 10) || 245,
                offset_x: this.config.offset_x
            };
            this.config = newConfig;
            this.dispatchEvent(new CustomEvent('config-changed', {
                detail: { config: newConfig },
                bubbles: true,
                composed: true
            }));
        };

        this.updateEntityPickers();
        let dispatchTimer = null;
        const scheduleDispatch = () => {
            window.clearTimeout(dispatchTimer);
            dispatchTimer = window.setTimeout(() => dispatchConfig(), 120);
        };


        this.querySelectorAll('input, select').forEach((el) => {
            const updateBadge = () => {
                const badge = el.parentElement?.querySelector('.value-badge');
                if (!badge) return;
                if (el.type === 'color') badge.textContent = el.value.toUpperCase();
                if (el.type === 'range') badge.textContent = el.id.includes('opacity') ? el.value : `${el.value}px`;
                if (el.id === 'system_monitor_cycle_seconds') badge.textContent = `${el.value}s`;
            };

            const isEntityInput = el.classList.contains('entity-input');
            const commitEntityInput = () => {
                if (!isEntityInput) return;
                const normalized = this.normalizeEntityId(el.value);
                if (el.value !== normalized) {
                    el.value = normalized;
                }
                this.config = { ...this.config, [el.id]: normalized };
                this.updateEntityPickerStates();
                dispatchConfig();
            };

            el.addEventListener('input', () => {
                updateBadge();
                if (isEntityInput) {
                    this.config = { ...this.config, [el.id]: el.value };
                    this.updateEntityPickerStates();
                    window.clearTimeout(this._entityInputDispatchTimer);
                    this._entityInputDispatchTimer = window.setTimeout(() => {
                        if (document.activeElement === el) return;
                        commitEntityInput();
                    }, 450);
                    return;
                }
            });
            el.addEventListener('change', () => {
                updateBadge();
                if (isEntityInput) {
                    commitEntityInput();
                    return;
                }
                dispatchConfig();
            });
            if (isEntityInput) {
                el.addEventListener('blur', commitEntityInput);
                el.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        commitEntityInput();
                    }
                });
            }
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
  if (!customElements.get('lich-am-duong-bubble-editor')) {
      customElements.define('lich-am-duong-bubble-editor', LunarCalendarBubbleEditor);
  }

  if (!customElements.get('lich-am-duong-bubble')) {
      customElements.define('lich-am-duong-bubble', LunarCalendarBubbleCard);
  }

  window.customCards = window.customCards || [];
  const bubbleCardDescriptor = {
      type: 'lich-am-duong-bubble',
      name: 'Bong Bong Lich Am Duong SVG',
      description: 'Bong bong SVG noi, tu doi vi tri khung chat, hieu ung go chu va ngay am duong.',
      documentationURL: 'https://github.com/khaisilk1910/am-lich-viet-nam',
      preview: false,
      // Thẻ nổi không gắn với một entity cụ thể; không đề xuất trong entity-first card picker (HA 2026.6+).
      getEntitySuggestion: () => null
  };
  const existingBubbleCard = window.customCards.find((card) => card && card.type === bubbleCardDescriptor.type);
  if (existingBubbleCard) Object.assign(existingBubbleCard, bubbleCardDescriptor);
  else window.customCards.push(bubbleCardDescriptor);
  });


