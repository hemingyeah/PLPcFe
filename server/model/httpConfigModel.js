
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  // host: '30.40.60.226',
  port: 8080,
  headers:{
    'cookie':'VIPPUBLINKJSESSIONID=02ad36de-4e30-48c1-a218-843cc6745e53'
    // 'cookie':'VIPPUBLINKJSESSIONID=b8ad2bdd-b399-4cf5-a471-3803fe3e6472'
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