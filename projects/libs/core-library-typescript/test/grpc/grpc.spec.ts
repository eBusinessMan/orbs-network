import * as path from "path";
import * as Mali from "mali";
import * as caller from "grpc-caller";
import { expect } from "chai";
import { types } from "../../src/common-library/types";
import { IsAliveInput, IsAliveContext } from "../../../../architecture/dist/index";

import * as pbjs from "protobufjs";

const PROTO_PATH = path.resolve(__dirname, "../../../../architecture/interfaces");

class ManagementService {
  async isAlive(ctx: IsAliveContext) {
    ctx.res = {alive: true};
  }
}

let app;
const name = "Management";
const protoPath = path.resolve(PROTO_PATH, "management.proto");
const endpoint = "localhost:8080";

function mapMethodsOf<T>(service: T, name: string) {
  const serviceFuncs: {[key: string]: Function} = {};
  for (const funcName of (<any>types)[name]) {
    serviceFuncs[funcName] = (service)[funcName];
  }
  return serviceFuncs;
}

describe("A gRPC based server", async () => {
  before(async () => {
    app = new Mali(protoPath, name);
    const mgmt = new ManagementService();
    app.use(mapMethodsOf(mgmt, name));
    app.start(endpoint);
  });

  it("starts a management endpoint", async () => {

    const client = caller(endpoint, protoPath, name);
    const res = await client.isAlive({});
    return expect(res).to.have.property("alive", true);
  });

  after(async () => {
    return await app.close();
  });
});
