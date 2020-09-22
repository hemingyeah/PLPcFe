import Vue from '@src/common/entry';
import http from '@src/util/http';
import index from './index.vue';
import mtracker from '@src/util/mtracker';
import VueClipboard from 'vue-clipboard2'

import initData from "../../doMyself/home/initData";



mtracker();

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();
Vue.prototype.$safeParams = function (params) {
  try {
    //js获取当前日期
    let date = new Date();
    // 引入 CryptoJS
    let CryptoJS = require("crypto-js");
    //由于Java就是按照128bit给的，需要使用CryptoJS.enc.Utf8.parse方法才可以将key转为128bit的。
    let key = CryptoJS.enc.Utf8.parse("IAalz3dubwoVjGS2");
    params = params || {}
    if (Object.keys(params).length > 0) {
      for (let keys in params) {
        //把结果转化为String类型再传入后端
        params[keys] = CryptoJS.AES.encrypt(`${params[keys]}`, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        }).toString();
      }
    }
  } catch (error) {

  }
  //返回VUE-resource对象
  return params;
}

Vue.filter('usual-num', function (value) {
  // 返回处理后的值
  if (!value) return '0'
  if (value * 1 > 10000) {
    return `${value/10000}万`
  }
  return value
})

Vue.use(VueClipboard)

//处理注入的参数
// let initData = {};

// try {
//   initData = JSON.parse(window._init || '{}');
// } catch (error) {
//   console.error(error)
//   console.error('no init data')
// }

const HomeView = Vue.extend(index);

const app = new HomeView({
  propsData: {
    initData
  },
});

app.$mount('#app');

export default app;