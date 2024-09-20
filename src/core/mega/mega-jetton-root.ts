import { Asset, JettonRoot } from "@dedust/sdk";
import { Address, ContractProvider } from "@ton/core";
import { tonClientPromise } from "../../config-old/ton-client";

// @ts-ignore
export class MegaJettonRoot extends JettonRoot {
  private constructor(address: Address) {
    // @ts-ignore
    super(address);
  }

  static createFromAddress(address: Address): MegaJettonRoot {
    return new MegaJettonRoot(address);
  }

  async getUserBalance(provider: ContractProvider, userAddress: Address) {
    const userWallet = await this.getWallet(provider, userAddress);

    const tonClient = await tonClientPromise;

    return await tonClient.open(userWallet).getBalance();
  }

  getAsset() {
    return Asset.jetton(this.address);
  }

  static async open(address: Address) {
    const jettonRoot = MegaJettonRoot.createFromAddress(address);

    const tonClient = await tonClientPromise;

    return tonClient.open(jettonRoot);
  }
}
