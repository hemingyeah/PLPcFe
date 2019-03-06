import Vue from '@src/common/entry';
import TeamListView from './views/TeamListView.vue';

//处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const TeamListViewComp = Vue.extend(TeamListView);
const app = new TeamListViewComp({
  propsData: { initData }
});

app.$mount('#app');

export default app;