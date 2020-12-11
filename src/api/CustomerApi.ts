import http from '@src/util/http'
import GrayUtil from '@src/util/gray'

import { getCustomerDetailResult } from "@model/param/out/Customer"

/** 
 * 获取客户信息
 * @param {string} id - 客户id
 * @returns Promise<Customer>
 */
export function getCustomer(id: string): Promise<getCustomerDetailResult> {
  return http.get('/customer/get', { id })
}

/** 
 * 获取客户信息，用于客户编辑
 * @param {string} id - 客户id
 * @returns Promise<Customer>
 */
export function getForEdit(id: any) {
  return http.get('/customer/getForEdit', {id})
}

/**
 * 获取客户最新的一条可见日志
 * @param {string} customerId - 客户id
 * @returns Promise<Customer>
 */
export function getUpdateRecord(customerId: {} | undefined){
  return http.get('/customer/record/latestOne', customerId)
}

/**
 * 切换客户关注状态
 * @param {object} params - 参数
 * @param {string} params.customerId - 客户id
 * @param {string} params.module - 客户模块： customer
 * @param {string} params.action - 行为, 值为: 关注 或 取消关注
 */ 
export function toggleAttention(params: {} | undefined){
  return http.post('/customer/record/attention/customer', params, false)
}

/** 
 * 查询某一客户的已关注列表
 * @param {object} params - 参数
 * @param {string} params.customerId - 客户id
 * @returns MsgModal<ArrayList<Map>>
 */
export function attentionList(params: {} | undefined){
  return http.get('/customer/record/attention/list', params)
}

/**
 * 取消某些用户对某客户的关注
 * @param {object} params - 参数
 * @param {string} params.customerId - 客户id
 * @param {string} params.userIds - 用户ids, 使用`,`拼接
 */
export function cancelAttention(params: {} | undefined){
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
export function matchTag(params: {} | undefined){
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
export function unique(params: {} | undefined){
  return http.post('/customer/unique', params, false, {cancelable: false})
}

/**
 * 获取客户提醒
 * @param {Object} params - 参数
 * @param {String} params.modalId - customerId || productId
 * @param {String} params.modal - customer || product
 */
export function getRemindOfCustomer(params: {} | undefined) {
  return http.get('/customer/remind/list', params)
}

/**
 *
 * @param {Object} params - 参数
 * @param {String} params.id - 记录id
 * @returns {*}
 */
export function deleteComment(params: {} | undefined) {
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
export function getLinkmanOfCustomer(params: {} | undefined) {
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
export function getUserTag(params: {} | undefined) {
  return http.get('/customer/userTag/list', params)
}

/**
 * 统计给选中的客户发送短信的数量
 * @param {Object} params - 参数
 * @param {String} params.ids - 客户ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 */
export function computeSendNum(params: {} | undefined) {
  return http.post('/customer/computeSendNum', params)
}

/**
 * 选择客户批量发送短信
 * @param {Object} params - 参数
 * @param {Number} params.smsTemplateId - 短信模板id
 * @param {String} params.ids - 产品ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 * @param {Date} params.sendTime - 发送时间
 */
export function sendSmsBatch(params: {} | undefined) {
  return http.post('/customer/sendSmsBatch', params, false);
}

/**
 * 批量编辑客户的某个字段
 * @param {Object} params - 参数
 * @param {String} params params.ids - 客户ids
 * @param {String} params params.mapJson - 修改值
 * @returns {*}
 */
export function batchEditCustomer(params: {} | undefined) {
  return http.post('/customer/editBatch', params, false);
}

/**
 * 获取客户列表
 * @param {Object} params - 参数
 * @returns {*}
 */
export function getCustomerListAsyn(params: {} | undefined) {
  let customerPreFixedPath = GrayUtil.getCustomerApiPath();
  return http.get(`${customerPreFixedPath}/customer/getListAsyn`, params);
}

/**
 * 根据客户id获取客户信息和客户负责人信息和开关
 * @param {Object} params - 参数
 * @param {String} params.id - 客户di
 */
export function getCustomerExeinsyn(params: {} | undefined) {
  return http.get('/customer/exeinsyn/get', params, false);
}

/**
 * 查询客户列表
 * @param {Object} params - 参数
 */
export function getCustomerList(params: {} | undefined) {
  let customerPreFixedPath = GrayUtil.getCustomerApiPath();
  return http.post(`${customerPreFixedPath}/customer/list`, params);
}

/**
* 客户表单字段列表
* @param {Object} params - 参数
* @param {String} params.isFromSetting - 是否用于设置页，是：true 否：false
*/
export function getCustomerFields(params: {} | undefined) {
  return http.get('/customer/getCustomerFields', params);
}
