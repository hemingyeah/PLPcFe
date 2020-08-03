
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  port: 8080,
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