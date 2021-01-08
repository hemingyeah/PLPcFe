import http from '@src/util/http';

let fixedPrefixPath = '/api/customer';
let fixedPrefixTaskPath = '/api/task';

/**
 * 客户自定义字段唯一校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 * @param {String} params params.id - 客户id （编辑必传）
 */
export function fieldRepeatCustomer(params: {} | undefined) {
  return http.post(`${fixedPrefixPath}/outside/pc/customer/field/repeat`, params);
}


/**
 * 产品自定义字段唯一校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 * @param {String} params params.id - 产品id （编辑必传）
 */
export function fieldRepeatProduct(params: {} | undefined) {
  return http.post(`${fixedPrefixPath}/outside/pc/product/field/repeat`, params);
}


/**
 * 产品模板自定义字段唯一校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 * @param {String} params params.id - 产品id （编辑必传）
 */
export function fieldRepeatProductTemplate(params: {} | undefined) {
  return http.post(`${fixedPrefixPath}/outside/pc/product/template/field/repeat`, params);
}

/**
 * 工单自定义字段唯一校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 * @param {String} params params.id - 工单id （编辑必传）
 * @param {String} params params.templateId - 工单类型id
 * @param {String} params params.isCommon - 是否是公共字段
 */
export function fieldRepeatTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/fieldRepeat`, params);
}

/**
 * 附加组件字段唯一性校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 */
export function fieldRepeatCard(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/cardFieldRepeat`, params);
}