/** 组件快速调用注册方法 */
export default function fastCall(Vue, namespace, props){
  if(!Vue.prototype.$fast) Vue.prototype.$fast = {};
  
  if(!Vue.prototype.$fast[namespace]) {
    Vue.prototype.$fast[namespace] = {};
  }
  let scope = Vue.prototype.$fast[namespace];
  for(let name in props){
    scope[name] = props[name];
  }
}
