import { environment } from "./environment";

const usdtTonVaultTestnet = "EQCczQbuj2Z5tLLt4mYb-kVgt52A9kXbkVFWSuToexwbajV_";
const usdtTonVaultMainnet = "EQC7MJVHpoi46zKJOKV2XLmYM00s6ittxRFAb4J0-20iIEMX";
const testnetVaults = [usdtTonVaultTestnet];
const mainnetVaults = [usdtTonVaultMainnet];

export const addresses = {
  vaults: environment.NETWORK === "testnet" ? testnetVaults : mainnetVaults,
} as const;
export const vaults =
  environment.NETWORK === "testnet" ? testnetVaults : mainnetVaults;
