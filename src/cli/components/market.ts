import blessed from "blessed";
import { isValidNumber, safeDisplayNumber } from "../../lib/safe-parse";
import { getPriceDecimalPos } from "../../lib/symbol";
import { AppState } from "../app-state";
import { BaseComponent } from "./base";

export class MarketPanel extends BaseComponent {
  private priceBox: blessed.Widgets.BoxElement;
  private indicatorBox: blessed.Widgets.BoxElement;

  constructor(screen: blessed.Widgets.Screen) {
    const container = blessed.box({
      top: 26,
      width: "100%",
      height: 8,
    });

    screen.append(container);

    super(container);

    this.priceBox = blessed.box({
      parent: container,
      top: 0,
      left: 0,
      width: "50%",
      height: 8,
      border: "line",
      tags: true,
      label: " Price ",
    });

    this.indicatorBox = blessed.box({
      parent: container,
      top: 0,
      left: "50%",
      width: "50%",
      height: 8,
      border: "line",
      tags: true,
      label: " Indicators ",
    });
  }

  render(state: AppState) {
    // render prices
    const difference =
      state.chainLinkPrice && state.event?.priceToBeat
        ? state.chainLinkPrice - state.event?.priceToBeat
        : undefined;

    let edgeColor = "white-fg";

    if (isValidNumber(difference)) {
      if (difference > 0.01) edgeColor = "green-fg";
      else if (difference < -0.01) edgeColor = "red-fg";
      else edgeColor = "yellow-fg";
    }

    this.priceBox.setContent(`
  Price To Beat:  ${safeDisplayNumber(state.event?.priceToBeat, getPriceDecimalPos())}
  Poly Price:     ${safeDisplayNumber(state.chainLinkPrice, getPriceDecimalPos())}
  Binance Price:  ${safeDisplayNumber(state.binancePrice, getPriceDecimalPos())}
  Edge:           {${edgeColor}}${safeDisplayNumber(difference, getPriceDecimalPos())}{/${edgeColor}}`);

    // render indicators
    const delta = state.binanceDelta ?? 0;
    const momentum = state.binanceMomentum ?? 0;
    const vol = state.binanceVolatility ?? 0;
    const rsi = state.binanceRsi ?? 50;

    const deltaColor = delta > 0 ? "green-fg" : delta < 0 ? "red-fg" : "white-fg";
    const momentumColor = momentum > 0 ? "green-fg" : momentum < 0 ? "red-fg" : "white-fg";
    const volColor = vol > 0.0005 ? "yellow-fg" : "white-fg";

    const rsiColor =
      rsi > 70
        ? "red-fg" // overbought
        : rsi < 30
          ? "green-fg" // oversold
          : "white-fg";

    const rsiZone = rsi > 70 ? "OVERBOUGHT" : rsi < 30 ? "OVERSOLD" : "NEUTRAL";

    this.indicatorBox.setContent(`
  RSI:           {${rsiColor}}${rsi.toFixed(1)} (${rsiZone}){/${rsiColor}}          
  1s Delta:      {${deltaColor}}${delta.toFixed(3)}{/${deltaColor}}
  1s Momentum:   {${momentumColor}}${(momentum * 100).toFixed(4)}%{/${momentumColor}}
  3s Volatility: {${volColor}}${(vol * 100).toFixed(4)}%{/${volColor}}`);
  }
}
