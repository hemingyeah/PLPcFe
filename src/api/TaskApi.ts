import http from "@src/util/http"
import {
  TaskCreateAndEditModel,
  PlanTaskCreateAndEditModel,
  TaskSearchListModel,
  TaskGetCardDetailListModel,
  TaskAllotUserListByTagModel,
  TaskAutoDispatchResultListModel,
  TaskUserCardSearchModel,
  TaskAllotUserSearchModel
} from "@model/param/in/Task"

import { 
  getUserViewsResult, 
  getTaskCountByStateResult, 
  getTaskSearchListResult,
  getTaskFilterWithPartResult,
  getLatestRecordResult,
  getUserListByTagResult,
  getTaskConfigResult,
  getAutoDispatchResultListResult,
  getTaskUserCardInfoResult,
  getTaskAllotUserInfoResult
} from '@model/param/out/Task'

import GrayUtil from '@src/util/gray'

const fixedPrefixTaskPath = '/api/task'
const ElASTICSEARCH = '/api/elasticsearch'
const fixedPrefixPaymentPath = '/api/payment'

/* ------------- start 旧工单api ---------------- */

/**
 * 删除计划任务
 * @param {Object} params - 参数
 * @param {Array} params.ids - 计划id
 */
export function deletePlanTask(params: {} | undefined) {
  return http.post("/task/deletePlanTask", params, false);
}

/**
 * 工单表单 关联字段
 * module为 customer/product
 * id为已选择的客户或产品的id，选择的产品数量=1的时候才去查值赋值
 * fieldName和formType填这种字段setting里存的值
 * @param {*} params = {String module,String id,String fieldName,String formType}
 */
export function relatedFieldValue(params: {} | undefined) {
  return http.get("/dd/task/relatedFieldValue", params);
}

/**
 * @description 获取工单表单数据
 * @param {Object} params-- params
 * @param {String} params.tableName -- 表名
 * @param {String} params.templateId -- 类型模板id
 */
export function getTaskTemplateFields(params: {} | undefined) {
  return http.get("/task/getTaskTemplateFields", params);
}

/**
 * @description 获取工单表单数据(老版本，可以获取被隐藏的系统组件)
 * @param {Object} params-- params
 * @param {String} params.tableName -- 表名
 * @param {String} params.typeId -- 类型模板id
 */
export function getFields(params: {} | undefined) {
  return http.get("/setting/taskType/getFields", params);
}

/**
 * @description 查询客户产品关联字段
 * @param {Object} params -- 参数对象
 * @param {String} params.module -- 模块 customer/product
 * @param {String} params.id -- 客户id
 * @param {String} params.fieldName -- 字段名称
 * @param {String} params.formType -- 字段类型
 */
export function getTaskRelatedInfo(params: {} | undefined) {
  return http.get("/task/getRelatedInfo", params);
}

/**
 * @description 获取客户数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 */
export function getTaskCustomerList(params: {} | undefined) {
  return http.get("/task/customer/list", params);
}

/**
 * @description 获取客户产品数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
 */
export function getTaskCustomerProduct(params: {} | undefined) {
  return http.get("/task/customer/product", params);
}

/**
 * @description 获取客户联系人数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
 */
export function getTaskCustomerLinkman(params: {} | undefined) {
  return http.get("/api/elasticsearch/outside/es/linkman/list", params);
}

/**
 * @description 获取客户地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.pageSize -- 页码大小
 * @param {String} params.pageNum -- 分页数
 * @param {String} params.keyword -- 关键字
 * @param {String} params.customerId -- 客户id
 */
export function getTaskCustomerAddress(params: {} | undefined) {
  return http.get("/task/customer/address", params);
}

/**
 * @description 获取客户联系人和地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.customerId -- 客户id
 * @param {String} params.productId -- 产品id
 * @param {String} params.notNull -- 分页数
 */
export function getTaskDefaultInfo(params: {} | undefined) {
  return http.get("/task/defaultInfo", params);
}

/**
 * @description 通过产品id获取客户数据
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 产品id
 */
export function getCustomerByProduct(params: {} | undefined) {
  let productPreFixedPath = GrayUtil.getCustomerApiPath();
  return http.get(`${productPreFixedPath}/customer/product/detail/data`, params);
}

/**
 * @description 通过联系人id获取地址数据
 * @param {Object} params -- 参数对象
 * @param {String} params.lmId -- 产品id
 */
export function getLmBindAddress(params: {} | undefined) {
  return http.get("/task/getLmBindAddress", params);
}

/**
 * @description 获取新建客户相关数据
 */
export function getCreateCustomerData(params: {} | undefined) {
  return http.get("/task/getCustomerEditInitData", params);
}

/**
 * @description 获取新建产品相关数据
 */
export function getCreateProductData(params: {} | undefined) {
  return http.get("/task/getProducEditInitData", params);
}

/**
 * @description 获取备件配置信息
 */
export function getSparepartConfig(params: {} | undefined) {
  return http.post("/partV2/repertory/sparepartConfig", params);
}

/**
 * @description 获取备件仓库列表数据
 */
export function getRepertoryList(params: {} | undefined) {
  return http.get("/task/repertory", params);
}

/**
 * @description 检查附加组件是否必填
 */
export function checkNotNullForCard(params: {} | undefined) {
  return http.post("/task/checkNotNullForCard", params, false);
}

/**
 * @description 打印工单
 */
export function printTask(params: {} | undefined) {
  return http.get("/task/getPrintToken", params);
}

/**
 * @description 审批详情
 */
export function getApprove(params: {} | undefined) {
  return http.get("/approve/get", params);
}

/**
 * @description 审批
 */
export function saveApprove(params: {} | undefined) {
  return http.post("/approve/saveResult", params, false);
}

/**
 * @description 撤回审批
 */
export function offApprove(params: {} | undefined) {
  return http.get("/approve/offApprove", params);
}

/**
 * @description 发起审批
 */
export function applyApprove(params: {} | undefined) {
  return http.post("/approve/apply", params);
}

/**
 * @description 开始工单时校验是否需要审批
 */
export function startApproveCheck(params: {} | undefined) {
  return http.get("/task/approve/start", params);
}

/**
 * @description 取消工单时校验是否需要审批
 */
export function offApproveCheck(params: {} | undefined) {
  return http.post("/task/approve/off", params, true);
}

/**
 * @description 暂停工单时校验是否需要审批
 */
export function pauseApproveCheck(params: {} | undefined) {
  return http.get("/task/approve/pause", params);
}

/**
 * @description 审核结算时校验是否需要审批
 */
export function balanceApproveCheck(params: {} | undefined) {
  return http.post("/balance/approve/confirm", params, false, { headers: { indices: true } });
}

/**
 * @description 回访时校验是否需要审批
 */
export function reviewApproveCheck(params: {} | undefined) {
  return http.post("/task/approve/degreeForView", params);
}

/**
 * @description 完成时校验是否需要审批
 */
export function finishApproveCheck(params: {} | undefined) {
  return http.post("/task/approve/finish", params);
}

/**
 * @description 获取工单最近更新记录
 * @param {Object} params - 参数
 * @param {String} params.taskId - 工单id
 * @return {MsgModal<String>} 最近更新记录
 */
