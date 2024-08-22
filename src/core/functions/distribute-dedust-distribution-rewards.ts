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
import { tonClientPromise } from "../../config/ton-client";
import { getAllJettonHolders } from "../../utils/get-jetton-holders";
import { fetchDictionaryFromIpfs } from "../../utils/fetch-dictionary-from-ipfs";
import { Vault } from "@parraton/sdk";

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

export async function distributeRewards(
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

export const prepareExtraRewards = async (
  vaultAddress: Address,
  newRewards: bigint,
  distributionPool: OpenedContract<DistributionPool>
) => {
  let rewardsDictionary = DistributionPool.createRewardsDictionary();

  let { dataUri } = await distributionPool.getRewardsData();
  if (dataUri) {
    rewardsDictionary = await fetchDictionaryFromIpfs(dataUri);
  }
  const tonClient = await tonClientPromise;

  const vault = tonClient.open(Vault.createFromAddress(vaultAddress));
  const { sharesTotalSupply } = await vault.getVaultData();
  const holders = await getAllJettonHolders(vaultAddress.toString());
  holders.forEach((holder) => {
    const newReward =
      (BigInt(holder.balance) * BigInt(newRewards)) / BigInt(sharesTotalSupply);
    const prevReward =
      rewardsDictionary.get(Address.parse(holder.owner.address)) || 0n;
    rewardsDictionary.set(
      Address.parse(holder.owner.address),
      prevReward + newReward
    );
  });
  return rewardsDictionary;
};

export const prepareDedustMockRewards = async (
  vaultAddress: Address,
  newRewards: bigint,
  distributionPool: OpenedContract<DistributionPool>
) => {
  const accountAddress = await distributionPool.getAccountAddress(vaultAddress);
  const tonClient = await tonClientPromise;
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
  return rewardsDictionary;
};
