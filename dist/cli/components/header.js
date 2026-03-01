"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const blessed_1 = __importDefault(require("blessed"));
const base_1 = require("./base");
class Header extends base_1.BaseComponent {
    constructor(screen) {
        const container = blessed_1.default.box({
            top: 0,
            height: 4,
            width: "100%",
            border: "line",
            align: "center",
            tags: true,
            style: { border: { fg: "cyan" } },
        });
        screen.append(container);
        super(container);
    }
    get element() {
        return this.box;
    }
    render(state) {
        this.box.setContent(`{bold}${state.event?.title ?? ""}{/bold}\n${state.event?.marketUrl()}`);
    }
}
exports.Header = Header;
