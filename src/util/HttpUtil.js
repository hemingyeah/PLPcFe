//https://github.com/mzabriskie/axios
import axios from 'axios';
import qs from './querystring2';

function http(method = 'get', url = '', config = {}){
  config.url = url;
  config.method = method;

  return axios.request(config).then(response => response.data);
}

function get(url = '', data = {}, config = {}){
  if(null != data){
    let params = qs.stringify(data);
    let hyphen = url.indexOf('?') != -1 ? "&" : "?";
    url = url + hyphen + params
  }

  return http('get', url, config);
}

function post(url = '', data = {}, emulateJSON = true, config = {}){
  data = emulateJSON ? data : qs.stringify(data);
  config.data = data;

  return http('post', url, config);
}

function ajax(url) {
  return new Promise(function(resolve,reject){
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var response = this.responseText;
      try {
        response = JSON.parse(response)
      } catch (e){
        console.error(e)
      }
      resolve(response)
    };
    
    xhr.onerror = err => reject(err);
    xhr.open("get", url, true);
    xhr.send();
  })
}

export default {
  get,
  post,
  ajax
};
