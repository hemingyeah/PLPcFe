/** Vue 常用指令 @author dongls */
import loadmore from './loadmore';
import tooltip from './tooltip'
import trim from './trim'
import elSelectLoadmore from '@src/directive/elSelectLoadmore'

const directives = {
  install(Vue, opts = {}){
    Vue.directive('loadmore', loadmore)
    Vue.directive('tooltip', tooltip)
    Vue.directive('trim', trim)
    Vue.directive('el-select-loadmore', elSelectLoadmore)
  }
}

export default directives;