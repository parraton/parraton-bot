import {tonApiHttpClient} from "./ton-api-client";

export const getTraces = async (hash: string) => {
  return await tonApiHttpClient.traces.getTrace(hash);
}
