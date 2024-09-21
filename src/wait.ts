import { tonweb } from "./tonweb";

type WaitResult = {
  hash: string;
  success: boolean;
};

type SuccessChecker = (hash: string) => boolean | Promise<boolean>;

import { TONAPI_URL } from "./config";

const createUrl = (hash: string) => {
  return TONAPI_URL + "/v2/events/" + hash;
};

const isTransactionFinished = async (hash: string): Promise<boolean> => {
  const url = createUrl(hash);
  const response = await fetch(url);

  if (!response.ok) {
    return false;
  }

  const { in_progress } = (await response.json()) as { in_progress: boolean };
  return in_progress != undefined && !in_progress;
};

const waitTransaction = async (hash: string): Promise<void> => {
  let isFinished = false;
  while (!isFinished) {
    isFinished = await isTransactionFinished(hash);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

const getTransactions = (
  address: string
): ReturnType<typeof tonweb.getTransactions> =>
  tonweb.provider.getTransactions(address, 1, void 0, void 0, void 0, true);

const base64ToHex = (base64: string) => {
  return Buffer.from(base64, "base64").toString("hex");
};

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
      const transactions = await getTransactions(address);
      newTxHash = transactions.at(0)?.transaction_id?.hash;
    }

    resolve(base64ToHex(newTxHash));
  });
};

export const wait = async (
  address: string,
  sendTx: () => Promise<void>,
  successChecker: SuccessChecker = (hash: string) => true
): Promise<WaitResult> => {
  const transactions = await getTransactions(address);

  const lastTx = transactions.at(0)?.transaction_id?.hash;
  await sendTx();
  const hash = await getNewTxHash(address, lastTx);

  await waitTransaction(hash);

  const success = await successChecker(hash);

  return { hash, success };
};
