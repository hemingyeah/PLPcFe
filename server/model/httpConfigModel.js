const { isNotLocalEnv } = require("./proxyConfigModel");
const https = require(isNotLocalEnv ? "https" : "http");
// 默认配置
const DEFAULT_OPIONS = {
  host: "127.0.0.1",
  port: 8080,
  headers: {
    cookie: "VIPPUBLINKJSESSIONID=57caf431-4c8b-4cbe-941e-f3f27c705ccc",
  },
};
// https agent
const AGENT = new https.Agent({
  keepAlive: true,
  maxSockets: 1024,
  maxFreeSockets: 256,
});

module.exports = {
  DEFAULT_OPIONS,
  AGENT,
};
