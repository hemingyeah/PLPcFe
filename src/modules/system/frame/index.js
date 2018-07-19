import 'src/assets/scss/index.scss'

import Vue from 'vue';
import component from 'src/component';
import FrameView from './FrameView.vue';

import dingtalk from 'src/util/dingtalk';

Vue.use(component);

//处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const FrameViewComp = Vue.extend(FrameView)
const app = new FrameViewComp({
  propsData: {
    initData
  }
});

dingtalk.sign(initData.ddConfig);

app.$mount('#app');

export default app;