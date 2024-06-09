import {environment} from "./environment";

import { Address, TonClient4, TupleItem } from '@ton/ton';
import {getHttpV4Endpoint} from "@orbs-network/ton-access";

export namespace AsyncRetry {
  export const retry = async <T>(fn: () => Promise<T>, retries = 3, delay = 200): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return await retry(fn, retries - 1);
    }
  };
}

class CustomTonClient extends TonClient4 {
  async getLastBlock() {
    return await AsyncRetry.retry(() => super.getLastBlock(), 5, 1000);
  }
  async getBlock(seqno: number) {
    return await AsyncRetry.retry(() => super.getBlock(seqno), 5, 1000);
  }
  async getBlockByUtime(ts: number) {
    return await AsyncRetry.retry(() => super.getBlockByUtime(ts), 5, 1000);
  }
  async getAccount(seqno: number, address: Address) {
    return await AsyncRetry.retry(() => super.getAccount(seqno, address), 5, 1000);
  }
  async getAccountLite(seqno: number, address: Address) {
    return await AsyncRetry.retry(() => super.getAccountLite(seqno, address), 5, 1000);
  }
  async isContractDeployed(seqno: number, address: Address) {
    return await AsyncRetry.retry(() => super.isContractDeployed(seqno, address), 5, 1000);
  }
  async isAccountChanged(seqno: number, address: Address, lt: bigint) {
    return await AsyncRetry.retry(() => super.isAccountChanged(seqno, address, lt), 5, 1000);
  }
  async getAccountTransactions(address: Address, lt: bigint, hash: Buffer) {
    return await AsyncRetry.retry(() => super.getAccountTransactions(address, lt, hash), 5, 1000);
  }
  async getAccountTransactionsParsed(address: Address, lt: bigint, hash: Buffer, count?: number) {
    return await AsyncRetry.retry(
      () => super.getAccountTransactionsParsed(address, lt, hash, count),
      5,
      1000,
    );
  }
  async getConfig(seqno: number, ids?: number[]) {
    return await AsyncRetry.retry(() => super.getConfig(seqno, ids), 5, 1000);
  }

  async runMethod(seqno: number, address: Address, name: string, args?: TupleItem[]) {
    return await AsyncRetry.retry(() => super.runMethod(seqno, address, name, args), 5, 1000);
  }

  async sendMessage(message: Buffer) {
    return await AsyncRetry.retry(() => super.sendMessage(message), 5, 1000);
  }
}

export const tonClientPromise = (async () => new CustomTonClient({
  endpoint: await getHttpV4Endpoint({
    network: "testnet"
  })
}))();