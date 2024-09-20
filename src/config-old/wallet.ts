import { WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import { environment } from "./environment";
import { OpenedContract, Sender } from "@ton/core";
import { tonClientPromise } from "./ton-client";

export interface WalletSender {
  wallet: OpenedContract<WalletContractV4>;
  sender: Sender;
}

const getWallet = async (mnemonic: string): Promise<WalletSender> => {
  const mnemonicArray = mnemonic.split(" ");

  const keys = await mnemonicToWalletKey(mnemonicArray);
  const tonClient = await tonClientPromise;

  const wallet = tonClient.open(
    WalletContractV4.create({
      workchain: 0,
      publicKey: keys.publicKey,
    })
  );

  return {
    wallet,
    sender: wallet.sender(keys.secretKey),
  };
};

export const managerWalletPromise = getWallet(environment.MANAGER_SEED_PHRASE);
export const dedustGovernorWalletPromise = getWallet(
  environment.DEDUST_GOVERNOR_SEED_PHRASE
);
