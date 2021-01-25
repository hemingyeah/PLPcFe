import Vue from '@src/common/entry';
import TeamEditView from './views/TeamEditView.vue';

// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const TeamEditViewComp = Vue.extend(TeamEditView);
const app = new TeamEditViewComp({
  propsData: { initData }
});

app.$mount('#app');

export default app;