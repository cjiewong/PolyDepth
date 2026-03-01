import MyOrderbookSummary from "../data/orderbook";
import PolyEvent from "../poly-event";

export type LogLevel = "info" | "warn" | "error";

export interface LogEntry {
  message: string;
  level: LogLevel;
  time: string;
}

export interface AppState {
  event?: PolyEvent;

  upOrderBook?: MyOrderbookSummary;
  dnOrderBook?: MyOrderbookSummary;

  chainLinkPrice?: number;
  binancePrice?: number;

  // technical data calculated based on binance recent trades
  binanceRsi?: number;
  binanceDelta?: number;
  binanceMomentum?: number;
  binanceVolatility?: number;

  logs?: LogEntry[];
}
