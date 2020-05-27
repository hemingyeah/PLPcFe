import Vue from '@src/common/entry';
import TransferDetailView from './views/TransferDetailView.vue';
// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}') || {};
} catch (error) {
  console.error(error);
  console.error('no init data')
}

const TransferDetailViewComp = Vue.extend(TransferDetailView);
const app = new TransferDetailViewComp({
  propsData: { initData }
});

app.$mount('#app');

export default app;