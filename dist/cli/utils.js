"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimeLeft = void 0;
const formatTimeLeft = (endDate) => {
    if (!endDate)
        return "Nah";
    const totalSeconds = (endDate - Date.now()) / 1_000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds.toFixed(0)).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
};
exports.formatTimeLeft = formatTimeLeft;
