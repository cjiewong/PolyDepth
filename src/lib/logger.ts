import fs from "fs";
import path from "path";

export type LoggerLevel = "info" | "warn" | "error";

class Logger {
  private dirPath: string;
  private filePath: string;

  constructor(dirName = "logs") {
    this.dirPath = path.join(process.cwd(), dirName);

    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.dirPath, { recursive: true });
    }

    const date = new Date().toISOString().slice(0, 10);
    this.filePath = path.join(this.dirPath, `polydepth-${date}.log`);
  }

  log(message: string, level: LoggerLevel = "info") {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    fs.appendFileSync(this.filePath, `${line}\n`);
  }

  getLogFilePath() {
    return this.filePath;
  }
}

const logger = new Logger();

export default logger;
