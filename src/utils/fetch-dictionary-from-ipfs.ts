import {environment} from "../config/environment";
import {DictionaryUtils} from "./dictionary";

export const fetchDictionaryFromIpfs = async (dataUri: string) => {
  const response = await fetch(environment.IPFS_GATEWAY + dataUri.replace('ipfs://', ''));

  const merkleTreeBOC = await response.arrayBuffer();

  const buffer = Buffer.from(merkleTreeBOC);

  return DictionaryUtils.fromBoc(buffer);
}