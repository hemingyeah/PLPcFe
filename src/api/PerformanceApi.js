import http from '@src/util/http';

/**
 * 创建绩效规则
 * @param {Object} params - 参数
 * @param {String} params.ruleName - 规则名称
 * @param {String} params.ruleDesc - 规则描述
 * @param {Number} params.ruleType - 规则类型（0:计分制;1:奖金制.）
 * @param {Number} params.effectCondition - 生效条件（0:全部;1:仅包含.2:仅排除.）
 * @param {Number} params.effect - 是否启用 (0,1)
 * @param {Array} params.ruleContents - 条件集合
 * @param {Object} params.ruleContents[0] - 具体条件
 *  {
 *    settleType,(templateId, serviceType, serviceContent, customField) = (工单类型, 服务类型, 服务内容, 自定义字段)
 *    screenMsg,(类型具体模板的id，或者自定义字段的选项)
 *    assPerson,(协同人得分奖金)
 *    chargePerson,(负责人得分活奖金)
 *    [customFieldValue],(可选: settleType = 自定义字段时存在)
 *    [templateId],(可选: settleType = 自定义字段时存在，工单模板id)
 *    [rewardType],(可选: ruleType = 1), (profit，sale， amount，) = (按毛利，按营收金额，按工单数量)
 *  }
 * @returns Promise {data: {ruleId}, message, status}
 */
function createPerformanceRule(params){
  return http.post('/performance/v2/insert/rule', params)
}

/**
 * 获取工单类型对应的字段
 * @id {Number} - 工单模板的id
 * @returns Promise {data: [field], message, status}
 */
function getFieldsForPerformance(id) {
  return http.get('/performance/v2/get/fields', {id})
}

/**
 * 获取全部绩效规则
 * @returns Promise {data: [rule], message, status}
 */
function getAllPerformanceRules() {
  return http.get('/performance/v2/list/rules');
}

/**
 * 删除绩效规则
 * @id {Number} - 绩效规则id
 * @returns Promise {data: null, message, status}
 */
function deletePerformanceRule(id) {
  return http.get(`/performance/v2/delete/rule/${id}`);
}

/**
 * 启用/禁用绩效规则
 * @params {Object} - 参数
 * @params.id {Number} - 规则id
 * @params.effect {Number} - 规则状态(0: 禁用, 1: 启用)
 * @returns Promise {data, message, status}
 */
function togglePerformanceRuleEffect(params) {
  return http.post('/performance/v2/effect/rule', params, false)
}

/**
 * 更新绩效规则
 * @params {Object}
 * @param.id {Number} - 绩效规则id
 * @param... 参考创建绩效规则参数
 * @returns Promise
 */
function updatePerformanceRule(params) {
  return http.post('/performance/v2/update/rule', params)
}

/**
 *
 * @params {Object}
 * @param.ruleId {Number} - 绩效规则id
 * @param.reportName {String} - 绩效报告名称
 * @param.state {Number} - 工单状态 (0:已完成,1:已完成并结算,)
 * @param.timeType {Number} - 时间类别 (0:完成时间,1:结算时间,)
 * @param.remarks {String} - 备注
 * @param.startTime {Date} - 开始时间
 * @param.endTime {Date} - 结束时间
 * @param[sign] {String} - 可选 first(第一次发起创建报告请求) screen(去除重复工单) 不传（包含重复工单）
 * @param[teams] {String} - 团队类型，需传团队id的字符串，以 , 分隔
 * @param[users] {String} - 人员类型，需传人员id的字符串，以 , 分隔
 * @returns Promise {data, message, status}
 */
function createPerformanceReport(params) {
  return http.post('/performance/v2/contain/work_order', params, false) // form data
}

