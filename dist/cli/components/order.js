"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderPanel = void 0;
const blessed_1 = __importDefault(require("blessed"));
const safe_parse_1 = require("../../lib/safe-parse");
const base_1 = require("./base");
class OrderPanel extends base_1.BaseComponent {
    upBox;
    downBox;
    crossBox;
    constructor(screen) {
        const container = blessed_1.default.box({
            top: 7,
            width: "100%",
            height: 16,
        });
        screen.append(container);
        super(container);
        this.upBox = blessed_1.default.box({
            parent: container,
            top: 0,
            left: 0,
            width: "50%",
            height: 10,
            border: "line",
            tags: true,
            label: " UP ",
        });
        this.downBox = blessed_1.default.box({
            parent: container,
            top: 0,
            left: "50%",
            width: "50%",
            height: 10,
            border: "line",
            tags: true,
            label: " DOWN ",
        });
        this.crossBox = blessed_1.default.box({
            parent: container,
            top: 10,
            width: "100%",
            height: 6,
            border: "line",
            tags: true,
            label: " CROSS METRICS ",
        });
    }
    render(state) {
        const up = state.upOrderBook;
        const down = state.dnOrderBook;
        if (!up || !down)
            return;
        const crossSpread = up.ask && down.bid ? up.ask + down.bid - 1 : undefined;
        const probDeviation = up.mid && down.mid ? up.mid - (1 - down.mid) : undefined;
        const imbalanceColor = (v) => (v && v > 0 ? "green-fg" : "red-fg");
        const microColor = (v) => (v && v > 0 ? "green-fg" : "red-fg");
        this.upBox.setContent(`
  Ask:        ${(0, safe_parse_1.safeDisplayNumber)(up.ask, 2)}
  Bid:        ${(0, safe_parse_1.safeDisplayNumber)(up.bid, 2)}
  Spread:     ${(0, safe_parse_1.safeDisplayNumber)(up.spread, 2)}
  Imbalance:  {${imbalanceColor(up.imbalance)}}${up.imbalance.toFixed(3)}{/${imbalanceColor(up.imbalance)}}
  VWAP(5):    ${up.top5bidVWAP.toFixed(3)}
  Micro:      {${microColor(up.microShift)}}${(0, safe_parse_1.safeDisplayNumber)(up.microShift, 4)}{/${microColor(up.microShift)}}`);
        this.downBox.setContent(`
  Ask:        ${(0, safe_parse_1.safeDisplayNumber)(down.ask, 2)}
  Bid:        ${(0, safe_parse_1.safeDisplayNumber)(down.bid, 2)}
  Spread:     ${(0, safe_parse_1.safeDisplayNumber)(down.spread, 2)}
  Imbalance:  {${imbalanceColor(down.imbalance)}}${down.imbalance.toFixed(3)}{/${imbalanceColor(down.imbalance)}}
  VWAP(5):    ${down.top5bidVWAP.toFixed(3)}
  Micro:      {${microColor(down.microShift)}}${(0, safe_parse_1.safeDisplayNumber)(down.microShift, 4)}{/${microColor(down.microShift)}}`);
        // Cross signals
        const crossColor = crossSpread && crossSpread > 0 ? "yellow-fg" : "white-fg";
        const probColor = probDeviation && Math.abs(probDeviation) > 0.01 ? "red-fg" : "white-fg";
        this.crossBox.setContent(`
  Cross Spread:    {${crossColor}}${crossSpread?.toFixed(4)}{/${crossColor}}
  Prob Deviation:  {${probColor}}${probDeviation?.toFixed(4)}{/${probColor}}`);
    }
}
exports.OrderPanel = OrderPanel;
