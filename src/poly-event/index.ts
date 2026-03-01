import { poll } from "../lib/poll";
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

        const res = await fetch(url.toString());

        if (res.ok) {
          const data = (await res.json()) as GammaEvent;

          if (data && !data.closed && data.endDate) {
            this.title = data.title;
            this.endDate = new Date(data.endDate).getTime();

            const tokens = await extractUpDownTokenIds(data);

            if (tokens?.up && tokens?.dn) {
              this.upToken = tokens.up;
              this.dnToken = tokens.dn;
              break;
            }
          }
        }
      } catch {
        // ignore error, keep retrying
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
