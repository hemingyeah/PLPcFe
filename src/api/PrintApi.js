import http from '@src/util/http' 

/** 
 * @description 批量打印服务报告
 * @param {Object} params 参数对象
 * @param {string[]} params.taskIds 工单ids数组
 */
export function createServicePrintBatch(params = {}) {
  return http.post('/print/createServicePrintBatch', params)
}