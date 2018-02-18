import { ErrorHandler, grpcServer, topology, AlwaysAliveManagementService } from "orbs-core-library";

import ConsensusService from "./consensus-service";
import SubscriptionManagerService from "./subscription-manager-service";
import TransactionPoolService from "./transaction-pool-service";

ErrorHandler.setup();

const nodeTopology = topology();
grpcServer.builder()
  .onEndpoint(nodeTopology.endpoint)
  .withService("Consensus", new ConsensusService())
  .withService("SubscriptionManager", new SubscriptionManagerService())
  .withService("TransactionPool", new TransactionPoolService())
  .withManagementService(new AlwaysAliveManagementService())
  .start();
