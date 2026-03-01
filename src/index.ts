import CliApp from "./cli";
import BinanceRtds from "./data/binance";
import MyOrderbookSummary from "./data/orderbook";
import PolyRtds from "./data/rdts";
import SnapshotRecorder from "./data/record";
import PolyClient from "./poly-client";
import PolyEvent from "./poly-event";
import AppSettings from "./settings";

const main = async () => {
  const client = new PolyClient();
  const cliApp = new CliApp();

  const polyRdts = new PolyRtds();
  polyRdts.connect((message, level) => cliApp.addLog(message, level));
  const binanceRdts = new BinanceRtds();
  binanceRdts.connect((message, level) => cliApp.addLog(message, level));

  const event = new PolyEvent();
  cliApp.updateState({ event: event });

  const recorder = new SnapshotRecorder("polydepth-snapshots");

  // Rrndering App
  setInterval(async () => {
    if (!event.isReady() || event.isFinishe()) {
      await event.pickLiveEvent();
    }

    if (event.isReady()) {
      const upOrderBookRaw = await client.getOrderBook(event.upToken!);
      const dnOrderBookRaw = await client.getOrderBook(event.dnToken!);
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
  }, 500);
};

main();
