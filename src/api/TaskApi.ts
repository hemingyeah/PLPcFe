import http from "@src/util/http";
import {
  TaskCreateAndEditModel,
  PlanTaskCreateAndEditModel,
} from "@model/param/in/Task";

let fixedPrefixAppPath = "/api/app";

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
  return http.get("/customer/product/detail/data", params);
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
 * @description 编辑回执表单
 */
export function editReceipt(params: {} | undefined) {
  return http.post("/task/editReceipt", params);
}

/**
 * @description 判断工单是否使用了备件
 */
export function taskFilterWithPart(params: {} | undefined) {
  return http.get("/task/filter/withPart", params);
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
  return http.post("/balance/approve/confirm", params, false);
}

/**
 * @description 回访时校验是否需要审批
 */
export function reviewApproveCheck(params: {} | undefined) {
  return http.post("/task/approve/degreeForView", params);
}

/**
 * @description 获取工单最近更新记录
 * @param {Object} params - 参数
 * @param {String} params.taskId - 工单id
 * @return {MsgModal<String>} 最近更新记录
 */
export function getTaskUpdateRecord(params: {} | undefined) {
  return http.get("/task/getLatestRecord", params, false);
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
  // return new Promise((resolve, reject) => {
  //   resolve({"status":0,"message":"ok","data":[{"createUser":null,"updateUser":null,"createTime":null,"updateTime":"2019-06-05 09:38:53","id":"0b100c91-4c54-11e9-bfc9-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"0ad15181-4c54-11e9-bfc9-00163e304a25","name":"新建客户-黄宝成5","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"createLoginUser":null,"lmName":null,"lmPhone":null,"lmEmail":null,"customerAddress":{"adCountry":"","adDist":"市北区","adProvince":"山东省","adCity":"青岛市","adAddress":"洪山坡街道伊春路162号鹏飞花园","adLongitude":120.39465500,"adLatitude":36.10926700,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"focus":false,"guideData":false},"name":"新建客户-黄宝成5","sex":null,"position":null,"department":null,"isMain":1,"remark":null,"phone":"17664666980","email":null,"weixin":null,"attribute":null,"postcode":null,"head":null,"fax":null,"enabled":null,"address":null,"guideProfessions":[],"isGuideData":false,"productId":null,"tenantId":null,"guideData":false},{"createUser":"b9510211-d82f-11e8-b3c6-00163e304a25","updateUser":"b9510211-d82f-11e8-b3c6-00163e304a25","createTime":"2020-08-24 09:49:31","updateTime":"2020-08-24 09:49:31","id":"0d741a48-e5ac-11ea-9929-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"0cf315b8-e5ac-11ea-9929-00163e304a25","name":"测试新建客户1111","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"createLoginUser":null,"lmName":null,"lmPhone":null,"lmEmail":null,"customerAddress":{"adCountry":"","adDist":"市北区","adProvince":"山东省","adCity":"青岛市","adAddress":"","adLongitude":120.37473100,"adLatitude":36.08760900,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"focus":false,"guideData":false},"name":"测试新建客户","sex":null,"position":null,"department":null,"isMain":1,"remark":null,"phone":"17664666980","email":null,"weixin":null,"attribute":null,"postcode":null,"head":null,"fax":null,"enabled":null,"address":null,"guideProfessions":[],"isGuideData":false,"productId":null,"tenantId":null,"guideData":false},{"createUser":null,"updateUser":null,"createTime":null,"updateTime":"2019-06-05 09:38:53","id":"0f36aade-5057-11e9-bfc9-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"0f10639b-5057-11e9-bfc9-00163e304a25","name":"测试事件新建客户团队","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"createLoginUser":null,"lmName":null,"lmPhone":null,"lmEmail":null,"customerAddress":{"adCountry":"中国","adDist":"市北区","adProvince":"山东省","adCity":"青岛市","adAddress":"万科","adLongitude":120.38278900,"adLatitude":36.11956300,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"focus":false,"guideData":false},"name":"测试事件新建客户团队","sex":null,"position":null,"department":null,"isMain":1,"remark":null,"phone":"17664666980","email":null,"weixin":null,"attribute":null,"postcode":null,"head":null,"fax":null,"enabled":null,"address":null,"guideProfessions":[],"isGuideData":false,"productId":null,"tenantId":null,"guideData":false},{"createUser":null,"updateUser":null,"createTime":null,"updateTime":"2019-06-05 09:38:53","id":"14b4dba8-4c6e-11e9-bfc9-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"14a11269-4c6e-11e9-bfc9-00163e304a25","name":"测试工单新建客户2","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"createLoginUser":null,"lmName":null,"lmPhone":null,"lmEmail":null,"customerAddress":{"adCountry":"中国","adDist":"浦东新区","adProvince":"上海市","adCity":"市辖区","adAddress":"陆家嘴街道东方明珠广播电视塔","adLongitude":121.50003500,"adLatitude":31.23925000,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"focus":false,"guideData":false},"name":"测试工单新建客户2","sex":null,"position":null,"department":null,"isMain":1,"remark":null,"phone":"17664666980","email":null,"weixin":null,"attribute":null,"postcode":null,"head":null,"fax":null,"enabled":null,"address":null,"guideProfessions":[],"isGuideData":false,"productId":null,"tenantId":null,"guideData":false},{"createUser":null,"updateUser":null,"createTime":"2018-11-28 22:54:37","updateTime":"2018-11-28 22:54:37","id":"8782826f-f31d-11e8-b3c6-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"19bfcb90-f317-11e8-b3c6-00163e304a25","name":"繁體字客戶","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"createLoginUser":null,"lmName":null,"lmPhone":null,"lmEmail":null,"customerAddress":{"adCountry":"","adDist":"东城区","adProvince":"北京市","adCity":"市辖区","adAddress":"1","adLongitude":116.41635700,"adLatitude":39.92835300,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"focus":false,"guideData":false},"name":"黄宝成","sex":null,"position":null,"department":null,"isMain":0,"remark":null,"phone":"17664666980","email":null,"weixin":null,"attribute":null,"postcode":null,"head":null,"fax":null,"enabled":null,"address":null,"guideProfessions":[],"isGuideData":false,"productId":null,"tenantId":null,"guideData":false},{"createUser":null,"updateUser":"f6725463-e733-11e8-b3c6-00163e304a25","createTime":null,"updateTime":"2019-05-10 16:49:24","id":"1ca6eddf-70a2-11e9-bfc9-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"1c8a3bfd-70a2-11e9-bfc9-00163e304a25","name":"新建客户地址测试04","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"createLoginUser":null,"lmName":null,"lmPhone":null,"lmEmail":null,"customerAddress":{"adCountry":"中国","adDist":"李沧区","adProvince":"山东省","adCity":"青岛市","adAddress":"哈哈","adLongitude":120.43269700,"adLatitude":36.14546300,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"focus":false,"guideData":false},"name":"新建客户地址测试01","sex":null,"position":null,"department":null,"isMain":1,"remark":null,"phone":"17664666980","email":null,"weixin":null,"attribute":null,"postcode":null,"head":null,"fax":null,"enabled":null,"address":null,"guideProfessions":[],"isGuideData":false,"productId":null,"tenantId":null,"guideData":false},{"createUser":"b9510211-d82f-11e8-b3c6-00163e304a25","updateUser":"b9510211-d82f-11e8-b3c6-00163e304a25","createTime":"2020-08-23 17:08:00","updateTime":"2020-08-24 11:51:28","id":"246079cc-e520-11ea-9929-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"2412d72f-e520-11ea-9929-00163e304a25","name":"月初","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"createLoginUser":null,"lmName":null,"lmPhone":null,"lmEmail":null,"customerAddress":{"adCountry":"","adDist":"市北区","adProvince":"山东省","adCity":"青岛市","adAddress":"","adLongitude":120.37473100,"adLatitude":36.08760900,"addressType":0,"validAddress":true},"source":null,"guideProfessions":[],"isGuideData":false,"products":[],"focus":false,"guideData":false},"name":"月初","sex":"","position":null,"department":"","isMain":1,"remark":"","phone":"17664666980","email":null,"weixin":null,"attribute":null,"postcode":null,"head":null,"fax":null,"enabled":null,"address":"1c09e7ab-e5ba-11ea-9929-00163e304a25","guideProfessions":[],"isGuideData":false,"productId":[],"tenantId":null,"guideData":false},{"createUser":null,"updateUser":"f6725463-e733-11e8-b3c6-00163e304a25","createTime":null,"updateTime":"2019-05-10 16:51:26","id":"286bf03b-6f1e-11e9-bfc9-00163e304a25","customerId":null,"customer":{"createUser":null,"updateUser":null,"createTime":null,"updateTime":null,"id":"2846e8c5-6f1e-11e9-bfc9-00163e304a25","name":"测试新建客户001","enName":null,"serialNumber":null,"status":null,"level":null,"superior":null,"teamId":null,"customerManager":null,"customerManagerName":null,"remark":null,"industry":null,"type":null,"taskCount":null,"productCount":null,"isDelete":null,"attribute":{},"companyNature":null,"tagIds":null,"tags":[],"createUserId":null,"create
  // })
  return http.get("task/getCustomerByPhone", params, false);
}

