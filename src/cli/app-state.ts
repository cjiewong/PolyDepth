import MyOrderbookSummary from "../data/orderbook";
import PolyEvent from "../poly-event";

export type LogLevel = "info" | "warn" | "error";

export type ServiceStatus = "idle" | "connecting" | "connected" | "degraded" | "error";

export interface ConnectionStatus {
  proxy?: string;
  event?: ServiceStatus;
  clob?: ServiceStatus;
  binance?: ServiceStatus;
  rdts?: ServiceStatus;
}

export interface LogEntry {
  message: string;
  level: LogLevel;
  time: string;
}

export interface AppState {
  event?: PolyEvent;
  connection?: ConnectionStatus;

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
