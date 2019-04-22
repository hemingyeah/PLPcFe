import http from '@src/util/http';

function getProduct(params) {
  return http.post('/product/list/data', params)
}

/**
 * 获取产品模板列表数据
 * @param {Object} params - 参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 页面大小
 * @returns Promise<Team>
 */
function getProductTemplateList(params) {
  return http.get('/product/template/list/data', params);
}

export { 
  getProduct, 
  getProductTemplateList 
};