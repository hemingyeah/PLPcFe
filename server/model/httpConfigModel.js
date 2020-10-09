const { isNotLocalEnv } = require("./proxyConfigModel");
const https = require(isNotLocalEnv ? "https" : "http");
// 默认配置
const DEFAULT_OPIONS = {
  host: "127.0.0.1",
  port: 8080,
  headers: {
    // cookie: "VIPPUBLINKJSESSIONID=c84db0cc-b94f-4f52-b525-429d03a57af5",
    // 卓尔
    cookie: "VIPPUBLINKJSESSIONID=b56f3994-22cf-4677-89e7-221d934e8322",
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
