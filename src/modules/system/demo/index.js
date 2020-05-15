import Vue from '@src/common/entry';
import DemoView from './DemoView.vue';

const app = new Vue({
  render: h => h(DemoView)
})

app.$mount('#app')

export default app;
