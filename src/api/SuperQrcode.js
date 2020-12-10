import http from '@src/util/HttpUtil';

// const prefix='http://30.40.63.238:10016';   // 杨灵本地
const prefix='';

// 获取目录
export function queryProductCatalogs(params={}){
  return http.get(`${prefix}/outside/superCode/product/queryProductCatalogs`,params);
}

// 选中某个目录后同步数据
export function syncCatalogInfo(params={}){
  return http.post(`${prefix}/outside/superCode/product/syncCatalogInfo`,params);
}

// 查询单个目录详情
export function queryProductSetting(params={}){
  return http.get(`${prefix}/outside/superCode/product/queryProductSetting`,params);
}

// 查询企业资料
export function queryCompanyInfo(params={}){
  return http.get(`${prefix}/outside/superCode/mobile/queryCompanyInfo`,params);
}

// 保存配置
export function modifyProductSetting(params={}){
  return http.post(`${prefix}/outside/superCode/product/modifyProductSetting`,params);
}

// 查询自助门户快捷入口
export function queryQuickInfo(params={}){
  return http.get(`${prefix}/outside/superCode/product/queryQuickInto`,params);
}

// 查询全部规则
export function querySettingRules(params={}){
  return http.get(`${prefix}/outside/superCode/rule/querySettingRules`,params);
}

// 查看规则详情
export function queryRuleInfo(params={}){
  return http.get(`${prefix}/outside/superCode/rule/queryRuleInfo`,params);
}

// 查询事件类型列表
export function queryEventType(params={}){
  return http.get(`${prefix}/outside/superCode/product/queryEventType`,params);
}