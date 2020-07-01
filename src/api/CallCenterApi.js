import http from '@src/util/http'
/**
 * 开通申请
 * @param {*} params 
 */
export function saveAccount(params) {
  return http.post('/outside/callcenter/api/saveAccount', params, false)
}

/**
 * 获取是否申请开通
 * @param {*} params 
 */
export function getAccountInfo(params = {}) {
  return http.get('/outside/callcenter/api/getAccountInfo', params)
}

/**
 * 添加成员
 * @param {*} params 
 */
export function saveAgent(params) {
  return http.post('/outside/callcenter/api/saveAgent', params, false)
}

/**
 * 获取坐席列表
 * @param {*} params 
 */
export function getAgentList(params = {}) {
  return http.get('/outside/callcenter/api/getAgentList', params)
}

/**
 * 坐席修改提交
 * @param {*} params 
 */
export function updateAgent(params) {
  return http.post('/outside/callcenter/api/updateAgent', params, false)
}

/**
 * 坐席删除
 * @param {*} params 
 */
export function deleteAgent(params) {
  return http.post('/outside/callcenter/api/deleteAgent', params, false)
}

/**
 * 坐席开关
 * @param {*} params 
 */
export function updateStatus(params) {
  return http.post('/outside/callcenter/api/updateStatus', params, false)
}

/**
 * 添加/修改一级/二级分类
 * @param {*} params 
 */
export function saveZxSort(params) {
  return http.post('/outside/callcenter/api/saveZxSort', params, false)
}

/**
 * 获取咨询分类列表
 * @param {*} params 
 */
export function getZxSortList(params = {}) {
  return http.get('/outside/callcenter/api/getZxSortList', params)
}

/**
 * 删除咨询分类
 * @param {*} params 
 */
export function deleteZxSort(params) {
  return http.post('/outside/callcenter/api/deleteZxSort', params, false)
}

/**
 * 服务备注列表
 * @param {*} params 
 */
export function getFwRemarkList(params = {}) {
  return http.get('/outside/callcenter/api/getFwRemarkList', params)
}

/**
 * 添加服务备注
 * @param {*} params 
 */
export function saveFwRemark(params) {
  return http.post('/outside/callcenter/api/saveFwRemark', params, false)
}

/**
 * 删除服务备注
 * @param {*} params 
 */
export function deleteFwRemark(params) {
  return http.post('/outside/callcenter/api/deleteFwRemark', params, false)
}

/**
 * 今日通话记录
 * @param {*} params 
 */
export function getTodayCallRecordList(params = {}) {
  return http.get('/outside/callcenter/api/getTodayCallRecordList', params)
}

/**
 * 来电消息--联系人信息
 * @param {*} params 
 */
export function getLinkmanInfo(params = {}) {
  return http.get('/customer/detail4CallCenterTab', params)
}

/**
 * 来电弹屏--服务备注--客户信息
 * @param {*} params 
 */
export function getCustomerInfo(params = {}) {
  return http.get('/customer/detail4CallCenterRemark', params)
}

/**
 * 服务记录--历史通话
 * @param {*} params 
 */
export function getHistoryCallRecordList(params = {}) {
  return http.get('/outside/callcenter/api/getHistoryCallRecordList', params)
}

/**
 * 删除今日通话记录
 * @param {*} params 
 */
export function deleteTodayCallRecord(params = {}) {
  return http.post('/outside/callcenter/api/deleteTodayCallRecord', params, false)
}

/**
 * 服务记录--历史工单
 * @param {*} params 
 */
export function getTaskHistoryList(params = {}) {
  return http.get('/task/list4CallCenterHistory', params)
}

/**
 * 服务记录--历史服务事件
 * @param {*} params 
 */
export function getEventHistoryList(params = {}) {
  return http.get('/event/list4CallCenterHistory', params)
}

/**
 * 呼叫中心状态
 * @param {*} params 
 */
export function getTodayCallState(params = {}) {
  return http.get('/outside/callcenter/api/getTodayCallState', params)
}

/**
 * 今日统计
 * @param {*} params 
 */
export function getTodayStatisticsRecord(params = {}) {
  return http.get('/outside/callcenter/api/getTodayStatisticsRecord', params)
}

/**
 * 通话记录
 * @param {*} params 
 */
export function getRecordList(params = {}) {
  return http.post('/outside/callcenter/api/recordList', params)
}
/**
 * 通话记录详情
 * @param {*} params 
 */
export function getCallRecord(params = {}) {
  return http.get('/outside/callcenter/api/getCallRecord', params)
}

/**
 * 类型呼出
 * @param {*} params 
 */
export function dialout(params = {}) {
  return http.post('/outside/callcenter/api/dialout', params, false)
}

/**
 * 未接来电修改处理状态
 * @param {*} params 
 */
export function updateHandleStatus(params = {}) {
  return http.post('/outside/callcenter/api/updateHandleStatus', params, false)
}

/**
 * 获取今日该号码来电数和归属地
 * @param {*} params 
 */
export function getTodayNormalCount(params = {}) {
  return http.get('/outside/callcenter/api/getTodayNormalCount')
}


