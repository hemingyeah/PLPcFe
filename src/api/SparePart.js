import http from '@src/util/HttpUtil';
let urlHead = '/api/part';


// partV2/repertory/repertoryApply.vue
export function rejectBatch(params = {}) {
  return http.post(`${urlHead}/outside/dd/part/approveList/rejectBatch`, params, false)
}

export function revokeBatch(params = {}) {
  return http.post(`${urlHead}/outside/dd/part/approveList/revokeBatch`, params, false)
}

export function approveBatch(params = {}) {
  return http.post(`${urlHead}/outside/dd/part/approveList/approveBatch`, params)
}

export function getRelationListByApproveNo(params = {}) {
  return http.get(`${urlHead}/outside/dd/part/approveList/getRelationListByApproveNo`, params)
}

export function getProgress(params={}){
  return http.get(`${urlHead}/outside/dd/part/approveList/getProgress`,params);
}


// 查询多个清单详情
export function getRelationsByApproveNos(params={}){
  return http.get(`${urlHead}/outside/dd/part/approveList/getRelationsByApproveNos`,params);
}

// 批量办理
export function approveBatchByApproveNos(params={}){
  return http.post(`${urlHead}/outside/dd/part/approveList/approveBatchByApproveNos`,params);
}

// 修改退回时目标库
export function updateBackTarget(params){
  return http.post(`${urlHead}/outside/dd/part/approveList/updateBackTarget`,params);
}