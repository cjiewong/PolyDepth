import AppSettings from "../settings";

export const getChainLinkSymbol = () => {
  switch (AppSettings.type) {
    case "btc":
      return "btc/usd";
    case "eth":
      return "eth/usd";
    case "sol":
      return "eth/usd";
    case "xrp":
      return "xrp/usd";
    default:
      return undefined;
  }
};

export const getBinanceSymbol = () => {
  switch (AppSettings.type) {
    case "btc":
      return "btcusdt";
    case "eth":
      return "ethusdt";
    case "sol":
      return "ethusdt";
    case "xrp":
      return "xrpusdt";
    default:
      return undefined;
  }
};

export const getPriceDecimalPos = () => {
  switch (AppSettings.type) {
    case "btc":
      return 2;
    case "eth":
      return 2;
    case "sol":
      return 2;
    case "xrp":
      return 4;
    default:
      return undefined;
  }
};
