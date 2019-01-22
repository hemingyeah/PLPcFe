import Vue from '@src/common/entry';
import TeamManageView from './TeamManageView.vue';

//处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const FrameViewComp = Vue.extend(TeamManageView);
const app = new FrameViewComp({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;