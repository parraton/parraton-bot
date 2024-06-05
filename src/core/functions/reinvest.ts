import { tonClient } from "../../config/ton-client";
import { Address, fromNano, OpenedContract, Sender, toNano } from "@ton/core";
import { Asset, Pool } from "@dedust/sdk";
import { Vault } from "../contracts/vault";
import { TonJettonTonStrategy } from "../contracts/TonJettonTonStrategy";

const MIN_BALANCE = toNano(1);

const depositFee = toNano(0.3);
const depositFwdFee = toNano(0.25);
const transferFee = toNano(0.05);
const reinvestFee = toNano(0.7);

const getAccountBalance = async (accountAddress: Address) => {
  const {
    last: { seqno },
  } = await tonClient.getLastBlock();
  const { account: vaultAccountData } = await tonClient.getAccountLite(
    seqno,
    accountAddress
  );
  const atomicBalance = vaultAccountData.balance.coins;

  return BigInt(atomicBalance);
};

export const reinvest = async (
  sender: Sender,
  vault: OpenedContract<Vault>
) => {
  const { strategyAddress } = await vault.getVaultData();
  const strategy = tonClient.open(
    TonJettonTonStrategy.createFromAddress(strategyAddress)
  );
  const { poolAddress } = await strategy.getStrategyData();

  const nativeAsset = Asset.native();

  const pool = tonClient.open(Pool.createFromAddress(poolAddress));

  const vaultBalance = await getAccountBalance(vault.address);

  const totalReward = vaultBalance - MIN_BALANCE;
  const tonToSell = totalReward / 2n;

  if (tonToSell <= MIN_BALANCE) {
    throw new Error(`Not enough balance(${fromNano(tonToSell)}) to reinvest`);
  }

  const jettonOutData = await pool.getEstimatedSwapOut({
    assetIn: nativeAsset,
    amountIn: tonToSell,
  });

  const estimatedDepositValues = await pool.getEstimateDepositOut([
    tonToSell,
    jettonOutData.amountOut,
  ]);
  const [tonTargetBalance, jettonTargetBalance] =
    estimatedDepositValues.deposits;

  await vault.sendReinvest(sender, {
    value: reinvestFee,
    totalReward,
    amountToSwap: tonToSell,
    limit: (jettonOutData.amountOut * 9n) / 10n,
    deadline: Math.floor(Date.now() / 1000 + 86400), // Added 1 day in milliseconds to the current timestamp
    tonTargetBalance,
    jettonTargetBalance,
    depositFee,
    depositFwdFee,
    transferFee,
  });
};
