/** Vue 常用指令 @author dongls */
import Vue from 'vue';

import loadmore from './loadmore';
import tooltip from './tooltip'

Vue.directive('loadmore', loadmore)
Vue.directive('tooltip', tooltip)

export default {
  install(Vue, opts = {}){
    Vue.directive('loadmore', loadmore)
    Vue.directive('tooltip', tooltip)
  }
}