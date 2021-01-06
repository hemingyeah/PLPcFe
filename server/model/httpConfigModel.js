const { isNotLocalEnv } = require('./proxyConfigModel');
const http = require('http')
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.58.216',
  port: 8090,
  headers:{
    'cookie':'VIPPUBLINKJSESSIONID=282657ba-becc-4639-aa2a-f030da24671e'
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
