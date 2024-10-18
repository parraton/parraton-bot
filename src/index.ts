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

const reinvestWithMockDistribution = async () => reinvestScenario(true);
const reinvestOnly = async () => reinvestScenario();

console.log(process.env.NETWORK);
switch (process.env.NETWORK) {
  case "development":
  case "dev":
    void reinvestScenario(false);
    break;
  case "testnet":
    schedule(
      "0 0 * * *", // every day at 00:00
      reinvestWithMockDistribution
    );
    break;
  default:
    schedule(
      "22 14 * * *", // every day at 14:22
      reinvestOnly
    );
}
