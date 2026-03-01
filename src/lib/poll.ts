import AppSettings from "../settings";

export const poll = () => {
  return new Promise((r) => setTimeout(r, AppSettings.poll));
};
