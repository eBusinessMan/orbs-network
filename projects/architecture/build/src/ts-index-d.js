const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const _ = require("lodash");

const TYPE_REPLACEMENTS = {
  "string": "string",
  "uint64": "number", // todo: should be Long from https://github.com/dcodeIO/long.js
  "bytes": "Buffer",
  "bool": "boolean"
};

const jsonPath = path.resolve(__dirname, "../../dist/protos.json");
if (!fs.existsSync(jsonPath)) {
  console.log("ERROR: protos.json not found in " + jsonPath);
  process.exit(-1);
}

console.log(`// AUTOGENERATED, DO NOT EDIT`);
console.log();
const services = [];
const json = _.get(require(jsonPath), "nested");
_.forEach(json, (value, key) => {
  if (_.get(value, "fields")) {
    exportMessage(key, _.get(value, "fields"));
  }
  if (_.get(value, "methods")) {
    services.push(key);
    exportService(key, _.get(value, "methods"));
  }
});
exportClientMap(services);
console.log(`export type HeardbeatClient = ChatterClient;`);
console.log();

function exportMessage(name, json) {
  console.log(`export interface ${name} {`);
  _.forEach(json, (value, key) => {
    let type = _.get(value, "type");
    if (TYPE_REPLACEMENTS[type]) {
      type = TYPE_REPLACEMENTS[type];
    }
    let modifier = "";
    if (_.get(value, "rule") === "repeated") {
      modifier = "[]";
    }
    console.log(`  ${key}: ${type}${modifier};`);
  });
  console.log(`}`);
  console.log();
}

function exportService(name, json) {
  _.forEach(json, (value, key) => {
    exportServiceMethod(key, value);
  });
  exportServiceClient(name, json);
  exportServiceServer(name, json);
  console.log(`export const ${name}: string[];`);
  console.log();
}

function exportServiceMethod(name, json) {
  console.log(`export interface ${name}Context {`);
  const req = _.get(json, "requestType");
  const res = _.get(json, "responseType");
  console.log(`  req: ${req};`);
  if (_.get(json, "responseStream")) {
    console.log(`  write: (message: ${_.get(json, "responseType")})=>void;`);
  }
  else {
    console.log(`  res: ${res};`);
  }
  console.log(`}`);
  console.log();
}

function exportServiceClient(name, json) {
  _.forEach(json, (value, key) => {
    if (_.get(value, "responseStream")) {
      const res = _.get(value, "responseType");
      console.log(`export interface ${name}Client${key}ReadableStream {`);
      console.log(`  onmessage: (message: ${res})=>void;`);
      console.log(`}`);
    }
  });
  console.log(`export interface ${name}Client {`);
  _.forEach(json, (value, key) => {
    const req = _.get(value, "requestType");
    const res = _.get(value, "responseType");
    if (_.get(value, "responseStream")) {
      console.log(`  ${_.lowerFirst(key)}(${_.lowerFirst(req)}: ${req}): ${name}Client${key}ReadableStream;`);
    }
    else {
      console.log(`  ${_.lowerFirst(key)}(${_.lowerFirst(req)}: ${req}): ${res};`);

    }
  });
  console.log(`}`);
  console.log();
}

function exportServiceServer(name, json) {
  console.log(`export interface ${name}Server {`);
  _.forEach(json, (value, key) => {
    const req = _.get(value, "requestType");
    const res = _.get(value, "responseType");
    console.log(`  ${_.lowerFirst(key)}(rpc: ${key}Context): void;`);
  });
  console.log(`}`);
  console.log();
}

function exportClientMap(services) {
  console.log(`export interface ClientMap {`);
  for (const service of services) {
    console.log(`  ${_.lowerFirst(service)}?: ${service}Client;`);
  }
  console.log(`}`);
  console.log();
}
