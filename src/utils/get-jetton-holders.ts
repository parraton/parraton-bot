import {tonApiHttpClient} from "./ton-api-client";

export const getAllJettonHolders = async (
  jettonAddress: string
) => {

  const data = await tonApiHttpClient.jettons.getJettonHolders(jettonAddress);

  return data.addresses;
};
