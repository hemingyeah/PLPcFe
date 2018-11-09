/** 此文件作为导出组件的入口，不在项目中引用 */
import '../assets/scss/reboot.scss';
import '../assets/scss/transition.scss';
import '../assets/scss/base.scss';
import './element.scss';
import '../common/polyfill';

import Vue from 'vue'
import BaseModal from '../component/common/BaseModal';
import BaseTree from '../component/common/BaseTree';
import contact from '../component/common/BaseContact';
import {
  Checkbox
} from 'element-ui';


Vue.use(BaseModal);
Vue.use(BaseTree);
Vue.use(Checkbox);

Vue.prototype.$ELEMENT = { size: 'small'};

const components = {
  contact: contact.props
}

window._pc_componentsV2 = components;

console.warn('该组件只用于兼容旧有页面，整体迁移后删除');

export default components;