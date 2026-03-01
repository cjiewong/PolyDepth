import blessed from "blessed";
import { safeDisplayNumber } from "../../lib/safe-parse";
import { AppState } from "../app-state";
import { BaseComponent } from "./base";

export class OrderPanel extends BaseComponent {
  private upBox: blessed.Widgets.BoxElement;
  private downBox: blessed.Widgets.BoxElement;
  private crossBox: blessed.Widgets.BoxElement;

  constructor(screen: blessed.Widgets.Screen) {
    const container = blessed.box({
      top: 7,
      width: "100%",
      height: 16,
    });

    screen.append(container);

    super(container);

    this.upBox = blessed.box({
      parent: container,
      top: 0,
      left: 0,
      width: "50%",
      height: 10,
      border: "line",
      tags: true,
      label: " UP ",
    });

    this.downBox = blessed.box({
      parent: container,
      top: 0,
      left: "50%",
      width: "50%",
      height: 10,
      border: "line",
      tags: true,
      label: " DOWN ",
    });

    this.crossBox = blessed.box({
      parent: container,
      top: 10,
      width: "100%",
      height: 6,
      border: "line",
      tags: true,
      label: " CROSS METRICS ",
    });
  }

  render(state: AppState) {
    const up = state.upOrderBook;
    const down = state.dnOrderBook;

    if (!up || !down) return;

    const crossSpread = up.ask && down.bid ? up.ask + down.bid - 1 : undefined;
    const probDeviation = up.mid && down.mid ? up.mid - (1 - down.mid) : undefined;

    const imbalanceColor = (v?: number) => (v && v > 0 ? "green-fg" : "red-fg");

    const microColor = (v?: number) => (v && v > 0 ? "green-fg" : "red-fg");

    this.upBox.setContent(`
  Ask:        ${safeDisplayNumber(up.ask, 2)}
  Bid:        ${safeDisplayNumber(up.bid, 2)}
  Spread:     ${safeDisplayNumber(up.spread, 2)}
  Imbalance:  {${imbalanceColor(up.imbalance)}}${up.imbalance.toFixed(3)}{/${imbalanceColor(up.imbalance)}}
  VWAP(5):    ${up.top5bidVWAP.toFixed(3)}
  Micro:      {${microColor(up.microShift)}}${safeDisplayNumber(up.microShift, 4)}{/${microColor(up.microShift)}}`);

    this.downBox.setContent(`
  Ask:        ${safeDisplayNumber(down.ask, 2)}
  Bid:        ${safeDisplayNumber(down.bid, 2)}
  Spread:     ${safeDisplayNumber(down.spread, 2)}
  Imbalance:  {${imbalanceColor(down.imbalance)}}${down.imbalance.toFixed(3)}{/${imbalanceColor(down.imbalance)}}
  VWAP(5):    ${down.top5bidVWAP.toFixed(3)}
  Micro:      {${microColor(down.microShift)}}${safeDisplayNumber(down.microShift, 4)}{/${microColor(down.microShift)}}`);

    // Cross signals
    const crossColor = crossSpread && crossSpread > 0 ? "yellow-fg" : "white-fg";

    const probColor = probDeviation && Math.abs(probDeviation) > 0.01 ? "red-fg" : "white-fg";

    this.crossBox.setContent(`
  Cross Spread:    {${crossColor}}${crossSpread?.toFixed(4)}{/${crossColor}}
  Prob Deviation:  {${probColor}}${probDeviation?.toFixed(4)}{/${probColor}}`);
  }
}
