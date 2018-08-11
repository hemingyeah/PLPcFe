import * as qs from './querystring';
//https://github.com/axios/axios
import axios from 'axios'; 

function get(url = '', params = {}, option = {}){
  return axios_http('get', url, params, true, option);
}

function post(url = '', params = {}, emulateJSON = true, option = {}){
  return axios_http('post',url, params, emulateJSON, option);
}

function axios_http(method = 'get', url = '', params = {}, emulateJSON = true, config = {}){
  if(method == 'get'){
    let _encodeParams = qs.stringify(params);  
    _encodeParams && (url += url.indexOf('?') != -1 ? "&" : "?" + _encodeParams);
  }

  if(method == 'post'){
    emulateJSON ? config.data = params : config.data = qs.stringify(params);
  }

  config.url = url;
  config.method = method;

  return axios.request(config).then(response => {
    return response.data
  });
}

const http = {get, post};

export default http;