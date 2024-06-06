import { Address } from "@ton/core";
import { environment } from "../config/environment";

const createUrl = (address: string) => {
  return environment.TONAPI_URL + "/v2/jettons/" + address + "/holders";
};

export const getAllJettonHolders = async (
  jettonAddress: string
): Promise<
  {
    address: string;
    owner: {
      address: string;
      is_scam: boolean;
      is_wallet: boolean;
    };
    balance: string;
  }[]
> => {
  const url = createUrl(jettonAddress);

  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return data.addresses;
};
