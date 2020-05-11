import '../../../../packages/ElementUI'
import '../../../../src/assets/scss/index.scss'

import BaseUpload from '../../../../packages/BaseUpload';
import BaseTimeline from '../../../../packages/BaseTimeline';
import BaseTimelineItem from '../../../../packages/BaseTimelineItem';
import component from '../../../component';
import Vue from 'vue';

import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';

import CategoryDetailView from './CategoryDetailView.vue';

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;

Vue.use(component);
Vue.component(BaseUpload.name, BaseUpload);
Vue.component(BaseTimeline.name, BaseTimeline);
Vue.component(BaseTimelineItem.name, BaseTimelineItem);

const app = new Vue({
    el: "#app",
    render: h => h(CategoryDetailView)
});

export default app;