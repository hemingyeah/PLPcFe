import http from '@src/util/http';

/** 
 * 获取客户信息，用于客户编辑
 * @param {string} id - 客户id
 * @returns Promise<Customer>
 */
export function getForEdit(id) {
  return http.get('/customer/getForEdit', {id})
}

/**
 * 获取客户最新的一条可见日志
 * @param {string} customerId - 客户id
 * @returns Promise<Customer>
 */
export function getUpdateRecord(customerId){
  return http.get('/customer/record/latestOne', customerId)
}

/**
 * 切换客户关注状态
 * @param {object} params - 参数
 * @param {string} params.customerId - 客户id
 * @param {string} params.module - 客户模块： customer
 * @param {string} params.action - 行为, 值为: 关注 或 取消关注
 */ 
export function toggleAttention(params){
  return http.post('/customer/record/attention/customer', params, false)
}

/** 
 * 查询某一客户的已关注列表
 * @param {object} params - 参数
 * @param {string} params.customerId - 客户id
 * @returns MsgModal<ArrayList<Map>>
 */
export function attentionList(params){
  return http.get('/customer/record/attention/list', params)
}

/**
 * 取消某些用户对某客户的关注
 * @param {object} params - 参数
 * @param {string} params.customerId - 客户id
 * @param {string} params.userIds - 用户ids, 使用`,`拼接
 */
export function cancelAttention(params){
  return http.post('/customer/record/attention/delete/customer_ids', params, false);
}
/**
 * 自动匹配团队
 * @param {Object} params - 参数
 * @param {string} params.province - 省
 * @param {string} params.city - 市
 * @param {string} params.dist - 区
 * 
 * @returns MsgModal<List<Team>> 匹配后的数据
 */
export function matchTag(params){
  return http.get('/customer/tagMatch', params)
}

