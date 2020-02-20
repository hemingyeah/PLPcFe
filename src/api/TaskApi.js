import http from '@src/util/http'

let prefixAppPath = '/api/app' // todo add switcher
let fixedPrefixAppPath = '/api/app'
let prefixSearchPath = '/api/search'

// eslint-disable-next-line no-undef
if (process && process.env === 'development') {
  prefixAppPath = ''
  prefixSearchPath = ''
}
/**
 * 删除计划任务
 * @param {Object} params - 参数
 * @param {Array} params.ids - 计划id
 */
export function deletePlanTask(params) {
  return http.post('/task/deletePlanTask', params, false)
}

/**
 * 获取全部工单类型
 */
export function taskType() {
  return http.get(`${fixedPrefixAppPath}/outside/dd/task/types`)
}

/**
 * 获取某一工单类型下的字段
 * @param {*} templateId - 工单类型id
 * @returns [fields]
 */
export function getTemplateFields(templateId) {
  return http.get('/task/getTaskTemplateFields', {
    tableName: 'task',
    templateId
  })
}

/**
 * 工单表单 关联字段
 * module为 customer/product 
id为已选择的客户或产品的id，选择的产品数量=1的时候才去查值赋值
fieldName和formType填这种字段setting里存的值
 * @param {*} params = {String module,String id,String fieldName,String formType}
 */
export function relatedFieldValue(params) {
  return http.get('/dd/task/relatedFieldValue', params)
}
