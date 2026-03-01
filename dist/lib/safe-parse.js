"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeDisplayNumber = exports.isValidNumber = exports.safeJsonParse = void 0;
const safeJsonParse = (s) => {
    if (!s)
        return null;
    try {
        return JSON.parse(s);
    }
    catch {
        return null;
    }
};
exports.safeJsonParse = safeJsonParse;
const isValidNumber = (v) => {
    return typeof v === "number" && Number.isFinite(v);
};
exports.isValidNumber = isValidNumber;
const safeDisplayNumber = (v, fixed) => {
    if ((0, exports.isValidNumber)(v)) {
        return !fixed ? v : v.toFixed(fixed);
    }
    return "NaN";
};
exports.safeDisplayNumber = safeDisplayNumber;
