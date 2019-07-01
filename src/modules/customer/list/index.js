
import Vue from '@src/common/entry';
import http from '@src/util/http';
import CustomerListView from './CustomerListView.vue';
import mtracker from '@src/util/mtracker';

mtracker();

Vue.prototype.$http = http;

//处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}');
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const CustomerListViewComp = Vue.extend(CustomerListView);
const app = new CustomerListViewComp({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;

