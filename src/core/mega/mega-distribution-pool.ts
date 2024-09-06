import { DistributionAccount, DistributionPool } from "@dedust/apiary-v1";
import { Address, ContractProvider, toNano } from "@ton/core";
import { tonClientPromise } from "../../config/ton-client";
import { fetchDictionaryFromIpfs } from "../../utils/fetch-dictionary-from-ipfs";

const MIN_REWARDS_TO_CLAIM = toNano("1");

export class MegaDistributionPool extends DistributionPool {
  static createFromAddress(address: Address): MegaDistributionPool {
    return new MegaDistributionPool(address);
  }

  static async open(address: Address) {
    const pool = MegaDistributionPool.createFromAddress(address);

    const tonClient = await tonClientPromise;

    return tonClient.open(pool);
  }

  async open() {
    const tonClient = await tonClientPromise;

    return tonClient.open(this);
  }

  private constructor(address: Address) {
    super(address);
  }

  async getIsClaimRewardsNeeded(
    provider: ContractProvider,
    userAddress: Address
  ) {
    const distributionAccountAddress = await this.getAccountAddress(
      provider,
      userAddress
    );
    const distributionAccount = DistributionAccount.createFromAddress(
      distributionAccountAddress
    );

    let accountData;
    try {
      accountData = await distributionAccount.getAccountData(provider);
    } catch (e) {
      return true;
    }

    const previousRewards = accountData.totalPaid;

    let { dataUri } = await this.getRewardsData(provider);

    if (!dataUri) {
      throw new Error("Data URI is not defined");
    }

    const rewardsDictionary = await fetchDictionaryFromIpfs(dataUri);
    const rewards = rewardsDictionary.get(userAddress) ?? 0n;
    const newRewards = rewards - previousRewards;

    return newRewards > MIN_REWARDS_TO_CLAIM;
  }
}
