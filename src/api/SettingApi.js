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

/** 
 * 获取用户列表
*/
export function getSettingUserList(params) {
  return http.get('/setting/user/list', params)
}

/** 
 * 获取角色列表
*/
export function getSettingRoleList(params) {
  return http.get('/setting/role/list', params)
}

/** 
 * 获取工单类型列表
*/
export function getSettingTaskTypeList(params) {
  return http.get('/setting/taskType/list', params)
}