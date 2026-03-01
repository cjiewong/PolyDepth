"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class SnapshotRecorder {
    buffer = [];
    dirPath;
    currentFilePath = null;
    constructor(dirName = "data") {
        this.dirPath = path_1.default.join(process.cwd(), dirName);
        if (!fs_1.default.existsSync(this.dirPath)) {
            fs_1.default.mkdirSync(this.dirPath, { recursive: true });
        }
    }
    stateToSnapshot(state) {
        return {
            t: Date.now(),
            event: state.event,
            upOrderBook: state.upOrderBook,
            dnOrderBook: state.dnOrderBook,
            chainLinkPrice: state.chainLinkPrice,
            binancePrice: state.binancePrice,
            binanceRsi: state.binanceRsi,
            binanceDelta: state.binanceDelta,
            binanceMomentum: state.binanceMomentum,
            binanceVolatility: state.binanceVolatility,
        };
    }
    getFilePath(state) {
        const slug = state.event?.slug;
        if (!slug)
            return null;
        return path_1.default.join(this.dirPath, `${slug}.jsonl`);
    }
    async flush() {
        if (!this.currentFilePath || this.buffer.length === 0)
            return;
        const lines = this.buffer.map((s) => JSON.stringify(s)).join("\n") + "\n";
        await fs_1.default.promises.appendFile(this.currentFilePath, lines);
        this.buffer = [];
    }
    flushSync() {
        if (!this.currentFilePath || this.buffer.length === 0)
            return;
        const lines = this.buffer.map((s) => JSON.stringify(s)).join("\n") + "\n";
        fs_1.default.appendFileSync(this.currentFilePath, lines);
        this.buffer = [];
    }
    recordFromState(state) {
        const newFilePath = this.getFilePath(state);
        if (!newFilePath)
            return;
        // If file changed flush old buffer first
        if (this.currentFilePath && this.currentFilePath !== newFilePath) {
            this.flushSync();
        }
        this.currentFilePath = newFilePath;
        const snapshot = this.stateToSnapshot(state);
        this.buffer.push(snapshot);
        if (this.buffer.length >= 100) {
            this.flush();
        }
    }
}
exports.default = SnapshotRecorder;
