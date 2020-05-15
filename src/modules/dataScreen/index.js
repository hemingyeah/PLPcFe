import Vue from '@src/common/entry';
import http from '@src/util/http';
const FrameView = () => import('./FrameView.vue');

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

const app = new Vue({
  el: '#app',
  render: h => (<FrameView></FrameView>)
})

export default app;