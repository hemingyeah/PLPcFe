import http from '@src/util/http';

/**
 * 获取工作通知列表
 * @param {Object} params - 参数
 * @param {String} params.source - 来源
 * @param {String} params.startTime - 开始时间
 * @param {String} params.endTime - 结束时间
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * 
 * @returns Promise<JobList>
 */
export function getJobList(params) {
  return http.get('/message/work/getWorkMessage', params);
  // return Promise.resolve({

  // })
}

/**
 * 获取系统通知列表
 * @param {Object} params - 参数 
 * @param {String} params.source - 来源
 * @param {String} params.startTime - 开始时间
 * @param {String} params.endTime - 结束时间
 * @param {Number} params.pageNum - 页数
 * @param {Number} params.pageSize - 每页条数
 * 
 * @returns Promise<SystemList>
 */
export function getSystemList(params) {
  return http.get('/message/system/getSystemMessage', params);
}

/**
 * 消息标记已读
 * @param {Object} params - 参数
 * @param {String} params.type - 类型
 * @param {String} params.primaryId - 实体Id 
 * 
 * @returns Promise<res>
 */
export function haveRead(params) {
  return http.post('/message/updateMsgState', params, false);
}

/**
 * 删除通知
 * @param {Object} params - 参数
 * @param {String} params.type - 类型
 * @param {String} params.primaryId - 实体Id
 * 
 * @returns Promise<res> 
 */
export function deleteNotification(params) {
  return http.post('/message/deleteMessage', params, false);
}

/**
 * 轮询查询系统消息，未读通知条数
 *
 * @returns Promise<message>  
 */
export function getSystemMessage() {
  return http.get('/message/getSystemByPCStatus');
}


let url_head = '/api/app/outside'

// 轮询获取最新消息以及数量
export function newGetMessage(params) {
  return http.get(`${url_head}/message/v1/last`, params)
}

// 获取不同种类的通知消息
export function newGetMessageGroup(params) {
  return http.get(`${url_head}/message/v1/group`, params)
}

// 获取不同种类的通知消息列表
export function newGetMessageQuery(params) {
  return http.get(`${url_head}/message/v1/query`, params)
}

// 标记为已读
export function newGetMessageMark(params) {
  return http.post(`${url_head}/message/v1/state/mark`, params)
}