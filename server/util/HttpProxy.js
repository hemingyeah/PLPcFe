/** 请求代理 @author dongls */
const http = require('http');
const ResultMessage = require('../../model/ResultMessage')

const DEFAULT_OPIONS = {
  host: '127.0.0.1',
  port: 8080,
  headers: {}
}
const AGENT = new http.Agent({
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
   * 发起一个请求
   * 如果请求地址需要登录，请在options中传入对应的headers
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
    proxyOptions.agent = AGENT;

    //TODO: 超时处理

    return new Promise((resolve, reject) => {
      let req = http.request(proxyOptions, res => {
        let chunks = [];
        let size = 0;

        res.on('data', (chunk) => {
          chunks.push(chunk);
          size += chunk.length;
        })
     
        //请求完成
        res.on('end', () => {
          //拼接返回数据
          let body = Buffer.concat(chunks, size).toString();
          
          //处理json
          let contentType = res.headers['content-type'];
          if(contentType && contentType.indexOf('application/json' >= 0)){
            body = toJSON(body)
          } 
          
          let resBody = getBody(res, body, null);

          resolve(resBody);
        });
      })

      req.on('error', error => {
        console.log(error)
        resolve(getBody(null, null, error));
      });
      
      //发送数据
      if(rawBody) req.write(rawBody);
      
      req.end();
    });
  },

  /**
   * 代理请求，需要对请求返回数据处理时
   * @param {*} request 请求对象
   * @param {*} options 
   */
  proxy(request, options = {}){
    let path = request.originalUrl;
    let method = request.method;
    let rawBody = request.rawBody;

    let proxyOptions = {};
    proxyOptions.headers = Object.assign({}, request.headers, options.headers)
    
    if(options.host) proxyOptions.host = options.host;
    if(options.port) proxyOptions.port = options.port;
    
    return this.request(path, method, rawBody, proxyOptions)
  },

  /**
   * 转发请求，无需对返回数据处理时用
   * @param {*} ctx 
   */
  async forward(ctx){
    let failMessage = ResultMessage.fail();

    let result = await this.proxy(ctx.request);
    let message = result.status ? result.body : failMessage;

    let headers = result.headers;
    for(let name in headers){
      ctx.response.set(name, headers[name])
    }
    
    ctx.response.status = result.statusCode;
    ctx.response.body = message;
  }
}