import http from '@src/util/HttpUtil';

/** 
 * 获取版本号  
 * 1为老版本(vip版) 2基础版本 3企业版本
*/
export function getSettingEdition(params = {}) {
  return http.get('/setting/edition', params)
}

/** 
 * 获取用户状态
*/
export function getStateColorMap() {
  return http.get('/setting/getStateColorMap')
}