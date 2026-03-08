import blessed from "blessed";
import logger from "../lib/logger";
import { AppState, LogLevel } from "./app-state";
import { BaseComponent } from "./components/base";
import { Header } from "./components/header";
import { LogPanel } from "./components/logs";
import { MarketPanel } from "./components/market";
import { OrderPanel } from "./components/order";
import { TimePanel } from "./components/time";

export type LogMethod = (message: string, level?: LogLevel) => void;

class CliApp {
  private screen: blessed.Widgets.Screen;
  private state: AppState = { logs: [] };
  private components: BaseComponent[] = [];

  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: "PolyDepth",
    });

    const header = new Header(this.screen);
    const timePanel = new TimePanel(this.screen);
    const orderPanel = new OrderPanel(this.screen);
    const marketPanel = new MarketPanel(this.screen);
    const logPanel = new LogPanel(this.screen);

    this.components = [header, timePanel, orderPanel, marketPanel, logPanel];

    this.screen.key(["q", "C-c"], () => process.exit(0));
  }

  updateState(partial: Partial<AppState>) {
    this.state = { ...this.state, ...partial };
  }

  render() {
    this.components.forEach((c) => c.render(this.state));
    this.screen.render();
  }

  addLog(message: string, level: LogLevel = "info") {
    const timestamp = new Date().toLocaleTimeString();

    const entry = {
      message,
      level,
      time: timestamp,
    };

    const newLogs = [...(this.state.logs ?? []), entry];

    this.state.logs = newLogs.slice(-10);
    logger.log(message, level);
  }
}

export default CliApp;