export function getTaskUpdateRecord(params: { taskId: string }): Promise<getLatestRecordResult> {
  return http.get("/task/getLatestRecord", params, false)
}

/**
 * @description 获取产品列表
 * @param {Object} params - 参数
 */
export function getTaskCustonerProductList(params: {} | undefined) {
  return http.get("/task/customer/product", params, false);
}

/**
 * @description 获取产品列表
 * @param {Object} params - 参数
 * @param {String} params.module - 模块名字
 * @param {String} params.id - id
 */
export function getCountForCreate(params: {} | undefined) {
  return http.get("/task/getCountForCreate", params, false);
}

/**
 * @description 获取产品列表
 * @param {Object} params - 参数
 * @param {String} params.phone - 手机号
 */
export function getCustomerByPhone(params: {} | undefined) {
  return http.get("task/getCustomerByPhone", params, false);
}

/**
 * @description 获取工单配置
 */
export function getTaskConfig(): Promise<getTaskConfigResult> {
  return http.get("/task/getTaskConfig", {}, false);
}

/**
 * @description 创建工单备注
 * @param {Object} params - 参数
 * @param {String} params.taskId - 工单Id
 * @param {String} params.taskNo - 工单编号
 * @param {Object} params.content - 内容信息
 * @param {Number} params.showInOwn - 是否仅自己可见
 * @param {Number} params.toCustomer - 客户可见
 * @param {Number} params.cusNotice - 向客户发送短信
 */
// export function taskRecordCreate(params: any) {
//   return http.post("/task/taskRecord/create", params, false);
// }

/* -------------  end  旧工单api ---------------- */

/* ------------- start 新工单api ---------------- */

/**
 * 获取工单类型
 */
export function getTaskTypes() {
  return http.get(`${fixedPrefixTaskPath}/outside/dd/task/types`);
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
export function taskList(params: {} | undefined) {
  return http.post("/task/findList", params);
}

/**
 * 开始工单
 * @param {Object} params - 参数对象
 * @param {String} params.planTime - 计划时间时间戳
 * @param {String} params.taskId - 工单id
 * @param {String} params.tick - 是否勾选 1勾选 0不勾选
 */
export function startTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/start`, params);
}

/**
 * 接受工单
 * @param {Object} params - 参数对象
 * @param {String} params.newPlanTime - 计划时间
 * @param {String} params.taskId - 工单id
 * @param {String} params.tick - 是否勾选 1勾选 0不勾选
 */
export function accept(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/accept`, params);
}

/**
 * 从工单池接单
 * @param {Object} params - 参数对象
 * @param {String} params.newPlanTime - 计划时间
 * @param {String} params.taskId - 工单id
 * @param {String} params.tick - 是否勾选 1勾选 0不勾选
 */
export function acceptFromPool(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/acceptFromPool`,
    params
  );
}

/**
 * 修改计划时间
 * @param {Object} params - 参数对象
 * @param {String} params.planTime - 计划时间
 * @param {String} params.taskId - 工单id
 * @param {String} params.sendSMS - 是否发送短信
 */
export function modifyPlanTime(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/updatePlanTime`,
    params
  );
}

/**
 * 拒绝工单
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 拒绝原因
 * @param {String} params.taskId - 工单id
 */
export function refuseTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/refuse`, params);
}

/**
 * 取消工单
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 取消原因
 * @param {String} params.taskId - 工单id
 * @param {String} params.isGoBack - 是否回退备件 1是0否
 */
export function cancelTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/off`, params);
}

/**
 * 判断曾回退、且当前状态未完成的工单，在最后一次完成时是否使用了备件
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 */
export function finishedWithPart(params: {} | undefined) {
  return http.get(
    `${fixedPrefixTaskPath}/outside/pc/task/finishedWithPart`,
    params
  );
}

/**
 * 暂停工单
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 暂停原因
 * @param {String} params.taskId - 工单id
 */
export function pauseTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/pause`, params);
}

/**
 * 继续
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 */
export function unpauseTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/unpause`, params);
}

/**
 * 回退工单
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 * @param {String} params.reason - 回退原因
 */
export function rollBackTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/rollBack`, params);
}

/**
 * 删除工单
 * @param {Object} params - 参数对象
 * @param {Array} params.taskIds - 需要删除的工单id数组
 */
export function deleteTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/delete`, params);
}

/**
 * 结算工单
 * @param {Object} params - 参数对象
 * @param {Array} params.balanceAttachments - 附件
 * @param {Object} params.balanceAttributes - 自定义结算字段值集合
 * @param {String} params.taskId - 工单id
 */
export function balanceTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/balance`, params);
}

/**
 * 编辑结算
 * @param {Object} params - 参数对象
 * @param {Array} params.balanceAttachments - 附件
 * @param {Object} params.balanceAttributes - 自定义结算字段值集合
 * @param {String} params.taskId - 工单id
 */
export function editBalance(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/editBalance`,
    params
  );
}

/**
 * 回退结算
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 回退原因
 * @param {String} params.taskId - 工单id
 */
export function rollBackBalance(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/rollBackBalance`,
    params
  );
}

/**
 * 回访工单
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 * @param {String} params.suggestion - 回访备注
 * @param {Object} params.evaluate - 自定义回访信息
 * @param {String} params.degree - 满意度
 * @param {Boolean} params.autoClosed - 回访并关闭true，光回访传false
 */
export function reviewTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/review`, params);
}

/**
 * @description 保存附加组件
 * @param {Object} params 参数对象
 * @param {String} params.cardId 附加组件id
 * @param {String} params.inputType 附加组件填写类型
 * @param {Object} params.attribute 附加组件自定义字段
 * @param {String} params.taskId 工单id
 */
export function taskCreateCard(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/card/save`, params);
}

/**
 * @description 编辑附加组件
 * @param {Object} params 参数对象
 * @param {String} params.cardId 附加组件id
 * @param {String} params.inputType 附加组件填写类型
 * @param {Object} params.attribute 附加组件自定义字段
 * @param {String} params.taskId 工单id
 */
export function taskEditCard(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/card/edit`, params);
}

/**
 * @description 删除附加组件
 * @param {Object} params 参数对象
 * @param {String} params.cardId 附加组件id
 * @param {String} params.infoId 附加组件实例id
 * @param {String} params.taskId 工单id
 */
export function taskDeleteCard(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/card/delete`,
    params
  );
}

/**
 * @description 工时记录列表
 * @param {Object} params 参数对象
 * @param {String} params.cardId 附加组件id
 * @param {String} params.orderId 工单id
 */
export function getHoursRecordList(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/tasktime/getMainList`,
    params
  );
}

/**
 * @description 编辑工时记录
 * @param {String} params.id 工时记录附加组件实例id
 */
export function updateHoursRecord(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/tasktime/updateWorkTimeRecord`,
    params
  );
}

/**
 * @description 新增工时记录
 * @param {String} params.cardId 工时记录id
 * @param {String} params.orderId 工单id
 * @param {String} params.recordFromType 默认1
 */
export function createHoursRecord(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/tasktime/createWorkTimeRecordForweb`,
    params
  );
}

/**
 * @description 删除工时记录
 * @param {String} params.mainId 工时记录附加组件实例id
 */
