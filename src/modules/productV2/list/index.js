import Vue from '@src/common/entry';
import http from '@src/util/http';
import HomeView from './ProductListView.vue';
import mtracker from '@src/util/mtracker';


import VueTour from 'vue-tour';
require('vue-tour/dist/vue-tour.css');
Vue.use(VueTour);

Vue.prototype.$http = http;
mtracker();

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('Caused: ProductList not have init data')
}

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(HomeView),
  el: '#app'
});

export default app;
