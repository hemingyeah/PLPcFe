import '@src/assets/scss/index.scss';
import Vue from 'vue';
import OpenSubscibeView from './OpenSubscibeView.vue';
import http from '../../../util/http';

Vue.prototype.$http = http;

//处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const OpenSubscibeViewComp = Vue.extend(OpenSubscibeView);
const app = new OpenSubscibeViewComp({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;