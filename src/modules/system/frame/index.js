import Vue from 'vue'
import FrameView from './FrameView.vue';

const app = new Vue({
  render: h => h(FrameView)
})

app.$mount('#app')

export default app;
