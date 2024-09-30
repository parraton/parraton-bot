import { Address, beginCell, Cell, Dictionary } from "@ton/core";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";
import { PinataPinOptions } from "@pinata/sdk/src/commands/pinning/pinFileToIPFS";
import { PINATA_JWT, IPFS_GATEWAY } from "./config";
import memoizee from "memoizee";
import asyncRetry from "async-retry";
import { RETRY_CONFIG } from "./constants";

const pinata = new pinataSDK({ pinataJWTKey: PINATA_JWT });

const fileName = "rewards.txt";
const filePath = path.join(__dirname, "assets", fileName);

export const uploadToIpfs = async (dict: Dictionary<Address, bigint>) => {
  const buffer = convertDictionaryToBuffer(dict);

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

export const fetchDictionaryFromIpfs = memoizee(
  async (dataUri: string) => {
    const response = await asyncRetry(
      async () => fetch(IPFS_GATEWAY + dataUri.replace("ipfs://", "")),
      RETRY_CONFIG
    );
    const merkleTreeBOC = await response.arrayBuffer();
    const buffer = Buffer.from(merkleTreeBOC);
    return convertBufferToDictionary(buffer);
  },
  {
    maxAge: 2 * 60 * 1000, // 2 minutes
    promise: true,
  }
);

const convertBufferToDictionary = (buffer: Buffer) =>
  Cell.fromBoc(buffer)[0]
    .beginParse()
    .loadDictDirect(Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4));

const convertDictionaryToBuffer = (dictionary: Dictionary<Address, bigint>) =>
  beginCell().storeDictDirect(dictionary).endCell().toBoc();
