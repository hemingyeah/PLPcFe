import http from '@src/util/http';
import GrayUtil from '@src/util/gray';
let de_headUrl = '';
let headUrl = '/api/customer/outside/pc'
let headUrl2 = '/api/elasticsearch/outside/es'

/** ------------ start 产品 ----------------------- */
/**
 * 获取产品列表
 * @param params
 * @returns {*}
 */
function getProduct(params) {
  return http.post('/customer/product/list/data', params)
  
}

function getProductV2(params) {
  return http.post(`${headUrl2}/product/pageList`, params)
}

/**
 * 创建产品
 * @param params
 * @returns {*}
 */
function createProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/create/action`, params);
}

/**
 * 更新产品
 * @param params
 * @returns {*}
 */
function updateProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/updateProduct`, params);
}

/**
 * 删除产品
 * @param ids String ids = [id].join(',')
 * @returns {*}
 */
function deleteProductByIds(ids) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/deleteBatch`, { ids})
}

/**
 * 检查产品编号的唯一性
 * @param params
 * @param params.serialNumber
 * @param params.id
 * @returns {*}
 */
function checkSerialNumber(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/checkUniqueForSerialNumber`, params, false);
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
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/sendSmsBatch`, params, false)
}

/**
 * 统计给选中的产品发送短信的数量
 * @param {Object} params - 参数
 * @param {String} params.ids - 产品ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 */
function computeSendNumForProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/computeSendNum`, params)
}

/**
 * 统计给选中的产品发送短信的数量
 * @param {Object} params - 参数
 * @param {String} params.ids - 产品ids
 * @param {Number} params.isAllLm - 是否是全部联系人
 */
function editBatchProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/editBatch`, params, false)
}

/**
 * 获取产品提醒模板
 */
function getProductRemindTemplate() {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/remind/list`)
}

/**
 * 获取产品详情
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getProductDetail(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/detail/data`, params)
}

/**
 * 获取产品相关事件
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getEventOfProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/event/list`, params)
}

/**
 * 获取产品相关工单
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getTaskOfProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/task/list`, params)
}

/**
 * 获取产品相关计划任务
 * @param {Object} params - 参数
 * @param {String} params.id - 产品id
 */
function getPlanOfProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/plantask/list`, params)
}


/**
 * 获取产品记录
 * @param {Object} params - 参数
 * @param {String} params.primaryId - 产品id
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 页面大小
 */
function getRecordOfProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/record/list`, params)
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
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/record/create`, params)
}

/**
 * 获取产品最近的一条更新记录
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 */
function getUpdateRecord(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/getLatestOne`, params)
}

/**
 * 删除二维码
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 */
function unbindQrcode(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/product/unbindQrcode`, params, false)
}

/**
 * 绑定二维码
 * @param {Object} params - 参数
 * @param {Boolean} params.addQrcodeId - 是否附带qrocdeId
 * @param {Boolean} params.addTenant - 是否附带公司简称
 * @param {String} params.qrocdeId - 二维码id
 */
function bindQrcode(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/product/bindQrcode`, params)
}


/**
 * 下载二维码
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 * @param {String} params.qrocdeId - 二维码id
 */

function downloadQrcode(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/product/downloadOneQrcode`, params)
}

/**
 * 获取产品详情统计数据
 * @param {Object} params - 参数
 * @param {String} params.productId - 产品id
 * @return Promise<>
 */

function productStatisticsInit(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/customer/product/statistics/init`, params)
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
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/product/list/data`, params);
}

/**
 * 删除产品模板
 * @param {String} ids - id字符串，以,分隔
 * @returns Promise<>
 */
function productTemplateDelete(ids) {
  let params = (ids || '').split(',');
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/product/delete`, params);
}

/**
 * 产品模板批量编辑
 * @param {Object} params.mapJson - 编辑的数据
 * @param {String} params.ids - id字符串，以,分隔
 * @returns Promise<>
 */
function productTemplateEditBatch(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/product/editBatch`, params, false);
}

/**
 * 新建产品模板
 * @param {Object} params - 参数
 * @returns Promise<>
 */
function productTemplateCreate(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/product/create/action`, params);
}

/**
 * 修改编辑产品模板
 * @param {Object} params - 参数
 * @returns Promise<>
 */
function productTemplateUpdate(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/product/update`, params);
}

/**
 * 查询单个产品模板信息
 * @param {String} params.id -- 产品模板id
 * @returns Promise<>
 */
function getProductTemplate(id) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/product/detail/data/${id}`);
}


/**
 * 查询产品模板 信息动态
 * @param {String} params.id -- 产品模板id
 * @param {Number} params.pageNum
 * @param {Number} params.pageSize
 * @returns Promise<>
 */
function getProductTemplateRecord(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/product/record/list`, params);
}

/**
 * 产品模板 添加备注
 * @returns Promise<>
 */
function productTemplateCreateRecord(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/product/record/create`, params);
}

/**
 * 产品模板 删除备注
 * @param {String} params.id -- 备注id
 * @returns Promise<>
 */
function productTemplateDeleteRecord(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.post(`${productPreFixedPath ? headUrl : de_headUrl}/customer/deleteCustomerRecord`, params, false);
}

/**
 * 获取产品模板关联的产品
 * @param {String} params.templateId -- 产品模板id
 * @param {Number} params.pageNum
 * @param {Number} params.pageSize
 * @returns Promise<>
 */
function productTemplateRelatedProducts(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/product/relatedProducts`, params);
}

/**
 * 编辑产品时搜索客户地址
 */
function searchCustomerAddressForProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/product/address`, params);
}

/**
 * 编辑产品时搜索客户联系人
 */
function searchCustomerLinkmanForProduct(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/product/linkmanRelation`, params);
}

/**
 * 产品表单属性列表
 * @param {String} params.isFromSetting -- 是否用于设置页面，是：true 否：false
 * @returns Promise<>
 */
function getProductFields(params) {
  let productPreFixedPath = GrayUtil.getProductV2ApiPath();
  return http.get(`${productPreFixedPath ? headUrl : de_headUrl}/getProductFields`, params);
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
  getProductV2,
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
  searchCustomerAddressForProduct,
  searchCustomerLinkmanForProduct,
  getProductFields
};