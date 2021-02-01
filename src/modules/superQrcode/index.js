import Vue from '@src/common/entry';
import http from '@src/util/http';
import superQrcode from './superQrcode.vue';

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

//处理注入的参数
// let initData = {};
// try {
//   initData = JSON.parse(window._init);
// } catch (error) {
//   console.error(error)
//   console.error('no init data')
// }

const superQrcodeComp = Vue.extend(superQrcode);
const app = new superQrcodeComp({
  propsData: {
    // initData
  }
});

app.$mount('#app');

export default app;
