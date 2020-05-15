/** 此文件作为导出组件的入口，不在项目中引用 */
import '../assets/scss/reboot.scss';
import '../assets/scss/transition.scss';
import '../assets/scss/base.scss';

import '../component/business/BizTeamSelect/index.scss'

import '../common/polyfill';

import directive from '../directive';
import BizTeamSelect from '../component/business/BizTeamSelect/BizTeamSelect'

function install(Vue){
  console.warn('该组件只用于兼容旧有页面，整体迁移后删除');
  Vue.use(directive)
  Vue.component(BizTeamSelect.name, BizTeamSelect)
}

window._pc_components_exports = install
if(null != window.Vue) install(window.Vue)

const component = {
  install
}

export default component;