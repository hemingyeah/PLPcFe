import Vue from 'vue';
import WikiDetailView from './WikiDetailView.vue';

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const WikiDetailViewComp = Vue.extend(WikiDetailView);
const app = new WikiDetailViewComp({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;