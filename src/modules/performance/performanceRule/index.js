import 'src/assets/scss/index.scss';
import 'packages/ElementUI';
import {Popover,Loading} from 'element-ui';
import Vue from 'vue';


import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';

import PerformanceRule from './PerformanceRule.vue';

Vue.use(Popover);
Vue.use(Loading.directive);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;

const app = new Vue({   
  el: "#app",
  render: h => h(PerformanceRule)
});
           
export default app;