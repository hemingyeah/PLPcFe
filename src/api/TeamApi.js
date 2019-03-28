import http from '@src/util/http';

/**
 * 获取团队列表数据
 * @param {Object} params - 参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 页面大小
 * @returns Promise<Team>
 */
export function tagList(params) {
  return http.post('/security/tag/list', params);
}

/**
 * 删除团队
 * @param {Array} ids - 团队id数组
 * @returns Promise<Team>
 */
export function deleteTag(ids) {
  return http.post('/security/tag/deleteTag', ids);
}

/**
 * 新建团队/子团队
 * @param {Object} params
 * 
 * @returns Promise<Team>
 */
export function createTag(params) {
  return http.post('/security/tag/createTag', params);
}

/**
 * 编辑团队/子团队
 * @param {Object} params
 * 
 * @returns Promise<Team>
 */
export function updateTag(params) {
  return http.post('/security/tag/updateTag', params);
}

/**
 * 查询单个团队信息
 * @param {String} params.id -- 团队id
 * @returns Promise<Team>
 */
export function getTag(params) {
  return http.get('/security/tag/get', params);
}

/**
 * 查询团队下的人员
 * @param {Object} params
 * @param {Number} params.pageNum -- 页码
 * @param {Number} params.pageSize -- 页面大小
 * @param {String} params.id -- 团队id
 * @returns Promise<Team>
 */
export function userList(params) {
  return http.post('/security/tag/userList', params, false);
}

/**
 * 添加团队  人员
 * @param {String} params.tagId -- 团队id
 * @param {Array} params.userIds -- 用户id数组
 * @returns Promise<Team>
 */
export function addUser(params) {
  return http.post('/security/tag/addUser', params, false);
}

/**
 * 删除团队  人员
 * @param {String} params.tagId -- 团队id
 * @param {String} params.userIds -- 用户ids
 * @returns Promise<Team>
 */
export function deleteUser(params) {
  return http.post('/security/tag/deleteUser', params, false);
}

/**
 * 验证团队参数唯一性
 * 
 * @param {Object} params -- 参数
 * @param {String} [params.id] -- 团队id，编辑时需要传
 * @param {String} params.field -- 验证的地段
 * @param {String} params.value -- 值
 * @returns Boolean true为验证通过
 */
export function checkUnique(params){
  return http.get('/security/tag/checkUnique', params)
}

/**
 * 是否开启按服务团队派单
 * 
 * @param {Object} params -- 参数
 * @param {String} params.set -- 派单方式的值
 * @returns Promise<Team>
 */
export function usedAllot(params) {
  return http.post('/security/tag/usedAllot', params, false)
}

/**
 * 是否开启按降低组织架构可见性
 * 
 * @param {Object} params -- 参数
 * @param {Boolean} params.state -- 是否开启降低组织架构
 * @returns Promise<Team>
 */
export function saveSeeAllOrg(params) {
  return http.post('/setting/user/saveSeeAllOrg', params, false)
}