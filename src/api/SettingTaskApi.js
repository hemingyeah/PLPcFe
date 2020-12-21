import http from '@src/util/HttpUtil';

/* ------------- start 附加组件设置 ---------------- */

/**
 * @description 获取附加组件列表
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 组件id
 */
export const getAllCardList =  (params = {} ) => {
  return http.get('/outside/pc/task/getAllCardList', params)
}

/**
 * @description 通过组件id获取附加组件信息
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 组件id
 */
export const getCardInfo =  (params = {} ) => {
  return http.get('/setting/task/card/getOne', params)
}
/**
 * @description 添加为单次/多次
 * @param {Object} params -- 参数对象
 * @param {String} params.cardId -- 组件id
 * @param {String} params.inputType -- single单次 multiple多次
 */
export const cardImport =  (params = {}) => {
  return http.post('/setting/task/card/import', params,false)
}

/**
 * @description 开启禁用工单附加组件
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 组件id
 * @param {String} params.enabled -- 1开启 0禁用
 */
export const onCardChange =  (params = {}) => {
  return http.post('/setting/task/card/enabled', params,false)
}

/**
 * @description 删除附加组件
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 组件id
 */
export const onDeleteCard =  (params = {}) => {
  return http.post('/setting/task/card/delete', params,false)
}

/**
 * @description 创建附加组件
 * @param {Object} params -- 参数对象
 * @param {String} params.description -- 组件说明
 * @param {String} params.inputType -- single单次 multiple多次
 * @param {String} params.name -- 组件名字
 */
export const onCreatCard =  (params = {}) => {
  return http.post('/setting/task/card/create', params)
}

/**
 * @description 更新附加组件
 * @param {Object} params -- 参数对象
 * @param {String} params.description -- 组件说明
 * @param {String} params.id -- 组件id
 * @param {String} params.name -- 组件名字
 */
export const onUpdateCard =  (params = {}) => {
  return http.post('/setting/task/card/update', params)
}


/**
 * @description 获取统计列表
 * @param {Object} params -- 参数对象
 * @param {String} params.cardId -- 组件id
 * @param {String} params.pageNum -- 第几页
 * @param {String} params.pageSize -- 每页展示多少条
 * @param {String} params.timeRange -- 时间范围
 * @param {String} params.userNameStr -- 操作人
 */
export const getCardCount =  (params = {}) => {
  return http.get('/setting/task/card/count', params)
}

/**
 * @description 获取统计fields列表
 * @param {Object} params -- 参数对象
 */
export const getCardFields =  (params = {}) => {
  return http.get('/setting/task/cardManage/getFields', params)
}

/**
 * @description 附加组件库
 * @param {Object} 
 */
export const getCardSysList =  (params = {}) => {
  return http.post('/setting/card/getSysList', params)
}



/* ------------- end 附加组件设置 ---------------- */

/* ------------- start 工单类型组件设置 ---------------- */

/**
 * @description 保存排序结果
 * @param {Object} params -- 参数对象
 */
export const saveTaskCardOrder =  (params = {}) => {
  return http.post('/setting/saveTaskCardOrder', params)
}

/**
 * @description 删除组件
 * @param {Object} params -- 参数对象
 */
export const deleteTaskCard =  (params = {}) => {
  return http.post('/setting/taskType/deleteCard', params,false)
}

/**
 * @description 使用规则设置
 * @param {Object} params -- 参数对象
 */
export const saveRulesFlow =  (params = {}) => {
  return http.post('/setting/taskType/card/saveNotNullFlow', params)
}

/**
 * @description 获取角色列表
 * @param {Object} params -- 参数对象
 */
export function getRoleList(params) {
  return http.get('/setting/role/list', params)
}

/**
 * @description 保存角色列表
 * @param {Object} params -- 参数对象
 */
export function saveCardAuth(params) {
  return http.post('/setting/taskType/cardAuth', params,false)
}

/* ------------- end 工单类型组件设置 ---------------- */
