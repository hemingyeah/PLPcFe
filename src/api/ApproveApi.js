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
  // return http.post('http://47.98.255.79:10002/approve/search', params) // 内部接口

  // --- 本地联调 start ---
  // params.tenantId = '7416b42a-25cc-11e7-a500-00163e12f748';
  // params.myId = 'd4384a18-8833-11e9-bfc9-00163e304a25';

  // return http.post('/outside/approve/search', params); // 本地联调
  // --- 本地联调 end ---

  // prod环境
  return http.post('/api/app/outside/approve/search', params); 
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

/**
 * 我能审核-转交接口
 * @param {String | Id} params.userId - 转交给的人id
 * @param {String} params.approveIds - 审核id列表
 */
function approversDeliver (params) {
  return http.post('/approve/approvers/deliver', params)
}

export {
  getInitiatorList,
  getEventTypeList,
  getTaskTypeList,
  getApproveList,
  applyApprove,
  getApplyApproveDetail,
  approversDeliver
}