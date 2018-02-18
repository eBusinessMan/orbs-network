import { ManagementService } from "./management";
import * as Mali from "mali";
import * as caller from "grpc-caller";
import { types } from "./types";
import * as path from "path";

const PROTO_PATH = path.resolve(__dirname, "../../../../architecture/interfaces");

class ManagementRPCService {
  service: ManagementService;

  constructor(service: ManagementService) {
    this.service = service;
  }

  async isAlive(ctx: types.IsAliveContext) {
    ctx.res = {alive: this.service.isAlive()};
  }
}

const mgmtName = "Management";
const mgmtProtoPath = path.resolve(PROTO_PATH, "management.proto");

function addManagementService(app: Mali, management: ManagementService) {
  const rpcService = <any> new ManagementRPCService(management);
  app.addService(mgmtProtoPath, mgmtName);
  const methods: {[key: string]: Function} = {};
  types.Management.forEach(method => methods[method] = rpcService[method].bind(rpcService));
  app.use(methods);
}

function managementClient(endpoint: String) {
  return caller(endpoint, mgmtProtoPath, mgmtName);
}

export {
  addManagementService, managementClient
};
