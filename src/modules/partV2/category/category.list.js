import Vue from '@src/common/entry';

import http from '@src/util/HttpUtil';
import mtracker from '@src/util/mtracker';

import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseImport from 'packages/BaseImport';
import BaseExport from 'packages/BaseExport';

import StatsPopverIcon from './components/StatsPopoverIcon.vue';


import CategoryListView from './CategoryListView.vue';

Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseImport.name, BaseImport);
Vue.component(BaseExport.name, BaseExport);
Vue.component(StatsPopverIcon.name, StatsPopverIcon);

Vue.prototype.$tdOnEvent = function() {
    
};
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
  render: h => h(CategoryListView)
});

export default app;