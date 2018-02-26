import * as _ from "lodash";

import { logger, config, types, topology, topologyPeers } from "orbs-core-library";
import { Service, ServiceConfig } from "orbs-core-library";
import { Consensus, RaftConsensusConfig } from "orbs-core-library";
import { Gossip } from "orbs-core-library";

export interface GossipServiceConfig extends ServiceConfig {
  gossipPort: number;
}

export default class GossipService extends Service {
  private serviceConfig: GossipServiceConfig;
  private gossip: Gossip;

  public constructor(serviceConfig: GossipServiceConfig) {
    super(serviceConfig);
    this.serviceConfig = serviceConfig;
  }

  async initialize() {
    await this.initGossip();

  }

  async initGossip(): Promise<void> {
    this.gossip = new Gossip({port: this.serviceConfig.gossipPort, localAddress: config.get("NODE_NAME"), peers: topologyPeers(topology().peers)});

    setInterval(() => {
      const activePeers = Array.from(this.gossip.activePeers()).sort();

      if (activePeers.length == 0) {
        logger.warn(`${this.gossip.localAddress} has no active peers`);
      } else {
        logger.info(`${this.gossip.localAddress} has active peers`, { activePeers });
      }
    }, 5000);

    setTimeout(() => {
        this.gossip.connect(topology().gossipPeers);
    }, Math.ceil(Math.random() * 3000));
  }

  @Service.SilentRPCMethod
  public async broadcastMessage(rpc: types.BroadcastMessageContext) {
    this.gossip.broadcastMessage(rpc.req.BroadcastGroup, rpc.req.MessageType, rpc.req.Buffer, rpc.req.Immediate);

    rpc.res = {};
  }

  @Service.SilentRPCMethod
  public async unicastMessage(rpc: types.UnicastMessageContext) {
    this.gossip.unicastMessage(rpc.req.Recipient, rpc.req.BroadcastGroup, rpc.req.MessageType, rpc.req.Buffer, rpc.req.Immediate);

    rpc.res = {};
  }
}