/**
 * 获取绩效报告的列表
 * @params {Object} - 参数
 * @param.pageSize {Number} - 分页
 * @param.pageNum {Number} - 页码
 * @param[startTime] {Date} - 开始时间
 * @param[endTime] {Date} - 结束时间
 * @param[type] {Number} - 筛选范围 (0: 按人员, 1: 按团队) 可选，不传筛选全部
 * @returns Promise {data: {reportList}, message, status}
 */
function getPerformanceReports(params) {
  return http.get('/performance/v2/list/report', params);
}

/**
 * 删除绩效报告
 * @params {Object} - 参数
 * @param.ids {String} - id的字符串，以 , 分隔， 并以 , 结尾
 * @returns Promise {data, message, status}
 */
function deletePerformanceReports(params) {
  return http.post('/performance/v2/delete/report_desc/by_report_id', params, false);
}

/**
 * 绩效报告选项设置是否发送抄送人
 * @param params
 * @param.flag {Boolean} - 是否发送抄送人
 * @returns {*}
 */
function setCcForReport(params) {
  return http.post('/performance/v2/send_cc', params, false)
}

/**
 * 获取绩效报告的审核人
 * @param params {}
 * @returns {*}
 */
function getApprovePerson(params) {
  return http.get('/performance/v2/get/init_reviewers', params)
}

/**
 *  绩效报告选项设置查看有运营分析的用户列表
 * @param params
 * @param.keyword
 * @param.pageNum
 * @param.pageSize
 * @returns {*}
 */
function getApprovePersonList(params) {
  return http.post('/performance/v2/reviewers/list', params)
}

/**
 * 绩效报告选项设置保存审核人信息
 * @param params
 * @param.reviewIds 审核人人ids，拼接id，逗号分隔
 * @returns {*}
 */
function setApprovePerson(params) {
  return http.post('/performance/v2/save/reviewers', params, false);
}

/**
 *
 * @param params
 * @param.reportId {String} 报告id
 * @param.approveRemark {String}
 * @returns {*}
 */

function submitApprove(params) {
  return http.post('/performance/v2/report/submit/approve', params, false);
}

/**
 *
 * @param params
 * @param.reportId {String} 报告id
 * @returns {*}
 */

function cancelApprove(params) {
  return http.post('/approve/offApprove/report', params, false);
}

/**
 * 审批绩效报告
 * @param params
 * @param.reportId {String} 报告id
 * @param.result {String}  success || fail
 * @param.approveRemark {String}
 * @returns {*}
 */
function approvePerformance(params) {
  return http.post('/approve/saveResult/report', params, false);
}

/**
 * 获取绩效报告的记录
 * @param params    {Object}
 * @param.reportId  {String}  报告id
 * @returns {*}
 */
function getPerformanceRecord(params) {
  return http.get('/performance/v2/record/list/report_id', params)
}

/**
 * 发布绩效报告
 * @param params    {Object}
 * @param.reportId  {String}  报告id
 * @param.isAdvice  {Boolean} 是否只通知有绩效结果的人
 * @param.isRanking {String}  是否显示排名
 * @returns {*}
 */
function publishPerformance(params) {
  return http.post('/performance/v2/report/publish', params, false);
}

/**
 * 检查团队用户是否有重复
 * @param params    {Object}
 * @param {Object} params.tag - 团队列表
 *  {
 *    【tagId]: [userId, userId],(可选: 'isAll')
 *  }
 * @returns {*}
 */
function checkTagUserRepeat(params) {
  return http.post('/security/tag/tagComponet/checkTagUserRepeat', params, false);
}

export {
  createPerformanceRule,
  getFieldsForPerformance,
  getAllPerformanceRules,
  deletePerformanceRule,
  togglePerformanceRuleEffect,
  updatePerformanceRule,
  createPerformanceReport,
  getPerformanceReports,
  deletePerformanceReports,
  setCcForReport,
  getApprovePerson,
  getApprovePersonList,
  setApprovePerson,
  submitApprove,
  cancelApprove,
  approvePerformance,
  getPerformanceRecord,
  publishPerformance,
  checkTagUserRepeat
}