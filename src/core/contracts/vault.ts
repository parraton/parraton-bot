import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type VaultConfig = {
  distributionPoolAddress: Address;
  sharesTotalSupply: bigint;
  depositedLp: bigint;
  isLocked: number;
  managementFeeRate: bigint;
  managementFee: bigint;
  depositLpWalletAddress: Address;
  adminAddress: Address;
  managerAddress: Address;
  strategyAddress: Address;
  sharesWalletCode: Cell;
  tempUpgrade: Cell;
};

export interface VaultFees {
  depositFee: bigint;
  withdrawalFee: bigint;
  reinvestFee: bigint;
}

export const HOLE_ADDRESS = Address.parse('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');


export function vaultConfigToCell(config: VaultConfig): Cell {
  return beginCell()
    .storeAddress(config.distributionPoolAddress)
    .storeCoins(config.sharesTotalSupply)
    .storeCoins(config.depositedLp)
    .storeUint(config.isLocked, 1)
    .storeCoins(config.managementFeeRate)
    .storeCoins(config.managementFee)
    .storeAddress(config.depositLpWalletAddress)
    .storeRef(
      beginCell()
        .storeAddress(config.adminAddress)
        .storeAddress(config.managerAddress)
        .storeAddress(config.strategyAddress)
        .endCell(),
    )
    .storeRef(config.sharesWalletCode)
    .storeRef(Vault.packInitTempUpgrade())
    .endCell();
}

