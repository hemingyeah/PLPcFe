
const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  port: 8080,
  headers: {
    cookie: '__wpkreporterwid_=19a952af-102a-4bd2-24ea-8a827956cfb4; VIPPUBLINKJSESSIONID=d0616248-9f0c-49b3-bbdd-9933117f7ba9; JSESSIONID=73877E9864963BB00CA8307FF5CA8F02'
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