import Vue from '@src/common/entry';
import http from '@src/util/http';
import index from './index.vue';
import mtracker from '@src/util/mtracker';

mtracker();

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

const HomeView = Vue.extend(index);

const app = new HomeView({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;