export function deleteHoursRecord(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/tasktime/deleteWorkTimeRecord`,
    params,
    false
  );
}

/**
 * @description 工时记录位置详情
 * @param {String} params.mainId 工时记录附加组件实例id
 */
export function hoursRecordLocation(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/tasktime/getDetailList`,
    params,
    false
  );
}

/**
 * @description 完成回执
 */
export function finishTask(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/finish`, params);
}

/**
 * @description 编辑回执
 */
export function editReceipt(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/editReceipt`,
    params
  );
}

/**
 * @description 暂存回执
 */
export function receiptDraft(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/receiptDraft/save`, params);
}

/**
 * @description 修改协同人
 */
export function updateSynergies(params: {} | undefined) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/updateSynergies`, params);
}

/**
 * @description 获取工单对应的订单的支付状态
 * @param {Object} params 参数
 * @param {String} params.taskId 工单id
 */
export function getPaymentOrder(params: {} | undefined) {
  return http.get(
    `${fixedPrefixPaymentPath}/outside/payment/order/query`,
    params
  );
}

/**
 * @description 获取工单对应的订单的支付状态
 * @param {Object} params 参数
 * @param {String} params.taskId 工单id
 */
export function getPaymentDetail(params: {} | undefined) {
  return http.get(
    `${fixedPrefixPaymentPath}/outside/paymentBill/online/getByTaskId`,
    params
  );
}

/**
 * 保存工单设置信息
 * @param {Object} params - 参数对象
 * @param {String} params.fields - 设置form对象
 */
export function taskSettingSave(params: {} | undefined) {
  return http.post("/setting/taskType/field/save", params);
}

/**
 * 校验人员是否是审批人
 * @param {Object} params - 参数对象
 * @param {String} params.id - 人员id
 */
export function checkUser(params: {} | undefined) {
  return http.post("/setting/fieldInfo/check", params, false);
}

/**
 * 取消人员在流程中的审批人身份
 * @param {Object} params - 参数对象
 * @param {String} params.id - 人员id
 */
export function cancelUserApproval(params: {} | undefined) {
  return http.post("/setting/fieldInfo/confirm", params, false);
}

/**
 * 工单设置，删除组件
 * @param {Object} params - 参数对象
 * @param {String} params.id - 人员id
 */
export function deleteComponent(params: {} | undefined) {
  return http.post("/setting/fieldInfo/delete2", params, false);
}

/**
 * 获取工单设置的除组件外的其他信息
 * @param {Object} params - 参数对象
 * @param {String} params.id - 工单id
 */
export function getTaskType(params: {} | undefined) {
  return http.get("/setting/taskType/getOne", params);
}

/**
 * 工单设置，回执其他设置模块的配置修改
 * @param {Object} params - 参数对象
 * @param {String} params.id - 配置id
 * @param {String} params.name - 配置名
 * @param {String} params.state - 配置状态
 */
export function modifyOption(params: {} | undefined) {
  return http.post("/setting/taskType/saveOption", params, false);
}

/**
 * 工单设置，回执合规设置模块的配置修改
 * @param {Object} params - 参数对象
 * @param {String} params.id - 配置id
 * @param {String} params.name - 配置名
 * @param {String} params.state - 配置状态
 */
export function modifyConfig(params: {} | undefined) {
  return http.post("/setting/taskType/saveConfig", params, false);
}

/**
 * 工单设置，回执合规设置模块的配置修改
 * @param {Object} params - 参数对象
 * @param {String} params.typeId - 配置id
 */
export function getTaskCardDetailList(params: {} | undefined) {
  return http.get("/setting/getTaskCardDetailList", params);
}

/**
 * 顶部筛选, 状态数据展示
 */
export function getTaskCountByState(params: {} | undefined): Promise<getTaskCountByStateResult> {
  return http.post(`${ElASTICSEARCH}/outside/es/task/getTaskCountByState`, params)
}

/**
 * 存为视图
 * @param {Object} params -对象参数
 * @param {String} params.viewName -视图名称
 * @param {String} params.viewRegion -是否全员可见
 * @param {String} params.editViewId -视图id
 * @param {Array} params.selectedCols -选择列选中的参数
 * @param {String} params.tsmStr
 */
export function createView(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/view/createTaskView`,
    params
  );
}

/**
 * 编辑视图
 * @param {Object} params -对象参数
 * @param {String} params.viewName -视图名称
 * @param {String} params.viewRegion -是否全员可见
 * @param {String} params.editViewId -视图id
 * @param {Array} params.selectedCols -选择列选中的参数
 * @param {String} params.tsmStr
 */
export function editView(params: {} | undefined) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/view/editTaskView`,
    params
  );
}

/**
 * 删除视图
 * @param {Object} params -对象参数
 * @param {String} params.editViewId -视图id
 */
export function deleteView(params: {} | undefined) {
  return http.get(
    `${fixedPrefixTaskPath}/outside/pc/view/deleteOneView/${params}`
  );
}

/**
 * 工单设置，回执合规设置模块 下载此工单类型的标识对应表
 * @param {Object} params - 参数对象
 * @param {String} params.typeId - 配置id
 */
export function getTaskTemplate(params: {} | undefined) {
  return http.get("/setting/taskType/getTemplateDic", params);
}

