import '@src/assets/scss/index.scss'

import Vue from '@src/common/entry';

import http from '@src/util/http';
import mtracker from '@src/util/mtracker';

import component from '../../../component';
import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseImport from 'packages/BaseImport';
import BaseExport from 'packages/BaseExport';
import BasePanel from 'packages/BasePanel';

import StatsPopverIcon from './components/StatsPopoverIcon.vue';
import directive from '../../../directive';


import CategoryListView from './CategoryListView.vue';

Vue.use(component);
Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseImport.name, BaseImport);
Vue.component(BaseExport.name, BaseExport);
Vue.component(StatsPopverIcon.name, StatsPopverIcon);
Vue.component(BasePanel.name, BasePanel);

Vue.prototype.$tdOnEvent = function() {
    
};

Vue.prototype.$http = http;
mtracker();

// 处理注入的参数
let initData = {};

try {
  initData = typeof window._init == 'string' ? JSON.parse(window._init || '{}') : window._init;
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const app = new Vue({
  el: '#app',
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(CategoryListView)
});

export default app;