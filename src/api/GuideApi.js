import http from '@src/util/http';

/**
 * 设置用户向导
 * @param {Object} params - 参数
 * @param {String} params.profession - 行业信息: 制造业、互联网/IT、服务业、建筑家居、贸易零售、其他
 * @param {Array} params.role - 权限分配列表
 * role = [
 *  { id: '', userId: [ userId ] }
 * ]
 * @param {String} params.phone - 手机号
 * @param {String} params.code - 验证码
 * @returns 
 * {
 *  status: ,
 *   data: {String},  专属客服 qrcode 名称
 * }
 */
export function saveGuideSetting(params) {
  return http.post('/freeGuideCode/saveGuideSetting', params);
}

/**
 * 用户向导 超级管理员 发送短信 验证码
 * @param {String} phone - 手机号
 * @returns Promise<>
 */
export function freeGuideCode(phone) {
  return http.post('/freeGuideCode/code', phone, false);
}