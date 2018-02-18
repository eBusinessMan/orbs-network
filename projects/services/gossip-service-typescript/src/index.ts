import { ErrorHandler, grpcServer, topology, AlwaysAliveManagementService } from "orbs-core-library";

import GossipService from "./service";

ErrorHandler.setup();

const nodeTopology = topology();
grpcServer.builder()
  .onEndpoint(nodeTopology.endpoint)
  .withService("Gossip", new GossipService())
  .withManagementService(new AlwaysAliveManagementService())
  .start();
