import { dedustGovernorWalletPromise } from "./config/wallet";
import { wait } from "./wait";
import { distributeRewards } from "./core/functions/distribute-dedust-distribution-rewards";
import { environment } from "./config/environment";
import { addresses } from "./config/contracts-config";
import { tonClient } from "./config/ton-client";
import { Vault } from "./core/contracts/vault";
import { Address, toNano } from "@ton/core";
import { DistributionPool } from "@dedust/apiary-v1";

export const mockDedustDistribution = async () => {
  const { wallet, sender: governor } = await dedustGovernorWalletPromise;
  const address = wallet.address.toString();

  for (const vaultData of Object.values(addresses.vaults)) {
    const vault = tonClient.open(
      Vault.createFromAddress(Address.parse(vaultData.vault))
    );
    const data = await vault.getVaultData();
    const distributionPool = tonClient.open(
      DistributionPool.createFromAddress(data.distributionPoolAddress)
    );
    const distributionPoolData = await distributionPool.getPoolExtraData();
    let rewards = 0n;

    const { hash } = await wait(address, async () => {
      rewards = await distributeRewards(
        governor,
        vault.address,
        toNano(2),
        distributionPool
      );
    });

    console.log(
      `Dedust distribution mock transaction hash: ${hash}. Link:${environment.TONVIEWER_URL}/transaction/${hash}`
    );

    const { hash: sendHash } = await wait(address, () =>
      governor.send({
        to: distributionPoolData.tokenWalletAddress,
        value: rewards,
      })
    );

    console.log(
      `Dedust send distribution hash: ${sendHash}. Link:${environment.TONVIEWER_URL}/transaction/${sendHash}`
    );
  }
};
