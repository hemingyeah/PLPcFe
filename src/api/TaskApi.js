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
 * 工单表单 关联字段
 * module为 customer/product 
 * id为已选择的客户或产品的id，选择的产品数量=1的时候才去查值赋值
 * fieldName和formType填这种字段setting里存的值
 * @param {*} params = {String module,String id,String fieldName,String formType}
 */
export function relatedFieldValue(params) {
  return http.get('/dd/task/relatedFieldValue', params)
}

/** 
 * @description 获取工单表单数据
 * @param {Object} params-- params
 * @param {String} params.tableName -- 表名
 * @param {String} params.templateId -- 类型模板id
*/

export function getTaskTemplateFields(params) {
  return http.get('/task/getTaskTemplateFields', params)
}

/** 
 * @description 查询客户产品关联字段
 * @param {Object} params -- 参数对象
 * @param {String} params.module -- 模块 customer/product
 * @param {String} params.id -- 客户id
 * @param {String} params.fieldName -- 字段名称
 * @param {String} params.formType -- 字段类型
*/
export function getTaskRelatedInfo(params) {
  return http.get('/task/getRelatedInfo', params)
}

/** 
 * @description 获取客户数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
*/
export function getTaskCustomerList(params) {
  return http.get('/task/customer/list', params)
}

/** 
 * @description 获取客户产品数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
*/
export function getTaskCustomerProduct(params) {
  return http.get('/task/customer/product', params);
}

/** 
 * @description 获取客户联系人数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
*/
export function getTaskCustomerLinkman(params) {
  return http.get('/api/elasticsearch/outside/es/linkman/list', params);
}

/** 
 * @description 获取客户地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
*/
export function getTaskCustomerAddress(params) {
  return http.get('/task/customer/address', params);
}

/** 
 * @description 获取客户联系人和地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.customerId -- 客户id
 * @param {String} params.productId -- 产品id
 * @param {String} params.notNull -- 分页数
*/
export function getTaskDefaultInfo(params) {
  return http.get('/task/defaultInfo', params);
}

/** 
 * @description 通过产品id获取客户数据
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 产品id
*/
export function getCustomerByProduct(params) {
  return http.get('/customer/product/detail/data', params);
}
