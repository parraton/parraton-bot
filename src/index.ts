import { schedule } from "node-cron";
import { rewardAllVaults } from "./reward";
import { compoundAllVaults } from "./autocompound";

const reinvestScenario = async (distributeRewards: boolean = false) => {
  try {
    if (distributeRewards) {
      await rewardAllVaults();
    }
    await compoundAllVaults();
  } catch (e) {
    console.error(e);
  }
};

const reinvestWithMockDedustDistributionScenario = async () =>
  reinvestScenario(true);

const reinvestOnlyScenario = async () => reinvestScenario();

console.log(process.env.NETWORK);
switch (process.env.NETWORK) {
  case "development":
  case "dev":
    void reinvestScenario(true);
    break;
  case "testnet":
    const dedustReinvestSchedule = "0 0 * * *"; // every day at 00:00

    schedule(
      dedustReinvestSchedule,
      reinvestWithMockDedustDistributionScenario
    );
    break;
  default:
    const reinvestSchedule = "45 20 * * *"; // every day at 19:05
    schedule(reinvestSchedule, reinvestOnlyScenario);
}
