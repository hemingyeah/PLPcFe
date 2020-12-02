const { isNotLocalEnv } = require("./proxyConfigModel");
const https = require(isNotLocalEnv ? "https" : "http");
// 默认配置
const DEFAULT_OPIONS = {
  host: "30.40.58.216",
  port: 8090,
  headers:{
    "cookie":"VIPPUBLINKJSESSIONID=33980646-8ea2-41bd-8593-1e508ee5d0df"
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
