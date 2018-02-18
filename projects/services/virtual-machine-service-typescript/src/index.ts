import { ErrorHandler, grpcServer, topology, AlwaysAliveManagementService } from "orbs-core-library";

import VirtualMachineService from "./service";

ErrorHandler.setup();

const nodeTopology = topology();
grpcServer.builder()
  .onEndpoint(nodeTopology.endpoint)
  .withService("VirtualMachine", new VirtualMachineService())
  .withManagementService(new AlwaysAliveManagementService())
  .start();
