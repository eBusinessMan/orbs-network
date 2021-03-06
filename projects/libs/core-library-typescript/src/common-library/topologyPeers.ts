import { grpc } from "./grpc";
import { types } from "./types";

export function topologyPeers(topologyPeers: any[]): types.ClientMap {
  const res: types.ClientMap = {};
  for (const peer of topologyPeers) {
    switch (peer.service) {
      case "public-api": {
        res.publicApi = grpc.publicApiClient({ endpoint: peer.endpoint });
        break;
      }
      case "gossip": {
        res.gossip = grpc.gossipClient({ endpoint: peer.endpoint });
        break;
      }
      case "consensus": {
        res.consensus = grpc.consensusClient({ endpoint: peer.endpoint });
        res.subscriptionManager = grpc.subscriptionManagerClient({ endpoint: peer.endpoint });
        res.transactionPool = grpc.transactionPoolClient({ endpoint: peer.endpoint });
        break;
      }
      case "virtual-machine": {
        res.virtualMachine = grpc.virtualMachineClient({ endpoint: peer.endpoint });
        break;
      }
      case "storage": {
        res.blockStorage = grpc.blockStorageClient({ endpoint: peer.endpoint });
        res.stateStorage = grpc.stateStorageClient({ endpoint: peer.endpoint });
        break;
      }
      case "sidechain-connector": {
        res.sidechainConnector = grpc.sidechainConnectorClient({ endpoint: peer.endpoint });
        break;
      }
      default: {
        throw `Undefined peer service: ${peer.service}`;
      }
    }
  }
  return res;
}
