import {Address} from "@ton/core";

import dotenv from 'dotenv';
import {addresses, usdtVault} from "./contracts-config";
dotenv.config();

const { PINATA_JWT } = process.env;

export const environment = {
  TON_CLIENT_ENDPOINT: 'https://sandbox-v4.tonhubapi.com',
  // SEED_PHRASE: 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
  SEED_PHRASE: 'loop seed negative maple twist matter cook depth gather crisp main dawn',
  TONCENTER_API_KEY: '',
  TONCENTER_URL: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  TONAPI_URL: 'https://testnet.tonapi.io',
  IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  TONVIEWER_URL: 'https://testnet.tonviewer.com',
  PINATA_JWT,
  VAULT_ADDRESS: Address.parse(usdtVault.vault),
  TOKEN_ADDRESS: Address.parse(usdtVault.token),
  DEDUST_ADDRESS: Address.parse(addresses.dedustFactory),
  DISTRIBUTION_POOL_ADDRESS: Address.parse(usdtVault.distributionPool),
  DISTRIBUTION_POOL_WALLET_ADDRESS: Address.parse(usdtVault.dedustDistributionWallet),
};