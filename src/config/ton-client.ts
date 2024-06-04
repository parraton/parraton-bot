import {TonClient4} from '@ton/ton';
import {environment} from "./environment";

export const tonClient = new TonClient4({
  endpoint: environment.TON_CLIENT_ENDPOINT
});