import _ from 'lodash';
import querystring from './querystring'
// https://github.com/axios/axios
import axios from 'axios';

const axiosIns = axios.create({
  // put, post, patch 请求参数转换
  transformRequest: [function (data, headers) {
    let copyData = data;
    if(headers['Content-Type'] == 'application/x-www-form-urlencoded' && _.isPlainObject(copyData)){
      copyData = querystring.stringify(copyData)
    }

    if(headers['Content-Type'] == 'application/json'){
      copyData = JSON.stringify(copyData)
    }
 
    return copyData;
  }],
  // get 请求参数序列化
  paramsSerializer(params) {
    return querystring.stringify(params)
  }
})

let CancelToken = axios.CancelToken; // 取消令牌
let requestPool = {}; // 请求池

function removeFromPool(key){
  let cancelFn = requestPool[key];
  if(typeof cancelFn == 'function'){
    cancelFn( `Request cancelled: ${key}`);
    delete requestPool[key];
  }
}

/** 请求拦截，取消对同一地址的重复请求，只保留最后一次请求 */
axiosIns.interceptors.request.use(config => {
  if(config.cancelable){ // 如果请求可取消
    let key = `${ config.method }_${ config.url }`;
    removeFromPool(key); // 取消重复请求

    // 生成取消token
    config.cancelToken = new CancelToken(function(c) {
      requestPool[key] = c;
    })
  }

  return config;
}, error => {
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(response => {
  let config = response.config;
  let key = `${ config.method }_${ config.url }`;
  removeFromPool(key);
  return response;
}, error => {
  return Promise.reject(error); // 返回一个空对象，主要是防止控制台报错
});

function get(url = '', params = {}, emulateJSON = true, option = {}) {
  console.log(url, params, emulateJSON)
  return axiosHttp('get', url, params, emulateJSON, option);
}

function post(url = '', params = {}, emulateJSON = true, option = {}) {
  return axiosHttp('post', url, params, emulateJSON, option);
}

function axiosHttp(method = 'get', url = '', params = {}, emulateJSON = true, config = {}) {
  if(!config.headers) config.headers = {};

  if(method == 'get'){
    config.params = params;
    config.params._t = Math.random() * 100000 >> 0;
  }

  if(method == 'post') {
    config.headers['Content-Type'] = emulateJSON ? 'application/json' : 'application/x-www-form-urlencoded';
    config.data = params;
  }
  
  config.url = url;
  config.method = method;
  // config.cancelable = config.cancelable !== false; // 请求是否可取消

  // 禁止在此处捕获异常
  // 如需统一处理，需要在处理后抛出异常，确保调用者可以处理异常
  return axiosIns.request(config).then(response => response.data)
}

const http = { get, post, axios: axiosHttp };

export default http;
