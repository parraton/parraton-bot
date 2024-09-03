import { environment } from "./environment";

const usdtVaultTestnet = {
  vault: "EQCczQbuj2Z5tLLt4mYb-kVgt52A9kXbkVFWSuToexwbajV_",
  extraDistributionPool: "EQDWQ59GyQ2qxkC2_kdoOnjwfVv_3kTBA1_GQ3JG9QhkM2sq",
};
const usdtVaultMainnet = {
  vault: "EQC7MJVHpoi46zKJOKV2XLmYM00s6ittxRFAb4J0-20iIEMX",
  extraDistributionPool: undefined,
};

const testnetVaults = [usdtVaultTestnet];
const mainnetVaults = [usdtVaultMainnet];

export const addresses = {
  vaults: environment.NETWORK === "testnet" ? testnetVaults : mainnetVaults,
} as const;
