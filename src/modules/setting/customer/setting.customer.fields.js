import '@src/assets/scss/index.scss';
import '@src/common/polyfill'

import Vue from 'vue';

import directive from '@src/directive';
import component from '@src/component';
import filter from '@src/filter';
import http from '@src/util/http';
import platform from '@src/platform';

import appConfig from 'app.config';

import SettingCustomerFieldsView from './SettingCustomerFieldsView.vue';

Vue.use(directive);
Vue.use(filter);
Vue.use(component);

Vue.prototype.$appConfig = appConfig;
Vue.prototype.$platform = platform;
Vue.prototype.$http = http;

//处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const PageComponent = Vue.extend(SettingCustomerFieldsView);
const app = new PageComponent({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;