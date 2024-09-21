import { RETRY_CONFIG } from "./constants";
import { Address, Cell, Dictionary } from "@ton/core";
import { tonClient } from "./ton-client";
import { DistributionAccount, DistributionPool } from "@dedust/apiary-v1";
import memoizee from "memoizee";
import asyncRetry from "async-retry";
import { fetchDictionaryFromIpfs } from "./ipfs.utils";

export const getDistributionPool = memoizee(
  async (distributionPoolAddress: Address) => {
    const rawDistributionPool = DistributionPool.createFromAddress(
      distributionPoolAddress
    );
    return (await tonClient).open(rawDistributionPool);
  },
  {
    maxAge: 60 * 60 * 1000, // 1 hour
    promise: true,
  }
);

export const getRewardsDictionary = memoizee(
  async (distributionPoolAddress: Address) => {
    const pool = await getDistributionPool(distributionPoolAddress);
    const { dataUri } = await asyncRetry(
      async () => pool.getRewardsData(),
      RETRY_CONFIG
    );
    if (!dataUri) {
      return;
    }
    const rewardsDictionary = await fetchDictionaryFromIpfs(dataUri);
    return rewardsDictionary;
  },
  {
    maxAge: 2 * 60 * 1000, // 2 minutes
    promise: true,
  }
);

export const getDistributionAccountClaimedRewards = async (
  distributionPoolAddress: Address,
  accountAddress: Address
) => {
  const pool = await getDistributionPool(distributionPoolAddress);

  const distributionAccountAddress = await pool.getAccountAddress(
    accountAddress
  );
  const rawDistributionAccount = DistributionAccount.createFromAddress(
    distributionAccountAddress
  );
  const distributionAccount = (await tonClient).open(rawDistributionAccount);

  if (!(await getAccountActive(distributionAccount.address))) {
    return 0n;
  }
  const { totalPaid } = await asyncRetry(
    async () => distributionAccount.getAccountData(),
    RETRY_CONFIG
  );
  return totalPaid;
};

export const getDistributionAccountAccumulatedRewards = async (
  distributionPoolAddress: Address,
  accountAddress: Address
) => {
  const rewardsDictionary = await getRewardsDictionary(distributionPoolAddress);
  if (!rewardsDictionary) {
    return 0n;
  }
  const rewards = rewardsDictionary.get(accountAddress) ?? 0n;
  return rewards;
};

const getAccountActive = async (accountAddress: Address) => {
  const {
    last: { seqno },
  } = await asyncRetry(
    async () => (await tonClient).getLastBlock(),
    RETRY_CONFIG
  );

  const { account } = await asyncRetry(
    async () => (await tonClient).getAccountLite(seqno, accountAddress),
    RETRY_CONFIG
  );
  return account.state.type === "active";
};
