import '@src/assets/scss/index.scss';
import '@src/common/polyfill'

import Vue from 'vue';

import directive from '@src/directive';
import component from '@src/component';
import filter from '@src/filter';
import http from '@src/util/http';
import platform from '@src/platform';

import appConfig from 'app.config';

import CustomerDetailView from './CustomerDetailView.vue';

Vue.use(directive);
Vue.use(filter);
Vue.use(component);
/**
 * Vue.config is an object containing Vue’s global configurations.
 * @link {https://cn.vuejs.org/v2/api/index.html}
 */
Vue.config.productionTip = false;
Vue.config.devtools = false;
// Vue.config.performance = true;

Vue.prototype.$appConfig = appConfig;
Vue.prototype.$platform = platform;
Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

//处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const CustomerDetailViewComp = Vue.extend(CustomerDetailView);
const app = new CustomerDetailViewComp({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;
