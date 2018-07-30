/** 生产环境配置 @author dongls */
import _ from 'lodash';
import base from './base';

export default _.assign({}, base, {
  env: 'production'    
});
