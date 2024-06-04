import {Address} from "@ton/core";

export const environment = {
  TON_CLIENT_ENDPOINT: 'https://sandbox-v4.tonhubapi.com',
  // SEED_PHRASE: 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
  SEED_PHRASE: 'loop seed negative maple twist matter cook depth gather crisp main dawn',
  TONCENTER_API_KEY: '',
  TONCENTER_URL: 'https://testnet.toncenter.com/api/v2/jsonRPC',
  TONAPI_URL: 'https://testnet.tonapi.io',
  IPFS_GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  VAULT_ADDRESS: Address.parse('EQDzdguGqM2NB_zdXnspCrNWp-jQOldXEopwMETFlOgsqGHH'),
  TOKEN_ADDRESS: Address.parse('EQB9mGqe94ZJdoP_3Ckz0ZFcrtY5xdK-ik7Zl2mUCTY0B5rD'),
  DEDUST_ADDRESS: Address.parse('EQDHcPxlCOSN_s-Vlw53bFpibNyKpZHV6xHhxGAAT_21nCFU'),
  DISTRIBUTION_POOL_ADDRESS: Address.parse('EQDiAyQsyAOdM6LXjgmG2AgifI5Xp69wuMtGNuETGDm8Okw9'),
};