import { NETWORK } from "./config";

export const RETRY_CONFIG = {
  retries: 5,
  minTimeout: 2000,
  maxTimeout: 20_000,
};

const usdtTonVaultTestnet = "EQCczQbuj2Z5tLLt4mYb-kVgt52A9kXbkVFWSuToexwbajV_";
const usdtTonVaultMainnet = "EQC7MJVHpoi46zKJOKV2XLmYM00s6ittxRFAb4J0-20iIEMX";

const stTonUsdtVaultTestnet =
  "EQAenYehuHOyOL-M2SWeSXQ9cpKbgVDC8tB8hinCjk5hPLm0";
const stTonUsdtVaultMainnet =
  "EQC1vwHI1R3_iaV1MhKS3OsLnPlvv7Wm98PBptTbPAyKq9YA";
const tsTonUsdtVaultMainnet =
  "EQArPB-JUA0hJ8l_RXeFmaN0W0jetNj9ItbzRgra2axxM5TQ";
const testnetVaults = [usdtTonVaultTestnet, stTonUsdtVaultTestnet];
const mainnetVaults = [
  usdtTonVaultMainnet,
  stTonUsdtVaultMainnet,
  tsTonUsdtVaultMainnet,
];

export const vaults = ["testnet", "dev", "development"].includes(NETWORK)
  ? testnetVaults
  : mainnetVaults;
