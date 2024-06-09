import dotenv from "dotenv";
dotenv.config();

const { PINATA_JWT, TONCENTER_API_KEY, SEED_PHRASE } = process.env;

export const environment = {
  TON_CLIENT_ENDPOINT: "https://testnet-v4.tonhubapi.com",
  // SEED_PHRASE: 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
  SEED_PHRASE: SEED_PHRASE || "",
  TONCENTER_API_KEY,
  TONCENTER_URL: "https://testnet.toncenter.com/api/v2/jsonRPC",
  TONAPI_URL: "https://testnet.tonapi.io",
  IPFS_GATEWAY: "https://gateway.pinata.cloud/ipfs/",
  TONVIEWER_URL: "https://testnet.tonviewer.com",
  PINATA_JWT,
};
