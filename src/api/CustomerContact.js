import http from '@src/util/http';
let urlHead = "/api/elasticsearch"

/** 
 * 获取客户联系人列表，用于客户编辑
 * @param {string} id - 客户id
 * @returns Promise<Customer>
 */
export function getContactList(params) {
  return http.post(`${urlHead}/outside/es/linkman/searchLinkManByTid`, params)
}