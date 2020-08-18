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
 * @description 获取工单表单数据(老版本，可以获取被隐藏的系统组件)
 * @param {Object} params-- params
 * @param {String} params.tableName -- 表名
 * @param {String} params.typeId -- 类型模板id
 */
export function getFields(params) {
  return http.get('/setting/taskType/getFields', params)
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
 * @description 开始工单时校验是否需要审批
*/
export function startApproveCheck(params) {
  return http.get('/task/approve/start', params);
}

/** 
 * @description 取消工单时校验是否需要审批
*/
export function offApproveCheck(params) {
  return http.post('/task/approve/off', params, true);
}

/** 
 * @description 暂停工单时校验是否需要审批
*/
export function pauseApproveCheck(params) {
  return http.get('/task/approve/pause', params);
}

/** 
 * @description 审核结算时校验是否需要审批
*/
export function balanceApproveCheck(params) {
  return http.post('/balance/approve/confirm', params, false);
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
 * 从工单池接单
 * @param {Object} params - 参数对象
 * @param {String} params.newPlanTime - 计划时间
 * @param {String} params.taskId - 工单id
 * @param {String} params.tick - 是否勾选 1勾选 0不勾选
*/
export function acceptFromPool(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/acceptFromPool`, params);
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

/** 
 * 判断曾回退、且当前状态未完成的工单，在最后一次完成时是否使用了备件
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
*/
export function finishedWithPart(params) {
  return http.get(`${fixedPrefixAppPath}/outside/pc/task/finishedWithPart`, params);
}

/** 
 * 暂停工单
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 暂停原因
 * @param {String} params.taskId - 工单id
*/
export function pauseTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/pause`, params);
}

/** 
 * 继续
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
*/
export function unpauseTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/unpause`, params);
}

/** 
 * 回退工单
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 * @param {String} params.reason - 回退原因
*/
export function rollBackTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/rollBack`, params);
}

/** 
 * 删除工单
 * @param {Object} params - 参数对象
 * @param {Array} params.taskIds - 需要删除的工单id数组
*/
export function deleteTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/delete`, params);
}

/** 
 * 结算工单
 * @param {Object} params - 参数对象
 * @param {Array} params.balanceAttachments - 附件
 * @param {Object} params.balanceAttributes - 自定义结算字段值集合
 * @param {String} params.taskId - 工单id
*/
export function balanceTask(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/balance`, params);
}

/** 
 * 编辑结算
 * @param {Object} params - 参数对象
 * @param {Array} params.balanceAttachments - 附件
 * @param {Object} params.balanceAttributes - 自定义结算字段值集合
 * @param {String} params.taskId - 工单id
*/
export function editBalance(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/editBalance`, params);
}

/** 
 * 回退结算
 * @param {Object} params - 参数对象
 * @param {Array} params.reason - 回退原因
 * @param {String} params.taskId - 工单id
*/
export function rollBackBalance(params) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/rollBackBalance`, params);
}

/**
 * 保存工单设置信息
 * @param {Object} params - 参数对象
 * @param {String} params.fields - 设置form对象
 */
export function taskSettingSave(params) {
  return http.post('/setting/taskType/field/save', params)
}

/**
 * 校验人员是否是审批人
 * @param {Object} params - 参数对象
 * @param {String} params.id - 人员id
 */
export function checkUser(params) {
  return http.post('/setting/fieldInfo/check', params, false)
}

/**
 * 取消人员在流程中的审批人身份
 * @param {Object} params - 参数对象
 * @param {String} params.id - 人员id
 */
export function cancelUserApproval(params) {
  return http.post('/setting/fieldInfo/confirm', params, false);
}

/**
 * 工单设置，删除组件
 * @param {Object} params - 参数对象
 * @param {String} params.id - 人员id
 */
export function deleteComponent(params) {
  return http.post('/setting/fieldInfo/delete2', params, false);
}

/**
 * 获取工单设置的除组件外的其他信息
 * @param {Object} params - 参数对象
 * @param {String} params.id - 工单id
 */
export function getTaskType(params) {
  return http.get('/setting/taskType/getOne', params);
}

/**
 * 工单设置，回执其他设置模块的配置修改
 * @param {Object} params - 参数对象
 * @param {String} params.id - 配置id
 * @param {String} params.name - 配置名
 * @param {String} params.state - 配置状态
 */
export function modifyOption(params) {
  return http.post('/setting/taskType/saveOption', params, false);
}

/**
 * 工单设置，回执合规设置模块的配置修改
 * @param {Object} params - 参数对象
 * @param {String} params.id - 配置id
 * @param {String} params.name - 配置名
 * @param {String} params.state - 配置状态
 */
export function modifyConfig(params) {
  return http.post('/setting/taskType/saveConfig', params, false);
}

/**
 * 工单设置，回执合规设置模块的配置修改
 * @param {Object} params - 参数对象
 * @param {String} params.typeId - 配置id
 */
export function getTaskCardDetailList(params) {
  return http.get('/setting/getTaskCardDetailList', params);
}

/**
 * 顶部筛选, 状态数据展示
 */
export function getTaskCountByState(params) {
  return http.get('/task/getTaskCountByState', params);
}




/* -------------  end  新工单api ---------------- */