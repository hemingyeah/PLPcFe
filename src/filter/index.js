/** Vue 常用过滤器 @author dongls */
import _ from 'lodash';

import common from './common';
import fmt from './fmt';

const filters = _.assign({}, common, fmt);

export default {
  install(Vue){
    for(let key in filters) Vue.filter(key, filters[key])
  }
}