import { DistributionPool } from "@dedust/apiary-v1";
import { fetchDictionaryFromIpfs } from "../../utils/fetch-dictionary-from-ipfs";
import { Address, OpenedContract, Sender } from "@ton/core";
import { claimDeDustDistributionRewards } from "../claim-de-dust-distribution-rewards";

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
