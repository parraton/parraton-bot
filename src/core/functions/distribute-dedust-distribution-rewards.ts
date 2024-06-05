import {Address, beginCell, Cell, Dictionary, OpenedContract, Sender, toNano} from '@ton/core';
import { DistributionPool } from '@dedust/apiary-v1';
import {environment} from "../../config/environment";
import {distributionPool} from "../../config/contracts";
import pinataSDK from '@pinata/sdk';
import fs from "fs";
import path from "path";
import {PinataPinOptions} from "@pinata/sdk/src/commands/pinning/pinFileToIPFS";
import {DictionaryUtils} from "../../utils/dictionary";

const pinata = new pinataSDK({ pinataJWTKey: environment.PINATA_JWT});

const fileName = "rewards.txt"
const filePath = path.join(__dirname,'..', "assets", fileName);

const uploadToIpfs = async (dict: Dictionary<Address, bigint>,) => {
  const buffer =  DictionaryUtils.toBoc(dict);

  fs.writeFileSync(filePath, buffer);

  const read = fs.createReadStream(filePath);

  const options: PinataPinOptions = {
    pinataMetadata: {
      name: fileName
    }
  }

  const {IpfsHash} = await pinata.pinFileToIPFS(read, options);

  return `ipfs://${IpfsHash}`;
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

const additionalReward = toNano(0.2);
const _reward = toNano(2)

export const distributeRewards = async (sender: Sender)  => {
    const rewardsUnit = toNano(1) + additionalReward + _reward;
    const reward = rewardsUnit * BigInt(1);
    const rewardsDictionary = DistributionPool.createRewardsDictionary();
    rewardsDictionary.set(environment.VAULT_ADDRESS, reward);

    await distributeDeDustDistributionRewards(sender, rewardsDictionary, distributionPool);

    return reward;
}
