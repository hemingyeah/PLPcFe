
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.59.106',
  port: 8080,
  headers:{
    'cookie':'VIPPUBLINKJSESSIONID=e048e7e1-8204-406f-9f03-d8ff78fe84d0'
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