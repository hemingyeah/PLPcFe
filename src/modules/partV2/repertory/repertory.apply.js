import Vue from '@src/common/entry';

import http from '@src/util/HttpUtil';
import mtracker from '@src/util/mtracker';
import * as math from 'mathjs';

import BaseCollapsePanel from 'packages/BaseCollapsePanel';
// import BaseExport from 'packages/BaseExport';

import RepertoryApplyView from './RepertoryApplyView.vue';

Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
// Vue.component(BaseExport.name, BaseExport);

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
// initData = require('@src/modules/doMyself/home/initData')

const app = new Vue({
  el: '#app',
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(RepertoryApplyView)
});

export default app;