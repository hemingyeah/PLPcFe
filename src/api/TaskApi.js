import http from '@src/util/http';

/**
 * 删除计划任务
 * @param {Object} params - 参数
 * @param {Array} params.ids - 计划id
 */
function deletePlanTask(params) {
  return http.post('/task/deletePlanTask', params, false)
}

export {
  deletePlanTask
}
