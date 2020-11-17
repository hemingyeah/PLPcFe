import Vue from '@src/common/entry';
import Mall from './mall.vue';

const app = new Vue({
  render: h => h(Mall)
})

app.$mount('#app')

export default app;