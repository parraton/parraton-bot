import {managerWalletPromise} from "./config/wallet";
import {wait} from "./wait";
import {reinvest} from "./core/functions/reinvest";
import {claimRewards} from "./core/functions/claim-rewards";
import {environment} from "./config/environment";

export const  sendReinvest = async () => {
  const {wallet, sender: manager} = await managerWalletPromise;
  const address = wallet.address.toString();

  const {hash: claimHash} = await wait(address, () => claimRewards(manager));
  console.log(`Claim rewards hash: ${claimHash}. Link: ${environment.TONVIEWER_URL}/transaction/${claimHash}`);

  const {hash: reinvestHash} = await wait(address, () => reinvest(manager));
  console.log(`Reinvest hash: ${reinvestHash}. Link: ${environment.TONVIEWER_URL}/transaction/${reinvestHash}`);
}