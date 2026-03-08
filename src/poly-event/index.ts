import { poll } from "../lib/poll";
import { fetchWithProxy } from "../lib/network";
import logger from "../lib/logger";
import AppSettings from "../settings";
import { GammaEvent } from "./types";
import { buildSlug, currentEventStartTime, extractUpDownTokenIds } from "./utils";

class PolyEvent {
  startTime: number | undefined;
  slug: string | undefined;
  title: string | undefined;
  endDate: number | undefined;
  upToken: string | undefined;
  dnToken: string | undefined;
  priceToBeat: number | undefined;

  isReady() {
    return this.slug && this.title && this.endDate && this.upToken && this.dnToken;
  }

  async pickLiveEvent() {
    while (true) {
      try {
        const startTime = currentEventStartTime();
        this.slug = buildSlug(startTime);
        this.startTime = startTime;

        const url = new URL(`${AppSettings.apiHost}/events/slug/${this.slug}`);
        logger.log(`[EVENT] fetching ${url.toString()}`);

        const res = await fetchWithProxy(url.toString());
        logger.log(`[EVENT] response ${res.status} for slug ${this.slug}`);

        if (res.ok) {
          const data = (await res.json()) as GammaEvent;

          if (data && !data.closed && data.endDate) {
            this.title = data.title;
            this.endDate = new Date(data.endDate).getTime();

            const tokens = await extractUpDownTokenIds(data);

            if (tokens?.up && tokens?.dn) {
              logger.log(`[EVENT] ready slug=${this.slug} up=${tokens.up} dn=${tokens.dn}`);
              this.upToken = tokens.up;
              this.dnToken = tokens.dn;
              break;
            }
          }
        }
      } catch (error) {
        logger.log(
          `[EVENT] fetch failed for slug ${this.slug}: ${error instanceof Error ? error.message : String(error)}`,
          "error",
        );
      }

      await poll();
    }
  }

  marketUrl() {
    return `${AppSettings.siteHost}/event/${this.slug}`;
  }

  isFinishe() {
    return this.endDate && Date.now() > this.endDate;
  }
}

export default PolyEvent;
