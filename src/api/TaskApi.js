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
 * 获取工单列表
 * @param {Object} params 
 * @param {String} params.view - 视图
 * @param {String} params.state - 工单状态
 * @param {String} params.planTime - 计划时间
 * @param {String} params.templateId - 工单类型id
 * @param {Number} params.startDistance - 距离起点
 * @param {Number} params.endDistance - 距离终点
 * @param {String} params.sortCondition - 排序标准
 * @param {String} params.isDescending - 是否降序
 * @param {String} params.myLatitude - 地理经度
 * @param {String} params.myLlongitude - 地理纬度
 * @param {Number} params.pageSize
 * @param {Number} params.pageNum
 * 
 * @returns Promise<List>
 */
export function getTaskList(params) {
  return http.post(`${prefixAppPath}/outside/dd/task/list/filter`, params);
}

/**
 * 获取工单列表
 * @param {Object} params 
 * @param {String} params.view - 视图
 * @param {String} params.planTime - 计划时间
 * @param {String} params.createTime - 创建时间
 * @param {String} params.templateId - 工单类型id
 * @param {Number} params.startDistance - 距离起点
 * @param {Number} params.endDistance - 距离终点
 * @param {String} params.latitude - 地理经度
 * @param {String} params.longitude - 地理纬度
 * @param {Number} params.pageSize
 * @param {Number} params.pageNum
 * 
 * @returns Promise<List>
 */
export function getTaskPoolList(params) {
  return http.post(`${prefixAppPath}/outside/dd/task/list/taskPool`, params);
}

/**
 * 获取工单列表
 * @param {Object} params 
 * @param {String} params.planTime - 计划时间
 * @param {String} params.createTime - 创建时间
 * @param {String} params.templateId - 工单类型id
 * @param {Number} params.startDistance - 距离起点
 * @param {Number} params.endDistance - 距离终点
 * @param {String} params.myLatitude - 地理经度
 * @param {String} params.myLlongitude - 地理纬度
 * 
 * @returns Promise<List>
 */
export function getTaskStateCount(params) {
  return http.post(`${prefixAppPath}/outside/dd/task/list/state/count`, params);
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
export function getTemplateFields(templateId, tableName = 'task') {
  return http.get('/task/getTaskTemplateFields', {
    tableName,
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
