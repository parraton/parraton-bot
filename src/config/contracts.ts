import {Vault} from "../core/contracts";
import {environment} from "./environment";
import {tonClient} from "./ton-client";
import {JettonMinter} from "../core/contracts/jetton-minter";
import {DeDustFactory} from "../core/contracts/dedust-factory";
import {DistributionPool} from "@dedust/apiary-v1";

const rawVault = Vault.createFromAddress(environment.VAULT_ADDRESS);
export const vault = tonClient.open(rawVault);

const rawJettonMinter = JettonMinter.createFromAddress(environment.TOKEN_ADDRESS);
export const jettonMinter = tonClient.open(rawJettonMinter);

const rawDeDustFactory = DeDustFactory.createFromAddress(environment.DEDUST_ADDRESS);
export const dedustFactory = tonClient.open(rawDeDustFactory);

const rawDistributionPool = DistributionPool.createFromAddress(environment.DISTRIBUTION_POOL_ADDRESS);
export const distributionPool = tonClient.open(rawDistributionPool);
