import '@src/assets/scss/index.scss'
import '@src/common/polyfill';

import Vue from 'vue';
import component from '@src/component';
import platform from '@src/platform';
import filter from '@src/filter';


import http from '../../../util/http';

import CustomerListView from './CustomerListView.vue';

Vue.use(filter);
Vue.use(component);

Vue.prototype.$http = http;
Vue.prototype.$platform = platform;

const CustomerListViewComp = Vue.extend(CustomerListView);
const app = new CustomerListViewComp({

});

app.$mount('#app');

export default app;