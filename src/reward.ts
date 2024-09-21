import { Address, toNano } from "@ton/core";
import { vaults } from "./constants";
import { Vault } from "@parraton/sdk";
import { tonClient } from "./ton-client";
import { getVaultData } from "./compound";
import {
  getDistributionPool,
  getRewardsDictionary,
} from "./distribution.utils";
import { DistributionPool } from "@dedust/apiary-v1";
import { uploadToIpfs } from "./ipfs.utils";
import { dedustGovernorWalletPromise } from "./wallet";
import { wait } from "./wait";
import { logOperation } from "./log";

export const rewardVault = async (vaultAddress: Address) => {
  console.log("Rewarding vault", vaultAddress.toString());
  const { wallet, sender: dedustGovernor } = await dedustGovernorWalletPromise;
  const vault = (await tonClient).open(Vault.createFromAddress(vaultAddress));
  const { distributionPoolAddress } = await getVaultData(vault);
  const rewardsDictionary = await getRewardsDictionary(distributionPoolAddress);

  if (!rewardsDictionary) {
    console.log("No rewards dictionary found");
    return;
  }

  const reward = toNano(1.5);
  const totalReward = rewardsDictionary.get(vaultAddress) ?? 0n;
  const newReward = totalReward + reward;
  rewardsDictionary.set(vaultAddress, newReward);

  const rewardsRootHash =
    DistributionPool.calculateRewardsHash(rewardsDictionary);

  const dataUri = await uploadToIpfs(rewardsDictionary);

  const distributionPool = await getDistributionPool(distributionPoolAddress);
  const distributionHash = await wait(wallet.address.toString(), async () => {
    await distributionPool.sendUpdateRewards(dedustGovernor, {
      newRewardsRootHash: rewardsRootHash,
      newRewardsDataUri: dataUri,
    });
  });
  logOperation("Distribution", distributionHash);
  const { tokenWalletAddress } = await distributionPool.getPoolExtraData();

  const fee = toNano(0.05);
  const sendHash = await wait(wallet.address.toString(), async () => {
    dedustGovernor.send({
      to: tokenWalletAddress,
      value: reward + fee,
    });
  });
  logOperation("Reward", sendHash);
};

export const rewardAllVaults = async () => {
  for (const vault of vaults) {
    await rewardVault(Address.parse(vault));
  }
};
