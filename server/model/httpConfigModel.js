const { isNotLocalEnv } = require('./proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
// 默认配置
const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  port: 8080,
  headers: {
    cookie: '__wpkreporterwid_=144ebba3-2e92-497e-a708-1a85b0f24ca2; JSESSIONID=519CA2C209BBDC096E984E8F8D3A14B1; VIPPUBLINKJSESSIONID=e2f0a35f-e12d-4ae2-b708-4bf52113ffe6'
  }
};
// https agent
const AGENT = new https.Agent({ 
  keepAlive: true,
  maxSockets: 1024,
  maxFreeSockets: 256,
});

module.exports = {
  DEFAULT_OPIONS,
  AGENT,
};
