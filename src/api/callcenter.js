import http from '@src/util/http'
/**
 * 服务备注列表
 * @param {*} params 
 */
export function getFwRemarkList(params) {
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
 * 今日呼入通话记录
 * @param {*} params 
 */
export function getTodayCalledRecordList(params) {
  return http.get('/outside/callcenter/api/getTodayCalledRecordList', params)
}

/**
 * 今日呼出通话记录
 * @param {*} params 
 */
export function getTodayCallRecordList(params) {
  return http.get('/outside/callcenter/api/getTodayCallRecordList', params)
}

/**
 * 来电消息--联系人信息
 * @param {*} params 
 */
export function getLinkmanInfo(params) {
  return http.get('/outside/callcenter/customer/detail4CallCenterTab', params)
}

/**
 * 来电弹屏--服务备注--客户信息
 * @param {*} params 
 */
export function getCustomerInfo(params) {
  return http.get('/outside/callcenter/customer/detail4CallCenterRemark', params)
}

/**
 * 服务记录--历史工单
 * @param {*} params 
 */
export function getTaskHistoryList(params) {
  return http.get('/outside/callcenter/task/list4CallCenterHistory', params)
}

/**
 * 服务记录--历史服务事件
 * @param {*} params 
 */
export function getEventHistoryList(params) {
  return http.get('/outside/callcenter/event/list4CallCenterHistory', params)
}


