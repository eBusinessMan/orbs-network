import * as _ from "lodash";

import { logger, config, types } from "orbs-core-library";

import { Service, ServiceConfig } from "orbs-core-library";
import { TransactionHandler, TransactionHandlerConfig } from "orbs-core-library";
import { PublicApi } from "orbs-core-library";

class ConstantTransactionHandlerConfig implements TransactionHandlerConfig {
  validateSubscription(): boolean {
    return true;
  }
}

export default class PublicApiService extends Service {
  private publicApi: PublicApi;

  private transactionHandler: TransactionHandler;

  public constructor(virtualMachine: types.VirtualMachineClient, gossip: types.GossipClient, subscriptionManager: types.SubscriptionManagerClient, serviceConfig: ServiceConfig) {
    super(serviceConfig);
    this.transactionHandler = new TransactionHandler(gossip, subscriptionManager, new ConstantTransactionHandlerConfig());

    this.publicApi = new PublicApi(this.transactionHandler, virtualMachine);
  }

  async initialize() {

  }

  @Service.RPCMethod
  async sendTransaction(rpc: types.SendTransactionContext) {
    await this.publicApi.sendTransaction(rpc.req);
  }

  @Service.RPCMethod
  async call(rpc: types.CallContext) {
    const resultJson = await this.publicApi.callContract(rpc.req);

    logger.debug(`${this.nodeName}: called contract with ${JSON.stringify(rpc.req)}. result is: ${resultJson}`);

    rpc.res = {
      resultJson: resultJson
    };
  }
}
