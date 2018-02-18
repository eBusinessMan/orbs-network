import { ErrorHandler, grpc, topology, ManagementService, types, ServiceRunner } from "orbs-core-library";

import ConsensusService from "./consensus-service";
import SubscriptionManagerService from "./subscription-manager-service";
import TransactionPoolService from "./transaction-pool-service";

ErrorHandler.setup();

const main = async () => {
  await ServiceRunner.runMulti(grpc.consensusServiceServer, [
    new ConsensusService(),
    new SubscriptionManagerService(),
    new TransactionPoolService()
  ]);
};

main();

// grpc.server()
//   .onEndpoint(nodeTopology.endpoint)
//   .withService("Consensus", new ConsensusService())
//   .withService("SubscriptionManager", new SubscriptionManagerService())
//   .withService("TransactionPool", new TransactionPoolService())
//   // .withManagementService(new ManagementService())
//   .start();
