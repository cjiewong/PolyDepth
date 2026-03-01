"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clob_client_1 = require("@polymarket/clob-client");
const settings_1 = __importDefault(require("../settings"));
class PolyClient {
    client;
    constructor() {
        this.client = new clob_client_1.ClobClient(settings_1.default.clobHost, settings_1.default.chainId);
    }
    async getOrderBook(token) {
        const orderBook = await this.client.getOrderBook(token);
        return orderBook;
    }
}
exports.default = PolyClient;
