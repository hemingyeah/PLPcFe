import Vue from '@src/common/entry';
import http from '@src/util/http';
import BillList from './BillList.vue';
import mtracker from '@src/util/mtracker';

mtracker();

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();


const BillListViewComp = Vue.extend(BillList);
const app = new BillListViewComp();

app.$mount('#app');

export default app;
