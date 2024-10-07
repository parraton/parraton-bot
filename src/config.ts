import { toNano } from "@ton/core";
import { config } from "dotenv";

console.log("Applying .env configuration");
config();

export const MANAGER_SEED_PHRASE = process.env.MANAGER_SEED_PHRASE || "";
export const DEDUST_GOVERNOR_SEED_PHRASE =
  process.env.DEDUST_GOVERNOR_SEED_PHRASE || "";

export const NETWORK = process.env.NETWORK || "mainnet";
export const TONAPI_URL = process.env.TONAPI_URL || "https://tonapi.io";
export const TONVIEWER_URL =
  process.env.TONVIEWER_URL || "https://tonviewer.com";

export const IPFS_GATEWAY =
  process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";
export const PINATA_JWT = process.env.PINATA_JWT || "";

export const MIN_REINVEST_AMOUNT = process.env.MIN_REINVEST_AMOUNT
  ? toNano(process.env.MIN_REINVEST_AMOUNT)
  : toNano(6);
export const MIN_CLAIM_AMOUNT = process.env.MIN_CLAIM_AMOUNT
  ? toNano(process.env.MIN_CLAIM_AMOUNT)
  : toNano(6.5);
export const MIN_VAULT_BALANCE = process.env.MIN_VAULT_BALANCE
  ? toNano(process.env.MIN_VAULT_BALANCE)
  : toNano(1);
export const JJT_REINVEST_FEE = process.env.JJT_REINVEST_FEE
  ? toNano(process.env.JJT_REINVEST_FEE)
  : toNano(1);
export const TJT_REINVEST_FEE = process.env.TJT_REINVEST_FEE
  ? toNano(process.env.TJT_REINVEST_FEE)
  : toNano(0.7);
