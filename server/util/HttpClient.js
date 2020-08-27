/** 请求代理 
 * @author dongls 
*/
const colors = require('colors')
// utils
const { isNotLocalEnv } = require('../model/proxyConfigModel');
const https = require(isNotLocalEnv ? 'https' : 'http');
const { getRequestOptions, getProxyOptions, toJSON, getBody } = require('./HttpUtil');

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
    
    let requestOptions = getRequestOptions(path, method, options);

    console.log(`${colors.bgYellow('request -> requestOptions')}, ${JSON.stringify(requestOptions)}`)

    return new Promise((resolve, reject) => {
      let req = https.request(requestOptions, res => {
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
          if (contentType && contentType.indexOf('application/json' >= 0)) {
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
      if (rawBody) req.write(rawBody);

      req.end();
    });
  },
  /**
   * 转发请求，无需对返回数据处理时用，可处理附件类请求
   * @param {*} ctx 
   * @param {*} options
   */
  proxy(ctx, options = {}) {
    let request = ctx.request;
    let response = ctx.response;

    let rawBody = request.rawBody;
    let isMultipart = request.is('multipart/form-data');

    let proxyOptions = getProxyOptions(ctx, options);

    console.log(`${colors.bgYellow('proxy -> proxyOptions')}, ${JSON.stringify(proxyOptions)}`)

    return new Promise((resolve, reject) => {
      let req = https.request(proxyOptions, res => {
        // 设定response的header
        let headers = res.headers;
        for(let name in headers) {
          response.set(name, headers[name])
        }

        // 设定请求状态
        response.status = res.statusCode;
        res.pipe(response.res, { end: false })

        res.on('end', () => {
          // 此处需要手动调用
          response.res.end()
          resolve()
        })
      })

      req.on('error', error => {
        console.log(error)
        reject(error)
      });

      // 非附件类请求需要调用end
      if (!isMultipart) {
        if (rawBody) req.write(rawBody)
        req.end();
        return
      }

      request.req.pipe(req)
    })
  }
};
