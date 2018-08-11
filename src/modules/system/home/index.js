import 'src/assets/scss/index.scss'
import 'src/common/polyfill';

import Vue from 'vue';
import ElementUI from 'src/component/ElementUI';
import HomeView from './HomeView.vue';
import platform from '../../../platform';

Vue.use(ElementUI)

Vue.prototype.$platform = platform;

const app = new Vue({
  render: h => h(HomeView)
})

app.$mount('#app')

export default app;
