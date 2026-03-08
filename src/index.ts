import CliApp from "./cli";
import BinanceRtds from "./data/binance";
import MyOrderbookSummary from "./data/orderbook";
import PolyRtds from "./data/rdts";
import SnapshotRecorder from "./data/record";
import logger from "./lib/logger";
import { initializeNetwork } from "./lib/network";
import PolyClient from "./poly-client";
import PolyEvent from "./poly-event";
import AppSettings from "./settings";

const main = async () => {
  initializeNetwork();

  console.log = (...args: unknown[]) => {
    logger.log(args.map(String).join(" "));
  };
  console.warn = (...args: unknown[]) => {
    logger.log(args.map(String).join(" "), "warn");
  };
  console.error = (...args: unknown[]) => {
    logger.log(args.map(String).join(" "), "error");
  };

  logger.log("[APP] startup");

  process.on("uncaughtException", (error) => {
    logger.log(`[APP] uncaughtException: ${error.stack ?? error.message}`, "error");
  });

  process.on("unhandledRejection", (reason) => {
    logger.log(`[APP] unhandledRejection: ${String(reason)}`, "error");
  });

  const client = new PolyClient();
  const cliApp = new CliApp();
  cliApp.updateState({
    connection: {
      proxy: AppSettings.httpProxy,
      event: "idle",
      clob: "idle",
      binance: "idle",
      rdts: "idle",
    },
  });

  const polyRdts = new PolyRtds();
  polyRdts.connect((message, level) => {
    cliApp.addLog(message, level);
    cliApp.updateState({
      connection: {
        ...cliApp["state"].connection,
        rdts: level === "error" ? "error" : level === "warn" ? "degraded" : "connected",
      },
    });
  });
  const binanceRdts = new BinanceRtds();
  binanceRdts.connect((message, level) => {
    cliApp.addLog(message, level);
    cliApp.updateState({
      connection: {
        ...cliApp["state"].connection,
        binance: level === "error" ? "error" : level === "warn" ? "degraded" : "connected",
      },
    });
  });

  const event = new PolyEvent();
  cliApp.updateState({ event: event });

  const recorder = new SnapshotRecorder("polydepth-snapshots");
  let isTickRunning = false;

  // Rrndering App
  setInterval(async () => {
    if (isTickRunning) return;
    isTickRunning = true;

    try {
      if (!event.isReady() || event.isFinishe()) {
        cliApp.updateState({
          connection: {
            ...cliApp["state"].connection,
            event: "connecting",
          },
        });
        await event.pickLiveEvent();
        cliApp.updateState({
          connection: {
            ...cliApp["state"].connection,
            event: "connected",
          },
        });
      }

      if (event.isReady()) {
        cliApp.updateState({
          connection: {
            ...cliApp["state"].connection,
            clob: "connecting",
          },
        });
        const upOrderBookRaw = await client.getOrderBook(event.upToken!);
        const dnOrderBookRaw = await client.getOrderBook(event.dnToken!);
        cliApp.updateState({
          connection: {
            ...cliApp["state"].connection,
            clob: "connected",
          },
        });
        const upOrderBook = new MyOrderbookSummary(upOrderBookRaw);
        const dnOrderBook = new MyOrderbookSummary(dnOrderBookRaw);

        if (!event.priceToBeat) {
          const lastEndPrice = polyRdts.getLastEnd();
          if (lastEndPrice && Number(lastEndPrice.t) / 1000 === Number(event.startTime)) {
            event.priceToBeat = lastEndPrice.px;
          }
        }

        const newState = {
          upOrderBook: upOrderBook,
          dnOrderBook: dnOrderBook,
          chainLinkPrice: polyRdts.getLast()?.px,
          binancePrice: binanceRdts.getLast()?.px,
          binanceDelta: binanceRdts.getDelta1s(),
          binanceMomentum: binanceRdts.getMomentum1s(),
          binanceRsi: binanceRdts.getRSI(),
          binanceVolatility: binanceRdts.getVolatility3s(),
        };

        cliApp.updateState(newState);

        if (AppSettings.recordSnapshots) recorder.recordFromState({ event: event, ...newState });
        cliApp.render();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      cliApp.updateState({
        connection: {
          ...cliApp["state"].connection,
          event: event.isReady() ? "connected" : "error",
          clob: message.includes("order book") ? "degraded" : cliApp["state"].connection?.clob,
        },
      });
      cliApp.addLog(`[APP] ${message}`, "error");
      cliApp.render();
    } finally {
      isTickRunning = false;
    }
  }, AppSettings.renderInterval);
};

main();
