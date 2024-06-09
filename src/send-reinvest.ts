import { managerWalletPromise } from "./config/wallet";
import { wait } from "./wait";
import { reinvest } from "./core/functions/reinvest";
import { claimRewards } from "./core/functions/claim-rewards";
import { environment } from "./config/environment";
import { addresses } from "./config/contracts-config";
import { Vault } from "./core/contracts/vault";
import { Address } from "@ton/core";
import { DistributionPool } from "@dedust/apiary-v1";
import {tonClientPromise} from "./config/ton-client";

export const sendReinvest = async () => {
  const { wallet, sender: manager } = await managerWalletPromise;
  const address = wallet.address.toString();
  const tonClient = await tonClientPromise;
  for (const vaultData of Object.values(addresses.vaults)) {
    const vault = tonClient.open(
      Vault.createFromAddress(Address.parse(vaultData.vault))
    );
    const data = await vault.getVaultData();
    const distributionPool = tonClient.open(
      DistributionPool.createFromAddress(data.distributionPoolAddress)
    );

    const { hash: claimHash } = await wait(address, () =>
      claimRewards(manager, distributionPool, vault.address)
    );
    console.log(
      `Claim rewards hash: ${claimHash}. Link: ${environment.TONVIEWER_URL}/transaction/${claimHash}`
    );

    const { hash: reinvestHash } = await wait(address, () =>
      reinvest(manager, vault)
    );
    console.log(
      `Reinvest hash: ${reinvestHash}. Link: ${environment.TONVIEWER_URL}/transaction/${reinvestHash}`
    );
  }
};
