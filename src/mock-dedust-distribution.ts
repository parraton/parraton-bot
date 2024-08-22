import { dedustGovernorWalletPromise } from "./config/wallet";
import { wait } from "./wait";
import {
  distributeRewards,
  prepareDedustMockRewards,
} from "./core/functions/distribute-dedust-distribution-rewards";
import { environment } from "./config/environment";
import { addresses } from "./config/contracts-config";
import { Vault } from "@parraton/sdk";
import { Address, toNano } from "@ton/core";
import { DistributionPool } from "@dedust/apiary-v1";
import { tonClientPromise } from "./config/ton-client";

export const mockDedustDistribution = async () => {
  const { wallet, sender: governor } = await dedustGovernorWalletPromise;
  const address = wallet.address.toString();
  const tonClient = await tonClientPromise;
  for (const vaultData of addresses.vaults) {
    const vault = tonClient.open(
      Vault.createFromAddress(Address.parse(vaultData.vault))
    );
    const data = await vault.getVaultData();
    const distributionPool = tonClient.open(
      DistributionPool.createFromAddress(data.distributionPoolAddress)
    );
    const distributionPoolData = await distributionPool.getPoolExtraData();
    let rewards = toNano(1.5);

    const { hash } = await wait(address, async () => {
      const rewardsDictionary = await prepareDedustMockRewards(
        vault.address,
        rewards,
        distributionPool
      );
      if (rewardsDictionary.size > 0) {
        await distributeRewards(governor, rewardsDictionary, distributionPool);
      }
    });

    console.log(
      `Dedust distribution mock transaction hash: ${hash}. Link:${environment.TONVIEWER_URL}/transaction/${hash}`
    );
    const fee = toNano(0.05);
    const { hash: sendHash } = await wait(address, () =>
      governor.send({
        to: distributionPoolData.tokenWalletAddress,
        value: rewards + fee,
      })
    );

    console.log(
      `Dedust send distribution hash: ${sendHash}. Link:${environment.TONVIEWER_URL}/transaction/${sendHash}`
    );
  }
};
