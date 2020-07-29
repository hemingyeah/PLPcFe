import Vue from '@src/common/entry';
import http from '@src/util/http';
import mtracker from '@src/util/mtracker';

import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseExport from 'packages/BaseExport';
import * as math from 'mathjs';

import RepertoryPersonView from './RepertoryPersonView.vue';

Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseExport.name, BaseExport);

Vue.prototype.$tdOnEvent = function () {

};
Vue.prototype.$math = math;
Vue.prototype.$http = http;
mtracker();

// 处理注入的参数
let initData = {};

try {
  initData = typeof window._init == 'string' ? JSON.parse(window._init || '{}') : window._init;
} catch (error) {
  console.warn(error)
  console.warn('no init data')
}

const app = new Vue({
  el: '#app',
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(RepertoryPersonView)
});


export default app;