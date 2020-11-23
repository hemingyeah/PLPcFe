import http from '@src/util/HttpUtil';

/** 
 * 获取版本号  
 * 1为老版本(vip版) 2基础版本 3企业版本
*/
export function getSettingEdition(params = {}) {
  return http.get('/setting/edition', params)
}

/******************** S 商品列表 ***************/

/**
 * 商品备件列表
 */
export const getShopSparepartRepertory =  (params = {}) => {
  return http.get('/api/part/outside/part/service/api/getShopSparepartRepertory', params)
}
/**
 * 是否启用橱窗
 */
export const updateIsShowOrIsShopWindows = (params = {}) => {
  return http.post('/api/part/outside/part/service/api/updateIsShowOrIsShopWindows', params, false)
}

/**
 * 商品服务列表
 */
export const serviceList= (params = {}) => {
  return http.get('/setting/market/service/list', params)
}

/**
 * 是否发布
 */
export const marketItem= (params = {}) => {
  return http.post('/setting/marketItem/save', params, false)
} 

/**
 * 获取备件设置
 */
export const sparepartConfig = () => {
  return http.post('/partV2/repertory/sparepartConfig')
}

/**
 * 获取仓库列表
 */
export const allRepertory = () => {
  return http.get('/partV2/repertory/allRepertory')
} 

/******************** E 商品列表 ***************/