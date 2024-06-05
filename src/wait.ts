import {waitTransaction} from "./utils/is-transaction-finished";
import {getTransactions} from "./utils/get-transactions";
import {getNewTxHash} from "./utils/get-new-tx-hash";

export const wait = async (address: string, sendTx: () => Promise<void>): Promise<{hash: string}>  =>  {
    const transactions = await getTransactions(address);

    const lastTx = transactions.at(0)?.transaction_id?.hash;
    await sendTx();
    const hash = await getNewTxHash(address, lastTx);

    await waitTransaction(hash);

    return { hash };
  };