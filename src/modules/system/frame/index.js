import Vue from '@src/common/entry';
import dingtalk from '@src/util/dingtalk';
import FrameView from './FrameView.vue';
import { Notification } from 'element-ui';
import mtracker from '@src/util/mtracker';

mtracker();


window.__exports__notification = Notification;

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(FrameView),
  el: '#app'
});

if(window.DingTalkPC) dingtalk.sign(initData.ddConfig);

export default app;
