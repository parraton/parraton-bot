import { TonClient4 } from '@ton/ton';
import { getHttpV4Endpoint } from '@orbs-network/ton-access';

const endpointPromise = getHttpV4Endpoint();

export const tonClient = (async () => {
  const endpoint = await endpointPromise;

  return new TonClient4({
    endpoint,
    timeout: 60_000,
  });
})();
