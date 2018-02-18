import { config, ErrorHandler, grpcServer, topology, AlwaysAliveManagementService } from "orbs-core-library";

import SidehainConnectorService from "./service";

ErrorHandler.setup();

const nodeTopology = topology();
grpcServer.builder()
  .onEndpoint(nodeTopology.endpoint)
  .withService("SidechainConnector", new SidehainConnectorService({
    ethereumNodeHttpAddress: config.get("ethereumNodeAddress")
  }))
  .withManagementService(new AlwaysAliveManagementService())
  .start();
