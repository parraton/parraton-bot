import {managerWalletPromise} from "./config/wallet";
import {wait} from "./wait";
import {reinvest} from "./core/functions/reinvest";
import {claimRewards} from "./core/functions/claim-rewards";


export const sendReinvest = async () => {
  const {wallet, sender: manager} = await managerWalletPromise;
  const address = wallet.address.toString();

  await wait(address, () => claimRewards(manager));

  await wait(address, () => reinvest(manager));
}