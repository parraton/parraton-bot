import {Address} from "@ton/core";
import {tonClientPromise} from "../config/ton-client";

export const getAccountBalance = async (accountAddress: Address) => {
  const tonClient = await tonClientPromise;
  const {
    last: { seqno },
  } = await tonClient.getLastBlock();
  const { account: vaultAccountData } = await tonClient.getAccountLite(
    seqno,
    accountAddress
  );
  const atomicBalance = vaultAccountData.balance.coins;

  return BigInt(atomicBalance);
};