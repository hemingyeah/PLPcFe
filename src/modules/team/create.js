import Vue from '@src/common/entry';
import TeamCreateView from './views/TeamCreateView.vue';

// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const TeamCreateViewComp = Vue.extend(TeamCreateView);
const app = new TeamCreateViewComp({
  propsData: { initData }
});

app.$mount('#app');

export default app;