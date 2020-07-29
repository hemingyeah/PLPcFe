import Vue from 'vue'
import App from './App.vue';

import {
  BaseFormDesign
} from 'packages/BaseForm';

Vue.component(BaseFormDesign.name, BaseFormDesign)

const app = new Vue({
  render: h => h(App),
  el: "#app"
})

export default app;