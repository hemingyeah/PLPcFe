/** @author dongls */
//TODO: 重写
const http = require('http');

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
   * 转发请求，无需对返回数据处理时用
   * @param {*} ctx 
   */
  forward(ctx, options = {}){
    let request = ctx.request;
    let response = ctx.response;

    let path = request.originalUrl;
    let method = request.method;
    let rawBody = request.rawBody;

    let proxyOptions = {};

    proxyOptions.host = options.host || DEFAULT_OPIONS.host;
    proxyOptions.port = options.port || DEFAULT_OPIONS.port;
    proxyOptions.method = method;
    proxyOptions.path = path;

    proxyOptions.headers = Object.assign({}, DEFAULT_OPIONS.headers, request.headers, options.headers)
    proxyOptions.agent = AGENT;

    let isMultipart = request.is('multipart/form-data');

    return new Promise((resolve, reject) => {
      let req = http.request(proxyOptions, res => {
        let headers = res.headers;
        for(let name in headers){
          response.set(name, headers[name])
        }
        
        response.status = res.statusCode;
        res.pipe(response.res, {end: false})
        
        res.on('end', () => {
          response.res.end()
          resolve()
        })
      })
  
      req.on('error', error => {
        console.log(error)
        reject(error)
      });
      
      if(!isMultipart){
        if(rawBody) req.write(rawBody)
        req.end();
        return
      }

      request.req.pipe(req)
    })
  }
};