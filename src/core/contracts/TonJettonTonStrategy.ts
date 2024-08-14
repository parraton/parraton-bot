import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TonJettonTonStrategyConfig = {
  vaultAddress: Address;
  jettonMasterAddress: Address;
  poolAddress: Address;
  poolType: number;
  depositLpWalletAddress: Address;
  jettonWalletAddress: Address;
  adminAddress: Address;
  jettonVaultAddress: Address;
  nativeVaultAddress: Address;
  tempUpgrade: Cell;
};
export interface TonJettonTonStrategyFees {
  transferFee: bigint;
  excessFee: bigint;
  transferNotificationFee: bigint;
  reinvestFee: bigint;
}

export function tonJettonTonStrategyConfigToCell(config: TonJettonTonStrategyConfig): Cell {
  return beginCell()
    .storeAddress(config.vaultAddress)
    .storeAddress(config.jettonMasterAddress)
    .storeAddress(config.poolAddress)
    .storeUint(config.poolType, 1)
    .storeRef(
      beginCell()
        .storeAddress(config.depositLpWalletAddress)
        .storeAddress(config.jettonWalletAddress)
        .storeAddress(config.adminAddress)
        .endCell(),
    )
    .storeRef(beginCell().storeAddress(config.jettonVaultAddress).storeAddress(config.nativeVaultAddress).endCell())
    .storeRef(config.tempUpgrade)
    .endCell();
}

// export const Opcodes = {
//     transfer_notification: 0x7362d09c,
//     internal_transfer: 0x178d4519,
//     // excesses: 0xd53276db,
//     // transfer: 0xf8a7ea5,
//     // set_deposit_lp_wallet_address: 0x7719b84f,
//     // set_jetton_wallet_address: 0x288b5223,
//     reinvest: 0x812d4e3,
// };

export class TonJettonTonStrategy implements Contract {
  static readonly OPS = {
    transfer_notification: 0x7362d09c,
    internal_transfer: 0x178d4519,
    reinvest: 0x812d4e3,
    deposit_liquidity: 0xd55e4686,
    cb_fail_swap_or_invest: 0x474f86cf,
    stop_deposit_to_pool: 0x53cd6d4b,
    cb_success_swap: 0x32d0ad4a,
    complete_reinvest: 0x973280f5,
    continue_deposit_to_pool: 0xbbe82bd8,
  };
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new TonJettonTonStrategy(address);
  }

  static createFromConfig(config: TonJettonTonStrategyConfig, code: Cell, workchain = 0) {
    const data = tonJettonTonStrategyConfigToCell(config);
    const init = { code, data };
    return new TonJettonTonStrategy(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }
  async sendReinvest(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      totalReward: bigint;
      amountToSwap: bigint;
      limit: bigint;
      tonTargetBalance: bigint;
      jettonTargetBalance: bigint;
      deadline: number;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeCoins(opts.totalReward)
        .storeUint(TonJettonTonStrategy.OPS.reinvest, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeCoins(opts.amountToSwap)
        .storeCoins(opts.limit)
        .storeUint(opts.deadline, 32)
        .storeCoins(opts.tonTargetBalance)
        .storeCoins(opts.jettonTargetBalance)
        .endCell(),
    });
  }

  async getStrategyData(provider: ContractProvider): Promise<TonJettonTonStrategyConfig> {
    const result = await provider.get('get_strategy_data', []);
    return {
      vaultAddress: result.stack.readAddress(),
      jettonMasterAddress: result.stack.readAddress(),
      poolAddress: result.stack.readAddress(),
      poolType: result.stack.readNumber(),
      depositLpWalletAddress: result.stack.readAddress(),
      jettonWalletAddress: result.stack.readAddress(),
      adminAddress: result.stack.readAddress(),
      jettonVaultAddress: result.stack.readAddress(),
      nativeVaultAddress: result.stack.readAddress(),
      tempUpgrade: result.stack.readCell(),
    };
  }
}
