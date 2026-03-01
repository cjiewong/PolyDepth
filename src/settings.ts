const AppSettings = {
  // Poly settings
  siteHost: "https://polymarket.com",
  clobHost: "https://clob.polymarket.com",
  apiHost: "https://gamma-api.polymarket.com",
  rdtsHost: "wss://ws-live-data.polymarket.com",
  binanceHost: "wss://fstream.binance.com/ws",
  chainId: 137,

  // market specific settings
  type: "btc",
  interval: 5,

  // other settings
  poll: 100,

  // snapshot record
  recordSnapshots: false,
};

export default AppSettings;
