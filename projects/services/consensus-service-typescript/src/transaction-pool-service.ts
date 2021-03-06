import * as _ from "lodash";
import bind from "bind-decorator";

import { types } from "orbs-core-library";

import { Service, ServiceConfig } from "orbs-core-library";
import { TransactionPool } from "orbs-core-library";

export default class TransactionPoolService extends Service {
  private transactionPool: TransactionPool;

  public constructor(transactionPool: TransactionPool, serviceConfig: ServiceConfig) {
    super(serviceConfig);
    this.transactionPool = transactionPool;
  }

  async initialize() {
  }

  @Service.RPCMethod
  public async addNewPendingTransaction(rpc: types.AddNewPendingTransactionContext) {
    this.transactionPool.addNewPendingTransaction(rpc.req.transaction);

    rpc.res = {};
  }

  @Service.RPCMethod
  public async addExistingPendingTransaction(rpc: types.AddExistingPendingTransactionContext) {
    this.transactionPool.addExistingPendingTransaction(rpc.req.transaction);

    rpc.res = {};
  }
}
