/** 生产环境配置 @author dongls */
import base from './base';

const production = {...base, ...{
  env: 'production'   
}}

export default production;