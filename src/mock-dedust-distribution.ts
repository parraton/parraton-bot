import {managerWalletPromise} from "./config/wallet";
import {wait} from "./wait";
import {distributeRewards} from "./core/functions/distribute-dedust-distribution-rewards";

export const mockDedustDistribution = async () => {
  const {wallet , sender: governor} = await managerWalletPromise;
  const address = wallet.address.toString();

  await wait(address, () => distributeRewards(governor));
}