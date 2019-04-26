import http from '@src/util/http';

function getSmsTemplate({pageSize = '100', pageNum = '1'} = {}) {
  return http.get('/vipsms/getTemplates', {pageSize, pageNum, })
}

/**
 *
 * @param id - 提醒id
 * @returns {*}
 */
function deleteScheduler(id) {
  return http.get(`/scheduler/delete/${id}`)
}
/**
 *
 * @param {Object} params - 参数
 * @param {String} params.id - remindId
 * @param {String} params.modalName - productName
 * @param {String} params.modal - product
 * @param {Object} params.remind - {remindTemplateId}
 * @param {Array} params.users - [user]
 * @returns {*}
 */
function editScheduler(params) {
  return http.post('/scheduler/editByJson', params)
}

/**
 *
 * @param {Object} params - 参数
 * @param {String} params.modalName - productName
 * @param {String} params.modal - product
 * @param {Object} params.remind - {remindTemplateId}
 * @param {Array} params.users - [user]
 * @returns {*}
 */
function createScheduler(params) {
  return http.post('/scheduler/buildByJson', params)
}

export {
  getSmsTemplate,
  deleteScheduler,
  editScheduler,
  createScheduler
};