/** Vue 常用过滤器 @author dongls */
import common from './common';
import fmt from './fmt';
import form from './form';

const filter = {
  install(Vue){
    let filterObj = {...common, ...fmt, ...form};
    for(let key in filterObj) Vue.filter(key, filterObj[key])
  }
}

export default filter;