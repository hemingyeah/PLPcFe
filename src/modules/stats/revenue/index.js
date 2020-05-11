import '../common/common.scss';
    
import Vue from 'vue';
import RevenueView from './RevenueView.vue'

const app = new Vue({
  el: "#app",
  render: h => h(RevenueView)
});

export default app;