import Vue from '@src/common/entry';
import http from '@src/util/HttpUtil';
import mtracker from '@src/util/mtracker';

import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseImport from 'packages/BaseImport';
import BaseExport from 'packages/BaseExport';
import * as math from 'mathjs';

import RepertoryStockView from './RepertoryStockView.vue';
// import { Autocomplete } from 'element-ui';
// Vue.component(Autocomplete.name, Autocomplete);

Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseImport.name, BaseImport);
Vue.component(BaseExport.name, BaseExport);

Vue.prototype.$http = http;
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
  render: h => h(RepertoryStockView)
});


export default app;