import Vue from '@src/common/entry';
import TransferDetailView from './views/TransferDetailView.vue';
import http from '@src/util/http';
import * as math from 'mathjs';

import VueTour from 'vue-tour';
require('vue-tour/dist/vue-tour.css');
Vue.use(VueTour);

Vue.prototype.$http = http;
Vue.prototype.$math = math;
// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}') || {};
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const TransferDetailViewComp = Vue.extend(TransferDetailView);
const app = new TransferDetailViewComp({
  propsData: { initData }
});

app.$mount('#app');

export default app;