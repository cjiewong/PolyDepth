"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blessed_1 = __importDefault(require("blessed"));
const header_1 = require("./components/header");
const logs_1 = require("./components/logs");
const market_1 = require("./components/market");
const order_1 = require("./components/order");
const time_1 = require("./components/time");
class CliApp {
    screen;
    state = { logs: [] };
    components = [];
    constructor() {
        this.screen = blessed_1.default.screen({
            smartCSR: true,
            title: "PolyDepth",
        });
        const header = new header_1.Header(this.screen);
        const timePanel = new time_1.TimePanel(this.screen);
        const orderPanel = new order_1.OrderPanel(this.screen);
        const marketPanel = new market_1.MarketPanel(this.screen);
        const logPanel = new logs_1.LogPanel(this.screen);
        this.components = [header, timePanel, orderPanel, marketPanel, logPanel];
        this.screen.key(["q", "C-c"], () => process.exit(0));
    }
    updateState(partial) {
        this.state = { ...this.state, ...partial };
    }
    render() {
        this.components.forEach((c) => c.render(this.state));
        this.screen.render();
    }
    addLog(message, level = "info") {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            message,
            level,
            time: timestamp,
        };
        const newLogs = [...(this.state.logs ?? []), entry];
        this.state.logs = newLogs.slice(-10);
    }
}
exports.default = CliApp;
