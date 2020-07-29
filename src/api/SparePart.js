import http from '@src/util/HttpUtil';
let urlHead = '/api/part';


// partV2/repertory/repertoryApply.vue
export function rejectBatch(params = {}) {
  return http.get(`${urlHead}/outside/dd/part/approveList/rejectBatch`, params)
}

export function revokeBatch(params = {}) {
  return http.get(`${urlHead}/outside/dd/part/approveList/revokeBatch`, params)
}

export function approveBatch(params = {}) {
  return http.post(`${urlHead}/outside/dd/part/approveList/approveBatch`, params)
}

export function getRelationListByApproveNo(params = {}) {
  return http.get(`${urlHead}/outside/dd/part/approveList/getRelationListByApproveNo`, params)
}