/**
 * @description 获取工单配置
 */
export function getTaskConfig() {
  return http.get("/task/getTaskConfig", {}, false);
}

/* -------------  end  旧工单api ---------------- */

/* ------------- start 新工单api ---------------- */

/**
 * 获取工单类型
 */
export function getTaskTypes() {
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
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/start`, params);
}

/**
 * 接受工单
 * @param {Object} params - 参数对象
 * @param {String} params.newPlanTime - 计划时间
 * @param {String} params.taskId - 工单id
 * @param {String} params.tick - 是否勾选 1勾选 0不勾选
 */
export function accept(params: {} | undefined) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/accept`, params);
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
    `${fixedPrefixAppPath}/outside/pc/task/acceptFromPool`,
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
    `${fixedPrefixAppPath}/outside/pc/task/updatePlanTime`,
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
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/refuse`, params);
}

/**
 * 取消工单
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 取消原因
 * @param {String} params.taskId - 工单id
 * @param {String} params.isGoBack - 是否回退备件 1是0否
 */
export function cancelTask(params: {} | undefined) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/off`, params);
}

/**
 * 判断曾回退、且当前状态未完成的工单，在最后一次完成时是否使用了备件
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 */
export function finishedWithPart(params: {} | undefined) {
  return http.get(
    `${fixedPrefixAppPath}/outside/pc/task/finishedWithPart`,
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
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/pause`, params);
}

/**
 * 继续
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 */
export function unpauseTask(params: {} | undefined) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/unpause`, params);
}

