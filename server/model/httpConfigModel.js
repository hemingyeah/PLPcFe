const { isNotLocalEnv } = require("./proxyConfigModel");
const https = require(isNotLocalEnv ? "https" : "http");
// 默认配置
// const DEFAULT_OPIONS = {
//   host: '127.0.0.1',
//   port: 8080,
// };
const DEFAULT_OPIONS = {
  host: "30.40.61.57",
  port: 8080,
  headers: {
    cookie: "VIPPUBLINKJSESSIONID=054e95fe-e787-4fdc-b4de-6bb5c44bc99f",
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
