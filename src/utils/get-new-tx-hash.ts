import {sleep} from "./sleep";
import {getTransactions} from "./get-transactions";

const base64ToHex = (base64: string) => {
  return Buffer.from(base64, 'base64').toString('hex');
};

export const getNewTxHash = async (
  address: string,
  prevTxHash: string,
): Promise<string> => {
  return await new Promise(async (resolve) => {
    let newTxHash = '';

    while (newTxHash == prevTxHash) {
      await sleep(5000);
      const transactions = await getTransactions(address);
      newTxHash = transactions.at(0)?.transaction_id?.hash;
    }

    resolve(base64ToHex(newTxHash));
  });
};