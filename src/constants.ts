import { NETWORK } from "./config";

export const RETRY_CONFIG = {
  retries: 5,
  minTimeout: 2000,
  maxTimeout: 20_000,
};

const usdtTonVaultTestnet = "EQCczQbuj2Z5tLLt4mYb-kVgt52A9kXbkVFWSuToexwbajV_";
const usdtTonVaultMainnet = "EQC7MJVHpoi46zKJOKV2XLmYM00s6ittxRFAb4J0-20iIEMX";
const testnetVaults = [usdtTonVaultTestnet];
const mainnetVaults = [usdtTonVaultMainnet];

export const addresses = {
  vaults: NETWORK === "testnet" ? testnetVaults : mainnetVaults,
} as const;
export const vaults = NETWORK === "testnet" ? testnetVaults : mainnetVaults;
