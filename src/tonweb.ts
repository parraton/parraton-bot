import TonWeb from "tonweb";
import { TON_CLIENT_URL, TONCENTER_API_KEY } from "./config";

export const tonweb = new TonWeb(
  new TonWeb.HttpProvider(TON_CLIENT_URL, {
    apiKey: TONCENTER_API_KEY,
  })
);
