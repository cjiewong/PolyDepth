"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const poll_1 = require("../lib/poll");
const settings_1 = __importDefault(require("../settings"));
const utils_1 = require("./utils");
class PolyEvent {
    startTime;
    slug;
    title;
    endDate;
    upToken;
    dnToken;
    priceToBeat;
    isReady() {
        return this.slug && this.title && this.endDate && this.upToken && this.dnToken;
    }
    async pickLiveEvent() {
        while (true) {
            try {
                const startTime = (0, utils_1.currentEventStartTime)();
                this.slug = (0, utils_1.buildSlug)(startTime);
                this.startTime = startTime;
                const url = new URL(`${settings_1.default.apiHost}/events/slug/${this.slug}`);
                const res = await fetch(url.toString());
                if (res.ok) {
                    const data = (await res.json());
                    if (data && !data.closed && data.endDate) {
                        this.title = data.title;
                        this.endDate = new Date(data.endDate).getTime();
                        const tokens = await (0, utils_1.extractUpDownTokenIds)(data);
                        if (tokens?.up && tokens?.dn) {
                            this.upToken = tokens.up;
                            this.dnToken = tokens.dn;
                            break;
                        }
                    }
                }
            }
            catch {
                // ignore error, keep retrying
            }
            await (0, poll_1.poll)();
        }
    }
    marketUrl() {
        return `${settings_1.default.siteHost}/event/${this.slug}`;
    }
    isFinishe() {
        return this.endDate && Date.now() > this.endDate;
    }
}
exports.default = PolyEvent;
