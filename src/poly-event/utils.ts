import { safeJsonParse } from "../lib/safe-parse";
import AppSettings from "../settings";
import { GammaEvent } from "./types";

export const currentEventStartTime = () => {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();

  const windowStartMinute = Math.floor(minute / AppSettings.interval) * AppSettings.interval;
  // Window END = start + interval
  const windowEnd = Date.UTC(year, month, day, hour, windowStartMinute, 0, 0);

  const epochSeconds = Math.floor(windowEnd / 1000);

  return epochSeconds;
};

export const buildSlug = (time: number) => {
  return `${AppSettings.type}-updown-${AppSettings.interval}m-${time}`;
};

export const extractUpDownTokenIds = async (
  event: GammaEvent,
): Promise<{ up: string; dn: string } | null> => {
  const m = event.markets?.[0];
  if (!m?.clobTokenIds || m.clobTokenIds.length < 2) return null;

  const outcomes = safeJsonParse<string[]>(m.outcomes) ?? ["Up", "Down"];
  // Many binary markets are ["Yes","No"], but Up/Down may be explicit.
  // attempt to map by outcome label.
  const lower = outcomes.map((x) => x.toLowerCase());

  const ids = await JSON.parse(m.clobTokenIds);
  // Common: outcomes aligned with token IDs order.
  // If labels are "Up"/"Down", use them; else treat [0]=UP, [1]=DN.
  const idxUp = lower.findIndex((x) => x.includes("up"));
  const idxDn = lower.findIndex((x) => x.includes("down"));

  if (idxUp >= 0 && idxDn >= 0 && idxUp !== idxDn) {
    return { up: ids[idxUp], dn: ids[idxDn] };
  }
  return { up: ids[0], dn: ids[1] };
};
