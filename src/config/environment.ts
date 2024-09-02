import dotenv from "dotenv";
import { Network } from "@orbs-network/ton-access";
dotenv.config();

type Environment = {
  TON_CLIENT_ENDPOINT: string;
  MANAGER_SEED_PHRASE: string;
  DEDUST_GOVERNOR_SEED_PHRASE: string;
  VAULT_GOVERNOR_SEED_PHRASE: string;
  NETWORK: Network;
  TONCENTER_API_KEY: string;
  TONCENTER_URL: string;
  TONAPI_URL: string;
  IPFS_GATEWAY: string;
  PINATA_JWT: string;
  TONVIEWER_URL: string;
};

const {
  PINATA_JWT,
  TONCENTER_API_KEY,
  MANAGER_SEED_PHRASE,
  DEDUST_GOVERNOR_SEED_PHRASE,
  VAULT_GOVERNOR_SEED_PHRASE,
  NODE_ENV,
} = process.env;

export const testnetEnvironment: Environment = {
  TON_CLIENT_ENDPOINT: "https://testnet-v4.tonhubapi.com",
  MANAGER_SEED_PHRASE: MANAGER_SEED_PHRASE || "",
  DEDUST_GOVERNOR_SEED_PHRASE: DEDUST_GOVERNOR_SEED_PHRASE || "",
  VAULT_GOVERNOR_SEED_PHRASE: VAULT_GOVERNOR_SEED_PHRASE || "",
  NETWORK: "testnet",
  TONCENTER_API_KEY: TONCENTER_API_KEY || "",
  TONCENTER_URL: "https://testnet.toncenter.com/api/v2/jsonRPC",
  TONAPI_URL: "https://testnet.tonapi.io",
  TONVIEWER_URL: "https://testnet.tonviewer.com",
  IPFS_GATEWAY: "https://gateway.pinata.cloud/ipfs/",
  PINATA_JWT: PINATA_JWT || "",
};

export const mainnetEnvironment: Environment = {
  TON_CLIENT_ENDPOINT: "https://mainnet-v4.tonhubapi.com",
  MANAGER_SEED_PHRASE: MANAGER_SEED_PHRASE || "",
  DEDUST_GOVERNOR_SEED_PHRASE: DEDUST_GOVERNOR_SEED_PHRASE || "",
  VAULT_GOVERNOR_SEED_PHRASE: VAULT_GOVERNOR_SEED_PHRASE || "",
  NETWORK: "mainnet",
  TONCENTER_API_KEY: TONCENTER_API_KEY || "",
  TONCENTER_URL: "https://toncenter.com/api/v2/jsonRPC",
  TONAPI_URL: "https://tonapi.io",
  TONVIEWER_URL: "https://tonviewer.com",
  IPFS_GATEWAY: "https://gateway.pinata.cloud/ipfs/",
  PINATA_JWT: PINATA_JWT || "",
};

export const environment =
  NODE_ENV === "mainnet" ? mainnetEnvironment : testnetEnvironment;
