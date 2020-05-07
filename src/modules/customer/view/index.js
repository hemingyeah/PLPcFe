import Vue from '@src/common/entry';

import http from '@src/util/http';


import CustomerDetailView from './CustomerDetailView.vue';


/**
 * Vue.config is an object containing Vue’s global configurations.
 * @link {https://cn.vuejs.org/v2/api/index.html}
 */
Vue.config.productionTip = false;
Vue.config.devtools = false;
// Vue.config.performance = true;

Vue.prototype.$http = http;

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
