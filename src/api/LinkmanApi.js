import http from '../util/http'

/**
 * 联系人手机号码唯一性验证
 * @param {Object} params - 参数
 * @param {String} params.customerId - 客户id
 * @param {String} params.phone - 手机号码
 */
export function checkUnique4Phone(params){
  return http.post('/linkman/checkUnique4Phone', params, false)
}