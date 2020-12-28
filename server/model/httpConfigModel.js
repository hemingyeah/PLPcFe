const { isNotLocalEnv } = require('./proxyConfigModel');
const http = require('http')
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '30.40.58.216',
  port: 8090,
  headers:{
    'cookie':'__wpkreporterwid_=77c2d747-071c-4ad6-0416-9c7bec063615; VIPPUBLINKJSESSIONID=0b893c84-0d3b-4899-98c5-564d4e4f4d11; JSESSIONID=9F7EFE01FDFF79F3B6BED8250DFAE4AF'
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
