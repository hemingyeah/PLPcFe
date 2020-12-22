const { isNotLocalEnv } = require('./proxyConfigModel');
const http = require('http')
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.58.216',
  port: 8090,
  headers:{
    'cookie':'VIPPUBLINKJSESSIONID=2f90f90e-c2fc-4273-aca2-478804ba2b09'
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
