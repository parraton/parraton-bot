import {Pool} from "@dedust/sdk";
import {Address} from "@ton/core";
import {tonClientPromise} from "../../config/ton-client";

export class MegaPool extends Pool {
  private constructor(address: Address) {
    super(address);
  }

  static createFromAddress(address: Address): MegaPool {
    return new MegaPool(address);
  }

  static async open(Address: Address) {
    const pool = MegaPool.createFromAddress(Address);

    const tonClient = await tonClientPromise;

    return tonClient.open(pool);
  }
}