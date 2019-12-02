import http from '@src/util/http';

/** ------------ start 产品 ----------------------- */
/**
 * 获取产品列表
 * @param params
 * @returns {*}
 */
function getProduct(params) {
  return http.post('/customer/product/list/data', params)
}

/**
 * 创建产品
 * @param params
 * @returns {*}
 */
function createProduct(params) {
  return http.post('/customer/product/create/action', params);
}

/**
 * 更新产品
 * @param params
 * @returns {*}
 */
function updateProduct(params) {
  return http.post('/customer/product/updateProduct', params);
}

/**
 * 删除产品
 * @param ids String ids = [id].join(',')
 * @returns {*}
 */
function deleteProductByIds(ids) {
  return http.post('/customer/product/deleteBatch', { ids})
}

/**
 * 检查产品编号的唯一性
 * @param params
 * @param params.serialNumber
 * @param params.id
 * @returns {*}
 */
function checkSerialNumber(params) {
  return http.post('/customer/product/checkUniqueForSerialNumber', params, false);
}

/**
 * 选择产品批量发送短信
 * @param {Object} params - 参数
 * @param {String} params.smsTemplateId - 短信模板id
 * @param {String} params.ids - 产品ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 * @param {Date} params.sendTime - 发送时间
 */
function sendSmsBatch(params) {
  return http.post('/customer/product/sendSmsBatch', params, false)
}

/**
 * 统计给选中的产品发送短信的数量
 * @param {Object} params - 参数
 * @param {String} params.ids - 产品ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 */
function computeSendNumForProduct(params) {
  return http.post('/customer/product/computeSendNum', params)
}

/**
 * 统计给选中的产品发送短信的数量
 * @param {Object} params - 参数
 * @param {String} params.ids - 产品ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 */
function editBatchProduct(params) {
  return http.post('/customer/product/editBatch', params, false)
}

/**
 * 获取产品提醒模板
 */
function getProductRemindTemplate() {
  return http.get('/customer/product/remind/list')
}

/**
 * 获取产品详情
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getProductDetail(params) {
  return http.get('/customer/product/detail/data', params)
}

/**
 * 获取产品相关事件
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getEventOfProduct(params) {
  return http.get('/customer/product/event/list', params)
}

/**
 * 获取产品相关工单
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getTaskOfProduct(params) {
  return http.get('/customer/product/task/list', params)
}

/**
 * 获取产品相关计划任务
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getPlanOfProduct(params) {
  return http.get('/customer/product/plantask/list', params)
}

/**
 * 获取产品记录
 * @param {Object} params - 参数
 * @param {String} params.primaryId - 产品id
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 页面大小
 */
function getRecordOfProduct(params) {
  return http.get('/customer/product/record/list', params)
}

/**
 * 创建产品备注
 * @param {Object} params - 参数
 * @param {String} params.primaryId - 产品id
 * @param {String} params.primaryName - 产品名称
 * @param {Number} params.showInOwn - 是否自己可见
 * @param {Array} params.attachments - 附件
 * @param {Object} params.content - 内容
 * @param {Object} params.content.updateContent - 内容
 * @param {Object} params.content.updateType - 'pRecord'
 */
function commentProduct(params) {
  return http.post('/customer/product/record/create', params)
}

/**
 * 获取产品最近的一条更新记录
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 */
function getUpdateRecord(params) {
  return http.get('/customer/product/getLatestOne', params)
}

/**
 * 删除二维码
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 */
function unbindQrcode(params) {
  return http.post('/product/unbindQrcode', params, false)
}

/**
 * 绑定二维码
 * @param {Object} params - 参数
 * @param {Boolean} params.addQrcodeId - 是否附带qrocdeId
 * @param {Boolean} params.addTenant - 是否附带公司简称
 * @param {String} params.qrocdeId - 二维码id
 */
function bindQrcode(params) {
  return http.get('/product/bindQrcode', params)
}


/**
 * 下载二维码
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 * @param {String} params.qrocdeId - 二维码id
 */

function downloadQrcode(params) {
  return http.get('/product/downloadOneQrcode', params)
}

/**
 * 获取产品详情统计数据
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 * @return Promise<>
 */

function productStatisticsInit(params) {
  return http.get('/customer/product/statistics/init', params)
}

/** ------------ end 产品 ----------------------- */


/** ------------ start 产品模板 ----------------------- */
/**
 * 获取产品模板列表数据
 * @param {Object} params - 参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 页面大小
 * @returns Promise<>
 */
function getProductTemplateList(params) {
  return http.post('/product/list/data', params);
}

/**
 * 删除产品模板
 * @param {String} ids - id字符串，以,分隔
 * @returns Promise<>
 */
function productTemplateDelete(ids) {
  return http.post(`/product/delete/${ids}`);
}

/**
 * 产品模板批量编辑
 * @param {Object} params.mapJson - 编辑的数据
 * @param {String} params.ids - id字符串，以,分隔
 * @returns Promise<>
 */
function productTemplateEditBatch(params) {
  return http.post('/product/editBatch', params, false);
}

/**
 * 新建产品模板
 * @param {Object} params - 参数
 * @returns Promise<>
 */
function productTemplateCreate(params) {
  return http.post('/product/create/action', params);
}

/**
 * 修改编辑产品模板
 * @param {Object} params - 参数
 * @returns Promise<>
 */
function productTemplateUpdate(params) {
  return http.post('/product/update', params);
}

/**
 * 查询单个产品模板信息
 * @param {String} params.id -- 产品模板id
 * @returns Promise<>
 */
function getProductTemplate(id) {
  return http.get(`/product/detail/data/${id}`);
}


/**
 * 查询产品模板 信息动态
 * @param {String} params.id -- 产品模板id
 * @param {Number} params.pageNum
 * @param {Number} params.pageSize
 * @returns Promise<>
 */
function getProductTemplateRecord(params) {
  return http.get('/product/record/list', params);
}

/**
 * 产品模板 添加备注
 * @returns Promise<>
 */
function productTemplateCreateRecord(params) {
  return http.post('/product/record/create', params);
}

/**
 * 产品模板 删除备注
 * @param {String} params.id -- 备注id
 * @returns Promise<>
 */
function productTemplateDeleteRecord(params) {
  return http.post('/customer/deleteCustomerRecord', params, false);
}

/**
 * 获取产品模板关联的产品
 * @param {String} params.templateId -- 产品模板id
 * @param {Number} params.pageNum
 * @param {Number} params.pageSize
 * @returns Promise<>
 */
function productTemplateRelatedProducts(params) {
  return http.get('/product/relatedProducts', params);
}

/** ------------ end 产品模板 ----------------------- */

export {
  getTaskOfProduct,
  getPlanOfProduct,
  getRecordOfProduct,
  commentProduct,
  getProductDetail,
  getEventOfProduct,
  getProduct,
  getUpdateRecord,
  createProduct,
  updateProduct,
  unbindQrcode,
  bindQrcode,
  downloadQrcode,
  checkSerialNumber,
  productStatisticsInit,
  getProductTemplateList,
  productTemplateDelete,
  productTemplateEditBatch,
  productTemplateCreate,
  productTemplateUpdate,
  getProductTemplate,
  getProductTemplateRecord,
  productTemplateCreateRecord,
  productTemplateDeleteRecord,
  productTemplateRelatedProducts,
  sendSmsBatch,
  computeSendNumForProduct,
  deleteProductByIds,
  editBatchProduct,
  getProductRemindTemplate,
};