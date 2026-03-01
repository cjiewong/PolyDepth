import fs from "fs";
import path from "path";
import { AppState } from "../cli/app-state";

export type Snapshot = Omit<AppState, "logs"> & {
  t: number;
};

class SnapshotRecorder {
  private buffer: Snapshot[] = [];
  private dirPath: string;
  private currentFilePath: string | null = null;

  constructor(dirName = "data") {
    this.dirPath = path.join(process.cwd(), dirName);

    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true });
    }
  }

  private stateToSnapshot(state: AppState): Snapshot {
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

  private getFilePath(state: AppState): string | null {
    const slug = state.event?.slug;
    if (!slug) return null;

    return path.join(this.dirPath, `${slug}.jsonl`);
  }

  private async flush() {
    if (!this.currentFilePath || this.buffer.length === 0) return;

    const lines = this.buffer.map((s) => JSON.stringify(s)).join("\n") + "\n";

    await fs.promises.appendFile(this.currentFilePath, lines);

    this.buffer = [];
  }

  flushSync() {
    if (!this.currentFilePath || this.buffer.length === 0) return;

    const lines = this.buffer.map((s) => JSON.stringify(s)).join("\n") + "\n";

    fs.appendFileSync(this.currentFilePath, lines);

    this.buffer = [];
  }

  recordFromState(state: AppState) {
    const newFilePath = this.getFilePath(state);
    if (!newFilePath) return;

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

export default SnapshotRecorder;
