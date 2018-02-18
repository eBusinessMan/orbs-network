import { ErrorHandler, grpcServer, topology, AlwaysAliveManagementService } from "orbs-core-library";

import BlockStorageService from "./block-storage-service";
import StateStorageService from "./state-storage-service";

ErrorHandler.setup();

const nodeTopology = topology();
grpcServer.builder()
  .onEndpoint(nodeTopology.endpoint)
  .withService("BlockStorage", new BlockStorageService())
  .withService("StateStorage", new StateStorageService())
  .withManagementService(new AlwaysAliveManagementService())
  .start();