/**
 * 回退工单
 * @param {Object} params - 参数对象
 * @param {String} params.taskId - 工单id
 * @param {String} params.reason - 回退原因
 */
export function rollBackTask(params: {} | undefined) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/rollBack`, params);
}

/**
 * 删除工单
 * @param {Object} params - 参数对象
 * @param {Array} params.taskIds - 需要删除的工单id数组
 */
export function deleteTask(params: {} | undefined) {
  return http.post(`/outside/pc/task/delete`, params);
}

/**
 * 结算工单
 * @param {Object} params - 参数对象
 * @param {Array} params.balanceAttachments - 附件
 * @param {Object} params.balanceAttributes - 自定义结算字段值集合
 * @param {String} params.taskId - 工单id
 */
export function balanceTask(params: {} | undefined) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/balance`, params);
}

/**
 * 编辑结算
 * @param {Object} params - 参数对象
 * @param {Array} params.balanceAttachments - 附件
 * @param {Object} params.balanceAttributes - 自定义结算字段值集合
 * @param {String} params.taskId - 工单id
 */
export function editBalance(params: {} | undefined) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/editBalance`, params);
}

/**
 * 回退结算
 * @param {Object} params - 参数对象
 * @param {String} params.reason - 回退原因
 * @param {String} params.taskId - 工单id
 */
export function rollBackBalance(params: {} | undefined) {
  return http.post(
    `${fixedPrefixAppPath}/outside/pc/task/rollBackBalance`,
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
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/review`, params);
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
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/card/save`, params);
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
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/card/edit`, params);
}

