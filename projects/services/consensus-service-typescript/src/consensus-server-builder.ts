import { ErrorHandler, grpcServer, topology, AlwaysAliveManagementService, GRPCServerBuilder } from "orbs-core-library";

import ConsensusService from "./consensus-service";
import SubscriptionManagerService from "./subscription-manager-service";
import TransactionPoolService from "./transaction-pool-service";

export function consensusServerBuilder(): GRPCServerBuilder {
  return grpcServer.builder()
  .withService("Consensus", new ConsensusService())
  .withService("SubscriptionManager", new SubscriptionManagerService())
  .withService("TransactionPool", new TransactionPoolService())
  // .withManagementService(new AlwaysAliveManagementService())
  ;
}
