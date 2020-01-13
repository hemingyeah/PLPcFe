import http from '@src/util/http';

/**
 *
 * @description 获取组织架构 树级列表
 * @returns {*}
 */
export function getDepartmentTree (id) {
  return http.get('/security/department/tree')
}

/**
 * @description 获取组织架构部门下人员数量
 * @returns {*}
 */
export function getDepartmentUserCount (params) {
  return http.get('/security/department/depUserCount')
}

/**
 * @description 获取组织架构部门下 人员列表
 * @returns {*}
 */
export function getDepartmentUser (params) {
  return http.get('/security/department/user', params)
}

/**
 * @description 删除部门人员
 * @param {String} userIdList 用户id列表 ,分割
 * @param {String} departmentId 部门id
 * @returns {*}
 */
export function deleteDepartmentUser (params) {
  return http.post('/security/department/user', params)
}

/**
 * @description 添加部门人员
 * @param {String} userIdList 用户id列表 ,分割
 * @param {String} departmentId 部门id
 * @returns {*}
 */
export function addDepartmentUser (params) {
  return http.post('/security/department/user', params)
}

/**
 * @description 添加部门
 * @param {String} name 部门名称
 * @param {String} higherDepartmentId 上级部门id
 * @returns {*}
 */
export function addDepartment (params) {
  return http.post('/security/department/user', params)
}

/**
 * @description 编辑部门
 * @param {String} name 部门名称
 * @param {String} higherDepartmentId 上级部门id
 * @returns {*}
 */
export function updateDepartment (params) {
  return http.post('/security/department/user', params)
}

/**
 * @description 删除部门
 * @param {String} departmentId 部门id
 * @returns {*}
 */
export function deleteDepartment (params) {
  return http.post('/security/department/user', params)
}