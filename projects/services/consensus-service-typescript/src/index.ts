import { ErrorHandler, config, topology, logger } from "orbs-core-library";
ErrorHandler.setup();

import consensusServer from "./consensus-server";

const nodeTopology = topology();

consensusServer(config, nodeTopology)
  .onEndpoint(nodeTopology.endpoint)
  .start();
