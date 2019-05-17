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

/**
 * 客户唯一性验证
 * @param {Object} params - 参数
 * @param {string} params.id - 客户id
 * @param {string} params.fieldName - 字段名
 * @param {string} params.value - 值
 * @returns 成功 - {error: message}， 失败 - {ok: ''}
 */
export function unique(params){
  return http.post('/customer/unique', params, false, {cancelable: false})
}

/**
 * 获取客户提醒
 * @param {Object} params - 参数
 * @param {String} params.modalId - customerId || productId
 * @param {String} params.modal - customer || product
 */
export function getRemindOfCustomer(params) {
  return http.get('/customer/remind/list', params)
}

/**
 *
 * @param {Object} params - 参数
 * @param {String} params.id - 记录id
 * @returns {*}
 */
export function deleteComment(params) {
  return http.post('/customer/deleteCustomerRecord', params, false)
}

/**
 *
 * @param {Object} params - 参数
 * @param {String} params.customerId - 客户id
 * @param {Number} params.pageSize -
 * @param {Number} params.pageNum -
 * @returns {*}
 */
export function getLinkmanOfCustomer(params) {
  return http.get('/customer/linkman/list', params)
}

/**
 *
 * @param {Object} params - 参数
 * @param {String} params.customerId - 客户id
 * @param {Number} params.pageSize -
 * @param {Number} params.pageNum -
 * @param {Number} params.keyword -
 * @returns {*}
 */
export function getUserTag(params) {
  return http.get('/customer/userTag/list', params)
}

/**
 * 统计给选中的客户发送短信的数量
 * @param {Object} params - 参数
 * @param {String} params.ids - 客户ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 */
export function computeSendNum(params) {
  return http.get('/customer/computeSendNum', params)
}


