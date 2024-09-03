import { vaultGovernorWalletPromise } from "./config/wallet";
import { wait } from "./wait";
import {
  distributeRewards,
  prepareExtraRewards,
} from "./core/functions/distribute-dedust-distribution-rewards";
import { environment } from "./config/environment";
import { addresses } from "./config/contracts-config";
import { Address, toNano } from "@ton/core";
import { DistributionPool } from "@dedust/apiary-v1";
import { tonClientPromise } from "./config/ton-client";

export const vaultExtraRewardsDistribution = async () => {
  const { wallet, sender: governor } = await vaultGovernorWalletPromise;
  const address = wallet.address.toString();
  const tonClient = await tonClientPromise;
  for (const vaultData of addresses.vaults) {
    if (!vaultData.extraDistributionPool) {
      continue;
    }
    const distributionPool = tonClient.open(
      DistributionPool.createFromAddress(
        Address.parse(vaultData.extraDistributionPool)
      )
    );
    const distributionPoolData = await distributionPool.getPoolExtraData();

    let rewardPerPeriod = toNano(0.1);

    const { hash } = await wait(address, async () => {
      const rewardsDictionary = await prepareExtraRewards(
        Address.parse(vaultData.vault),
        rewardPerPeriod,
        distributionPool
      );
      if (rewardsDictionary.size > 0) {
        await distributeRewards(governor, rewardsDictionary, distributionPool);
      }
    });

    console.log(
      `Extra rewards distribution for ${vaultData.vault} hash: ${hash}. Link:${environment.TONVIEWER_URL}/transaction/${hash}`
    );

    const fee = toNano(0.05);
    const { hash: sendHash } = await wait(address, () =>
      governor.send({
        to: distributionPoolData.tokenWalletAddress,
        value: rewardPerPeriod + fee,
      })
    );

    console.log(
      `Send extra rewards for ${vaultData.vault} hash: ${sendHash}. Link:${environment.TONVIEWER_URL}/transaction/${sendHash}`
    );
  }
};
