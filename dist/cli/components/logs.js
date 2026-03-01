"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPanel = void 0;
const blessed_1 = __importDefault(require("blessed"));
const base_1 = require("./base");
class LogPanel extends base_1.BaseComponent {
    constructor(screen) {
        const container = blessed_1.default.box({
            bottom: 0,
            width: "100%",
            height: 8,
            border: "line",
            tags: true,
            label: " LOGS ",
            scrollable: true,
            alwaysScroll: true,
        });
        screen.append(container);
        super(container);
    }
    render(state) {
        const logs = state.logs ?? [];
        const format = (log) => {
            const base = `[${log.time}] ${log.message}`;
            switch (log.level) {
                case "error":
                    return `{red-fg}${base}{/red-fg}`;
                case "warn":
                    return `{yellow-fg}${base}{/yellow-fg}`;
                default:
                    return `{white-fg}${base}{/white-fg}`;
            }
        };
        this.box.setContent(logs.map(format).join("\n"));
        this.box.setScrollPerc(100);
    }
}
exports.LogPanel = LogPanel;
