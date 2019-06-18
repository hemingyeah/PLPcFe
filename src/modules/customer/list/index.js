
import Vue from '@src/common/entry';
import http from '@src/util/http';
import CustomerListView from './CustomerListView.vue';
import mtracker from '@src/util/mtracker';

mtracker();

Vue.prototype.$http = http;

const CustomerListViewComp = Vue.extend(CustomerListView);
const app = new CustomerListViewComp({});

app.$mount('#app');

export default app;