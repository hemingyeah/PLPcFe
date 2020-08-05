import Vue from '@src/common/entry';
import http from '@src/util/http';
import TaskList from './TaskListView.vue';
import mtracker from '@src/util/mtracker';

Vue.prototype.$http = http;
mtracker();

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('Caused: TaskList not have init data')
}

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(TaskList),
  el: '#app'
});

export default app;
