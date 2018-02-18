import { ErrorHandler, grpcServer, topology, AlwaysAliveManagementService } from "orbs-core-library";

import PublicApiService from "./service";

ErrorHandler.setup();

const nodeTopology = topology();
grpcServer.builder()
  .onEndpoint(nodeTopology.endpoint)
  .withService("PublicApi", new PublicApiService())
  .withManagementService(new AlwaysAliveManagementService())
  .start();
