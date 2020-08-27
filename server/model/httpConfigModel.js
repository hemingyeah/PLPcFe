const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  port: 8080,
  headers: {
    cookie: "VIPPUBLINKJSESSIONID=b0cac679-ac9e-4fbd-909d-1de94fd567df",
    // "Content-Type" : "application/json"
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
