import http from '@src/util/http';

/** 
 * 获取公众号通知列表，用于客户编辑
 * @param {string} id - 客户id
 * @returns Promise<Customer>
 */
export function getToastWxList(params) {
  return http.post('/outside/weixin/msg/getTemplateMsgList', params)
}