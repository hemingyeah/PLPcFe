/** Vue 常用过滤器 @author dongls */
import common from './common';
import fmt from './fmt';

const filter = {
  install(Vue){
    let filterObj = {...common, ...fmt};
    for(let key in filterObj) Vue.filter(key, filterObj[key])
  }
}

export default filter