import Vue from '@src/common/entry';
import CallCenter from './setting/index.vue';
import http from '@src/util/http';
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

Vue.prototype.$http = http;

// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}') || {};
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const CallCenterComp = Vue.extend(CallCenter);
const app = new CallCenterComp({
  provide: {
    initData: Object.freeze(initData)
  },
});

app.$mount('#app');

export default app;