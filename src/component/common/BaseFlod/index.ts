// @ts-ignore
import BaseFlod from './BaseFlod.tsx'
// @ts-ignore
import BaseFlodItem from './BaseFlodItem.tsx'

// @ts-ignore
BaseFlod.install = function(Vue){
  Vue.component(BaseFlod.name, BaseFlod)
}

// @ts-ignore
BaseFlodItem.install = function(Vue){
  Vue.component(BaseFlodItem.name, BaseFlodItem)
}

export default [BaseFlod, BaseFlodItem]