"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = __importDefault(require("./cli"));
const binance_1 = __importDefault(require("./data/binance"));
const orderbook_1 = __importDefault(require("./data/orderbook"));
const rdts_1 = __importDefault(require("./data/rdts"));
const record_1 = __importDefault(require("./data/record"));
const poly_client_1 = __importDefault(require("./poly-client"));
const poly_event_1 = __importDefault(require("./poly-event"));
const main = async () => {
    const client = new poly_client_1.default();
    const cliApp = new cli_1.default();
    const polyRdts = new rdts_1.default();
    polyRdts.connect((message, level) => cliApp.addLog(message, level));
    const binanceRdts = new binance_1.default();
    binanceRdts.connect((message, level) => cliApp.addLog(message, level));
    const event = new poly_event_1.default();
    cliApp.updateState({ event: event });
    const recorder = new record_1.default("polydepth-snapshots");
    // Rrndering App
    setInterval(async () => {
        if (!event.isReady() || event.isFinishe()) {
            await event.pickLiveEvent();
        }
        if (event.isReady()) {
            const upOrderBookRaw = await client.getOrderBook(event.upToken);
            const dnOrderBookRaw = await client.getOrderBook(event.dnToken);
            const upOrderBook = new orderbook_1.default(upOrderBookRaw);
            const dnOrderBook = new orderbook_1.default(dnOrderBookRaw);
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
            // recorder.recordFromState({ event: event, ...newState });
            cliApp.render();
        }
    }, 500);
};
main();
