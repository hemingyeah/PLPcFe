import http from '@src/util/http';

function getProduct(params) {
  return http.post('/product/list/data', params, false)
}

/**
 * 获取产品模板列表数据
 * @param {Object} params - 参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 页面大小
 * @returns Promise<>
 */
function getProductTemplateList(params) {
  return http.post('/product/template/list/data', params, false);
}

/**
 * 新建产品模板
 * @param {Object} params - 参数
 * @returns Promise<>
 */
function productTemplateCreate(params) {
  return http.get('/product/template/create', params);
}

/**
 * 修改编辑产品模板
 * @param {Object} params - 参数
 * @returns Promise<>
 */
function productTemplateUpdate(params) {
  return http.get('/product/template/update', params);
}

/**
 * 查询单个产品模板信息
 * @param {String} params.id -- 产品模板id
 * @returns Promise<>
 */
function getProductTemplate(params) {
  return http.get('/product/template/detail/data', params);
}

/**
 * 查询单个产品模板统计信息
 * @param {String} params.id -- 产品模板id
 * @returns Promise<>
 */
function getProductTemplateStatisticsInit(params) {
  return http.get('/product/template/statistics/init', params);
}

/**
 * 查询产品模板 信息动态
 * @param {String} params.id -- 产品模板id
 * @returns Promise<>
 */
function getProductTemplateRecord(params) {
  return http.get('/product/ptRecord', params);
}

/**
 * 产品模板 添加备注
 * @returns Promise<>
 */
function productTemplateCreateRecord(params) {
  return http.post('/product/template/createRemark', params);
}

/**
 * 产品模板 删除备注
 * @param {String} params.id -- 备注id
 * @returns Promise<>
 */
function productTemplateDeleteRecord(params) {
  return http.post('/product/template/deleteRemark', params);
}

export {
  getProduct,
  getProductTemplateList,
  productTemplateCreate,
  productTemplateUpdate,
  getProductTemplate,
  getProductTemplateStatisticsInit,
  getProductTemplateRecord,
  productTemplateCreateRecord,
  productTemplateDeleteRecord,
};