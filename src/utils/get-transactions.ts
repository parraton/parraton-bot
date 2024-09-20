import TonWeb from "tonweb";
import { environment } from "../config-old/environment";

const tonweb = new TonWeb(
  new TonWeb.HttpProvider(environment.TONCENTER_URL, {
    apiKey: environment.TONCENTER_API_KEY,
  })
);

export const getTransactions = (
  address: string
): ReturnType<typeof tonweb.getTransactions> =>
  tonweb.provider.getTransactions(address, 1, void 0, void 0, void 0, true);
