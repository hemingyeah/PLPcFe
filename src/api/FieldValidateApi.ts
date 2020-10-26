import http from '@src/util/http';

let fixedPrefixPath = '/api/app';

/**
 * 客户自定义字段唯一校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 */
export function fieldRepeatCustomer(params: {} | undefined) {
  return http.post(`${fixedPrefixPath}/outside/pc/customer/field/repeat`, params);
}


/**
 * 产品自定义字段唯一校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 */
export function fieldRepeatProduct(params: {} | undefined) {
  return http.post(`${fixedPrefixPath}/outside/pc/product/field/repeat`, params);
}
