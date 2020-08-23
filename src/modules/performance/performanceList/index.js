import 'packages/ElementUI'
import 'src/assets/scss/index.scss';

import Vue from 'vue';


import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseImport from 'packages/BaseImport';
import BaseExport from 'packages/BaseExport';

import Platform from 'src/util/Platform';
import Http from 'src/util/HttpUtil';

import PerformanceList from './PerformanceList.vue';

Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseImport.name, BaseImport);
Vue.component(BaseExport.name, BaseExport);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;

const app = new Vue({   
  el: "#app",
  render: h => h(PerformanceList)
});
           
export default app;