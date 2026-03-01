import blessed from "blessed";
import { AppState, LogEntry } from "../app-state";
import { BaseComponent } from "./base";

export class LogPanel extends BaseComponent {
  constructor(screen: blessed.Widgets.Screen) {
    const container = blessed.box({
      bottom: 0,
      width: "100%",
      height: 8,
      border: "line",
      tags: true,
      label: " LOGS ",
      scrollable: true,
      alwaysScroll: true,
    });

    screen.append(container);
    super(container);
  }

  render(state: AppState) {
    const logs = state.logs ?? [];

    const format = (log: LogEntry) => {
      const base = `[${log.time}] ${log.message}`;

      switch (log.level) {
        case "error":
          return `{red-fg}${base}{/red-fg}`;
        case "warn":
          return `{yellow-fg}${base}{/yellow-fg}`;
        default:
          return `{white-fg}${base}{/white-fg}`;
      }
    };

    this.box.setContent(logs.map(format).join("\n"));
    this.box.setScrollPerc(100);
  }
}
