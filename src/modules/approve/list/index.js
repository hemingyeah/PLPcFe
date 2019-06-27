
import Vue from '@src/common/entry';
import http from '@src/util/http';
import ApproveListView from './ApproveListView.vue';

Vue.prototype.$http = http;

const ApproveListViewComp = Vue.extend(ApproveListView);
const app = new ApproveListViewComp({});

app.$mount('#app');

export default app;


