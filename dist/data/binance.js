"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const symbol_1 = require("../lib/symbol");
const settings_1 = __importDefault(require("../settings"));
class BinanceRtds {
    ws = null;
    last = null;
    trades = [];
    reconnectAttempts = 0;
    reconnectTimer = null;
    connect(log) {
        const symbol = (0, symbol_1.getBinanceSymbol)();
        const url = `${settings_1.default.binanceHost}/${symbol}@aggTrade`;
        if (this.ws) {
            this.ws.removeAllListeners();
            try {
                this.ws.terminate();
            }
            catch { }
        }
        this.ws = new ws_1.default(url);
        this.ws.on("open", () => {
            this.reconnectAttempts = 0;
            log("[BINANCE] connected");
        });
        this.ws.on("message", (raw) => {
            try {
                const data = JSON.parse(raw.toString("utf8"));
                const px = Number(data.p);
                const qty = Number(data.q);
                const ts = Number(data.T);
                const isBuy = !data.m; // m=true => sell
                if (!Number.isFinite(px) || px <= 0)
                    return;
                this.last = { t: ts, px };
                const now = Date.now();
                this.trades.push({
                    t: now,
                    px,
                    qty,
                    isBuy,
                });
                // keep last 3 seconds only
                this.trades = this.trades.filter((t) => now - t.t <= 3000);
            }
            catch {
                // ignore
            }
        });
        this.ws.on("close", () => {
            this.scheduleReconnect(log);
        });
        this.ws.on("error", (e) => {
            log(`[BINANCE] error: ${String(e)}`, "error");
            try {
                this.ws?.close();
            }
            catch { }
        });
    }
    scheduleReconnect(log) {
        this.reconnectAttempts++;
        const base = 1000 * 2 ** this.reconnectAttempts;
        const delay = Math.min(base, 30000);
        log(`[BINANCE] reconnecting in ${delay / 1000}s...`, "warn");
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        this.reconnectTimer = setTimeout(() => {
            this.connect(log);
        }, delay);
    }
    getLast() {
        return this.last;
    }
    // 1-second trade delta
    getDelta1s() {
        const cutoff = Date.now() - 1000;
        const recent = this.trades.filter((t) => t.t >= cutoff);
        const buyVol = recent.filter((t) => t.isBuy).reduce((a, t) => a + t.qty, 0);
        const sellVol = recent.filter((t) => !t.isBuy).reduce((a, t) => a + t.qty, 0);
        return buyVol - sellVol;
    }
    // 1-second momentum
    getMomentum1s() {
        const cutoff = Date.now() - 1000;
        const recent = this.trades.filter((t) => t.t >= cutoff);
        if (recent.length < 2)
            return 0;
        const first = recent[0].px;
        const last = recent[recent.length - 1].px;
        if (!first)
            return 0;
        return (last - first) / first;
    }
    // 3-second realized volatility
    getVolatility3s() {
        if (this.trades.length < 2)
            return 0;
        const returns = [];
        for (let i = 1; i < this.trades.length; i++) {
            const prev = this.trades[i - 1].px;
            const curr = this.trades[i].px;
            if (!prev)
                continue;
            returns.push((curr - prev) / prev);
        }
        if (returns.length === 0)
            return 0;
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, r) => a + (r - mean) ** 2, 0) / returns.length;
        return Math.sqrt(variance);
    }
    // RSI
    getRSI(periodMs = 5000) {
        const returns = this.computeReturns(periodMs);
        if (returns.length < 2)
            return 50;
        let gain = 0;
        let loss = 0;
        for (const r of returns) {
            if (r > 0)
                gain += r;
            else
                loss += Math.abs(r);
        }
        const avgGain = gain / returns.length;
        const avgLoss = loss / returns.length;
        if (avgLoss === 0)
            return 100;
        if (avgGain === 0)
            return 0;
        const rs = avgGain / avgLoss;
        return 100 - 100 / (1 + rs);
    }
    computeReturns(periodMs) {
        const cutoff = Date.now() - periodMs;
        const recent = this.trades.filter((t) => t.t >= cutoff);
        const returns = [];
        for (let i = 1; i < recent.length; i++) {
            const prev = recent[i - 1].px;
            const curr = recent[i].px;
            if (!prev)
                continue;
            returns.push(curr - prev);
        }
        return returns;
    }
}
exports.default = BinanceRtds;
