import { toNano } from "@ton/core";
import { config } from "dotenv";

console.log("Applying .env configuration");
config();

export const TONAPI_URL = process.env.TONAPI_URL || "https://tonapi.io";

export const TON_CLIENT_URL =
  process.env.TON_CLIENT_URL || "https://toncenter.com/api/v2/jsonRPC";

export const DEDUST_API_URL =
  process.env.DEDUST_API_URL || "https://api.dedust.io/v3/graphql";

export const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY || "";

export const IPFS_GATEWAY =
  process.env.IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

export const NETWORK = process.env.NETWORK || "testnet";

export const MIN_REINVEST_AMOUNT = process.env.MIN_REINVEST_AMOUNT
  ? toNano(process.env.MIN_REINVEST_AMOUNT)
  : toNano(7);

export const MIN_CLAIM_AMOUNT = process.env.MIN_CLAIM_AMOUNT
  ? toNano(process.env.MIN_CLAIM_AMOUNT)
  : toNano(7);

export const MIN_VAULT_BALANCE = process.env.MIN_VAULT_BALANCE
  ? toNano(process.env.MIN_VAULT_BALANCE)
  : toNano(1);

export const JJT_REINVEST_FEE = process.env.JJT_REINVEST_FEE
  ? toNano(process.env.JJT_REINVEST_FEE)
  : toNano(1);

export const TJT_REINVEST_FEE = process.env.TJT_REINVEST_FEE
  ? toNano(process.env.TJT_REINVEST_FEE)
  : toNano(0.7);
