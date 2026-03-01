"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBinanceSymbol = exports.getChainLinkSymbol = void 0;
const settings_1 = __importDefault(require("../settings"));
const getChainLinkSymbol = () => {
    switch (settings_1.default.type) {
        case "btc":
            return "btc/usd";
        default:
            return undefined;
    }
};
exports.getChainLinkSymbol = getChainLinkSymbol;
const getBinanceSymbol = () => {
    switch (settings_1.default.type) {
        case "btc":
            return "btcusdt";
        default:
            return undefined;
    }
};
exports.getBinanceSymbol = getBinanceSymbol;
