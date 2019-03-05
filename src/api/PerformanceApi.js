import http from '@src/util/http';

function createPerformanceRule(params){
  return http.post('/performance/v2/insert/rule', params)
}

function getFieldsForPerformance(id) {
  return http.get('/performance/v2/get/fields', {id})
}

export {
  createPerformanceRule,
  getFieldsForPerformance
}