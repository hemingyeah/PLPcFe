import http from '@src/util/http';

let fixedPrefixPath = '';

/**
 * 客户自定义字段唯一校验
 * @param {Object} params - 参数
 * @param {String} params params.fieldName - 自定义字段fieldName
 * @param {String} params params.fieldValue - 自定义字段value
 * @param {String} params params.id - 客户id （编辑必传）
 */
export function useDetail(params: {} | undefined) {
  return http.post(`${fixedPrefixPath}/webregister/outside/register/useDetail`, params);
}

