import {environment} from "../config/environment";


export const logOperation = (operation: string, hash: string) => {
  console.log(`${operation} hash: ${hash}. Link: ${environment.TONVIEWER_URL}/transaction/${hash}`);
}