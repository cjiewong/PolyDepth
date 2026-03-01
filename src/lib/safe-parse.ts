export const safeJsonParse = <T>(s: string | undefined): T | null => {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};

export const isValidNumber = (v: unknown): v is number => {
  return typeof v === "number" && Number.isFinite(v);
};

export const safeDisplayNumber = (v: unknown, fixed?: number) => {
  if (isValidNumber(v)) {
    return !fixed ? v : v.toFixed(fixed);
  }
  return "NaN";
};
