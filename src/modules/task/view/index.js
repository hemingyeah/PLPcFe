import Vue from '@src/common/entry';
import http from '@src/util/http';
import TaskDetailView from './TaskDetailView.vue';

import VueTour from 'vue-tour';
require('vue-tour/dist/vue-tour.css');
Vue.use(VueTour);

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init || '{}');
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(TaskDetailView),
  el: '#app'
})

export default app;
