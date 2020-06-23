import http from '@src/util/http'

let fixedPrefixAppPath = '/api/app'

/**
 * 获取工单类型
 */
export function taskType(){
  return http.get(`${fixedPrefixAppPath}/outside/dd/task/types`);
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

/** 
 * @description 通过联系人id获取地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.lmId -- 产品id
*/
export function getLmBindAddress(params) {
  return http.get('/task/getLmBindAddress', params);
}

/** 
 * @description 获取新建客户相关数据
*/
export function getCreateCustomerData(params) {
  return http.get('/customer/editGetData', params);
}

/** 
 * @description 获取新建产品相关数据
*/
export function getCreateProductData(params) {
  return http.get('/customer/product/editGetData', params);
}

/** 
 * @description 获取备件配置信息
*/
export function getSparepartConfig(params) {
  return http.post('/partV2/repertory/sparepartConfig', params);
}

/** 
 * @description 获取备件仓库列表数据
*/
export function getRepertoryList(params) {
  return http.get('/task/repertory', params);
}

/** 
 * @description 编辑回执表单
*/
export function editReceipt(params) {
  return http.post('/task/editReceipt', params);
}