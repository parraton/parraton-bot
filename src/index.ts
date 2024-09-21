import { schedule } from "node-cron";
import { rewardAllVaults } from "./reward";
import { compoundAllVaults } from "./compound";

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
    void reinvestScenario(false);
    break;
  case "testnet":
    schedule(
      "0 0 * * *", // every day at 00:00
      reinvestWithMockDedustDistributionScenario
    );
    break;
  default:
    schedule(
      "45 20 * * *", // every day at 19:05
      reinvestOnlyScenario
    );
}
