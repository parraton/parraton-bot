import { Vault } from "../contracts/vault";
import { TonJettonTonStrategy } from "../contracts/TonJettonTonStrategy";
import { Address, ContractProvider } from "@ton/core";
import { getAccountBalance } from "../../utils/get-account-balance";
import { tonClientPromise } from "../../config-old/ton-client";
import { MegaDistributionPool } from "./mega-distribution-pool";

export class MegaVault extends Vault {
  async getStrategy(provider: ContractProvider): Promise<TonJettonTonStrategy> {
    const { strategyAddress } = await this.getVaultData(provider);

    return TonJettonTonStrategy.createFromAddress(strategyAddress);
  }

  async getDistributionPool(provider: ContractProvider) {
    const { distributionPoolAddress } = await this.getVaultData(provider);

    return MegaDistributionPool.createFromAddress(distributionPoolAddress);
  }

  async getAccountBalance(): Promise<bigint> {
    return await getAccountBalance(this.address);
  }

  static createFromAddress(address: Address): MegaVault {
    return new MegaVault(address);
  }

  static createFromConfig(
    ...args: Parameters<typeof Vault.createFromConfig>
  ): MegaVault {
    return MegaVault.createMegaVaultFromVault(Vault.createFromConfig(...args));
  }

  private static createMegaVaultFromVault(vault: Vault): MegaVault {
    return new MegaVault(vault.address);
  }

  static async open(address: Address) {
    const vault = MegaVault.createFromAddress(address);

    const tonClient = await tonClientPromise;

    return tonClient.open(vault);
  }
}