/**
 * @description 删除附加组件
 * @param {Object} params 参数对象
 * @param {String} params.cardId 附加组件id
 * @param {String} params.infoId 附加组件实例id
 * @param {String} params.taskId 工单id
 */
export function taskDeleteCard(params: {} | undefined) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/card/delete`, params);
}

/**
 * @description 工时记录列表
 * @param {Object} params 参数对象
 * @param {String} params.cardId 附加组件id
 * @param {String} params.orderId 工单id
 */
export function getHoursRecordList(params: {} | undefined) {
  return http.post(
    `${fixedPrefixAppPath}/outside/tasktime/getMainList`,
    params
  );
}

/**
 * @description 编辑工时记录
 * @param {String} params.id 工时记录附加组件实例id
 */
export function updateHoursRecord(params: {} | undefined) {
  return http.post(
    `${fixedPrefixAppPath}/outside/tasktime/updateWorkTimeRecord`,
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
    `${fixedPrefixAppPath}/outside/tasktime/createWorkTimeRecordForweb`,
    params
  );
}

/**
 * @description 删除工时记录
 * @param {String} params.mainId 工时记录附加组件实例id
 */
export function deleteHoursRecord(params: {} | undefined) {
  return http.post(
    `${fixedPrefixAppPath}/outside/tasktime/deleteWorkTimeRecord`,
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
    `${fixedPrefixAppPath}/outside/tasktime/getDetailList`,
    params,
    false
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
export function getTaskCountByState(params: {} | undefined) {
  return http.get("/task/getTaskCountByState", params);
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
    `${fixedPrefixAppPath}/outside/pc/view/createTaskView`,
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
    `${fixedPrefixAppPath}/outside/pc/view/editTaskView`,
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
    `${fixedPrefixAppPath}/outside/pc/view/deleteOneView`,
    params
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
export function search(params: {} | undefined) {
  return http.post("/outside/es/task/search", params);
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
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/create`, params);
}

/**
 * @description 编辑工单
 */
export function editTask(params: TaskCreateAndEditModel) {
  return http.post(`${fixedPrefixAppPath}/outside/pc/task/edit`, params);
}

/**
 * @description 查询关联显示项数据
 * @param {Object} params 参数对象
 * @param {String} params.customerId 客户id
 * @param {String} params.productId 产品id
 */
export function getRelatedInfo(params: {} | undefined) {
  return http.get(
    `${fixedPrefixAppPath}/outside/pc/task/getRelatedInfo`,
    params
  );
}

/**
 * @description 是否删除工单列表
 * @param {Object} 删除对象id
 */
export function withPart(params: Object = {}) {
  return http.get(`/task/filter/withPart?${params}`);
}

/**
 * @description 批量更新
 */
export function editBatchTask(params: Object = {}) {
  return http.post("/outside/pc/task/editBatchTask", params);
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
    `${fixedPrefixAppPath}/outside/pc/task/planTask/create`,
    params
  );
}

/**
 * @description 编辑计划任务
 */
export function editPlanTask(params: PlanTaskCreateAndEditModel) {
  return http.post(
    `${fixedPrefixAppPath}/outside/pc/task/planTask/update`,
    params
  );
}

/**
 * @description 拨打电话
 */
export function dialout(params: object) {
  return http.post(`/api/callcenter/outside/callcenter/api/dialout`, params);
}
/* -------------  end  新工单api ---------------- */
