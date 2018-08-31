import '@src/assets/scss/index.scss'
import '@src/assets/scss/_mixins.scss'
import '@src/assets/scss/_variables.scss'
import '@src/common/polyfill';

import Vue from 'vue';
import ElementUI from '@src/component/element-ui';
import component from '@src/component';
import platform from '@src/platform';


import http from '../../../util/http';
import Loading from '../../../component/BaseLoading'

import CustomerListView from './CustomerListView.vue';

Vue.use(ElementUI);
Vue.use(component);

Vue.prototype.$http = http;
Vue.prototype.$platform = platform;
Vue.prototype.$loading = Loading;
Vue.prototype.$eventBridge = new Vue();

const CustomerListViewComp = Vue.extend(CustomerListView);
const app = new CustomerListViewComp({

});

app.$mount('#app');

export default app;