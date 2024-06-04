import {DistributionPool} from "@dedust/apiary-v1";
import {environment} from "../../config/environment";
import {tonClient} from "../../config/ton-client";
import {fetchDictionaryFromIpfs} from "../../utils/fetch-dictionary-from-ipfs";
import {Sender} from "@ton/core";
import {claimDeDustDistributionRewards} from "../claim-de-dust-distribution-rewards";
import {distributionPool} from "../../config/contracts";


export const claimRewards = async (sender: Sender) => {
  let {dataUri} = await distributionPool.getRewardsData();

  dataUri ??= 'ipfs://QmPgwC1hWJWwzNumzmExSZ449ozEgNYAU6Phy2JGVxkuZd'

  if(!dataUri) {
    throw new Error('Data URI is not defined');
  }

  const rewardsDictionary = await fetchDictionaryFromIpfs(dataUri);

  await claimDeDustDistributionRewards(
    sender,
    rewardsDictionary,
    distributionPool,
    environment.VAULT_ADDRESS
  );
}