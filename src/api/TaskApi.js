import http from '@src/util/http'

let fixedPrefixAppPath = '/api/app'

/* ------------- start 旧工单api ---------------- */

/**
 * 删除计划任务
 * @param {Object} params - 参数
 * @param {Array} params.ids - 计划id
 */
export function deletePlanTask(params) {
  return http.post('/task/deletePlanTask', params, false)
}

/**
 * 工单表单 关联字段
 * module为 customer/product 
 * id为已选择的客户或产品的id，选择的产品数量=1的时候才去查值赋值
 * fieldName和formType填这种字段setting里存的值
 * @param {*} params = {String module,String id,String fieldName,String formType}
 */
export function relatedFieldValue(params) {
  return http.get('/dd/task/relatedFieldValue', params)
}

/** 
 * @description 获取工单表单数据
 * @param {Object} params-- params
 * @param {String} params.tableName -- 表名
 * @param {String} params.templateId -- 类型模板id
*/
export function getTaskTemplateFields(params) {
  return http.get('/task/getTaskTemplateFields', params)
}

/** 
 * @description 查询客户产品关联字段
 * @param {Object} params -- 参数对象
 * @param {String} params.module -- 模块 customer/product
 * @param {String} params.id -- 客户id
 * @param {String} params.fieldName -- 字段名称
 * @param {String} params.formType -- 字段类型
*/
export function getTaskRelatedInfo(params) {
  return http.get('/task/getRelatedInfo', params)
}

/** 
 * @description 获取客户数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
*/
export function getTaskCustomerList(params) {
  return http.get('/task/customer/list', params)
}

/** 
 * @description 获取客户产品数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
*/
export function getTaskCustomerProduct(params) {
  return http.get('/task/customer/product', params);
}

/** 
 * @description 获取客户联系人数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
*/
export function getTaskCustomerLinkman(params) {
  return http.get('/api/elasticsearch/outside/es/linkman/list', params);
}

/** 
 * @description 获取客户地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
*/
export function getTaskCustomerAddress(params) {
  return http.get('/task/customer/address', params);
}

/** 
 * @description 获取客户联系人和地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.customerId -- 客户id
 * @param {String} params.productId -- 产品id
 * @param {String} params.notNull -- 分页数
*/
export function getTaskDefaultInfo(params) {
  return http.get('/task/defaultInfo', params);
}

/** 
 * @description 通过产品id获取客户数据
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 产品id
*/
export function getCustomerByProduct(params) {
  return http.get('/customer/product/detail/data', params);
}

/** 
 * @description 通过联系人id获取地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.lmId -- 产品id
*/
export function getLmBindAddress(params) {
  return http.get('/task/getLmBindAddress', params);
}

/** 
 * @description 获取新建客户相关数据
*/
export function getCreateCustomerData(params) {
  return http.get('/customer/editGetData', params);
}

/** 
 * @description 获取新建产品相关数据
*/
export function getCreateProductData(params) {
  return http.get('/customer/product/editGetData', params);
}

/** 
 * @description 获取备件配置信息
*/
export function getSparepartConfig(params) {
  return http.post('/partV2/repertory/sparepartConfig', params);
}

/** 
 * @description 获取备件仓库列表数据
*/
export function getRepertoryList(params) {
  return http.get('/task/repertory', params);
}

/** 
 * @description 编辑回执表单
*/
export function editReceipt(params) {
  return http.post('/task/editReceipt', params);
}

/** 
 * @description 新建工单
*/
export function createTask(params) {
  return http.post('/task/create', params);
}

/** 
 * @description 编辑工单
*/
export function editTask(params) {
  return http.post('/task/update', params);
}

/** 
 * @description 判断工单是否使用了备件
*/
export function taskFilterWithPart(params) {
  return http.get('/task/filter/withPart', params);
}

/** 
 * @description 删除工单
*/
export function deleteTask(params) {
  return http.post('/task/delete', params, true);
}

/** 
 * @description 回退工单
*/
export function rollBackTask(params) {
  return http.post('/task/rollBack', params, true);
}

/** 
 * @description 暂停工单
*/
export function pauseTask(params) {
  return http.get('/task/pause', params);
}

/** 
 * @description 继续工单
*/
export function unpauseTask(params) {
  return http.get('/task/unpause', params);
}

/** 
 * @description 检查附加组件是否必填
*/
export function checkNotNullForCard(params) {
  return http.post('/task/checkNotNullForCard', params, false);
}

/** 
 * @description 打印工单
*/
export function printTask(params) {
  return http.get('/task/getPrintToken', params);
}

/** 
 * @description 审批详情
*/
export function getApprove(params) {
  return http.get('/approve/get', params);
}

/** 
 * @description 审批
*/
export function saveApprove(params) {
  return http.post('/approve/saveResult', params, false);
}

/** 
 * @description 撤回审批
*/
export function offApprove(params) {
  return http.get('/approve/offApprove', params);
}

/** 
 * @description 发起审批
*/
export function applyApprove(params) {
  return http.post('/approve/apply', params);
}

/** 
 * @description 从工单池接单
*/
export function acceptFromPool(params) {
  return http.get('/task/acceptFromPool', params);
}

/**
 * @description 获取工单最近更新记录
 * @param {Object} params - 参数
 * @param {String} params.taskId - 工单id
 * @return {MsgModal<String>} 最近更新记录
 */
export function getTaskUpdateRecord(params) {
  return http.get('/task/getLatestRecord', params, false)
}

/**
 * @description 获取产品列表
 * @param {Object} params - 参数
 */
export function getTaskCustonerProductList(params) {
  return http.get('/task/customer/product', params, false)
}

/* -------------  end  旧工单api ---------------- */



/* ------------- start 新工单api ---------------- */

/**
 * 获取工单类型
 */
export function getTaskTypes(){
  return http.get(`${fixedPrefixAppPath}/outside/dd/task/types`);
}

/**
 * 获取工单列表
 * @param {Object} params - 参数对象
 * @param {String} params.tenantId - 租户id
 * @param {String} params.customerId - 客户id
 * @param {String} params.keyword - 关键字
 * @param {String} params.productId - 产品id
 * @param {String} params.typeId - 工单类型id
 */
export function taskList(params) {
  return http.post('/task/findList', params)
}


/** 
 * 开始工单
 * @param {Object} params - 参数对象
 * @param {String} params.planTime - 计划时间时间戳
 * @param {String} params.taskId - 工单id
 * @param {String} params.tick - 是否勾选 1勾选 0不勾选
*/
export function startTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/start`, params);
}

/** 
 * 接受工单
 * @param {Object} params - 参数对象
 * @param {String} params.newPlanTime - 计划时间
 * @param {String} params.taskId - 工单id
 * @param {String} params.tick - 是否勾选 1勾选 0不勾选
*/
export function accept(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/accept`, params);
}

/** 
 * 修改计划时间
 * @param {Object} params - 参数对象
 * @param {String} params.planTime - 计划时间
 * @param {String} params.taskId - 工单id
 * @param {String} params.sendSMS - 是否发送短信
*/
export function modifyPlanTime(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/updatePlanTime`, params);
}

/** 
 * 拒绝工单
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 拒绝原因
 * @param {String} params.taskId - 工单id
*/
export function refuseTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/refuse`, params);
}

/** 
 * 取消工单
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 取消原因
 * @param {String} params.taskId - 工单id
 * @param {String} params.isGoBack - 是否回退备件 1是0否
*/
export function cancelTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/off`, params);
}

/* -------------  end  新工单api ---------------- */