import {Cell, Dictionary} from "@ton/core";
import {environment} from "../config/environment";

export const fetchDictionaryFromIpfs = async (dataUri: string) => {
  const response = await fetch(environment.IPFS_GATEWAY + dataUri.replace('ipfs://', ''));

  const merkleTreeBOC = await response.arrayBuffer();

  const buffer = Buffer.from(merkleTreeBOC);

  return Cell.fromBoc(buffer)[0]
    .beginParse()
    .loadDictDirect(
      Dictionary.Keys.Address(),
      Dictionary.Values.BigVarUint(4),
    );
}