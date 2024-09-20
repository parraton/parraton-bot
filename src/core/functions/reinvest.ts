import { Address, OpenedContract, Sender, toNano } from "@ton/core";
import { Asset } from "@dedust/sdk";
import { TonJettonTonStrategy } from "../contracts/TonJettonTonStrategy";
import { tonClientPromise } from "../../config-old/ton-client";
import { getAccountBalance } from "../../utils/get-account-balance";
import { getDeadlineInDay } from "../../utils/get-deadline-in-day";
import { MegaVault } from "../mega/mega-vault";
import { MegaJettonRoot } from "../mega/mega-jetton-root";
import { MegaPool } from "../mega/mega-pool";

const MIN_BALANCE = toNano(1);
const MIN_REINVEST_AMOUNT =
  process.env.NETWORK === "development" ? toNano(0.5) : toNano(3);

const depositFee = toNano(0.3);
const depositFwdFee = toNano(0.25);
const transferFee = toNano(0.05);
const reinvestFee = toNano(0.7);

export const isReinvestNeeded = async (vaultAddress: Address) => {
  const vaultBalance = await getAccountBalance(vaultAddress);

  const totalReward = vaultBalance - MIN_BALANCE;
  console.log("totalReward", totalReward);

  return totalReward > MIN_REINVEST_AMOUNT;
};

const bigIntMax = (...args: Array<bigint>) =>
  args.reduce((m, e) => (e > m ? e : m));

const applySlippage = (amount: bigint, slippageInPercents = 1n) =>
  (amount * (100n - slippageInPercents)) / 100n;

const getAmountsForOperations = async (
  strategy: OpenedContract<TonJettonTonStrategy>,
  totalReward: bigint
) => {
  const { poolAddress, jettonMasterAddress: jettonAddress } =
    await strategy.getStrategyData();

  const pool = await MegaPool.open(poolAddress);

  const nativeAsset = Asset.native();

  const jettonRoot = await MegaJettonRoot.open(jettonAddress);
  const jettonAsset = jettonRoot.getAsset();

  console.log({ totalReward });

  let balance = 0n;
  try {
    balance = await jettonRoot.getUserBalance(strategy.address);
  } catch (e) {
    console.log("No jetton balance");
  }

  console.log({ balance });
  let tonEquivalent = 0n;

  if (balance > 0n) {
    const { amountOut } = await pool.getEstimatedSwapOut({
      assetIn: jettonAsset,
      amountIn: balance,
    });
    tonEquivalent = amountOut;
  }
  console.log({ tonEquivalent });

  let tonToDeposit = (totalReward + tonEquivalent) / 2n;

  const minimalTonToDeposit = 0n;
  const tonToSwap = bigIntMax(
    tonToDeposit - tonEquivalent,
    minimalTonToDeposit
  );

  console.log({ tonToDeposit, tonToSwap });

  let amountOut = 0n;

  if (tonToSwap > 0n) {
    const eso = await pool.getEstimatedSwapOut({
      assetIn: nativeAsset,
      amountIn: tonToSwap,
    });

    amountOut = eso.amountOut;
    tonToDeposit = totalReward - tonToSwap;
  }

  console.log({ amountOut });

  const limit = applySlippage(amountOut);

  const { deposits } = await pool.getEstimateDepositOut([
    tonToDeposit,
    limit + balance,
  ]);

  const [tonTargetBalance, jettonTargetBalance] = deposits;

  console.log({
    limit,
    tonTargetBalance,
    jettonTargetBalance,
  });

  return {
    limit,
    tonToSwap,
    tonTargetBalance,
    jettonTargetBalance,
  };
};

const excludeFee = (amount: bigint, fee: bigint) =>
  (amount * (10_000n - fee)) / 10_000n;

export const reinvest = async (
  sender: Sender,
  vault: OpenedContract<MegaVault>
) => {
  const tonClient = await tonClientPromise;
  const { managementFeeRate, managementFee } = await vault.getVaultData();
  const strategy = tonClient.open(await vault.getStrategy());

  const vaultBalance = await vault.getAccountBalance();
  const foo = excludeFee(vaultBalance, managementFeeRate); //TON
  const totalReward = foo - MIN_BALANCE - managementFee; //TON

  const { limit, tonToSwap, tonTargetBalance, jettonTargetBalance } =
    await getAmountsForOperations(strategy, totalReward);

  if (totalReward < tonTargetBalance + tonToSwap) {
    throw new Error("Not enough rewards to reinvest");
  }

  await vault.sendReinvest(sender, {
    value: reinvestFee,
    totalReward,
    amountToSwap: tonToSwap,
    swapLimit: limit,
    depositLimit: 0n,
    deadline: getDeadlineInDay(),
    tonTargetBalance,
    jettonTargetBalance,
    depositFee,
    depositFwdFee,
    transferFee,
  });
};
