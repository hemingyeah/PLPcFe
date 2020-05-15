/**
 * 数据大屏相关接口
 */

import http from '@src/util/http';

let urlAppPrefix = '/api/app';

/**
 * 更新设置信息
 * @param {*} params 
 */
function saveSettingConfig(params) {
  return http.post('/setting/screen/save', params);
}

/**
 * 获取配置信息接口
 * 目前后台逻辑是需要全部配置文件，
 * 改动会造成A先改了配置，然后B在修改，B修改配置后会覆盖A的配置
 * 所以在请求保存/更新配置前 从这个接口拿一下当前配置信息 去做merge后提交
 */
function getSettingConfig() {
  return http.get('/stats/screenData/screenDataConfig')
}

/**
 * 心跳检测请求接口 
 */
function refreshCacheTime() {
  return http.get(`${urlAppPrefix}/outside/screen/refreshCacheTime`);
}

/**
 * 获取数据大屏数据除地图面板之外的数据
 * 这个接口不需要参数，
 * @param {*} params 
 */
function getScreenGroupData() {
  // return http.get(`${urlAppPrefix}/outside/screen/getScreenData`);

  // 联调特殊部署，todo clear
  return http.get(`${urlAppPrefix}/outside/screen/getScreenData`);
}

/**
 * 获取地图面板中 工单和人员 信息
 */
function getMapPanelTaskInfo(params) {
  return http.post(`${urlAppPrefix}/outside/screen/map/task`, params);
}

/**
 * 获取地图面板中 客户，团队，备件库 信息
 */
function getMapPanelCustomerInfo(params) {
  return http.post(`${urlAppPrefix}/outside/screen/map/customer`, params);
}

/**
 * 获取免登码，用于在钉钉外浏览器中显示 
 */
function getOpenWebCode() {
  return http.get('/getOpenWebCode');
}

function getTestMapData() {
  return http.get('stats/customer/list?tagId=');
}


export {
  saveSettingConfig,
  getSettingConfig,
  refreshCacheTime,
  getScreenGroupData,

  getMapPanelTaskInfo,
  getMapPanelCustomerInfo,

  getOpenWebCode,
  getTestMapData
}

