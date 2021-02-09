/** 此文件作为导出组件的入口，不在项目中引用 */
import '../assets/scss/reboot.scss'
import '../assets/scss/transition.scss'
import '../assets/scss/base.scss'
import './element.scss'
import '../common/polyfill'
/* components */
import BaseModal from '../component/common/BaseModal'
import BaseTree from '../component/common/BaseTree'
import BaseContact from '../component/common/BaseContact'
import BaseMapPicker from '../component/common/BaseMapPicker'
import BizTeamSelect from '../component/business/BizTeamSelect'
import BizVersionLimitDialogHOC from '../component/business/BizVersionLimitDialog/index.tsx'
import BizVersionLimitDialog from '../component/business/BizVersionLimitDialog/BizVersionLimitDialog.tsx'

import { Checkbox, Button } from 'shb-element-ui'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* vue */
import Vue from 'vue'
import filter from '../filter'
import directive from '../directive'

Vue.use(BaseModal)
Vue.use(BaseTree)
Vue.use(Checkbox)
Vue.use(Button)
Vue.use(filter)
Vue.use(directive)

Vue.prototype.$ELEMENT = { size: 'small'}

const components = {
  [BaseContact.namespace]: BaseContact.props,
  [BaseMapPicker.namespace]: BaseMapPicker.props,
  [BizTeamSelect.namespace]: {
    ...BizTeamSelect.props,
    ...BizVersionLimitDialogHOC.props
  },
}

function install(Vue){
  Vue.use(directive)
  Vue.component(BizTeamSelect.name, BizTeamSelect)
  Vue.component(ComponentNameEnum.BizVersionLimitDialog, BizVersionLimitDialog)
}

window._pc_componentsV2 = components
window._pc_components_exports = install

if(typeof window.Vue != undefined) {
  install(window.Vue)
}

console.warn('该组件只用于兼容旧有页面，整体迁移后删除')

export default components