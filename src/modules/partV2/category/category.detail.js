import Vue from '@src/common/entry';

import http from '@src/util/http';
import mtracker from '@src/util/mtracker';

import BaseUpload from 'packages/BaseUpload';
import BaseTimeline from 'packages/BaseTimeline';
import BaseTimelineItem from 'packages/BaseTimelineItem';

import CategoryDetailView from './CategoryDetailView.vue';

Vue.prototype.$http = http;
mtracker();

Vue.component(BaseUpload.name, BaseUpload);
Vue.component(BaseTimeline.name, BaseTimeline);
Vue.component(BaseTimelineItem.name, BaseTimelineItem);

// 处理注入的参数
let initData = {};

try {
  initData = typeof window._init == 'string' ? JSON.parse(window._init || '{}') : window._init;
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const app = new Vue({
  el: '#app',
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(CategoryDetailView)
});

export default app;