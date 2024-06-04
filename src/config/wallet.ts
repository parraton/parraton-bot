import { WalletContractV3R2 } from '@ton/ton';
import { KeyPair, mnemonicToSeed } from '@ton/crypto';
import { environment } from './environment';
import nacl from 'tweetnacl';
import { tonClient } from './ton-client';
import {OpenedContract, Sender} from "@ton/core";

function normalizeMnemonic(src: string[]) {
  return src.map((v) => v.toLowerCase().trim());
}

export async function mnemonicToPrivateKey(
  mnemonicArray: string[],
  seed: string,
  password?: string | null | undefined,
): Promise<KeyPair> {
  const n_mnemonicArray = normalizeMnemonic(mnemonicArray);
  const g_seed = await mnemonicToSeed(n_mnemonicArray, seed, password);
  const keyPair = nacl.sign.keyPair.fromSeed(g_seed.slice(0, 32));

  return {
    publicKey: Buffer.from(keyPair.publicKey),
    secretKey: Buffer.from(keyPair.secretKey),
  };
}

export interface WalletSender {
  wallet: OpenedContract<WalletContractV3R2>;
  sender: Sender;
}

const getWallet = async (num?: number): Promise<WalletSender> => {
  const mnemonicArray = environment.SEED_PHRASE.split(' ');
  const seed = `${0}${num ?? 0}`;

  const keys = await mnemonicToPrivateKey(mnemonicArray, seed);

  const wallet = tonClient.open(
    WalletContractV3R2.create({
      workchain: 0,
      publicKey: keys.publicKey,
    }),
  );

  return {
    wallet,
    sender: wallet.sender(keys.secretKey),
  };
};

export const managerWalletPromise = getWallet(0);
export const dedustGovernorWalletPromise = getWallet(1);
export const vaultGovernorWalletPromise = getWallet(2);