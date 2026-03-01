import { ClobClient } from "@polymarket/clob-client";
import AppSettings from "../settings";

class PolyClient {
  client: ClobClient;

  constructor() {
    this.client = new ClobClient(AppSettings.clobHost, AppSettings.chainId);
  }

  async getOrderBook(token: string) {
    const orderBook = await this.client.getOrderBook(token);
    return orderBook;
  }
}

export default PolyClient;
