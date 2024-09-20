import { managerWalletPromise } from "./config-old/wallet";
import { wait } from "./wait";
import { isReinvestNeeded, reinvest } from "./core/functions/reinvest";
import { claimRewards } from "./core/functions/claim-rewards";
import { RETRY_CONFIG, vaults } from "./constants";
import { Address, Cell, Dictionary, OpenedContract, Sender } from "@ton/core";
import { MegaVault } from "./core/mega/mega-vault";
import { logOperation } from "./utils/log";
import { MegaDistributionPool } from "./core/mega/mega-distribution-pool";
import { getTraces } from "./utils/get-traces";
import { Trace } from "tonapi-sdk-js";
import { Vault } from "@parraton/sdk";
import { tonClient } from "./ton-client";
import { DistributionAccount, DistributionPool } from "@dedust/apiary-v1";
import memoizee from "memoizee";
import { fetchDictionaryFromIpfs } from "./utils/dictionary";

const claimScenario = async (
  vault: OpenedContract<MegaVault>,
  distributionPool: OpenedContract<MegaDistributionPool>,
  manager: Sender,
  address: string
) => {
  const { hash: claimHash } = await wait(address, () =>
    claimRewards(manager, distributionPool, vault.address)
  );
  logOperation("Claim rewards", claimHash);
};

const cb_fail_swap_or_invest = "0x474F86CF";

const checkTrace = (trace: Trace) => {
  const { transaction, children } = trace;
  const { in_msg } = transaction;
  if (in_msg) {
    const { op_code } = in_msg;
    if (op_code === cb_fail_swap_or_invest) {
      throw new Error("Swap or invest failed");
    }
  }

  children?.forEach(checkTrace);
};

const checkReinvest = async (hash: string) => {
  const trace = await getTraces(hash);

  try {
    checkTrace(trace);
    return true;
  } catch (e) {
    return false;
  }
};

const reinvestScenario = async (
  vault: OpenedContract<MegaVault>,
  manager: Sender,
  address: string
) => {
  if (!(await isReinvestNeeded(vault.address))) {
    return console.log(`No reinvest needed for ${vault.address}`);
  }
  console.log("Reinvest needed");

  let retry = true;

  while (retry) {
    console.log("TRY REINVEST");
    const { hash, success } = await wait(
      address,
      () => reinvest(manager, vault),
      checkReinvest
    );
    retry = !success;
    logOperation("Reinvest", hash);
  }
};

export const sendReinvest = async () => {
  const { wallet, sender: manager } = await managerWalletPromise;
  const address = wallet.address.toString();

  const vaults = addresses.vaults
    .map((vault) => vault)
    .map(Address.parse.bind(Address))
    .map(MegaVault.open);

  for await (const vault of vaults) {
    const distributionPool = await vault
      .getDistributionPool()
      .then((p) => p.open());

    if (await distributionPool.getIsClaimRewardsNeeded(vault.address)) {
      await claimScenario(vault, distributionPool, manager, address);
    }

    await reinvestScenario(vault, manager, address);
  }
};
