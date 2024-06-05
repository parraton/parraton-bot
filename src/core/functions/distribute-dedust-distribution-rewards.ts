import {
  Address,
  beginCell,
  Cell,
  Dictionary,
  OpenedContract,
  Sender,
  toNano,
} from "@ton/core";
import { DistributionAccount, DistributionPool } from "@dedust/apiary-v1";
import { environment } from "../../config/environment";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";
import { PinataPinOptions } from "@pinata/sdk/src/commands/pinning/pinFileToIPFS";
import { DictionaryUtils } from "../../utils/dictionary";
import { tonClient } from "../../config/ton-client";

const pinata = new pinataSDK({ pinataJWTKey: environment.PINATA_JWT });

const fileName = "rewards.txt";
const filePath = path.join(__dirname, "..", "assets", fileName);

const uploadToIpfs = async (dict: Dictionary<Address, bigint>) => {
  const buffer = DictionaryUtils.toBoc(dict);

  fs.writeFileSync(filePath, buffer);

  const read = fs.createReadStream(filePath);

  const options: PinataPinOptions = {
    pinataMetadata: {
      name: fileName,
    },
  };

  const { IpfsHash } = await pinata.pinFileToIPFS(read, options);

  return `ipfs://${IpfsHash}`;
};

export async function distributeDeDustDistributionRewards(
  admin: Sender,
  rewardsDictionary: Dictionary<Address, bigint>,
  distributionPool: OpenedContract<DistributionPool>
) {
  const rewardsRootHash =
    DistributionPool.calculateRewardsHash(rewardsDictionary);
  const dataUri = await uploadToIpfs(rewardsDictionary);

  await distributionPool.sendUpdateRewards(admin, {
    newRewardsRootHash: rewardsRootHash,
    newRewardsDataUri: dataUri,
  });
}

export const distributeRewards = async (
  sender: Sender,
  vaultAddress: Address,
  newRewards: bigint,
  distributionPool: OpenedContract<DistributionPool>
) => {
  // read rewards from distribution pool & add new rewards
  const accountAddress = await distributionPool.getAccountAddress(vaultAddress);
  const distributionAccount = tonClient.open(
    DistributionAccount.createFromAddress(accountAddress)
  );
  let totalPaid = 0n;
  try {
    const result = await distributionAccount.getAccountData();
    totalPaid = result.totalPaid;
  } catch (error) {}
  const reward = totalPaid + newRewards;

  const rewardsDictionary = DistributionPool.createRewardsDictionary();
  rewardsDictionary.set(vaultAddress, reward);

  await distributeDeDustDistributionRewards(
    sender,
    rewardsDictionary,
    distributionPool
  );

  return newRewards;
};
