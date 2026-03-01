"use strict";
/** Custom Polymarket Orderbook utils */
Object.defineProperty(exports, "__esModule", { value: true });
const safe_parse_1 = require("../lib/safe-parse");
class MyOrderbookSummary {
    raw;
    ask;
    bid;
    mid;
    spread;
    imbalance;
    top5bidVWAP;
    top5askVWAP;
    microPrices;
    microShift;
    constructor(raw) {
        this.raw = raw;
        // guarantee the price result (although the original price levels are sorted)
        if (raw.asks.length > 0) {
            this.ask = Math.min(...raw.asks.map((l) => Number(l.price)));
        }
        if (raw.bids.length > 0) {
            this.bid = Math.max(...raw.bids.map((l) => Number(l.price)));
        }
        if ((0, safe_parse_1.isValidNumber)(this.ask) && (0, safe_parse_1.isValidNumber)(this.bid)) {
            this.mid = (this.ask + this.bid) / 2;
            this.spread = this.ask - this.bid;
        }
        else {
            // fall back to 0
            this.mid = 0;
            this.spread = 0;
        }
        const totalBidVol = raw.bids.reduce((a, l) => a + Number(l.size), 0);
        const totalAskVol = raw.asks.reduce((a, l) => a + Number(l.size), 0);
        const totalVol = totalAskVol + totalBidVol;
        this.imbalance = totalVol === 0 ? 0 : (totalBidVol - totalAskVol) / totalVol;
        this.top5bidVWAP = this.calculateVWAP(raw.bids, 5);
        this.top5askVWAP = this.calculateVWAP(raw.asks, 5);
        if ((0, safe_parse_1.isValidNumber)(this.ask) && (0, safe_parse_1.isValidNumber)(this.bid)) {
            this.microPrices =
                totalVol === 0 ? this.mid : (this.ask * totalBidVol + this.bid * totalAskVol) / totalVol;
            this.microShift = this.microPrices - this.mid;
        }
    }
    calculateVWAP(levels, depthLevels) {
        if (!levels.length)
            return 0;
        const selected = levels.slice(-depthLevels);
        const totalVol = selected.reduce((sum, l) => sum + Number(l.size), 0);
        if (totalVol === 0)
            return 0;
        const weighted = selected.reduce((sum, l) => sum + Number(l.price) * Number(l.size), 0);
        return weighted / totalVol;
    }
}
exports.default = MyOrderbookSummary;
