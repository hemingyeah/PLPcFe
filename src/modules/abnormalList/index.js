import Vue from '@src/common/entry';
import Abnormal from './index.vue';

// 处理注入的参数
let initData = {};

try {
  initData = window._init || {};
} catch (error) {
  console.warn(error)
  console.warn('no init data')
}

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(Abnormal)
})

app.$mount('#app')

export default app;