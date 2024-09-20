import { environment } from "../config-old/environment";

const createUrl = (hash: string) => {
  return environment.TONAPI_URL + "/v2/events/" + hash;
};

export const isTransactionFinished = async (hash: string): Promise<boolean> => {
  const url = createUrl(hash);

  const response = await fetch(url);

  if (!response.ok) {
    return false;
  }

  const { in_progress } = (await response.json()) as { in_progress: boolean };

  return in_progress != undefined && !in_progress;
};

export const waitTransaction = async (hash: string): Promise<void> => {
  let isFinished = false;
  while (!isFinished) {
    isFinished = await isTransactionFinished(hash);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};
