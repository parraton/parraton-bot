import { tonApiClient } from "./ton-api";
import { TraceIDs } from "tonapi-sdk-js";
import asyncRetry from "async-retry";
import { RETRY_CONFIG } from "./constants";

const isTransactionFinished = async (hash: string): Promise<boolean> => {
  try {
    const { in_progress } = await asyncRetry(
      async () => await tonApiClient.events.getEvent(hash),
      RETRY_CONFIG
    );
    return !in_progress;
  } catch (e) {
    return false;
  }
};

const waitTransaction = async (hash: string): Promise<void> => {
  let isFinished = false;
  while (!isFinished) {
    isFinished = await isTransactionFinished(hash);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

const getTraces = async (address: string): Promise<TraceIDs> =>
  await asyncRetry(
    async () => tonApiClient.accounts.getAccountTraces(address, { limit: 1 }),
    RETRY_CONFIG
  );

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getNewTxHash = async (
  address: string,
  prevTxHash: string
): Promise<string> => {
  return await new Promise(async (resolve) => {
    let newTxHash = prevTxHash;

    while (newTxHash == prevTxHash) {
      await sleep(5000);
      const { traces } = await getTraces(address);
      newTxHash = traces.at(0)?.id ?? "";
    }

    resolve(newTxHash);
  });
};

export const wait = async (
  address: string,
  sendTx: () => Promise<void>
): Promise<string> => {
  const { traces } = await getTraces(address);

  const lastTx = traces.at(0)?.id ?? "";
  await sendTx();
  const hash = await getNewTxHash(address, lastTx);

  await waitTransaction(hash);

  return hash;
};
