import * as gaggle from "gaggle";
import { EventEmitter } from "events";

import { logger } from "../common-library/logger";
import { types } from "../common-library/types";
import { config } from "../common-library/config";
import BlockBuilder from "./block-builder";

import { Gossip } from "../gossip";
import { Block } from "web3/types";

const NODE_NAME = config.get("NODE_NAME");

// An RPC adapter to use with Gaggle's channels. We're using this adapter in order to implement the transport layer,
// for using Gaggle's "custom" channel (which we've extended ourselves).
class RPCConnector extends EventEmitter {
  private id: string;
  private gossip: types.GossipClient;

  public constructor(id: string, gossip: types.GossipClient) {
    super();

    this.id = id;
    this.gossip = gossip;
  }

  public connect(): void {
  }

  public disconnect(): void {
  }

  public received(originNodeId: string, message: any): void {
    // Propagate broadcast messages or unicast messages from other nodes.
    if (message.to === undefined || message.to === this.id) {
      this.emit("received", originNodeId, message);
    }
  }

  public broadcast(data: any): void {
    this.gossip.broadcastMessage({
      BroadcastGroup: "consensus",
      MessageType: "RaftMessage",
      Buffer: new Buffer(JSON.stringify(data)),
      Immediate: true
    });
  }

  public send(nodeId: string, data: any): void {
    this.gossip.unicastMessage({
      Recipient: nodeId,
      BroadcastGroup: "consensus",
      MessageType: "RaftMessage",
      Buffer: new Buffer(JSON.stringify(data)),
      Immediate: true
    });
  }
}

export interface ElectionTimeoutConfig {
  min: number;
  max: number;
}

export interface RaftConsensusConfig {
  clusterSize: number;
  electionTimeout: ElectionTimeoutConfig;
  heartbeatInterval: number;
}


export class RaftConsensus {
  private blockStorage: types.BlockStorageClient;
  private blockBuilder: BlockBuilder;

  private connector: RPCConnector;
  private node: any;
  private lastBlockId: number;
  private readyForBlockAppend = false;

  public constructor(options: RaftConsensusConfig,
    gossip: types.GossipClient,
    blockStorage: types.BlockStorageClient,
    blockBuilder: BlockBuilder) {
    this.blockStorage = blockStorage;
    this.blockBuilder = blockBuilder;
    this.connector = new RPCConnector(NODE_NAME, gossip);

    this.node = gaggle({
      id: NODE_NAME,
      clusterSize: options.clusterSize,
      channel: {
        name: "custom",
        connector: this.connector
      },

      // How long to wait before declaring the leader dead?
      electionTimeout: {
        min: options.electionTimeout.min,
        max: options.electionTimeout.max,
      },

      // How often should the leader send heartbeats?
      heartbeatInterval: options.heartbeatInterval
    });

    // Nodes will emit "committed" events whenever the cluster comes to consensus about an entry.
    //
    // Note: we might consider adding transactions as the result to the "appended" event, which will require further
    // synchronization, but will make everything a wee bit faster.

    this.node.on("committed", async (data: any) => {
      const msg: types.ConsensusMessage = data.data;

      // Since we're currently storing single transactions per-block, we'd increase the block numbers for every
      // committed entry.
      const block: types.Block = msg.block;
      logger.debug("new block to be committed ${JSON.stringify(block)}");
      await this.blockStorage.addBlock({
        block: block
      });
      this.lastBlockId = block.header.id;

      if (this.node.isLeader()) {
        this.readyForBlockAppend = true;
      }
    });

    this.node.on("leaderElected", () => {
      if (this.node.isLeader()) {
        this.readyForBlockAppend = true;
        logger.info(`Node ${this.node.id} was elected as a new leader!`);
      } else {
        this.readyForBlockAppend = false;
      }
    });

    this.pollTransactionPool();

  }

  private pollTransactionPool() {
    setInterval(async () => {
      try {
        if (this.readyForBlockAppend) {
          logger.debug(`attempting append of new block`);
          await this.appendNextBlock();
        }
      } catch (err) {
        logger.error("newBlockAppendTick error: " + err);
      }
    }, 500);
  }

  private async appendNextBlock() {
    if (this.lastBlockId == undefined) {
      const { blockId } = await this.blockStorage.getLastBlockId({});
      this.lastBlockId = blockId;
    }
    const block = await this.blockBuilder.buildNextBlock(this.lastBlockId);

    this.appendMessage({
      block
    });

    logger.debug(`appended new block ${JSON.stringify(block)}`);

    this.readyForBlockAppend = false;
  }

  private appendMessage(msg: types.ConsensusMessage) {
    this.node.append(msg);
  }

  async gossipMessageReceived(fromAddress: string, messageType: string, message: any) {
    switch (messageType) {
      case "RaftMessage": {
        this.connector.received(message.from, message.data);
      }
    }
  }
}
