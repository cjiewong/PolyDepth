import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { ProxyAgent, fetch, setGlobalDispatcher } from "undici";
import AppSettings from "../settings";

let initialized = false;
let webSocketAgent: HttpsProxyAgent<string> | undefined;

export const initializeNetwork = () => {
  if (initialized) return;

  if (AppSettings.httpProxy) {
    setGlobalDispatcher(new ProxyAgent(AppSettings.httpProxy));
    webSocketAgent = new HttpsProxyAgent(AppSettings.httpProxy);

    axios.defaults.proxy = false;
    axios.defaults.httpsAgent = webSocketAgent;
  }

  initialized = true;
};

export const fetchWithProxy = fetch;

export const getWebSocketOptions = () => {
  if (!webSocketAgent) return undefined;

  return {
    agent: webSocketAgent,
  };
};
