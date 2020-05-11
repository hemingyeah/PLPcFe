import '../../../../packages/ElementUI'
import '../../../../src/assets/scss/index.scss'

import BaseUpload from '../../../../packages/BaseUpload';

import Vue from 'vue';
import CategoryEditView from './CategoryEditView.vue';
import component from '../../../component';
import http from '@src/util/HttpUtil';
import platform from '@src/util/Platform';

Vue.prototype.$http = http;
Vue.prototype.$platform = platform;

Vue.component(BaseUpload.name, BaseUpload);
Vue.use(component);
const app = new Vue({
    el: "#app",
    render: h => h(CategoryEditView)
});

export default app;