import { TONVIEWER_URL } from "./config";

export const logOperation = (operation: string, hash: string) => {
  console.log(
    `${operation} hash: ${hash}. Link: ${TONVIEWER_URL}/transaction/${hash}`
  );
};
