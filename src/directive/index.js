/** Vue 常用指令 @author dongls */
import loadmore from './loadmore';
import tooltip from './tooltip'
import trim from './trim'

const directives = {
  install(Vue, opts = {}){
    Vue.directive('loadmore', loadmore)
    Vue.directive('tooltip', tooltip)
    Vue.directive('trim', trim)
  }
}

export default directives;