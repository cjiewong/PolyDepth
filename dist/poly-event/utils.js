"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUpDownTokenIds = exports.buildSlug = exports.currentEventStartTime = void 0;
const safe_parse_1 = require("../lib/safe-parse");
const settings_1 = __importDefault(require("../settings"));
const currentEventStartTime = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const day = now.getUTCDate();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const windowStartMinute = Math.floor(minute / settings_1.default.interval) * settings_1.default.interval;
    // Window END = start + interval
    const windowEnd = Date.UTC(year, month, day, hour, windowStartMinute, 0, 0);
    const epochSeconds = Math.floor(windowEnd / 1000);
    return epochSeconds;
};
exports.currentEventStartTime = currentEventStartTime;
const buildSlug = (time) => {
    return `${settings_1.default.type}-updown-${settings_1.default.interval}m-${time}`;
};
exports.buildSlug = buildSlug;
const extractUpDownTokenIds = async (event) => {
    const m = event.markets?.[0];
    if (!m?.clobTokenIds || m.clobTokenIds.length < 2)
        return null;
    const outcomes = (0, safe_parse_1.safeJsonParse)(m.outcomes) ?? ["Up", "Down"];
    // Many binary markets are ["Yes","No"], but Up/Down may be explicit.
    // attempt to map by outcome label.
    const lower = outcomes.map((x) => x.toLowerCase());
    const ids = await JSON.parse(m.clobTokenIds);
    // Common: outcomes aligned with token IDs order.
    // If labels are "Up"/"Down", use them; else treat [0]=UP, [1]=DN.
    const idxUp = lower.findIndex((x) => x.includes("up"));
    const idxDn = lower.findIndex((x) => x.includes("down"));
    if (idxUp >= 0 && idxDn >= 0 && idxUp !== idxDn) {
        return { up: ids[idxUp], dn: ids[idxDn] };
    }
    return { up: ids[0], dn: ids[1] };
};
exports.extractUpDownTokenIds = extractUpDownTokenIds;
