import http from '@src/util/http';


/**
 * 获取发起人列表
 * @param {Object} params - 参数
 * @param {String} params.keyword - 关键字
 * @param {String} params.pageNum - 页码
 * @param {String} params.pageSize - 页数据
 */
function getInitiatorList (params) {
  return http.get('/task/user/list', params);
}

/**
 * 获取事件类型列表
 * @param {Object} params 参数
 * @param {String} params.keyword - 关键字
 * @param {String} params.pageNum - 页码
 * @param {String} params.pageSize - 页数据
 */
function getEventTypeList (params) {
  return http.get('/approve/eventType/allList', params);
}

/**
 * 获取工单类型列表
 * @param {Object} params 参数
 * @param {String} params.keyword - 关键字
 * @param {String} params.pageNum - 页码
 * @param {String} params.pageSize - 页数据
 */
function getTaskTypeList (params) {
  return http.get('/approve/taskType/allList', params);
}

/**
 * 获取审批数据列表
 * @param {Object} params 
 */
function getApproveList (params) {
  return http.post('/api/search/outside/approve/search', params);
}

/**
 * 执行审批操作
 * @param {String | Id} params.id - 审批条目id
 * @param {String} params.result - 审批结果 'success' or 'fail'
 * @param {String} params.approveRemark - 审批备注
 */
function applyApprove (params) {
  return http.post('/approve/saveResult', params)
}

/**
 * 获取审批详情（执行审批时）
 */
function getApplyApproveDetail (params) {
  return http.get('/approve/get', params)
}

export {
  getInitiatorList,
  getEventTypeList,
  getTaskTypeList,
  getApproveList,
  applyApprove,
  getApplyApproveDetail
}