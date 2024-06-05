import {dedustGovernorWalletPromise} from "./config/wallet";
import {wait} from "./wait";
import {distributeRewards} from "./core/functions/distribute-dedust-distribution-rewards";
import {environment} from "./config/environment";

export const mockDedustDistribution = async () => {
  const {wallet , sender: governor} = await dedustGovernorWalletPromise;
  const address = wallet.address.toString();

  let rewards = 0n;

  const {hash} = await wait(address, async () => {
    rewards = await distributeRewards(governor)
  });

  console.log(`Dedust distribution mock transaction hash: ${hash}. Link:${environment.TONVIEWER_URL}/transaction/${hash}`)

  const {hash: sendHash} = await wait(address, () => governor.send({
    to: environment.DISTRIBUTION_POOL_WALLET_ADDRESS,
    value: rewards
  }))

  console.log(`Dedust send distribution hash: ${sendHash}. Link:${environment.TONVIEWER_URL}/transaction/${sendHash}`)
}