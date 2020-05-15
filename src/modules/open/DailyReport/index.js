import Vue from 'vue';
import DailyReportView from './DailyReportView.vue';

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const DailyReportViewComp = Vue.extend(DailyReportView);
const app = new DailyReportViewComp({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;