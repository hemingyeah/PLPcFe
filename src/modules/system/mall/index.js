import Vue from '@src/common/entry';
import Mall from './mall.vue';
import http from '@src/util/HttpUtil';

// 处理注入的参数
let initData = {};

try {
  initData = typeof window._init == 'string' ? JSON.parse(window._init || '{}') : window._init;
} catch (error) {
  console.warn(error)
  console.warn('no init data')
}

Vue.prototype.$http = http;

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(Mall)
})

app.$mount('#app')

export default app;