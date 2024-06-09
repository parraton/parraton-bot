const usdtVault = {
  vault: "EQDCTVjdnkcr5yIyBJBKLdGtiSuDYYhZCQD6ZwqSPWeMP4Mi",
  extraDistributionPool: "EQBDJhFGiwHf17N4KCDgDS8GkGDeNadWzg_Ek23DN7WNAuVN",
};

const scaleVault = {
  vault: "EQCx3v_v6OTg58BDMIBIREewZ1rfFjyzbgEivXbpZGN9J6_P",
  extraDistributionPool: "EQCG-vwexBCTFh17mU2ffwRusqkv2PbqQa1mhZt5NUtMhCZt",
};

const notVault = {
  vault: "EQDzgLurE_klqVvHAdyZ1hBGQpgHCiDFpRg4bnu_-DUyxX4g",
  extraDistributionPool: "EQA-Nx5mMcP8_BXlh6qJ_oLsFPguCsoa0Pn4Nbg6cI3SNE-8",
};

export const addresses = {
  dedustFactory: "EQDHcPxlCOSN_s-Vlw53bFpibNyKpZHV6xHhxGAAT_21nCFU",
  dedustDistributionFactory: "EQC0WJSeustdSo4fI5eRXmxdu8rqyWz9tBwLmX9E94dQlUCv",
  extraRewardsDistributionFactory:
    "EQDmtWKElPJLGJfjlN060ztD6-CwM_8HFNIFH507qiza-x6H",
  vaultFactory: "EQAYiDrQ9_veYdJZGbbHF4HSUoT3YvJ5xNHmMxrJRMtwEP7s",
  vaults: [scaleVault],
  // vaults: [usdtVault, scaleVault, notVault],
} as const;
