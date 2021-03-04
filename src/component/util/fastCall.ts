/* vue */
import { VueConstructor } from 'vue'

/**
 * @description: 组件快速调用注册方法
 * @param {VueConstructor} Vue vue实例
 * @param {String} namespace 命名空间名称
 * @param {PropsType} props 命名空间属性
 * @return {void}
 * @author dongls
 */
function fastCall<PropsType> (
  Vue: VueConstructor, 
  namespace: string, 
  props: PropsType
): void {
  // 初始化原型属性
  if(!Vue.prototype.$fast) Vue.prototype.$fast = {}
  
  // 初始化命名空间
  if(!Vue.prototype.$fast[namespace]) {
    Vue.prototype.$fast[namespace] = {}
  }

  // 命名空间挂载对应属性
  let scope = Vue.prototype.$fast[namespace]
  for(let name in props){
    scope[name] = props[name]
  }
}

export default fastCall