/**
 * 获取工单列表
 * @param {Object} params - 参数对象
 * @param {String} params.allotUser - 派单人userId
 * @param {Object} params.conditions - 自定义字段的搜索条件
 * @param {String} params.createUser - 创建人userId
 * @param {String} params.cusAddress - 详细地址搜索
 * @param {String} params.cusCity - 市搜索
 * @param {String} params.cusDist - 区搜索
 * @param {String} params.cusProvince - 省搜索
 * @param {String} params.cusTagIds - 团队ID，用于查询符合团队的客户
 * @param {String} params.customerId - 客户id
 * @param {String} params.customerLinkman - 客户联系人
 * @param {number} params.dataLevel - 数据权限
 * @param {String} params.executor - 负责人userId
 * @param {String} params.executorIdList - 负责人userIdList，配合数据权限使用
 * @param {String} params.ids - 工单idList
 * @param {boolean} params.ignoreTaskPoolAuth - 忽略工单池权限
 * @param {String} params.keyword - 关键字搜索
 * @param {boolean} params.mobileState - 是否是移动端的工单状态，search方法特殊处理
 * @param {String} params.myId - 搜索人id，配合数据权限使用
 * @param {boolean} params.noGeo - 获取是否有定位的工单
 * @param {boolean} params.orderByDistance - 是否按距离排序
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页显示数量
 * @param {String} params.productId - 产品id
 * @param {String} params.serviceContent - 服务内容
 * @param {String} params.serviceType - 服务类型
 * @param {String} params.state - 工单状态
 * @param {String} params.stateList - 工单状态list
 * @param {String} params.synergyId - 协同人userId
 * @param {String} params.tagId - 工单按团队搜索
 * @param {String} params.templateId - 工单类型Id
 * @param {String} params.tenantId	 - 租户Id
 * @param {integer} params.onceException	 - 异常标记：曾超时暂停拒绝整合 1超时 2拒绝 3暂停 4回退 5位置异常
 * @param {integer} params.onceOverTime	 - 曾超时
 * @param {integer} params.onceRefused	 - 曾拒绝
 * @param {integer} params.oncePaused	 - 曾暂停
 * @param {integer} params.onceReallot	 - 曾转派
 * @param {integer} params.oncePrinted	 - 曾打印
 * @param {integer} params.allotType	 - 派单方式
 * @param {String} params.updateTimeStart	 - 更新时间start
 * @param {String} params.updateTimeEnd	 - 更新时间end
 * @param {integer} params.inApprove	 - 是否审批中
 * @param {integer} params.isException	 - 是否异常
 * @param {String} params.oneTagExecutorIdList	 - 服务团队负责人userIdList，配合tagId一起使用
 * @param {String} params.tagIds	 - 多个团队
 * @param {String} params.tagExecutorIdList	 - 团队负责人userIdList，配合tagIds一起使用
 * @param {String} params.customerUserIdList	 - 我所有客户
 * @param {String} params.customerUserId	 - 我客户的：工单的客户的创建人和负责人id
 * @param {String} params.timeStart	 - 开始时间
 * @param {String} params.timeEnd	 - 结束时间
 * @param {String} params.createTimeStart	 - 创建时间start
 * @param {String} params.createTimeEnd	 - 创建时间end
 * @param {String} params.planTimeStart	 - 计划时间start
 * @param {String} params.planTimeEnd	 - 计划时间end
 * @param {String} params.allotTimeStart	 - 派单时间start
 * @param {String} params.allotTimeEnd	 - 派单时间end
 * @param {String} params.completeTimeStart	 - 完成时间start
 * @param {String} params.completeTimeEnd	 - 完成时间end
 * @param {String} params.reviewTimeStart	 - 回访时间start
 * @param {String} params.reviewTimeEnd	 - 回访时间end
 * @param {String} params.balanceTimeStart	 - 结算时间start
 * @param {String} params.balanceTimeEnd	 - 结算时间end
 * @param {String} params.closeTimeStart	 - 关闭时间start
 * @param {String} params.closeTimeEnd	 - 关闭时间end
 * @param {String} params.acceptTimeStart	 - 接收时间start
 * @param {String} params.acceptTimeEnd	 - 接收时间end
 * @param {String} params.startTimeStart	 - 开始时间start
 * @param {String} params.startTimeEnd	 - 开始时间end
 * @param {String} params.level	 - 优先级
 * @param {String} params.overTime	 - 超时时间
 * @param {String} params.inTaskPool	 - 工单池标记
 * @param {String} params.isReview	 - 已回访
 * @param {integer} params.exceptionType	 - 异常类型 0全部 1暂停 2超时
 * @param {String} params.customerIdList	 - 客户IdList，配合数据权限使用
 * @param {String} params.sorts	 - 排序，默认按照创建时间倒序
 * @param {String} params.taskTypeIdList	 - 工单类型IdList，用来工单池顶部统计查询时筛选工单类型
 * @param {integer} params.onceRollback	 - 是否回退过 1回退过 2未回退过
 * @param {boolean} params.validAddress	 - 地址是否有效
 * @param {integer} params.startDistance	 - 起始距离
 * @param {String} params.endDistance	 - 终止距离
 * @param {number} params.myLongitude	 - 当前位置经度
 * @param {number} params.myLatitude	 - 当前位置纬度
 * @param {string} params.taskIds	 - 已经筛选过的工单ID
 * @param {integer} params.isSettled	 - 已结算
 * @param {string} params.reviewType	 - 回访列表选 1人工回访 2客户评价
 * @param {string} params.degree	 - 满意度: 不满意, 满意, 一般
 * @param {string} params.searchCondition	 - 关键词搜索类型
 * @param {string} params.view	 - 视图
 */
export function search(params: TaskSearchListModel): Promise<getTaskSearchListResult> {
  return http.post(`${ElASTICSEARCH}/outside/es/task/search`, params)
}

/*
 * 工单设置，回执合规设置模块 保存自定义打印模板
 * @param {Object} params - 参数对象
 * @param {String} params.typeId - 配置id
 */
export function savePrintTemplate(params: {} | undefined) {
  return http.post("/setting/taskType/savePrintTemplates", params, false);
}

/**
 * 工单设置，回执合规设置模块 保存自定义报告模板
 * @param {Object} params - 参数对象
 * @param {String} params.typeId - 配置id
 */
export function saveReportTemplate(params: {} | undefined) {
  return http.post("/setting/taskType/saveReportTemplates", params, false);
}

/**
 * 工单设置，回执合规设置模块 保存系统 报告模板勾选项
 * @param {Object} params - 参数对象
 * @param {String} params.id - 配置id
 * @param {String} params.reportSetting - 勾选整个对象包裹
 */
export function saveSystemReport(params: {} | undefined) {
  return http.post("/setting/taskType/saveReport", params);
}

/**
 * 工单设置，回执合规设置模块 保存系统 打印模板勾选项
 * @param {Object} params - 参数对象
 * @param {String} params.id - 配置id
 * @param {String} params.printSetting - 勾选整个对象包裹
 */
export function saveSystemPrint(params: {} | undefined) {
  return http.post("/setting/taskType/savePrint", params);
}

/**
 * @description 新建工单
 */
export function createTask(params: TaskCreateAndEditModel) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/create`, params);
}

/**
 * @description 编辑工单
 */
export function editTask(params: TaskCreateAndEditModel) {
  return http.post(`${fixedPrefixTaskPath}/outside/pc/task/edit`, params);
}

/**
 * @description 查询关联显示项数据
 * @param {Object} params 参数对象
 * @param {String} params.customerId 客户id
 * @param {String} params.productId 产品id
 */
export function getRelatedInfo(params: {} | undefined) {
  return http.get(
    `${fixedPrefixTaskPath}/outside/pc/task/getRelatedInfo`,
    params
  );
}

/**
 * @description 筛选已经关联过备件的工单
 * @param {String} taskIds 查询的工单ids example: taskIds=1&taskIds=2
 */
export function withPart(taskIds: string): Promise<getTaskFilterWithPartResult> {
  return http.get(`/task/filter/withPart?${taskIds}`)
}

/**
 * @description 批量更新
 */
export function editBatchTask(params: Object = {}) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/editBatchTask`,
    params
  );
}

/**
 * @description 工单转派
 */
export function redeployBatch(params: Object = {}) {
  return http.post("/task/redeployBatch", params);
}

/**
 * @description 新建计划任务
 */
export function createPlanTask(params: PlanTaskCreateAndEditModel) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/planTask/create`,
    params
  );
}

/**
 * @description 编辑计划任务
 */
export function editPlanTask(params: PlanTaskCreateAndEditModel) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/task/planTask/update`,
    params
  );
}

/**
 * @description 插入工单日志
 * @param {Object} params - 参数
 * @param {String} params.taskId - 工单Id
 * @param {String} params.taskNo - 工单编号
 * @param {String} params.content - 内容信息
 * @param {Number} params.showInOwn - 是否仅自己可见
 * @param {Number} params.toCustomer - 客户可见
 * @param {Number} params.cusNotice - 向客户发送短信
 */
