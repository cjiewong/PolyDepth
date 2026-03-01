"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blessed_1 = __importDefault(require("blessed"));
// Create screen
const screen = blessed_1.default.screen({
    smartCSR: true,
    title: "PolyDepth",
});
// Create a box
const box = blessed_1.default.box({
    top: "center",
    left: "center",
    width: "50%",
    height: "30%",
    content: "Hello, Shawn 👋\n\nWelcome to PolyDepth",
    tags: true,
    border: {
        type: "line",
    },
    style: {
        fg: "white",
        bg: "blue",
        border: {
            fg: "white",
        },
    },
    align: "center",
    valign: "middle",
});
// Append box to screen
screen.append(box);
// Quit on q or Ctrl+C
screen.key(["q", "C-c"], () => {
    process.exit(0);
});
exports.default = screen;
