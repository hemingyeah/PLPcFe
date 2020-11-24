import http from '@src/util/http';
const headUrl = ''

/** ------------ start 产品 ----------------------- */
/**
 * 获取产品目录表单
 * @param params
 * @returns {*}
 */
function getProductMenuField(params) {
  return http.get(`${headUrl}/outside/pc/catalog/setting/select`, params)
}

/**
 * 保存产品目录表单
 * @param params
 * @returns {*}
 */
function setProductMenuField(params) {
  return http.post(`${headUrl}/outside/pc/catalog/setting/save`, params)
}

/**
 * 目录树获取
 * @param params
 * @returns {*}
 */
function getTreeList(params) {
  return http.get(`${headUrl}/outside/pc/catalog/treeList`, params)
}

/**
 * 目录树新增
 * @param params
 * @returns {*}
 */
function setTreeList(params) {
  return http.post(`${headUrl}/outside/pc/catalog/saveTree`, params)
}

/**
 * 目录树排序
 * @param params
 * @returns {*}
 */
function sortTreeList(params) {
  return http.post(`${headUrl}/outside/pc/catalog/treeSort`, params)
}

/**
 * 目录树删除
 * @param params
 * @returns {*}
 */
function delTreeList(params) {
  return http.post(`${headUrl}/outside/pc/catalog/batchDelete`, params)
}


/**
 * 目录树设置详情
 * @param params
 * @returns {*}
 */
function setInfoTreeList(params) {
  return http.post(`${headUrl}/outside/pc/catalog/saveInfo`, params)
}

/**
 * 目录列表获取
 * @param params
 * @returns {*}
 */
function getPageList(params) {
  return http.post(`${headUrl}/outside/pc/catalog/pageList`, params)
}

/**
 * 目录列表详情获取
 * @param params
 * @returns {*}
 */
function getPageInfo(params) {
  return http.get(`${headUrl}/outside/pc/catalog/info`, params)
}


/**
 * 目录详情关联产品列表查询
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getPageProduct(params) {
  return http.get(`${headUrl}/outside/pc/catalog/product`, params)
}

/**
 * 目录详情关联产品
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function setPageRelationProduct(params) {
  return http.post(`${headUrl}/outside/pc/catalog/relationProduct`, params)
}



/**
 * 目录详情关联备件列表查询
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getPageLinkPart(params) {
  return http.get(`${headUrl}/outside/pc/catalog/part`, params)
}

/**
 * 目录详情关联知识库列表查询
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getPageLinkWiki(params) {
  return http.get(`${headUrl}/outside/pc/catalog/wiki`, params)
}


/**
 * 目录详情关联备件或知识库
 * @param params
 *   catalogId : 目录id
 *   relationIds: 关联id
 *   type ： 关联类型 part wiki
 * @returns {*}
 */
function setPagerelationPartOrWiki(params) {
  return http.post(`${headUrl}/outside/pc/catalog/relationPartOrWiki`, params)
}

/**
 * 目录详情知识库列表查询
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getPageWiki(params) {
  return http.get(`${headUrl}/outside/pc/catalog/getWiki`, params)
}


/**
 * 目录详情关联知识库列表查询
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function setPageInfo(params) {
  return http.post(`${headUrl}/outside/pc/catalog/edit`, params)
}

/**
 * 获取可以克隆的目录列表
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getPageCloneData(params) {
  return http.get(`${headUrl}/outside/pc/catalog/cloneData`, params)
}

/**
 * 获取关联的备件列表
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getPagePart(params) {
  return http.get(`${headUrl}/outside/pc/catalog/getPart`, params)
}


/**
 * 获取关联的知识库列表
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getPagelinkWiki(params) {
  return http.get(`${headUrl}/outside/pc/catalog/getWiki`, params)
}


/**
 * 目录重命名
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function renameTree(params) {
  return http.post(`${headUrl}/outside/pc/catalog/updateTree`, params)
}


/**
 * 目录关联备件知识库单独删除
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function removePartOrWiki(params) {
  return http.post(`${headUrl}/outside/pc/catalog/removePartOrWiki`, params)
}

/**
 * 目录清空内容
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function clearCatalogData(params) {
  return http.get(`${headUrl}/outside/pc/catalog/clearCatalogData`, params)
}

/**
 * 目录动态信息
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getMenuRecord(params) {
  return http.get(`${headUrl}/outside/pc/catalog/record`, params)
}

/**
 * 查询目录树某个节点
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function getTreeListNode(params) {
  
  return http.get(`${headUrl}/outside/pc/catalog/getTreeListNode`, params)
}


/**
 * 克隆某个目录
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function cloneMenu(params) {
  
  return http.get(`${headUrl}/outside/pc/catalog/clone`, params)
}


/**
 * 目录详情tab的数量
 * @param params
 *   id : 目录id
 * @returns {*}
 */
function productMenuStatistics(params) {
  
  return http.get(`${headUrl}/outside/pc/catalog/relation/statistics`, params)
}



export {
  getProductMenuField,
  setProductMenuField,
  getTreeList,
  setTreeList,
  setInfoTreeList,
  sortTreeList,
  delTreeList,
  getPageList,
  getPageInfo,
  setPageInfo,
  getPageProduct,
  getPageLinkPart,
  getPageLinkWiki,
  setPageRelationProduct,
  setPagerelationPartOrWiki,
  getPageWiki,
  getPageCloneData,
  getPagePart,
  getPagelinkWiki,
  renameTree,
  removePartOrWiki,
  clearCatalogData,
  getMenuRecord,
  getTreeListNode,
  cloneMenu,
  productMenuStatistics
}