export function taskRecordCreate(params: any) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/taskrecord/create`,
    params
  );
}

/**
 * @description 查询工单日志列表
 * @param {Object} params - 参数
 * @param {String} params.taskId - 工单Id
 */
export function taskRecordList(params: any) {
  return http.get(
    `${fixedPrefixTaskPath}/outside/pc/taskrecord/list`,
    params,
    false
  );
}

/**
 * @description 删除工单日志
 * @param {Object} params - 参数
 * @param {String} params.id -  工单备注Id
 */
export function taskRecordDelete(params: any) {
  return http.post(
    `${fixedPrefixTaskPath}/outside/pc/taskrecord/logicDelete`,
    params,
    false
  );
}

/**
 * @description 拨打电话
 */
export function dialout(params: object) {
  return http.post(`/api/callcenter/outside/callcenter/api/dialout`, params, false);
}

/**
 * @description 获取视图
 * @return {getUserViewsResult} 视图列表
 */
export function getUserViews(): Promise<getUserViewsResult> {
  return http.get(`${fixedPrefixTaskPath}/outside/pc/view/getUserViews`)
}

/**
 * @description 根据工单类型id获取其附加组件信息
 */
export function getCardDetailList(params: TaskGetCardDetailListModel): Promise<Map<string, any>[]> {
  return http.get(`/task/getCardDetailList`, params)
}

/**
 * @description 查询一个视图
 */
export function getOneView(params: string) {
  return http.get(`${fixedPrefixTaskPath}/outside/pc/view/getOneView/${params}`)
}

/**
 * @description 查询指派人员列表
 */
export function getUserListByTag(params: TaskAllotUserListByTagModel): Promise<getUserListByTagResult> {
  return http.post('/task/allotMap/userListByTag', params)
}

/**
 * @description 旧版切换原因
 */
export function revertReason(params: object) {
  return http.post(`/task/revertReason`, params)
}

/** 
 * @description 查询指派工单池人员列表
*/
export function getTaskAllotPoolUserList(params: TaskAllotUserListByTagModel): Promise<getUserListByTagResult> {
  return http.post('/task/allotMap/userListByTag', params)
}

/**
 * @description 查询工单池工单列表
 */
export function getTaskAlloyPoolList(params: any): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    resolve(
      {"success":true,"code":0,"message":"请求成功","result":{"pageNum":1,"pageSize":20,"size":20,"startRow":0,"endRow":0,"total":387,"pages":20,"list":[{"taskNo":"TRP9020040114","taskId":"8a8702f1-8ad9-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1588248112000,"positionException":1,"taddress":{"id":"c33689fd-89ff-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"市北区","address":"山东省,青岛市,市北区","longitude":120.374731,"latitude":36.087609},"executorImage":null,"executorName":null,"customerName":"测试 测试","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TRP9020040114","attribute":{"field_AteWWzeriWNsAYdd":{}},"customer":{"id":"c3293e00-89ff-11ea-9ddd-00163e0f1a1b","name":"测试 测试","executorUserId":"6a6892c6-5c00-11e7-9ba9-00163e12f748","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6a7c3b49-585c-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"夏沈超","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9rzPDtfjNAdvNAd0_477_475.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"043955471422807372","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"679e6312-683e-11ea-9ddd-00163e0f1a1b","displayName":"薄德忠","staffId":"146424121533631117","head;":"https://static-legacy.dingtalk.com/media/lADPD3lGo1ZeoWfNBDjNBDg_1080_1080.jpg"},{"userId":"5c27860d-c812-11e7-acef-00163e12f748","displayName":"测试","staffId":"32555636903146","head;":"https://static-legacy.dingtalk.com/media/lADOucIsHc0BrM0BrA_428_428.jpg"}],"isEncryptPlanTime":null},{"taskNo":"TWP8120040117","taskId":"678a2677-8ae0-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1588337100000,"completeTime":0,"templateId":"2fbe3c32-7f25-4b0c-b76a-ba279cb1cb04","templateName":"工时组件","inApprove":0,"isPaused":0,"overTime":1588251060000,"positionException":0,"taddress":{"id":null,"province":null,"city":null,"dist":null,"address":"","longitude":null,"latitude":null},"executorImage":null,"executorName":null,"customerName":"曾庆红","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":null,"balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":"2020-05-01T12:45:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TWP8120040117","attribute":{},"customer":{"id":"4c9eedac-8a13-11ea-9ddd-00163e0f1a1b","name":"曾庆红","executorUserId":"6a6892c6-5c00-11e7-9ba9-00163e12f748","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"51d4d219-c7d9-11e9-a387-7cd30abca02e","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"王欣宇","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9q8hoOFvNAobNAhw_540_646.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"264142503029299087","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TZI9020040118","taskId":"4c1352a5-8ae2-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1588251873000,"positionException":0,"taddress":{"id":"c33689fd-89ff-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"市北区","address":"山东省,青岛市,市北区","longitude":120.374731,"latitude":36.087609},"executorImage":null,"executorName":null,"customerName":"测试 测试","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TZI9020040118","attribute":{"field_AteWWzeriWNsAYdd":{}},"customer":{"id":"c3293e00-89ff-11ea-9ddd-00163e0f1a1b","name":"测试 测试","executorUserId":"6a6892c6-5c00-11e7-9ba9-00163e12f748","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6a7c3b49-585c-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"夏沈超","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9rzPDtfjNAdvNAd0_477_475.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"043955471422807372","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TQO9020040119","taskId":"5ba8cbca-8ae2-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1588251899000,"positionException":0,"taddress":{"id":"c33689fd-89ff-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"市北区","address":"山东省,青岛市,市北区","longitude":120.374731,"latitude":36.087609},"executorImage":null,"executorName":null,"customerName":"测试 测试","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TQO9020040119","attribute":{"field_AteWWzeriWNsAYdd":{}},"customer":{"id":"c3293e00-89ff-11ea-9ddd-00163e0f1a1b","name":"测试 测试","executorUserId":"6a6892c6-5c00-11e7-9ba9-00163e12f748","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6a7c3b49-585c-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"夏沈超","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9rzPDtfjNAdvNAd0_477_475.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"043955471422807372","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TCQ9020040120","taskId":"85c5961f-8ae2-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1588251970000,"positionException":0,"taddress":{"id":"4759f83c-6279-11ea-9ddd-00163e0f1a1b","province":"浙江省","city":"杭州市","dist":"余杭区","address":"浙江省,杭州市,余杭区,八方城","longitude":120.046052,"latitude":30.289958},"executorImage":null,"executorName":null,"customerName":"夏沈超~","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TCQ9020040120","attribute":{"field_AteWWzeriWNsAYdd":{}},"customer":{"id":"474ceef2-6279-11ea-9ddd-00163e0f1a1b","name":"夏沈超~","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6a7c3b49-585c-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"夏沈超","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9rzPDtfjNAdvNAd0_477_475.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"043955471422807372","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"THI9020050023","taskId":"ce2f0aa7-94fa-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1589361931000,"positionException":0,"taddress":{"id":"17dfb7f1-8a2a-11ea-9ddd-00163e0f1a1b","province":"北京市","city":"市辖区","dist":"东城区","address":"北京市,市辖区,东城区,东直门","longitude":116.418802,"latitude":39.940792},"executorImage":null,"executorName":null,"customerName":"张 三","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"THI9020050023","attribute":{"field_uPZqfpMk0PfVshhX":{},"field_eZ11Hm4JK4habfH4":[],"field_AteWWzeriWNsAYdd":{}},"customer":{"id":"7e5cd6fc-8a19-11ea-9ddd-00163e0f1a1b","name":"张 三","executorUserId":"6a6892c6-5c00-11e7-9ba9-00163e12f748","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"486da775-f11a-11e8-af91-7cd30abca02e","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"姜玲","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem8OKvNBKHNAxY_790_1185.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"2241636048742742","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":null,"displayName":null,"staffId":null,"head;":null}],"isEncryptPlanTime":null},{"taskNo":"TLI9020050056","taskId":"3d2aeaec-9693-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1589539500000,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1590630926000,"positionException":0,"taddress":{"id":"b079d5d2-944a-11ea-9ddd-00163e0f1a1b","province":"其他区域","city":"其他","dist":"","address":"其他区域,其他,1212121212","longitude":null,"latitude":null},"executorImage":null,"executorName":null,"customerName":"A","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"1212","balanceAttribute":{},"serviceContent":"安装","attachment":[{"filename":"25566c64034f78f092ef70fd77310a55b2191c10-叶泽伟-2020-05-15.jpg","fileSize":"179.00KB","id":"3324d384-684a-4b2e-a559-1afbb74d9b0b","url":"https://she-dev.oss-cn-hangzhou.aliyuncs.com/acs/newfiles/7416b42a-25cc-11e7-a500-00163e12f748/202005/ab263027-a6ac-462b-b796-20fe6401c8c3.jpg"}],"planTime":"2020-05-15T10:45:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TLI9020050056","attribute":{"field_dpcLPbMlGo3GJrX2":["选项二"],"field_7hNJx41j80btOcBQ":"121212","field_uPZqfpMk0PfVshhX":{"head":"https://static-legacy.dingtalk.com/media/lADOucIsHc0BrM0BrA_428_428.jpg","displayName":"测试","userId":"5c27860d-c812-11e7-acef-00163e12f748","staffId":"32555636903146"},"field_eZ11Hm4JK4habfH4":["一级选项 1","二级选项 1"],"field_AteWWzeriWNsAYdd":{"head":"https://static-legacy.dingtalk.com/media/lADPD3lGo1ZeoWfNBDjNBDg_1080_1080.jpg","displayName":"薄德忠","userId":"679e6312-683e-11ea-9ddd-00163e0f1a1b","staffId":"146424121533631117"},"field_DEtozR4bUqJSC6ZQ":"1212","field_WThiYXXyZPMiyrbN":{"head":"","displayName":"null","userId":"cb92f70a-8900-11e7-aba8-00163e12f748","staffId":"10161161493392903"},"field_YWP82FBQHmM0OMwQ":"2020-05-22 00:00:00"},"customer":{"id":"cff0d222-b91a-4601-b514-762ab0f822ed","name":"A","executorUserId":"672b0b25-5c00-11e7-9ba9-00163e12f748","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"e06d87c0-5d10-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"叶泽伟","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgfLOWr3MtzNBCrNBCo_1066_1066.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"170937546621540920","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"672b0b25-5c00-11e7-9ba9-00163e12f748","displayName":"杨昌洋196","staffId":"06116304481144564679","head;":""}],"isEncryptPlanTime":null},{"taskNo":"TIB9620050064","taskId":"81ad0bd7-96ac-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1589623200000,"completeTime":0,"templateId":"dcc0c882-61b5-4d71-ad2d-359593336690","templateName":"测试","inApprove":0,"isPaused":0,"overTime":1589561069000,"positionException":0,"taddress":{"id":"de11bc6b-93f5-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"","address":"山东省,青岛市,地址地址地址地址","longitude":120.382639,"latitude":36.067082},"executorImage":null,"executorName":null,"customerName":"张丁","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":null,"balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":"2020-05-16T10:00:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TIB9620050064","attribute":{},"customer":{"id":"de01bb8c-93f5-11ea-9ddd-00163e0f1a1b","name":"张丁","executorUserId":"3945fae5-8a1b-11ea-9ddd-00163e0f1a1b","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"e06d87c0-5d10-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"叶泽伟","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgfLOWr3MtzNBCrNBCo_1066_1066.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"170937546621540920","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"3945fae5-8a1b-11ea-9ddd-00163e0f1a1b","displayName":"木兰","staffId":"0155351420839496","head;":"https://static-legacy.dingtalk.com/media/lADPGoxXbO0xJlTNByPNByM_1827_1827.jpg"}],"isEncryptPlanTime":null},{"taskNo":"TQS9420050073","taskId":"c4a17a17-99b3-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"6ee11dfa-084b-409f-8a6e-a563b080f75a","templateName":"移动端测试","inApprove":0,"isPaused":0,"overTime":1589881171000,"positionException":0,"taddress":{"id":"ad3a9a7c-95a8-11ea-9ddd-00163e0f1a1b","province":"陕西省","city":"西安市","dist":"雁塔区","address":"陕西省,西安市,雁塔区,丈八沟街道陕西宾馆","longitude":108.877004,"latitude":34.201425},"executorImage":null,"executorName":null,"customerName":"Xs1","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":null,"balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TQS9420050073","attribute":{"field_oJuoWO4aaffH6Ipi":[]},"customer":{"id":"ad27c1ff-95a8-11ea-9ddd-00163e0f1a1b","name":"Xs1","executorUserId":"2abb263c-9594-11ea-9ddd-00163e0f1a1b","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"ab0ef1f3-1942-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"蔡大海","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9rShVsl7NAlvNAek_489_603.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"0702311433487377","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"2abb263c-9594-11ea-9ddd-00163e0f1a1b","displayName":"李阳","staffId":"2841185665858277","head;":null}],"isEncryptPlanTime":null},{"taskNo":"TEL9420050074","taskId":"c97ccf71-99b5-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"6ee11dfa-084b-409f-8a6e-a563b080f75a","templateName":"移动端测试","inApprove":0,"isPaused":0,"overTime":1589882024000,"positionException":0,"taddress":{"id":"d28ac723-9362-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"崂山区","address":"山东省,青岛市,崂山区,北宅街道薄板","longitude":120.536447,"latitude":36.199845},"executorImage":null,"executorName":null,"customerName":"测试客户地址00","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TEL9420050074","attribute":{"field_BmW8mVQNvfheyRI4":{},"field_oJuoWO4aaffH6Ipi":[],"field_Re4jtzwpQZMVuMLV":{}},"customer":{"id":"d2850fdc-9362-11ea-9ddd-00163e0f1a1b","name":"测试客户地址00","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"b8a4dc27-d82f-11e8-8abd-7cd30abca02e","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"黄宝成","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem3pdjNBCzNBCo_1066_1068.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"116759226639811031","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TNG9420050075","taskId":"9b704964-99c9-11ea-9ddd-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"6ee11dfa-084b-409f-8a6e-a563b080f75a","templateName":"移动端测试","inApprove":0,"isPaused":0,"overTime":1589890536000,"positionException":0,"taddress":{"id":"d28ac723-9362-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"崂山区","address":"山东省,青岛市,崂山区,北宅街道薄板","longitude":120.536447,"latitude":36.199845},"executorImage":null,"executorName":null,"customerName":"测试客户地址00","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TNG9420050075","attribute":{"field_BmW8mVQNvfheyRI4":{},"field_oJuoWO4aaffH6Ipi":[],"field_Re4jtzwpQZMVuMLV":{}},"customer":{"id":"d2850fdc-9362-11ea-9ddd-00163e0f1a1b","name":"测试客户地址00","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"b8a4dc27-d82f-11e8-8abd-7cd30abca02e","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"黄宝成","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem3pdjNBCzNBCo_1066_1068.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"116759226639811031","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TOR9020060021","taskId":"cdd4a378-a9ed-11ea-9ddd-00163e0f1a1b","level":"测试leaver","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1591666765000,"positionException":0,"taddress":{"id":"ea8458c7-a961-11ea-9ddd-00163e0f1a1b","province":"江西省","city":"九江市","dist":"武宁县","address":"江西省,九江市,武宁县,客看空间的时代大厦","longitude":115.100578,"latitude":29.256323},"executorImage":null,"executorName":null,"customerName":"毒蛙","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"测试leaver","description":null,"balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TOR9020060021","attribute":{"field_gfqxGyEa2omyg8Y0":{"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qfkA7IvNAWTNAWQ_356_356.jpg","displayName":"曹浩","userId":"c33a5952-e5f5-11e7-a9a3-00163e12f748","staffId":"0142602059845200"}},"customer":{"id":"ea7d9cb0-a961-11ea-9ddd-00163e0f1a1b","name":"毒蛙","executorUserId":"6abf7d8d-9e68-11ea-9ddd-00163e0f1a1b","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"b8a4dc27-d82f-11e8-8abd-7cd30abca02e","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"黄宝成","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9qem3pdjNBCzNBCo_1066_1068.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"116759226639811031","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"c7ebde3b-98bb-11ea-9ddd-00163e0f1a1b","displayName":"瞿瑞","staffId":"2765062433980095","head;":null}],"isEncryptPlanTime":null},{"taskNo":"TEB9020060023","taskId":"e7a4223a-a9f0-11ea-9ddd-00163e0f1a1b","level":"测试leaver","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1591668095000,"positionException":0,"taddress":{"id":"d0807397-a708-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"","address":"山东省,青岛市,发发发","longitude":120.382639,"latitude":36.067082},"executorImage":null,"executorName":null,"customerName":"测试联系人wx","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"测试leaver","description":null,"balanceAttribute":{},"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TEB9020060023","attribute":{"field_gfqxGyEa2omyg8Y0":{"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9rShVsl7NAlvNAek_489_603.jpg","displayName":"蔡大海","userId":"ab0ef1f3-1942-11ea-9ddd-00163e0f1a1b","staffId":"0702311433487377"}},"customer":{"id":"d06b6270-a708-11ea-9ddd-00163e0f1a1b","name":"测试联系人wx","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"ab0ef1f3-1942-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"蔡大海","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDgQ9rShVsl7NAlvNAek_489_603.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"0702311433487377","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TFU9020070091","taskId":"f6797738-c416-11ea-9ddd-00163e0f1a1b","level":null,"state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1595500200000,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1594544965000,"positionException":0,"taddress":{"id":null,"province":null,"city":null,"dist":null,"address":"","longitude":null,"latitude":null},"executorImage":null,"executorName":null,"customerName":"黄宝成测试","fieldNames":{"serviceType":null,"sparepart":null,"level":null,"description":null,"balanceAttribute":{},"serviceContent":null,"attachment":[],"planTime":"2020-07-23T10:30:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TFU9020070091","attribute":{},"customer":{"id":"9c96bb0e-bdf4-11ea-9ddd-00163e0f1a1b","name":"黄宝成测试","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6231d4fe-7303-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"仇太俊","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDiQ3J3dlNxrNAvDNAu4_750_752.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"441929081620108519","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"679e6312-683e-11ea-9ddd-00163e0f1a1b","displayName":"薄德忠","staffId":"146424121533631117","head;":"https://static-legacy.dingtalk.com/media/lADPD3lGo1ZeoWfNBDjNBDg_1080_1080.jpg"}],"isEncryptPlanTime":null},{"taskNo":"TEJ9020070092","taskId":"64aa5d0f-c417-11ea-9ddd-00163e0f1a1b","level":null,"state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1595586600000,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1594541658000,"positionException":0,"taddress":{"id":null,"province":null,"city":null,"dist":null,"address":"","longitude":null,"latitude":null},"executorImage":null,"executorName":null,"customerName":"杭州鸽鸽鸽","fieldNames":{"serviceType":null,"sparepart":null,"level":null,"description":null,"balanceAttribute":{},"serviceContent":null,"attachment":[],"planTime":"2020-07-24T10:30:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TEJ9020070092","attribute":{},"customer":{"id":"793584b4-be9e-11ea-9ddd-00163e0f1a1b","name":"杭州鸽鸽鸽","executorUserId":null,"createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6231d4fe-7303-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"仇太俊","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDiQ3J3dlNxrNAvDNAu4_750_752.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"441929081620108519","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"679e6312-683e-11ea-9ddd-00163e0f1a1b","displayName":"薄德忠","staffId":"146424121533631117","head;":"https://static-legacy.dingtalk.com/media/lADPD3lGo1ZeoWfNBDjNBDg_1080_1080.jpg"}],"isEncryptPlanTime":null},{"taskNo":"TED9020070093","taskId":"9d6bd2f3-c419-11ea-9ddd-00163e0f1a1b","level":null,"state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1595500200000,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1594542647000,"positionException":0,"taddress":{"id":null,"province":null,"city":null,"dist":null,"address":"","longitude":null,"latitude":null},"executorImage":null,"executorName":null,"customerName":"黄宝成测试","fieldNames":{"serviceType":null,"sparepart":null,"level":null,"description":null,"balanceAttribute":{},"serviceContent":null,"attachment":[],"planTime":"2020-07-23T10:30:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TED9020070093","attribute":{},"customer":{"id":"9c96bb0e-bdf4-11ea-9ddd-00163e0f1a1b","name":"黄宝成测试","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6231d4fe-7303-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"仇太俊","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDiQ3J3dlNxrNAvDNAu4_750_752.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"441929081620108519","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[{"userId":"679e6312-683e-11ea-9ddd-00163e0f1a1b","displayName":"薄德忠","staffId":"146424121533631117","head;":"https://static-legacy.dingtalk.com/media/lADPD3lGo1ZeoWfNBDjNBDg_1080_1080.jpg"}],"isEncryptPlanTime":null},{"taskNo":"TCO9020070147","taskId":"224de4aa-d09e-11ea-9ddd-00163e0f1a1b","level":null,"state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1596105900000,"completeTime":0,"templateId":"915eb291-420c-4854-b91b-b05df6c5dbed","templateName":"工单列表改造","inApprove":0,"isPaused":0,"overTime":1595922422000,"positionException":0,"taddress":{"id":"8e57684d-c5e7-11ea-9ddd-00163e0f1a1b","province":"山东省","city":"青岛市","dist":"","address":"山东省,青岛市","longitude":120.382639,"latitude":36.067082},"executorImage":null,"executorName":null,"customerName":"测试用户1","fieldNames":{"serviceType":null,"sparepart":null,"level":null,"description":null,"balanceAttribute":{},"serviceContent":null,"attachment":[],"planTime":"2020-07-30T10:45:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TCO9020070147","attribute":{},"customer":{"id":"8e4ef56b-c5e7-11ea-9ddd-00163e0f1a1b","name":"测试用户1","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6231d4fe-7303-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"仇太俊","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPDiQ3J3dlNxrNAvDNAu4_750_752.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"441929081620108519","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TIA9120080010","taskId":"2b9fe351-e8d9-11ea-879a-00163e0f1a1b","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"d3c69214-87fe-4eca-9359-7740d94b805d","templateName":"设备巡检保养","inApprove":0,"isPaused":0,"overTime":1599187231000,"positionException":0,"taddress":{"id":null,"province":"北京市","city":"市辖区","dist":"西城区","address":"北京市,市辖区,西城区,啊","longitude":116.365868,"latitude":39.912289},"executorImage":null,"executorName":null,"customerName":"我的客户1234","fieldNames":{"serviceType":null,"sparepart":null,"level":"中","description":null,"balanceAttribute":{},"serviceContent":null,"attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TIA9120080010","attribute":{"field_fROO5pwTVVAD27sK":"https://baidu.com aaa","field_dDS9XY9M5HcRxVOf":"https://baidu.com aaa"},"customer":{"id":"fee3ea6f-e87a-11ea-879a-00163e0f1a1b","name":"我的客户1234","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"6abf7d8d-9e68-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"贾权超","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPGojJ8b586_nNA8LNA8A_960_962.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"196230552935603552","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TNX9420090002","taskId":"5a71e069-f32c-11ea-9baf-00163e0d174e","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":0,"completeTime":0,"templateId":"6ee11dfa-084b-409f-8a6e-a563b080f75a","templateName":"移动端测试","inApprove":0,"isPaused":0,"overTime":0,"positionException":0,"taddress":{"id":"feea5ecd-e87a-11ea-879a-00163e0f1a1b","province":"北京市","city":"市辖区","dist":"西城区","address":"北京市,市辖区,西城区,啊","longitude":116.365868,"latitude":39.912289},"executorImage":null,"executorName":null,"customerName":"我的客户1234","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"","balanceAttribute":null,"serviceContent":"安装","attachment":[],"planTime":null,"systemAutograph":null,"receiptAttachment":null,"taskNo":"TNX9420090002","attribute":{"field_BmW8mVQNvfheyRI4":{},"field_oJuoWO4aaffH6Ipi":[],"field_Re4jtzwpQZMVuMLV":{}},"customer":{"id":"fee3ea6f-e87a-11ea-879a-00163e0f1a1b","name":"我的客户1234","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"0ade5144-bc14-11ea-9ddd-00163e0f1a1b","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"胡芝芝","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPGo_k8Cor36PNDbDNDbA_3504_3504.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"122408282032776257","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null},{"taskNo":"TST10420090002","taskId":"2bb48250-016b-11eb-9baf-00163e0d174e","level":"中","state":"taskPool","stateName":"工单池","flowSettingName":"工单池","planTime":1601288100000,"completeTime":0,"templateId":"ca83d432-6f95-4749-89e1-d55613f8261b","templateName":"工时打卡测试","inApprove":0,"isPaused":0,"overTime":0,"positionException":0,"taddress":{"id":"bdb566db-c0d2-11e9-bf0c-506b4b2bb4ae","province":"山东省","city":"青岛市","dist":"李沧区","address":"山东省,青岛市,李沧区,浮山路街道青山路267-15号福临万家1期东区","longitude":120.437704,"latitude":36.144266},"executorImage":null,"executorName":null,"customerName":"毛政强测试","fieldNames":{"serviceType":"保内免费","sparepart":null,"level":"中","description":"噔噔噔噔噔","balanceAttribute":null,"serviceContent":"安装","attachment":[],"planTime":"2020-09-28T10:15:00.000+0000","systemAutograph":null,"receiptAttachment":null,"taskNo":"TST10420090002","attribute":{},"customer":{"id":"bdb3a453-c0d2-11e9-bf0c-506b4b2bb4ae","name":"毛政强测试","executorUserId":"","createUserId":null,"tags":null}},"isGuideData":false,"reason":null,"isTiming":null,"distance":null,"balanceConfirm":0,"isReview":0,"viewBalanceTab":false,"viewReviewTab":false,"executor":null,"isSettled":-1,"isReviewed":-1,"createUserEntity":{"userId":"aacfac9a-65f7-11e7-9ba9-00163e12f748","tenantId":null,"loginName":null,"loginPassword":null,"salt":null,"displayName":"王越","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":null,"weiXinId":null,"powerCode":null,"attribute":{},"firstLogin":null,"superAdmin":null,"head":"https://static-legacy.dingtalk.com/media/lADPGoGu76-eXJTNAdXNAZI_402_469.jpg","sex":null,"openId":null,"longitude":null,"latitude":null,"isDelete":null,"synOpenId":null,"staffId":"1159676932953183","createTime":null,"updateTime":null,"state":null,"mainTeamId":null,"iid":null,"province":null,"city":null,"district":null,"cusDistance":null,"unfinishedTask":null},"synergies":[],"isEncryptPlanTime":null}],"prePage":0,"nextPage":0,"isFirstPage":true,"isLastPage":false,"hasPreviousPage":false,"hasNextPage":true,"navigatePages":0,"navigatepageNums":null,"navigateFirstPage":0,"navigateLastPage":0,"firstPage":0,"lastPage":0}}
    )
  })
  // return http.post('/task/allotMap/userListByTag', params)
}

/**
 * @description 查询指派工单团队人员列表
 */
export function getTaskAllotTeamUserList(params: any): Promise<any> {
  return http.post('/task/customerTag/dispatch/list', params)
}

/**
 * @description 自动派单-获取预估列表结果
 */
export function getAutoDispatchResultList(params: TaskAutoDispatchResultListModel): Promise<getAutoDispatchResultListResult> {
  return http.post('http://30.40.61.216:3000/mock/59/outside/pc/task/autoDispatchResultList', params)
}

/**
 * @description 自动派单-审批结果
 */
export function getTaskAutoDispatchApprove(params: any): Promise<any> {
  return http.post('http://30.40.61.216:3000/mock/59/task/approve/autoDispatch', params)
}

/**
 * @description 自动派单-提交开始派单
 */
export function taskAutoDispatch(params: any): Promise<any> {
  return http.post('http://30.40.61.216:3000/mock/59/outside/pc/task/autoDispatch', params)
}

/**
 * @description 工单指派-获取人员卡片信息
 */
export function getTaskUserCardInfo(params: TaskUserCardSearchModel): Promise<getTaskUserCardInfoResult> {
  return http.post('http://30.40.61.216:3000/mock/59/outside/es/task/getUserCardInfo', params)
}

/**
 * @description 工单指派-获取人员列表信息
 */
export function getTaskAllotUserInfo(params: TaskAllotUserSearchModel): Promise<getTaskAllotUserInfoResult> {
  return http.post('http://30.40.61.216:3000/mock/59/outside/es/task/getAllotUserInfo', params)
}

/* -------------  end  新工单api ---------------- */
