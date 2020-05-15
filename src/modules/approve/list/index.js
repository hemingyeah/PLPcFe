
import Vue from '@src/common/entry';
import http from '@src/util/http';
import ApproveListView from './ApproveListView.vue';

Vue.prototype.$http = http;

const app = new Vue({
  el: '#app',
  render: h => (<ApproveListView></ApproveListView>)
})

export default app;


