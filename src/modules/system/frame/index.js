import 'src/assets/scss/index.scss'

import Vue from 'vue';
import component from 'src/component';
import FrameView from './FrameView.vue';

Vue.use(component);

const app = new Vue({
  render: h => h(FrameView)
})

//TODO: 钉钉签名
//console.log(window.DingTalkPC)

app.$mount('#app');

export default app;
