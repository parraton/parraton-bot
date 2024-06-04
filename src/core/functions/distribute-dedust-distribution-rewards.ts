import {Address, beginCell, Cell, Dictionary, OpenedContract, Sender, toNano} from '@ton/core';
import { DistributionPool } from '@dedust/apiary-v1';
import {environment} from "../../config/environment";
import {distributionPool} from "../../config/contracts";

const uploadToIpfs = async (dict: Dictionary<Address, bigint>,) => {
  const buffer =  beginCell().storeDict(dict).endCell().toBoc();

  return 'ipfs://some-link';
}

export async function distributeDeDustDistributionRewards(
    admin: Sender,
    rewardsDictionary: Dictionary<Address, bigint>,
    distributionPool: OpenedContract<DistributionPool>,
) {
    const rewardsRootHash = DistributionPool.calculateRewardsHash(rewardsDictionary);
    const dataUri = await  uploadToIpfs(rewardsDictionary);

    await distributionPool.sendUpdateRewards(admin, {
        newRewardsRootHash: rewardsRootHash,
        newRewardsDataUri: dataUri
    });
}

export const distributeRewards = async (sender: Sender)  => {
    const rewardsUnit = toNano(1);
    const reward = rewardsUnit * BigInt(1);
    const rewardsDictionary = DistributionPool.createRewardsDictionary();
    rewardsDictionary.set(environment.VAULT_ADDRESS, reward);

    await distributeDeDustDistributionRewards(sender, rewardsDictionary, distributionPool);
}
