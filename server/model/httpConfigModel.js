const { isNotLocalEnv } = require("./proxyConfigModel");
const https = require(isNotLocalEnv ? "https" : "http");
// 默认配置
const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  port: 8080,
  headers: {
    cookie: '__wpkreporterwid_=b3142f5b-207a-4baa-be53-65bb555039bc; VIPPUBLINKJSESSIONID=5ca6f94e-acd4-410e-82b2-5bba3fb31ede; JSESSIONID=3A7E5AB56268F3F985D9BBDB13E7F631',
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
