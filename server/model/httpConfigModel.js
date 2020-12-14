const { isNotLocalEnv } = require('./proxyConfigModel');
const http = require('http');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.59.151',
  port: 8080,
  headers:{
    'cookie':'VIPPUBLINKJSESSIONID=7aa423d1-e2e5-48e1-9bd9-6f94af7e9f32'
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
