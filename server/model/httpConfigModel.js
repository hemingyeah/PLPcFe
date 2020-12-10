const { isNotLocalEnv } = require("./proxyConfigModel");
const https = require(isNotLocalEnv ? "https" : "http");
// 默认配置
const DEFAULT_OPIONS = {
  host: "30.40.58.216",
  port: 8090,
  headers:{
    "cookie":"VIPPUBLINKJSESSIONID=99704083-f688-47c2-8993-4164bd77eef4"
  }
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
