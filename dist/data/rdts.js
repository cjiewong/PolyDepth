"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const symbol_1 = require("../lib/symbol");
const settings_1 = __importDefault(require("../settings"));
// RTDS price feed - Polymarket Documentation](https://docs.polymarket.com/developers/RTDS/RTDS-crypto-prices)
class PolyRtds {
    ws = null;
    last = null;
    // can't find a chain link api to fetch historical price for certain symbol.
    // so keeping the end price of the previous event to serve as the polymarket's "price to beat"
    lastEnd = null;
    reconnectAttempts = 0;
    reconnectTimer = null;
    connect(log) {
        if (this.ws) {
            this.ws.removeAllListeners();
            try {
                this.ws.terminate();
            }
            catch { }
        }
        this.ws = new ws_1.default(settings_1.default.rdtsHost);
        const symbol = (0, symbol_1.getChainLinkSymbol)();
        if (!symbol)
            return;
        this.ws.on("open", () => {
            this.reconnectAttempts = 0; // reset on success
            const msg = {
                action: "subscribe",
                subscriptions: [
                    { topic: "crypto_prices_chainlink", type: "*", filters: `{"symbol":"${symbol}"}` },
                ],
            };
            this.ws?.send(JSON.stringify(msg));
            log("[RTDS] connected");
        });
        this.ws.on("message", (raw) => {
            try {
                const data = JSON.parse(raw.toString("utf8"));
                const payload = data.payload;
                if (!payload)
                    return;
                const px = Number(payload.value);
                if (!Number.isFinite(px) || px <= 0)
                    return;
                const pt = {
                    t: Number(payload.timestamp),
                    px,
                };
                this.last = pt;
                if ((Number(payload.timestamp) / 1000) % (settings_1.default.interval * 60) === 0) {
                    // log price at the start of the event
                    this.lastEnd = this.last;
                }
            }
            catch {
                // ignore
            }
        });
        this.ws.on("close", () => {
            this.scheduleReconnect(log);
        });
        this.ws.on("error", (e) => {
            log(`[RTDS] error: ${String(e)}`, "error");
            try {
                this.ws?.close();
            }
            catch { }
        });
    }
    scheduleReconnect(log) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        log(`[RTDS] reconnecting in ${delay / 1000}s...`, "warn");
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
    getLastEnd() {
        return this.lastEnd;
    }
}
exports.default = PolyRtds;
