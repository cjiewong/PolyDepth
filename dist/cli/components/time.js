"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimePanel = void 0;
const blessed_1 = __importDefault(require("blessed"));
const utils_1 = require("../utils");
const base_1 = require("./base");
class TimePanel extends base_1.BaseComponent {
    constructor(screen) {
        const container = blessed_1.default.box({
            top: 4,
            height: 3,
            width: "100%",
            border: "line",
            align: "center",
            tags: true,
            style: { border: { fg: "yellow" } },
        });
        screen.append(container);
        super(container);
    }
    get element() {
        return this.box;
    }
    render(state) {
        if (!state.event?.endDate)
            return;
        const time = (0, utils_1.formatTimeLeft)(state.event.endDate);
        this.box.setContent(`Time Left: {green-fg}${time}{/green-fg}`);
    }
}
exports.TimePanel = TimePanel;
