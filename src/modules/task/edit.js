import Vue from '@src/common/entry';
import TaskEditView from './views/TaskEditView.vue';

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
  render: h => h(TaskEditView),
  el: '#app'
});

export default app;
