
import Vue from '@src/common/entry';
import http from '@src/util/http';
import CustomerListView from './CustomerListView.vue';

Vue.prototype.$http = http;

const CustomerListViewComp = Vue.extend(CustomerListView);
const app = new CustomerListViewComp({});

app.$mount('#app');

export default app;