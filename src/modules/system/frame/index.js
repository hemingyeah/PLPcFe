import 'src/assets/scss/index.scss';
import 'src/common/polyfill'

import Vue from 'vue';

import directive from 'src/directive';
import component from 'src/component';

import dingtalk from 'src/util/dingtalk';

import FrameView from './FrameView.vue';

Vue.use(directive);
Vue.use(component);

//处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const FrameViewComp = Vue.extend(FrameView);
const app = new FrameViewComp({
  propsData: {
    initData
  }
});

if(window.DingTalkPC) dingtalk.sign(initData.ddConfig);

app.$mount('#app');

export default app;