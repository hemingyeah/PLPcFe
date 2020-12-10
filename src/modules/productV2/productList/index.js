import Vue from "@src/common/entry";
import http from "@src/util/http";
import HomeView from "./index.vue";
import mtracker from "@src/util/mtracker";

// import initData from '@src/modules/doMyself/home/initData.js'

mtracker();

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || "{}");
} catch (error) {
  console.error(error)
  console.error("no init data")
}

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(HomeView),
  el: "#app"
})

export default app;