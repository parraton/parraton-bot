import {waitTransaction} from "./utils/is-transaction-finished";
import {getTransactions} from "./utils/get-transactions";
import {getNewTxHash} from "./utils/get-new-tx-hash";

type WaitResult = {
  hash: string;
  success: boolean;
};

type SuccessChecker = (hash: string) => boolean | Promise<boolean>

export const wait = async (address: string, sendTx: () => Promise<void>, successChecker: SuccessChecker = (hash: string) => true): Promise<WaitResult> => {
  const transactions = await getTransactions(address);

  const lastTx = transactions.at(0)?.transaction_id?.hash;
  await sendTx();
  const hash = await getNewTxHash(address, lastTx);

  await waitTransaction(hash);

  const success = await successChecker(hash);

  return {hash, success};
};