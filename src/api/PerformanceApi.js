import http from '@src/util/http';

// performance rule
function createPerformanceRule(params){
  return http.post('/performance/v2/insert/rule', params)
}

function getFieldsForPerformance(id) {
  return http.get('/performance/v2/get/fields', {id})
}

function getAllPerformanceRules() {
  return http.get('/performance/v2/list/rules');
}

function deleteAllPerformanceRules(id) {
  return http.get(`/performance/v2/delete/rule/${id}`);
}

function togglePerformanceRuleEffect(params) {
  return http.post('/performance/v2/effect/rule', params, false)
}

function updatePerformanceRule(params) {
  return http.post('/performance/v2/update/rule', params)
}

// performance report
function createPerformanceReport(params) {
  return http.post('/performance/v2/contain/work_order', params, false)
}

function getPerformanceReports(params) {
  return http.get('/performance/v2/list/report', params);
}

function deletePerformanceReports(params) {
  return http.get('/performance/v2/delete/report_desc/by_report_id', params);
}

export {
  createPerformanceRule,
  getFieldsForPerformance,
  getAllPerformanceRules,
  deleteAllPerformanceRules,
  togglePerformanceRuleEffect,
  updatePerformanceRule,
  createPerformanceReport,
  getPerformanceReports,
  deletePerformanceReports
}