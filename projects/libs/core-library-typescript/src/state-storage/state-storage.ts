import * as _ from "lodash";

import { logger } from "../common-library/logger";
import { types } from "../common-library/types";

import MemoryKVStore from "./kvstore/memory-kvstore";

export class StateStorage {
  private blockStorage: types.BlockStorageClient;

  private kvstore = new MemoryKVStore();
  private lastBlockId: number = 0;

  public constructor(blockStorage: types.BlockStorageClient) {
    this.blockStorage = blockStorage;
  }

  public async poll(): Promise<void> {
    this.pollBlockStorage();
  }

  public async readKeys(contractAddress: string, keys: string[]) {
    await this.waitForBlockState();


    return await this.kvstore.getMany(contractAddress, keys);
  }

  private async waitForBlockState(timeout = 5000) {
    const { blockId } = await this.blockStorage.getLastBlockId({});

    return new Promise((resolve, reject) => {
      if (blockId > this.lastBlockId) {
        if (timeout < 200) {
          reject(new Error(`Timeout in attempt to read block state (${blockId} != ${this.lastBlockId})`));
        } else {
          setTimeout(() => this.waitForBlockState(timeout - 200), 200);
        }
      }

      resolve();
    });
  }

  private async pollBlockStorage() {
    const { blocks } = await this.blockStorage.getBlocks({ lastBlockId: this.lastBlockId });

    // Assuming an ordered list of blocks.
    for (const block of blocks) {
      await this.processNextBlock(block);
    }

    setTimeout(() => this.pollBlockStorage(), 200);
  }

  private async processNextBlock(block: types.Block) {
    if (block.header.prevBlockId == this.lastBlockId) {
      logger.debug("Processing block:", block.header.id);

      const modifiedArgs = new Map<string, string>(_.toPairs(JSON.parse(block.modifiedAddressesJson)));
      await this.kvstore.setMany(block.tx.contractAddress, modifiedArgs);
      this.lastBlockId = block.header.id;
    } else {
      throw new Error(`Unexpected block ID: ${block.header.id}. Out of sync?`);
    }
  }
}
