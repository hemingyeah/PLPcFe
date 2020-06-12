
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  // host: '30.40.56.211',
  // port: 8080,
  // host: '30.40.63.75',
  // port: 9001,
  host: 'localhost',
  port: 8080,
  headers: {
    'cookie': 'VIPPUBLINKJSESSIONID=591bda79-09b7-4577-b009-3b0b6fc88b52'
  }
};
// https agent
const AGENT = new https.Agent({
  keepAlive: true,
  maxSockets: 1024,
  maxFreeSockets: 256
});

module.exports = {
  DEFAULT_OPIONS,
  AGENT
}