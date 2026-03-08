import WebSocket from "ws";
import { LogMethod } from "../cli";
import { getWebSocketOptions } from "../lib/network";
import { getChainLinkSymbol } from "../lib/symbol";
import AppSettings from "../settings";

type PricePoint = { t: number; px: number };

// RTDS price feed - Polymarket Documentation](https://docs.polymarket.com/developers/RTDS/RTDS-crypto-prices)
class PolyRtds {
  private ws: WebSocket | null = null;
  private last: PricePoint | null = null;
  // can't find a chain link api to fetch historical price for certain symbol.
  // so keeping the end price of the previous event to serve as the polymarket's "price to beat"
  private lastEnd: PricePoint | null = null;

  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  connect(log: LogMethod) {
    if (this.ws) {
      this.ws.removeAllListeners();
      try {
        this.ws.terminate();
      } catch {}
    }

    this.ws = new WebSocket(AppSettings.rdtsHost, getWebSocketOptions());

    const symbol = getChainLinkSymbol();
    if (!symbol) return;

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
        if (!payload) return;

        const px = Number(payload.value);
        if (!Number.isFinite(px) || px <= 0) return;

        const pt: PricePoint = {
          t: Number(payload.timestamp),
          px,
        };

        this.last = pt;

        if ((Number(payload.timestamp) / 1000) % (AppSettings.interval * 60) === 0) {
          // log price at the start of the event
          this.lastEnd = this.last;
        }
      } catch {
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
      } catch {}
    });
  }

  private scheduleReconnect(log: LogMethod) {
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

  getLast(): PricePoint | null {
    return this.last;
  }

  getLastEnd(): PricePoint | null {
    return this.lastEnd;
  }
}

export default PolyRtds;
