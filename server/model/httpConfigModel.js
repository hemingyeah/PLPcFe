
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.56.211',
  port: 8081,
  // host: '30.40.63.75',
  // port: 9001,
  // host: '30.40.56.189',
  // port: 8080,
  // headers: {
  //   'cookie': 'VIPPUBLINKJSESSIONID=80458f50-6ddc-4b5b-89df-953db0db4a81'
  // }
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