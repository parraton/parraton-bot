export const usdtVault = {
  vault: "EQDGv6joUI2UROu2J2NBPZlVi0cII5nZ9WX6_S1gSgkwiG-l",
  extraDistributionPool: "EQCgguh-Jl2aD905sbxc_KrZPx2iJ7BuEqC7iQ4rkAQmUxCq",
};

const scaleVault = {
  vault: "EQBg6jLj_pzpTD4fFDZcE8mSJ74I7-6F8LDMeDxUPBuCnIOB",
  extraDistributionPool: "EQCBWlGoVd8w4riZ6dLqqKT1GqgM3C-PwI_54XHLL_sRPNM-",
};

const notVault = {
  vault: "EQAl2X9xhZzhRuIEEBK4CBQLp6pYuDUM-5FougbWHdRsK7RH",
  extraDistributionPool: "EQCSyh3gs548BKzn62dIZMVTl6GkuqdSkaY_OeyUzpfqSaHZ",
};

export const addresses = {
  dedustFactory: "EQDHcPxlCOSN_s-Vlw53bFpibNyKpZHV6xHhxGAAT_21nCFU",
  dedustDistributionFactory: "EQC0WJSeustdSo4fI5eRXmxdu8rqyWz9tBwLmX9E94dQlUCv",
  extraRewardsDistributionFactory:
    "EQDmtWKElPJLGJfjlN060ztD6-CwM_8HFNIFH507qiza-x6H",
  vaultFactory: "EQAYiDrQ9_veYdJZGbbHF4HSUoT3YvJ5xNHmMxrJRMtwEP7s",
  vaults: [usdtVault],
  // vaults: [usdtVault, scaleVault, notVault],
} as const;
