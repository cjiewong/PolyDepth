import { ClobClient, OrderBookSummary } from "@polymarket/clob-client";
import logger from "../lib/logger";
import AppSettings from "../settings";

type OrderBookLevel = {
  price: string | number;
  size: string | number;
};

type NormalizedOrderBook = {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
};

class PolyClient {
  client: ClobClient;

  constructor() {
    this.client = new ClobClient(AppSettings.clobHost, AppSettings.chainId);
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getOrderBook(token: string): Promise<OrderBookSummary> {
    const retries = AppSettings.clobRetryCount;
    const baseDelay = AppSettings.clobRetryDelay;

    for (let attempt = 1; attempt <= retries; attempt++) {
      logger.log(`[CLOB] fetching order book for token ${token} (attempt ${attempt}/${retries})`);

      const orderBook = (await this.client.getOrderBook(token)) as
        | (Partial<OrderBookSummary> & Partial<NormalizedOrderBook>)
        | null;

      if (orderBook && Array.isArray(orderBook.asks) && Array.isArray(orderBook.bids)) {
        logger.log(
          `[CLOB] order book ok for token ${token}: asks=${orderBook.asks.length}, bids=${orderBook.bids.length}`,
        );

        return orderBook as OrderBookSummary;
      }

      logger.log(
        `[CLOB] invalid order book for token ${token}: ${JSON.stringify(orderBook).slice(0, 500)}`,
        "error",
      );

      if (attempt < retries) {
        const delay = baseDelay * 2 ** (attempt - 1);
        logger.log(`[CLOB] retrying token ${token} in ${delay}ms`, "warn");
        await this.sleep(delay);
      }
    }

    throw new Error(`Invalid order book response for token ${token}`);
  }
}

export default PolyClient;
