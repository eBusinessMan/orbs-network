import * as path from "path";
import * as Mali from "mali";
import * as caller from "grpc-caller";
import { expect } from "chai";
import { types } from "../../src/common-library/types";
import { IsAliveInput, IsAliveContext } from "../../../../architecture/dist/index";
import { addManagementService, managementClient } from "../../src/common-library/grpc-management";
import { ManagementService } from "../../src/common-library/management";


class DummyManagementService implements ManagementService {
  isAlive(): boolean {
    return true;
  }
}

class GreeterService {
  async sayHello(ctx: SayHelloContext) {
    ctx.res = {message: `Hey, ${ctx.req.name}`};
  }
}

interface SayHelloContext {
  req: SayHelloInput;
  res: SayHelloOutput;
}

interface GreeterClient {
  SayHello(SayHelloInput: SayHelloInput): SayHelloOutput;
}

interface GreeterServer {
  SayHello(rpc: SayHelloContext): void;
}

interface SayHelloInput {
  name: string;
}

interface SayHelloOutput {
  message: string;
}

let app;
const endpoint = "localhost:8080";
const greeterName = "Greeter";
const greeterProtoPath = path.resolve(__dirname, "./greeter.proto");

describe("A gRPC based server", async () => {
  before(async () => {
    app = new Mali(greeterProtoPath, greeterName);
    const greeter = new GreeterService();
    app.use({"sayHello": greeter.sayHello});

    addManagementService(app, new DummyManagementService());

    app.start(endpoint);
  });

  it("starts the main endpoint", async () => {

    const client = caller(endpoint, greeterProtoPath, greeterName);
    const res = await client.sayHello({name: "Joe"});
    return expect(res).to.have.property("message", "Hey, Joe");
  });

  it("starts the management endpoint", async () => {

    const client = managementClient(endpoint);
    const res = await client.isAlive({});
    return expect(res).to.have.property("alive", true);
  });

  after(async () => {
    return await app.close();
  });
});
