import '@src/assets/scss/index.scss';
import '@src/common/polyfill'

import Vue from 'vue';

import directive from '@src/directive';
import component from '@src/component';
import filter from '@src/filter';

import dingtalk from '@src/util/dingtalk';
import appConfig from 'app.config';

import TeamCreateView from './TeamCreateView.vue';

Vue.use(directive);
Vue.use(filter);
Vue.use(component);

Vue.prototype.$appConfig = appConfig;

//处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const FrameViewComp = Vue.extend(TeamCreateView);
const app = new FrameViewComp({
  propsData: {
    initData
  }
});

if(window.DingTalkPC) dingtalk.sign(initData.ddConfig);

app.$mount('#app');

export default app;