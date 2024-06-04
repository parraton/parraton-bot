// import {reinvest} from "./send-reinvest";
import {dedustGovernorWalletPromise, vaultGovernorWalletPromise} from "./config/wallet";

const period = '0 0 * * *';


// schedule(period, async () => {
//
//
// });

void (async () => {
  const {wallet:dedustGovernor} = await dedustGovernorWalletPromise;
  console.log({dedustGovernor: dedustGovernor.address.toString()})
  const {wallet: vaultGovernor} = await vaultGovernorWalletPromise;
  console.log({vaultGovernor: vaultGovernor.address.toString()})
  // await reinvest();
})()