import blessed from "blessed";
import { AppState } from "../app-state";
import { BaseComponent } from "./base";

export class Header extends BaseComponent {
  constructor(screen: blessed.Widgets.Screen) {
    const container = blessed.box({
      top: 0,
      height: 4,
      width: "100%",
      border: "line",
      align: "center",
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
    this.box.setContent(`{bold}${state.event?.title ?? ""}{/bold}\n${state.event?.marketUrl()}`);
  }
}
