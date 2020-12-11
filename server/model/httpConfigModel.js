const { isNotLocalEnv } = require('./proxyConfigModel');
const http = require('http')
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.59.151',
  port: 8080,
  headers:{
    'cookie':'VIPPUBLINKJSESSIONID=588f226d-f8b2-461f-9734-3c9f88e6e674'
  }
};
// https agent
const HTTPSAGENT = new https.Agent({
  keepAlive: true,
  maxSockets: 1024,
  maxFreeSockets: 256,
});

const HTTPAGENT = new http.Agent({
  keepAlive: true,
  maxSockets: 1024,
  maxFreeSockets: 256,
});

module.exports = {
  DEFAULT_OPIONS,
  HTTPSAGENT,
  HTTPAGENT
};
