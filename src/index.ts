import { schedule } from "node-cron";

import { mockDedustDistribution } from "./mock-dedust-distribution";

import { sendReinvest } from "./send-reinvest";
import { vaultExtraRewardsDistribution } from "./vault-extra-rewards-distribution";

const reinvestScenario = async (distributeRewards: boolean = false) => {
  try {
    if (distributeRewards) {
      await mockDedustDistribution();
    }
    console.log("reinvestScenario");
    await sendReinvest();
  } catch (e) {
    console.error(e);
  }
};

const reinvestWithMockDedustDistributionScenario = async () =>
  reinvestScenario(true);

const reinvestOnlyScenario = async () => reinvestScenario();

const extraRewardsScenario = async () => {
  try {
    await vaultExtraRewardsDistribution();
  } catch (e) {
    console.error(e);
  }
};

console.log(process.env.NETWORK);
switch (process.env.NETWORK) {
  case "development":
  case "dev":
    void reinvestScenario(true);
    break;
  case "testnet":
    const dedustReinvestSchedule = "0 0 * * *"; // every day at 00:00
    const vaultExtraRewardsDistributionSchedule = "0 1 * * *"; // every day at 01:00

    schedule(
      dedustReinvestSchedule,
      reinvestWithMockDedustDistributionScenario
    );
    schedule(vaultExtraRewardsDistributionSchedule, extraRewardsScenario);
    break;
  default:
    const reinvestSchedule = "50 19 * * *"; // every day at 19:05
    schedule(reinvestSchedule, reinvestOnlyScenario);
}
