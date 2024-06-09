import { addresses } from "./config/contracts-config";
import { mockDedustDistribution } from "./mock-dedust-distribution";

import { sendReinvest } from "./send-reinvest";
import { getAllJettonHolders } from "./utils/get-jetton-holders";
import { vaultExtraRewardsDistribution } from "./vault-extra-rewards-distribution";
// import { vault } from "./config/contracts";
// import { TonJettonTonStrategy } from "./core/contracts/TonJettonTonStrategy";
// import { usdtVault } from "./config/contracts-config";
// import { Address } from "@ton/core";
// import { tonClient } from "./config/ton-client";

const period = "0 0 * * *";

// schedule(period, async () => {
//
//
// });

void (async () => {
  try {
    await mockDedustDistribution();
    //
    // console.log(await getAllJettonHolders(addresses.vaults[0].vault));
    await sendReinvest();
    await vaultExtraRewardsDistribution();
    //
    // const data = await  vault.getVaultData();

    // console.log({data})

    // const strategy = tonClient.open(TonJettonTonStrategy.createFromAddress(data.strategyAddress));

    // const _data = await strategy.getStrategyData();

    // console.log({_data})
  } catch (e) {
    console.error(e);
  }
})();
