import { schedule } from "node-cron";

import { mockDedustDistribution } from "./mock-dedust-distribution";

import { sendReinvest } from "./send-reinvest";
import { vaultExtraRewardsDistribution } from "./vault-extra-rewards-distribution";


const reinvestScenario = async () => {
  try {
    // await mockDedustDistribution();

    await sendReinvest();
  } catch (e) {
    console.error(e);
  }
}

const extraRewardsScenario = async () => {
  try {
    await vaultExtraRewardsDistribution();
  } catch (e) {
    console.error(e);
  }

}

void reinvestScenario();



// const dedustReinvestSchedule = "0 0 * * *"; // every day at 00:00
// const vaultExtraRewardsDistributionSchedule = "0 1 * * *"; // every day at 01:00
//
// schedule(dedustReinvestSchedule, reinvestScenario);
// schedule(vaultExtraRewardsDistributionSchedule, extraRewardsScenario);
