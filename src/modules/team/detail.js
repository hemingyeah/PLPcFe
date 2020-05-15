import Vue from '@src/common/entry';
import TeamDetailView from './views/TeamDetailView.vue';

// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}') || {};
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const TeamDetailViewComp = Vue.extend(TeamDetailView);
const app = new TeamDetailViewComp({
  propsData: { initData }
});

app.$mount('#app');

export default app;