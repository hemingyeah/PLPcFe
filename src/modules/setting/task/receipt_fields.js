import Vue from '@src/common/entry';
import TaskReceiptFieldsSettingView from './views/TaskReceiptFieldsSettingView.vue';

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
  render: h => h(TaskReceiptFieldsSettingView),
  el: '#app'
});

export default app;
