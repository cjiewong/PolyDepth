"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poll = void 0;
const settings_1 = __importDefault(require("../settings"));
const poll = () => {
    return new Promise((r) => setTimeout(r, settings_1.default.poll));
};
exports.poll = poll;
