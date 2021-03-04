import 'packages/ElementUI'
import 'src/assets/scss/index.scss';

import Vue from 'vue';

import BaseImport from 'packages/BaseImport';
import BaseExport from 'packages/BaseExport';

import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';

import PerformanceReport from './PerformanceReport.vue';

Vue.component(BaseImport.name, BaseImport);
Vue.component(BaseExport.name, BaseExport);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;

const app = new Vue({   
  el: "#app",
  render: h => h(PerformanceReport)
});
           
export default app;