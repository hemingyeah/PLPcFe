/** 可快速调用的组件 */
import BaseContact from './common/BaseContact';
import BaseMapPicker from './common/BaseMapPicker';

const components = [
  BaseContact,
  BaseMapPicker
];

const fast = {
  install(Vue){
    if(!Vue.prototype.$fast) Vue.prototype.$fast = {};
  
    components.forEach(comp => {
      if(!Vue.prototype.$fast[comp.namespace]) {
        Vue.prototype.$fast[comp.namespace] = {};
      }

      let scope = Vue.prototype.$fast[comp.namespace];
      for(let name in comp.props){
        scope[name] = comp.props[name];
      }
    })
  }
}
export default fast;