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
export function deleteBatchDepartmentUserByIdList (params) {
  return http.post('/security/department/deleteBatchDepartmentUserByIdList', params, false)
}

/**
 * @description 添加部门人员
 * @param {String} userIdList 用户id列表 ,分割
 * @param {String} departmentId 部门id
 * @returns {*}
 */
export function addDepartmentUser (params) {
  return http.post('/security/department/createAndAddDepartmentUser', params.loginUser)
}

/**
 * @description 添加部门
 * @param {String} name 部门名称
 * @param {String} parentId 上级部门id
 * @param {String} description 介绍
 * @param {String} type 类型
 * @returns {*}
 */
export function addDepartment (params) {
  return http.post('/security/department/update', params, false)
}

/**
 * @description 更新部门
 * @param {String} id 部门id
 * @param {String} name 部门名称
 * @param {String} parentId 上级部门id
 * @param {String} description 介绍
 * @param {String} type 类型
 * @returns {*}
 */
export function updateDepartment (params) {
  return http.post('/security/department/update', params, false)
}

/**
 * @description 删除部门
 * @param {String} departmentId 部门id
 * @returns {*}
 */
export function deleteDepartment (params) {
  return http.post(`/security/department/delete/${params.id}`)
}

/**
 * @description 调整部门
 * @param {String} userId 用户ID
 * @param {String} primaryDepartment 原部门
 * @param {String} freshDepartment  新部门
 * @returns {*}
 */
export function updateDepartmentUserBatch (params) {
  return http.post('/security/department/updateDepartmentUserBatch', params, false)
}


/**
 * @description 判断人员的账户名称是否重复
 * @param {String} loginName 名称
 * @param {String} userId 用户id
 * @returns {*}
 */
export function userLoginNameUnique (params) {
  return http.get('/security/user/unique', params)
}


/**
 * @description 获取角色下人员列表
 * @returns {*}
 */
export function getRoleUser (params) {
  return http.post('/security/user/list', params, false)
}

/**
 * @description 角色添加成员
 * @returns {*}
 */
export function addRoleUser (params) {
  return http.post('/security/role/addUser', params, false)
}

/**
 * @description 角色移除成员
 * @returns {*}
 */
export function delRoleUser (params) {
  return http.post('/security/role/deleteUser', params, false)
}

/**
 * @description 获取角色下已删除人员列表
 * @returns {*}
 */
export function getDelUser (params) {
  return http.post('/security/user/list/getDUserInfo', params, false)
}

/**
 * @description 自动分配角色
 * @returns {*}
 */
export function autoAuth (params) {
  return http.post('/setting/autoAuth/save', params, false)
}

/**
 * @description 重置密码
 * @returns {*}
 */
export function resetPwd (params) {
  return http.post('/security/user/resetPwd', params, false)
}

/**
 * @description 启用禁用
 * @returns {*}
 */
export function enable (params) {
  return http.post('/security/user/resetPwd', params, false)
}

