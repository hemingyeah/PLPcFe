import http from '@src/util/http' 

/** 
 * @description 批量生成服务报告
 * @param {Object} params 参数对象
 * @param {Boolean} params.isPdf 是否是pdf格式
 * @param {string[]} params.taskIds 工单ids数组
 */
export function createServiceReportBatch(params = {}) {
  return http.post('/excels/createServiceReportBatch', params)
}