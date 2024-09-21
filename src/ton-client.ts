import { TonClient4 } from "@ton/ton";
import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import { NETWORK } from "./config";

const endpointPromise = getHttpV4Endpoint({
  network: NETWORK === "mainnet" ? "mainnet" : "testnet",
});

export const tonClient = (async () => {
  const endpoint = await endpointPromise;

  return new TonClient4({
    endpoint,
    timeout: 60_000,
  });
})();
