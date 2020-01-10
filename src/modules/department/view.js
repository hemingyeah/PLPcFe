import Vue from '@src/common/entry';
import http from '@src/util/http';

const DepartmentView = () => import('./DepartmentView.vue');

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

const app = new Vue({
  el: '#app',
  render: h => (<DepartmentView></DepartmentView>)
})

export default app;