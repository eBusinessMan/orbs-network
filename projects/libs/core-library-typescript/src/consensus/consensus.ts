import { logger } from "../common-library/logger";
import { config } from "../common-library/config";
import { types } from "../common-library/types";

import { Gossip } from "../gossip";

import { RaftConsensusConfig, RaftConsensus } from "./raft-consensus";
import BlockBuilder from "./block-builder";

export class Consensus {
  private raftConsensus: RaftConsensus;

  constructor(
    options: RaftConsensusConfig, gossip: types.GossipClient,
    virtualMachine: types.VirtualMachineClient, blockStorage: types.BlockStorageClient,
     transactionPool: types.TransactionPoolClient) {
    this.raftConsensus = new RaftConsensus(
      options, gossip, blockStorage, transactionPool, new BlockBuilder({ virtualMachine, transactionPool }));
  }

  async gossipMessageReceived(fromAddress: string, messageType: string, message: any) {
    await this.raftConsensus.onMessageReceived(fromAddress, messageType, message);
  }
}
