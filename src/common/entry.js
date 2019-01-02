/** 各入口文件应该引入该文件替代手动引入 */
import '@src/assets/scss/index.scss'
import '@src/common/polyfill';

import Vue from 'vue';

import directive from '@src/directive';
import component from '@src/component';
import filter from '@src/filter';

import appConfig from 'app.config';
import platform from '@src/platform';

Vue.use(directive);
Vue.use(filter);
Vue.use(component);

Vue.prototype.$appConfig = appConfig;
Vue.prototype.$platform = platform;

export default Vue;