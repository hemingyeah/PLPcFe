import '@src/assets/scss/index.scss'
import '@src/common/polyfill';

import Vue from 'vue';

import directive from '@src/directive';
import filter from '@src/filter';
import component from '@src/component';
import ElementUI from '@src/component/element-ui';

import appConfig from 'app.config';

import platform from '@src/platform';
import DemoView from './DemoView.vue';

Vue.use(directive)
Vue.use(filter)
Vue.use(component)
Vue.use(ElementUI)

Vue.prototype.$platform = platform;
Vue.prototype.$appConfig = appConfig;

const app = new Vue({
  render: h => h(DemoView)
})

app.$mount('#app')

export default app;
