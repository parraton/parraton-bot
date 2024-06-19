const usdtVault = {
  vault: "EQBgdJIHy2z4YEo5ssqIOExlGDD61Tn2bIytXtNBj1pW9onM",
  extraDistributionPool: "EQDpeKN5EPj7sSAToZlLTYppRPNDk2EQghugRKLWlBAjCvOi",
};

const scaleVault = {
  vault: "EQCQ1FiAoaZemtGd_5Nz3zJpzBqzG2RLipoBfIvOcioTLAB7",
  extraDistributionPool: "EQAE6WdY8_uybeL_8jN1nlV-4ixTbUVbAKx--pUjs2mUQL79",
};

const notVault = {
  vault: "EQDRdHx-8fC6aW6lSlqAYwOlYo5L5nM8PNChwjxWaQHOdDVx",
  extraDistributionPool: "EQDpkTnKu_fX_ZRotAVsA9yZTfFd35LBtLWfhO6f1Kp2-b1Z",
};

const isDev = process.env.NODE_ENV === "development";

export const addresses = {
  dedustFactory: "EQDHcPxlCOSN_s-Vlw53bFpibNyKpZHV6xHhxGAAT_21nCFU",
  dedustDistributionFactory: "EQC0WJSeustdSo4fI5eRXmxdu8rqyWz9tBwLmX9E94dQlUCv",
  extraRewardsDistributionFactory:
    "EQDmtWKElPJLGJfjlN060ztD6-CwM_8HFNIFH507qiza-x6H",
  vaultFactory: "EQC3Mcj8A7V3zrmPnOUM3ylpty8Tq2kVIhBWj4cs2rAHnHRK",
  vaults: isDev ? [usdtVault]: [usdtVault, scaleVault, notVault],
} as const;
