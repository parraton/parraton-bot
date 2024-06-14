import { DistributionAccount, DistributionPool } from "@dedust/apiary-v1";
import { fetchDictionaryFromIpfs } from "../../utils/fetch-dictionary-from-ipfs";
import { Address, OpenedContract, Sender } from "@ton/core";
import { claimDeDustDistributionRewards } from "../claim-de-dust-distribution-rewards";
import { tonClientPromise } from "../../config/ton-client";

export const isClaimRewardsNeeded = async (
  distributionPool: OpenedContract<DistributionPool>,
  userAddress: Address
) => {
  const tonClient = await tonClientPromise;
  const distributionAccountAddress = await distributionPool.getAccountAddress(
    userAddress
  );
  const distributionAccount = tonClient.open(
    DistributionAccount.createFromAddress(distributionAccountAddress)
  );
  console.log(distributionAccountAddress);
  let accountData;
  try {
    accountData = await distributionAccount.getAccountData();
  } catch (e) {
    return true;
  }

  const previousRewards = accountData.totalPaid;

  let { dataUri } = await distributionPool.getRewardsData();

  if (!dataUri) {
    throw new Error("Data URI is not defined");
  }

  const rewardsDictionary = await fetchDictionaryFromIpfs(dataUri);
  const rewards = rewardsDictionary.get(userAddress) ?? 0n;
  const newRewards = rewards - previousRewards;
  console.log(`New rewards: ${newRewards}`);

  return newRewards > 0n;
};

export const claimRewards = async (
  sender: Sender,
  distributionPool: OpenedContract<DistributionPool>,
  userAddress: Address
) => {
  let { dataUri } = await distributionPool.getRewardsData();

  if (!dataUri) {
    throw new Error("Data URI is not defined");
  }

  const rewardsDictionary = await fetchDictionaryFromIpfs(dataUri);

  await claimDeDustDistributionRewards(
    sender,
    rewardsDictionary,
    distributionPool,
    userAddress
  );
};
