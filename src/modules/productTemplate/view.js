import Vue from '@src/common/entry'
import http from '@src/util/http';
import ProductTemplateView from './View.vue';

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

const PageComponent = Vue.extend(ProductTemplateView);
const app = new PageComponent({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;