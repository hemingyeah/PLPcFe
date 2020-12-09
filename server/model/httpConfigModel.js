const { isNotLocalEnv } = require("./proxyConfigModel");
const https = require(isNotLocalEnv ? "https" : "http");
// 默认配置
const DEFAULT_OPIONS = {
  host: "30.40.58.216",
  port: 8090,
  headers:{
    "cookie":"VIPPUBLINKJSESSIONID=d1a35a47-cb36-4e9a-8993-fbe210d2c01e"
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
