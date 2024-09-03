import { environment } from "./environment";

const usdtVaultTestnet = {
  vault: "EQCczQbuj2Z5tLLt4mYb-kVgt52A9kXbkVFWSuToexwbajV_",
  extraDistributionPool: "EQDWQ59GyQ2qxkC2_kdoOnjwfVv_3kTBA1_GQ3JG9QhkM2sq",
};

const testnetVaults = [usdtVaultTestnet];
export const addresses = {
  vaults: environment.NETWORK === "testnet" ? testnetVaults : [],
} as const;
