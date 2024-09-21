import { WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "@ton/crypto";
import { OpenedContract, Sender } from "@ton/core";
import { tonClient } from "./ton-client";
import { DEDUST_GOVERNOR_SEED_PHRASE, MANAGER_SEED_PHRASE } from "./config";

export interface WalletSender {
  wallet: OpenedContract<WalletContractV4>;
  sender: Sender;
}

const getWallet = async (mnemonic: string): Promise<WalletSender> => {
  const mnemonicArray = mnemonic.split(" ");
  const keys = await mnemonicToWalletKey(mnemonicArray);

  const wallet = (await tonClient).open(
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

export const managerWalletPromise = getWallet(MANAGER_SEED_PHRASE);
export const dedustGovernorWalletPromise = getWallet(
  DEDUST_GOVERNOR_SEED_PHRASE
);
