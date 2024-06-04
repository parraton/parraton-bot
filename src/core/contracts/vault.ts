import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type VaultConfig = {
  sharesTotalSupply: bigint;
  depositedLp: bigint;
  jettonBalance: bigint;
  jettonMasterAddress: Address;
  poolType: number;
  adminAddress: Address;
  depositLpWalletAddress: Address;
  jettonWalletAddress: Address;
  jettonVaultAddress: Address;
  poolAddress: Address;
  distributionPoolAddress: Address;
  nativeVaultAddress: Address;
  sharesWalletCode: Cell;
  tempUpgrade: Cell;
};

export function vaultConfigToCell(config: VaultConfig): Cell {
  return beginCell()
    .storeCoins(config.sharesTotalSupply)
    .storeCoins(config.depositedLp)
    .storeCoins(config.jettonBalance)
    .storeAddress(config.jettonMasterAddress)
    .storeUint(config.poolType, 1)
    .storeAddress(config.adminAddress)
    .storeRef(
      beginCell()
        .storeAddress(config.depositLpWalletAddress)
        .storeAddress(config.jettonWalletAddress)
        .storeAddress(config.jettonVaultAddress)
        .endCell(),
    )
    .storeRef(
      beginCell()
        .storeAddress(config.poolAddress)
        .storeAddress(config.distributionPoolAddress)
        .storeAddress(config.nativeVaultAddress)
        .endCell(),
    )
    .storeRef(config.sharesWalletCode)
    .storeRef(config.tempUpgrade)
    .endCell();
}

export const Opcodes = {
  deposit: 0x95db9d39,
  burn_notification: 0x7bdd97de,
  transfer_notification: 0x7362d09c,
  internal_transfer: 0x178d4519,
  excesses: 0xd53276db,
  transfer: 0xf8a7ea5,
  set_deposit_lp_wallet_address: 0x7719b84f,
  set_jetton_wallet_address: 0x288b5223,
  set_token_1_wallet_address: 0xdf215700,
  reinvest: 0x812d4e3,
};

export class Vault implements Contract {
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

  prepareDepositPayload() {
    return beginCell().storeUint(Opcodes.deposit, 32).endCell();
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
    let transferPayload = await this.prepareDepositPayload();

    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.transfer_notification, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeCoins(opts.jettonAmount)
        .storeAddress(opts.fromAddress)
        .storeBit(true)
        .storeRef(transferPayload)
        .endCell(),
    });
  }

  async sendSetDepositLpWalletAddress(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      walletAddress: Address;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.set_deposit_lp_wallet_address, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeAddress(opts.walletAddress)
        .endCell(),
    });
  }

  async sendReinvest(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      amount: bigint;
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
        .storeUint(Opcodes.reinvest, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeCoins(opts.amount)
        .storeCoins(opts.limit)
        .storeUint(opts.deadline, 32)
        .storeCoins(opts.tonTargetBalance)
        .storeCoins(opts.jettonTargetBalance)
        .endCell(),
    });
  }

  async sendSetJettonWalletAddress(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      walletAddress: Address;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.set_jetton_wallet_address, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeAddress(opts.walletAddress)
        .endCell(),
    });
  }

  async sendSetToken1WalletAddress(
    provider: ContractProvider,
    via: Sender,
    opts: {
      value: bigint;
      walletAddress: Address;
      queryId?: number;
    },
  ) {
    return provider.internal(via, {
      value: opts.value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcodes.set_token_1_wallet_address, 32)
        .storeUint(opts.queryId ?? 0, 64)
        .storeAddress(opts.walletAddress)
        .endCell(),
    });
  }

  async getVaultData(provider: ContractProvider): Promise<VaultConfig> {
    const result = await provider.get('get_vault_data', []);
    return {
      sharesTotalSupply: result.stack.readBigNumber(),
      depositedLp: result.stack.readBigNumber(),
      jettonBalance: result.stack.readBigNumber(),
      jettonMasterAddress: result.stack.readAddress(),
      poolType: result.stack.readNumber(),
      adminAddress: result.stack.readAddress(),
      depositLpWalletAddress: result.stack.readAddress(),
      jettonWalletAddress: result.stack.readAddress(),
      jettonVaultAddress: result.stack.readAddress(),
      poolAddress: result.stack.readAddress(),
      distributionPoolAddress: result.stack.readAddress(),
      nativeVaultAddress: result.stack.readAddress(),
      sharesWalletCode: result.stack.readCell(),
      tempUpgrade: result.stack.readCell(),
    };
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
}
