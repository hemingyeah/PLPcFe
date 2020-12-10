import http from '@src/util/HttpUtil';

/** 
 * 获取版本号  
 * 1为老版本(vip版) 2基础版本 3企业版本
*/
export function getSettingEdition(params = {}) {
  return http.get('/setting/edition', params)
}

/******************** S 商品列表 ***************/

/**
 * 商品备件列表
 */
export const getShopSparepartRepertory =  (params = {}) => {
  return http.get('/api/part/outside/part/service/api/getShopSparepartRepertory', params)
}
/**
 * 是否启用橱窗
 */
export const updateIsShowOrIsShopWindows = (params = {}) => {
  return http.post('/api/part/outside/part/service/api/updateIsShowOrIsShopWindows', params, false)
}

/**
 * 商品服务列表
 */
export const serviceList= (params = {}) => {
  return http.get('/setting/market/service/list', params)
}

/**
 * 是否发布
 */
export const marketItem= (params = {}) => {
  return http.post('/setting/marketItem/save', params, false)
} 

/**
 * 获取备件设置
 */
export const sparepartConfig = () => {
  return http.post('/partV2/repertory/sparepartConfig')
}

/**
 * 获取仓库列表
 */
export const allRepertory = () => {
  return http.get('/partV2/repertory/allRepertory')
} 

/******************** E 商品列表 ***************/

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

/** 
 * 获取工单类型字段 不含被删除的系统字段
*/
export function getSettingTaskTypeEnabledFields(params) {
  return http.get('/setting/taskType/getEnabledFields', params)
}

/** 
 * 新建分配规则
*/
export function saveSettingDispatchRule(params) {
  return http.post('/setting/dispatchRule/task/save', params)
}

/******************** S 工单类型设置 ***************/

/**
 * 查询行业模板库记录
 */
export const getSysTaskTypeList = () => {
  return http.post('/setting/taskType/getSysList')
}
/******************** E 工单类型设置 ***************/
