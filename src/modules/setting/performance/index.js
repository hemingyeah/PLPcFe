import Vue from '@src/common/entry'
import http from '@src/util/http';
import PerformanceSettingView from './PerformanceSettingView.vue';

Vue.prototype.$http = http;

//处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}');
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const PageComponent = Vue.extend(PerformanceSettingView);
const app = new PageComponent({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;