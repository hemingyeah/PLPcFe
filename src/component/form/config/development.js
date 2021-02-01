/** 开发环境配置 @author dongls */
import base from './base';

const development = {...base, ...{
  env: 'development',
  debug: true  
}}

export default development;
