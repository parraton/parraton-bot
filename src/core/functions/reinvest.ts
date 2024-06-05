import {tonClient} from "../../config/ton-client";
import {environment} from "../../config/environment";
import {fromNano, Sender, toNano} from "@ton/core";
import {Asset, PoolType} from "@dedust/sdk";
import {dedustFactory, vault} from "../../config/contracts";

const nativeAsset = Asset.native();
const jettonAsset = Asset.jetton(environment.TOKEN_ADDRESS);
const assets: [Asset, Asset] = [nativeAsset, jettonAsset];

const MIN_BALANCE = toNano(1);

const getVaultBalance = async () => {
  const {last: {seqno}} = await tonClient.getLastBlock();
  const {account: vaultAccountData} = await tonClient.getAccountLite(seqno, environment.VAULT_ADDRESS);
  const atomicBalance  = vaultAccountData.balance.coins;

  return {atomicBalance: BigInt(atomicBalance)};
}

const depositFee= toNano(0.3);
const depositFwdFee= toNano(0.25);
const transferFee= toNano(0.05);

export const reinvest = async (sender: Sender) => {
  const rawPool = await dedustFactory.getPool(PoolType.VOLATILE, assets)

  const pool = tonClient.open(rawPool);

  const {atomicBalance: vaultBalance} = await getVaultBalance();

  const totalReward = vaultBalance - MIN_BALANCE;
  const tonToSell = totalReward / 2n;


  if(tonToSell <= MIN_BALANCE) {
    throw new Error(`Not enough balance(${fromNano(tonToSell)}) to reinvest`);
  }

  const jettonOutData = await pool.getEstimatedSwapOut({
    assetIn: nativeAsset,
    amountIn: tonToSell,
  });

  const estimatedDepositValues = await pool.getEstimateDepositOut([tonToSell, jettonOutData.amountOut]);
  const [tonTargetBalance, jettonTargetBalance] = estimatedDepositValues.deposits;

  await vault.sendReinvest(sender, {
    value: toNano(0.7),
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
}