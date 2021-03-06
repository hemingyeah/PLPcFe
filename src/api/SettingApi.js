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
export const serviceList = (params = {}) => {
  return http.get('/setting/market/service/list', params)
}

/**
 * 是否发布
 */
export const marketItem = (params = {}) => {
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

/** 
 * @description 检测版本某些功能数量是否超过限制
*/
export function checkNumExceedLimit(params) {
  return http.post('/setting/checkDataCount', params)
}

/******************** S 工单类型设置 ***************/

/**
 * 查询行业模板库记录
 */
export function getSysTaskTypeList() {
  return http.post('/setting/taskType/getSysList');
}

/**
 * 工单类型排序
 * 
 * @param {object} params 工单类型排序
 */
export function taskTypeOrder(params) {
  return http.post('/task/taskTypeOrder/update', params);
}


/**
 * 启用/关闭工单类型
 * 
 * @param {string} params.id 工单类型id
 * @param {number} params.enabled 工单类型开启/关闭
 */
export function taskTypeEnable(params) {
  return http.post('/setting/taskType/enable', params, false);
}

/**
 * 删除工单类型
 * 
 * @param {string} params.typeId 工单类型id  
 */
export function delTaskType(params) {
  return http.post('/setting/taskType/delete', params, false);
}

/**
 * 更新工单类型可用团队
 * 
 * @param {string} params.id 工单类型id  
 * @param {string} params.tagIds 可用团队id (英文逗号分割)
 */
export function changeTags(params) {
  return http.post('/setting/taskType/changeTags', params, false);
}

/**
 * 创建工单类型
 * 
 * @param {string} params.typeName 工单类型名称
 * @param {string} params.templateId 模板id  
 * @param {string} params.color 颜色
 */
export function createTaskType(params) {
  return http.post('/setting/taskType/create', params, false);
}

/**
 * 创建工单类型 (新版)
 * 
 * @param {string} params.typeName 工单类型名称
 * @param {string} params.templateId 模板id  
 * @param {string} params.color 颜色
 */
export function createInitTaskType(params) {
  return http.post('/setting/taskType/init/create', params, false);
}

/**
 * 根据行业模板创建工单类型
 * 
 * @param {string} params.taskTypeId 行业模板id
 * @param {string} params.taskTypeName 工单类型名称  
 * @param {string} params.color 颜色
 */
export function importTaskType(params) {
  return http.post('/setting/taskType/import', params, false);
}

/**
 * 启用或禁用工单流程
 * 
 * @param {string} params.id 工单类型id  
 * @param {boolean} params.status 状态 
 * @param {string} params.flowName 流程 
 */
export function flowSwitchTaskType(params) {
  return http.post('/setting/taskType/flowSwitch', params, false);
}

/**
 * 流程设置保存
 * 
 * @param {string} params （yapi: http://30.40.61.216:3000/project/59/interface/api/14327）
 */
export function saveProcess(params) {
  return http.post('/setting/saveProcess', params);
}

/**
 * 高级设置页保存
 * 
 * @param {string} params.templateId 工单类型id
 * @param {string} params.saveOptionFormList 设置服务报告和打印功能	  
 * @param {string} params.typeConfigForms 水印设置和位置异常提示设置	
 */
export function advancedSetting(params) {
  return http.post('/setting/taskType/advancedSetting', params);
}

/**
 * 获取工单类型设置列表 （包含最大可设置的工单数、所有团队列表）
 */
export function getTaskTypeManage(params) {
  return http.get('/setting/taskType/getTaskTypeManage', params);
}

/**
 * 获取工单表单、回执表单中必填的人员字段
 * 
 * @param {String} id 工单类型id 
 */
export function getFromUser(id) {
  return http.get(`/setting/getFromUser/${id}`);
}

/******************** E 工单类型设置 ***************/
