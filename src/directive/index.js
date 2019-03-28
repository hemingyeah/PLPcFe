/** Vue 常用指令 @author dongls */
import loadmore from './loadmore';
import tooltip from './tooltip'

const directives = {
  install(Vue, opts = {}){
    Vue.directive('loadmore', loadmore)
    Vue.directive('tooltip', tooltip)
  }
}

export default directives;