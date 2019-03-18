import Vue from '@src/common/entry';
import dingtalk from '@src/util/dingtalk';
import FrameView from './FrameView.vue';
import { Notification } from 'element-ui';

window.__exports__notification = Notification;

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error);
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
