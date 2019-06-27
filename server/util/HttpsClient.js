/** 请求代理 @author dongls */
const http = require('http');

const DEFAULT_OPIONS = {
  host: '172.18.1.10',
  port: 10000,
  // protocol: 'https:',
  headers: {}
};

const HTTPS_AGENT = new http.Agent({
  keepAlive: true,
  maxSockets: 1024,
  maxFreeSockets: 256
});


/** 如果解析失败返回原值 */
function toJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

/**
 * 拆解返回体
 * @param {*} response @see http://nodejs.cn/api/http.html#http_class_http_serverresponse
 * @param {*} body 返回的数据
 * @param {*} error 
 */
function getBody(response, body, error){  
  let statusCode = error ? 500 : response.statusCode;
  let status = statusCode >= 200 && statusCode < 300;

  let headers = {};
  if(response && response.headers) {
    headers = response.headers;
  }

  return {statusCode, status, headers, body, error};
}

module.exports = {
  /**
   * 发起一个请求,不能处理附件类请求
   * 如果请求地址需要登录，请在options的headers中传入对应的cookie
   * 
   * @param {*} path 请求路径
   * @param {*} method 请求方法
   * @param {*} rawBody 请求体
   * @param {*} options 
   */
  request(path, method, rawBody, options = {}){
    let proxyOptions = {};
    
    proxyOptions.host = options.host || DEFAULT_OPIONS.host;
    proxyOptions.port = options.port || DEFAULT_OPIONS.port;
    proxyOptions.method = method;
    proxyOptions.path = path;

    proxyOptions.headers = Object.assign({}, DEFAULT_OPIONS.headers, options.headers)
    proxyOptions.agent = HTTPS_AGENT;

    return new Promise((resolve, reject) => {
      let req = http.request(proxyOptions, res => {
        let chunks = [];
        let size = 0;

        res.on('data', (chunk) => {
          chunks.push(chunk);
          size += chunk.length;
        })
     
        // 请求完成
        res.on('end', () => {
          // 拼接返回数据
          let body = Buffer.concat(chunks, size).toString();
          
          // 处理返回值
          let contentType = res.headers['content-type'];
          if(contentType && contentType.indexOf('application/json' >= 0)) {
            body = toJSON(body)
          }
          
          resolve(getBody(res, body, null));
        });
      })

      req.on('error', error => {
        console.log(error)
        resolve(getBody(null, null, error));
      });
      
      // 发送数据
      if(rawBody) req.write(rawBody);
      
      req.end();
    });
  },
};
