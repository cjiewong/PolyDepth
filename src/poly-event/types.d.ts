export type GammaEvent = {
  id: string;
  title?: string;
  slug?: string;
  active?: boolean;
  closed?: boolean;
  endDate?: string; // sometimes ISO
  startTime?: string;
  markets?: Array<{
    id: string;
    question?: string;
    outcomes?: string; // JSON string array
    clobTokenIds?: string; // token IDs (typically [YES, NO] OR [UP, DN])
    outcomePrices?: string;
  }>;
};
