
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.56.82',
  port: 8080,
  headers:{
    'cookie':'__wpkreporterwid_=00f66f69-f62c-4df9-1a2d-39474a7b4b5f; VIPPUBLINKJSESSIONID=485bec42-47d7-4984-b8e8-6fa3097b142b; JSESSIONID=343A8FB9BC7B13607214E3AD7DBEB1CC'
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