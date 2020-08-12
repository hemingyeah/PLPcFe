
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  port: 8080,
  // headers:{
  //   'cookie':'__wpkreporterwid_=00f66f69-f62c-4df9-1a2d-39474a7b4b5f; VIPPUBLINKJSESSIONID=c819184a-673d-4076-ae5c-b1ff2add137b; JSESSIONID=26A7D6D3501D565E58ED04BBDCB0990D'
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