export class Vault implements Contract {
  static readonly MANAGEMENT_FEE_PRECISION = 10000n;
  static readonly OPS = {
    deposit: 0x95db9d39,
    withdraw: 0xb5de5f9e,
    init: 0xc674e474,
    reinvest: 0x812d4e3,
    complete_reinvest: 0x973280f5,
    withdraw_management_fee: 0xef9e917b,
    set_strategy_address: 0xa3d7611f,
    set_management_fee_rate: 0xc25ffa5f,
    set_is_locked: 0xe2cde084,
    transfer_notification: 0x7362d09c,
    internal_transfer: 0x178d4519,
    burn_notification: 0x7bdd97de,
    excesses: 0xd53276db,
    transfer_bounce_invalid_request: 0x19727ea8,
    transfer: 0xf8a7ea5,
    refund_rewards: 0xb7959473,
    init_code_upgrade: 0xdf1e233d,
    init_admin_upgrade: 0x2fb94384,
    finalize_upgrades: 0x6378509f,
  };
  static readonly EXIT_CODES = {
    WRONG_OP: 80,
    WRONG_WORKCHAIN: 81,
    INVALID_AMOUNT: 82,
    INVALID_DEPOSIT_TOKEN: 83,
    INSUFFICIENT_GAS: 84,
    INVALID_CALLER: 85,
    ZERO_SHARES_BURNT: 86,
    INSUFFICIENT_LP_BALANCE: 87,
    INSUFFICIENT_LP_AMOUNT: 88,
    INSUFFICIENT_REWARDS_BALANCE: 89,
    INVALID_REINVEST_SENDER: 90,
    WRONG_MANAGER_OP: 91,
    INSUFFICIENT_MANAGEMENT_FEE: 92,
    INSUFFICIENT_SHARES_BALANCE: 93,
    MANAGEMENT_FEE_RATE_OUT_OF_BOUNDS: 94,
    INSUFFICIENT_REINVEST_GAS: 95,
    INSUFFICIENT_CANCEL_DEPOSIT_GAS: 96,
    INVALID_DEPOSIT_ADDRESS: 97,
    WRONG_ADMIN_OP: 801,
  };

  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address) {
    return new Vault(address);
  }

  static createFromConfig(config: VaultConfig, code: Cell, workchain = 0) {
    const data = vaultConfigToCell(config);
    const init = { code, data };
    return new Vault(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  prepareDepositPayload(fulfillAddress?: Address, fulfillPayload?: Cell) {
    let depositPayload = beginCell().storeUint(Vault.OPS.deposit, 32);
    if (fulfillAddress && fulfillPayload) {
      depositPayload = depositPayload.storeAddress(fulfillAddress);
      depositPayload = depositPayload.storeRef(fulfillPayload);
    }
    return depositPayload.endCell();
  }

  async sendDepositNotification(
    provider: ContractProvider,
    via: Sender,
    opts: {
      jettonAmount: bigint;
      fromAddress: Address;
      value: bigint;
      queryId?: number;
    },
  ) {
    const transferPayload = await this.prepareDepositPayload();

    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.transfer_notification, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeCoins(opts.jettonAmount)
        .storeAddress(opts.fromAddress)
        .storeBit(true)
        .storeRef(transferPayload)
        .endCell(),
    });
  }

  async sendBurnNotification(
    provider: ContractProvider,
    via: Sender,
    opts: {
      queryId?: number | bigint;
      amount: bigint;
      responseAddress: Address;
      value: bigint;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.burn_notification, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeCoins(opts.amount)
        .storeAddress(opts.responseAddress)
        .endCell(),
    });
  }

  async sendReinvest(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      totalReward: bigint;
      amountToSwap: bigint;
      swapLimit: bigint;
      depositLimit: bigint;
      tonTargetBalance: bigint;
      depositFee: bigint;
      depositFwdFee: bigint;
      transferFee: bigint;
      jettonTargetBalance: bigint;
      deadline: number;
      queryId?: number;
    },
  ) {
    if (opts.amountToSwap > 0) {
      return provider.internal(via, {
        value: opts.value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell()
          .storeUint(Vault.OPS.reinvest, 32)
          .storeUint(opts.queryId ?? 0, 64)
          .storeCoins(opts.totalReward)
          .storeCoins(opts.amountToSwap)
          .storeCoins(opts.swapLimit)
          .storeUint(opts.deadline, 32)
          .storeCoins(opts.tonTargetBalance)
          .storeCoins(opts.jettonTargetBalance)
          .storeCoins(opts.depositFee)
          .storeCoins(opts.depositFwdFee)
          .storeCoins(opts.transferFee)
          .storeRef(beginCell().storeCoins(opts.depositLimit).endCell())
          .endCell(),
      });
    } else {
      return provider.internal(via, {
        value: opts.value,
        sendMode: SendMode.PAY_GAS_SEPARATELY,
        body: beginCell()
          .storeUint(Vault.OPS.reinvest, 32)
          .storeUint(opts.queryId ?? 0, 64)
          .storeCoins(opts.totalReward)
          .storeCoins(opts.amountToSwap)
          .storeCoins(opts.tonTargetBalance)
          .storeCoins(opts.jettonTargetBalance)
          .storeCoins(opts.depositFee)
          .storeCoins(opts.depositFwdFee)
          .storeCoins(opts.transferFee)
          .storeRef(beginCell().storeCoins(opts.depositLimit).endCell())
          .endCell(),
      });
    }
  }

  async sendRefundRewards(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.refund_rewards, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .endCell(),
    });
  }

  static packInitTempUpgrade() {
    return beginCell().storeUint(0, 64).storeUint(0, 64).storeAddress(HOLE_ADDRESS).storeRef(Cell.EMPTY).endCell();
  }

  static unpackTempUpgrade(cell: Cell) {
    const slice = cell.beginParse();
    return {
      endCode: slice.loadUint(64),
      endAdmin: slice.loadUint(64),
      admin: slice.loadAddress(),
      code: slice.loadRef(),
    };
  }

  async sendSetStrategyAddress(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      strategyAddress: Address;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.set_strategy_address, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeAddress(opts.strategyAddress)
        .endCell(),
    });
  }
  async sendWithdrawManagementFee(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      receiver: Address;
      amount: bigint;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.withdraw_management_fee, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeAddress(opts.receiver)
        .storeCoins(opts.amount)
        .endCell(),
    });
  }
  async sendSetIsLocked(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      isLocked: number;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.set_is_locked, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeUint(opts.isLocked, 1)
        .endCell(),
    });
  }
  async sendFinalizeUpgrades(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.finalize_upgrades, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .endCell(),
    });
  }

  async sendInitCodeUpgrade(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      code: Cell;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.init_code_upgrade, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeRef(opts.code)
        .endCell(),
    });
  }

  async sendInitAdminUpgrade(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      admin: Address;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.init_admin_upgrade, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeAddress(opts.admin)
        .endCell(),
    });
  }

  async sendSetManagementFeeRate(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      managementFeeRate: bigint;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Vault.OPS.set_management_fee_rate, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeUint(opts.managementFeeRate, 16)
        .endCell(),
    });
  }

  async getVaultData(provider: ContractProvider): Promise<VaultConfig> {
    const result = await provider.get('get_vault_data', []);
    return {
      distributionPoolAddress: result.stack.readAddress(),
      sharesTotalSupply: result.stack.readBigNumber(),
      depositedLp: result.stack.readBigNumber(),
      isLocked: result.stack.readNumber(),
      managementFeeRate: result.stack.readBigNumber(),
      managementFee: result.stack.readBigNumber(),
      depositLpWalletAddress: result.stack.readAddress(),
      adminAddress: result.stack.readAddress(),
      managerAddress: result.stack.readAddress(),
      strategyAddress: result.stack.readAddress(),
      sharesWalletCode: result.stack.readCell(),
      tempUpgrade: result.stack.readCell(),
    };
  }

  async getEstimatedLpAmount(provider: ContractProvider, sharesAmount: bigint): Promise<bigint> {
    const result = await provider.get('get_estimated_lp_out', [
      {
        type: 'int',
        value: sharesAmount,
      },
    ]);
    return result.stack.readBigNumber();
  }

  async getEstimatedSharesAmount(provider: ContractProvider, lpAmount: bigint): Promise<bigint> {
    const result = await provider.get('get_estimated_shares_out', [
      {
        type: 'int',
        value: lpAmount,
      },
    ]);
    return result.stack.readBigNumber();
  }

  async getWalletAddress(provider: ContractProvider, ownerAddress: Address): Promise<Address> {
    const result = await provider.get('get_wallet_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(ownerAddress).endCell(),
      },
    ]);
    return result.stack.readAddress();
  }

  async getDepositFee(provider: ContractProvider): Promise<bigint> {
    const result = await provider.get('get_deposit_fee', []);
    return result.stack.readBigNumber();
  }
  async getReinvestFee(provider: ContractProvider): Promise<bigint> {
    const result = await provider.get('get_reinvest_fee', []);
    return result.stack.readBigNumber();
  }
  async getVaultStorageFee(provider: ContractProvider): Promise<bigint> {
    const result = await provider.get('get_vault_storage_fee', []);
    return result.stack.readBigNumber();
  }
}
