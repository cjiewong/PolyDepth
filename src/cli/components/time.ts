import blessed from "blessed";
import { AppState } from "../app-state";
import { formatTimeLeft } from "../utils";
import { BaseComponent } from "./base";

export class TimePanel extends BaseComponent {
  constructor(screen: blessed.Widgets.Screen) {
    const container = blessed.box({
      top: 4,
      height: 3,
      width: "100%",
      border: "line",
      align: "center",
      tags: true,
      style: { border: { fg: "yellow" } },
    });

    screen.append(container);
    super(container);
  }

  get element() {
    return this.box;
  }

  render(state: AppState) {
    if (!state.event?.endDate) return;

    const time = formatTimeLeft(state.event.endDate);
    this.box.setContent(`Time Left: {green-fg}${time}{/green-fg}`);
  }
}
