import Vue from '@src/common/entry'
import HomeView from './HomeView.vue';

const app = new Vue({
  render: h => h(HomeView)
})

app.$mount('#app')

export default app;
