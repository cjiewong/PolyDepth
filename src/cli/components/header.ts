import blessed from "blessed";
import { AppState } from "../app-state";
import { BaseComponent } from "./base";

export class Header extends BaseComponent {
  constructor(screen: blessed.Widgets.Screen) {
    const container = blessed.box({
      top: 0,
      height: 6,
      width: "100%",
      border: "line",
      tags: true,
      style: { border: { fg: "cyan" } },
    });

    screen.append(container);
    super(container);
  }

  get element() {
    return this.box;
  }

  render(state: AppState) {
    const formatStatus = (label: string, status?: string) => {
      const value = status ?? "idle";
      const color =
        value === "connected"
          ? "green-fg"
          : value === "connecting"
            ? "yellow-fg"
            : value === "degraded"
              ? "yellow-fg"
              : value === "error"
                ? "red-fg"
                : "white-fg";

      return `${label}:{${color}}${value}{/${color}}`;
    };

    const statusLine = [
      formatStatus("EVENT", state.connection?.event),
      formatStatus("CLOB", state.connection?.clob),
      formatStatus("BINANCE", state.connection?.binance),
      formatStatus("RTDS", state.connection?.rdts),
    ].join("  ");

    this.box.setContent(
      `{center}{bold}${state.event?.title ?? "PolyDepth"}{/bold}{/center}\n` +
        `{center}${state.event?.marketUrl() ?? "Waiting for live market..."}{/center}\n` +
        ` Proxy: ${state.connection?.proxy ?? "off"}\n ${statusLine}`,
    );
  }
}
