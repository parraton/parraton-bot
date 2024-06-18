import {Address} from "@ton/core";
import {tonClientPromise} from "../config/ton-client";
import {JettonRoot} from "@dedust/sdk";

export const getJettonWalletBalance = async (jettonMasterAddress: Address, userAddress:Address) => {
  const tonClient = await tonClientPromise;
  const rawJettonRoot = JettonRoot.createFromAddress(jettonMasterAddress);
  const jettonRoot = tonClient.open(rawJettonRoot);
  const rawUserWallet = await jettonRoot.getWallet(userAddress);
  const userWallet = tonClient.open(rawUserWallet);

  return await userWallet.getBalance();
}
