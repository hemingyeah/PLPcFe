import 'src/assets/scss/index.scss'
import 'src/common/polyfill'

import Vue from 'vue'
import HomeView from './HomeView.vue';

const app = new Vue({
  render: h => h(HomeView)
})

app.$mount('#app')

export default app;
