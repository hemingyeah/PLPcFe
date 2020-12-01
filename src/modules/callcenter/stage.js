import Vue from '@src/common/entry';
import Stage from './views/Stage.vue';
import http from '@src/util/http';
import mtracker from '@src/util/mtracker';

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

mtracker();
// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}') || {};
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const CallCenterComp = Vue.extend(Stage);
const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(CallCenterComp),
  el: '#app'
});


export default app;