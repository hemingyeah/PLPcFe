import http from '@src/util/http';

/**
 * 删除计划任务
 * @param {Object} params - 参数
 * @param {Array} params.ids - 计划id
 */
export function deletePlanTask(params) {
  return http.post('/task/deletePlanTask', params, false)
}

/**
 * 获取某一工单类型下的字段
 * @param {*} templateId - 工单类型id
 * @returns [fields]
 */
export function getTemplateFields(templateId){
  return http.get('/task/getTaskTemplateFields', {tableName: 'task', templateId})
}