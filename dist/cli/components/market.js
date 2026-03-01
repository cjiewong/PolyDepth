"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketPanel = void 0;
const blessed_1 = __importDefault(require("blessed"));
const safe_parse_1 = require("../../lib/safe-parse");
const base_1 = require("./base");
class MarketPanel extends base_1.BaseComponent {
    priceBox;
    indicatorBox;
    constructor(screen) {
        const container = blessed_1.default.box({
            top: 24,
            width: "100%",
            height: 8,
        });
        screen.append(container);
        super(container);
        this.priceBox = blessed_1.default.box({
            parent: container,
            top: 0,
            left: 0,
            width: "50%",
            height: 8,
            border: "line",
            tags: true,
            label: " Price ",
        });
        this.indicatorBox = blessed_1.default.box({
            parent: container,
            top: 0,
            left: "50%",
            width: "50%",
            height: 8,
            border: "line",
            tags: true,
            label: " Indicators ",
        });
    }
    render(state) {
        // render prices
        const difference = state.chainLinkPrice && state.event?.priceToBeat
            ? state.chainLinkPrice - state.event?.priceToBeat
            : undefined;
        let edgeColor = "white-fg";
        if ((0, safe_parse_1.isValidNumber)(difference)) {
            if (difference > 0.01)
                edgeColor = "green-fg";
            else if (difference < -0.01)
                edgeColor = "red-fg";
            else
                edgeColor = "yellow-fg";
        }
        this.priceBox.setContent(`
  Price To Beat:  ${(0, safe_parse_1.safeDisplayNumber)(state.event?.priceToBeat, 2)}
  Poly Price:     ${(0, safe_parse_1.safeDisplayNumber)(state.chainLinkPrice, 2)}
  Binance Price:  ${(0, safe_parse_1.safeDisplayNumber)(state.binancePrice, 2)}
  Edge:           {${edgeColor}}${(0, safe_parse_1.safeDisplayNumber)(difference, 2)}{/${edgeColor}}`);
        // render indicators
        const delta = state.binanceDelta ?? 0;
        const momentum = state.binanceMomentum ?? 0;
        const vol = state.binanceVolatility ?? 0;
        const rsi = state.binanceRsi ?? 50;
        const deltaColor = delta > 0 ? "green-fg" : delta < 0 ? "red-fg" : "white-fg";
        const momentumColor = momentum > 0 ? "green-fg" : momentum < 0 ? "red-fg" : "white-fg";
        const volColor = vol > 0.0005 ? "yellow-fg" : "white-fg";
        const rsiColor = rsi > 70
            ? "red-fg" // overbought
            : rsi < 30
                ? "green-fg" // oversold
                : "white-fg";
        const rsiZone = rsi > 70 ? "OVERBOUGHT" : rsi < 30 ? "OVERSOLD" : "NEUTRAL";
        this.indicatorBox.setContent(`
  RSI:           {${rsiColor}}${rsi.toFixed(1)} (${rsiZone}){/${rsiColor}}          
  1s Delta:      {${deltaColor}}${delta.toFixed(3)}{/${deltaColor}}
  1s Momentum:   {${momentumColor}}${(momentum * 100).toFixed(4)}%{/${momentumColor}}
  3s Volatility: {${volColor}}${(vol * 100).toFixed(4)}%{/${volColor}}`);
    }
}
exports.MarketPanel = MarketPanel;
