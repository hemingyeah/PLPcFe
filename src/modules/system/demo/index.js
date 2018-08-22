import '@src/assets/scss/index.scss'
import '@src/common/polyfill';

import Vue from 'vue';
import ElementUI from '@src/component/element-ui';
import component from '@src/component';
import platform from '@src/platform';

import DemoView from './DemoView.vue';

Vue.use(ElementUI)
Vue.use(component)

Vue.prototype.$platform = platform;

const app = new Vue({
  render: h => h(DemoView)
})

app.$mount('#app')

export default app;
