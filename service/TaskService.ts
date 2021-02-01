/* entity */
import Customer from '@model/entity/Customer'
import Field from '@model/entity/Field'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Task from '@model/entity/Task'
import TaskApprove from '@model/entity/TaskApprove'
import TaskType from '@model/entity/TaskType'
/* enum */
import { 
	CommonMappingEnum,
  CustomerFieldNameMappingEnum, 
  FieldTypeMappingEnum, 
  ProductFieldNameMappingEnum,
  TagEntityMappingEnum
} from '@model/enum/FieldMappingEnum'
import LeaderEnum from '@model/enum/LeaderEnum'
/* types */
import FlowSetting from '@model/types/FlowSetting'
/* util */
import { isArray, isString } from '@src/util/type'
import { getRootWindow } from '@src/util/dom'
import Log from '@src/util/log.ts'

/** 
 * @description 获取初始化数据
*/
function getInitData(): any | null {
  try {
    const RootWindow: any = getRootWindow(window)
    const RootWindowInitData = JSON.parse(RootWindow._init)
    
		return RootWindowInitData || {}
	
  } catch (error) {
    Log.error(error, getInitData.name)
    return {}
  }
}
/* 初始数据 */
const InitData = getInitData()

// 有重复的代码，后续优化

/**
 * @description 获取data对象的某个字段的string形式
 * 照搬的后端 base -> TaskService getFieldValue2string 方法
 * @param {Object} data
 * @param {string} fieldName
 * @param {string} formType
 * @param {Array} fields 字段列表
 * @return
*/
export function getFieldValue2string(data: any, fieldName: string, formType: string, fields = [], isCustomerRelation: Boolean): string {
	// 判断字段名称是否存在
	if (!fieldName) return ''
	// 是否是客户模块，暂时先这么判断
	let isCustomerModule: Boolean = isCustomerRelation
  
  return (
		isCustomerModule
		? getCustomerFieldValue2string(data, fieldName, formType, fields) 
		: getProductFieldValue2string(data, fieldName, formType, fields)
	)
}

/**
 * @description 获取客户的某个字段的string形式
 * @param {Object} data 数据
 * @param {string} fieldName 字段名称
 * @param {string} formType 字段类型
 * @param {Array} fields 字段列表
 * @return
*/
function getCustomerFieldValue2string(data: any, fieldName: string, formType: string, fields = []): string {
	// 客户数据
	const Customer: any = data || {};
	// 返回结果
	let result: string = ''
	// 团队
	if (fieldName == CustomerFieldNameMappingEnum.Tags) {
		let tags = Customer[CustomerFieldNameMappingEnum.Tags] || []
		result = tags.map((tag: any) => tag[TagEntityMappingEnum.TagName]).join(',')
	}
	// 编号
	else if (fieldName == CustomerFieldNameMappingEnum.SerialNumber) {
		result = Customer[CustomerFieldNameMappingEnum.SerialNumber] || ''
	}
	// 客户负责人
	else if (fieldName == CustomerFieldNameMappingEnum.CustomerManager) {
		result = Customer[CustomerFieldNameMappingEnum.CustomerManagerName] || ''
	}
	// 其他字段
	else {
		const Attribute: any = Customer[CommonMappingEnum.Attribute] || {}
		// 地址类型
		if (formType == FieldTypeMappingEnum.Address) {
			let addressData = Attribute[fieldName]
			result = addressData.all || ''
		}
		// 说明信息类型
		else if (formType == FieldTypeMappingEnum.Info) {
			let infoField: any = fields.filter((field: any) => field.fieldName == fieldName)
			result = infoField?.[0]?.placeholder || ''
		}
		// 位置类型
		else if (formType == FieldTypeMappingEnum.Location) {
			let locationData = Attribute[fieldName]
			result = locationData.address || ''
		}
		// 其他自定义字段
		else {
			let attributeValue =  Attribute[fieldName];
			let isStringArray = Array.isArray(attributeValue) && attributeValue.every(item => isString(item))
			result = isStringArray ? attributeValue.join(',') : attributeValue || ''
		}
	}
  
	return result
}

/**
 * @description 获取产品的某个字段的string形式
 * @param {Object} data 数据
 * @param {string} fieldName 字段名称
 * @param {string} formType 字段类型
 * @param {Array} fields 字段列表
 * @return
*/
function getProductFieldValue2string(data: any, fieldName: string, formType: string, fields = []): string {
		// 产品数据
	const Product: any = data || {}
	// 返回结果
	let result: string = ''
	
	// 编号
	if (fieldName == ProductFieldNameMappingEnum.SerialNumber) {
		result = Product[ProductFieldNameMappingEnum.SerialNumber] || ''
	}
	// 产品类型
	else if (fieldName == ProductFieldNameMappingEnum.Type) {
		result = Product[ProductFieldNameMappingEnum.Type] || ''
	}
	// 其他字段
	else {
		const Attribute: any = Product[CommonMappingEnum.Attribute] || {}
		// 地址类型
		if (formType == FieldTypeMappingEnum.Address) {
			let addressData = Attribute[fieldName]
			result = addressData.all || ''
		}
		// 说明信息类型
		else if (formType == FieldTypeMappingEnum.Info) {
			let infoField: any = fields.filter((field: any) => field.fieldName == fieldName)
			result = infoField?.[0]?.placeholder || ''
		}
		// 位置类型
		else if (formType == FieldTypeMappingEnum.Location) {
			let locationData = Attribute[fieldName]
			result = locationData.address || ''
		}
		// 其他自定义字段
		else {
			let attributeValue =  Attribute[fieldName];
			let isStringArray = Array.isArray(attributeValue) && attributeValue.every(item => isString(item))
			result = isStringArray ? attributeValue.join(',') : attributeValue || ''
		}
	}
	
	return result;
}

/** 
 * @description 检查审批
*/
export function checkApprove(taskType: TaskType, action: string, task: Task | null, customer: Customer | null): TaskApprove {
	let needApprove: boolean = false
	let flowSetting: any = taskType.flowSetting
	let result: TaskApprove = { needApprove }
  
  // 验证是否存在匹配的流程节点信息
	if (flowSetting && !flowSetting[action]) return result
	
	// 当前节点流程
	let currentFlowSetting: FlowSetting = flowSetting[action]
	if (!currentFlowSetting.state) return result
  
	result.needApprove = checkIsNeedApprove(currentFlowSetting, task, customer, result)
	result.approversName = getApproversName(currentFlowSetting, task, result)
	result.taskId = task?.id || ''
  
	return result
}

/** 
 * @description 是否需要审批
*/
function checkIsNeedApprove(flowSetting: FlowSetting, task: Task | null, customer: Customer | null, result: any = {}): boolean {
	let { leader = '', approvers } = flowSetting
	// 审批人列表是否是空的
	let isEmptyApprovers = isArray(approvers) ? approvers.length <= 0 : false
	// 表单字段 人员字段
	let isFormUser = leader.indexOf(LeaderEnum.FormUser) > -1
	// 客户负责人
	let isCustomerManager = leader === LeaderEnum.UserAdmin
	// 发起人选择
	let isPromoter = leader ===  LeaderEnum.Promoter
	// 是否需要审批
	let isNeedApprove = Boolean(
		(!isEmptyApprovers && (leader == LeaderEnum.Users || isFormUser))
		|| leader === LeaderEnum.Leader
		|| leader ===  LeaderEnum.CreateUser
		|| leader ===  LeaderEnum.AllotUser
		|| isPromoter
		|| isCustomerManager
		|| (!leader && !isEmptyApprovers)
	)
	
  // 无审批人
	if (!leader && isEmptyApprovers) {
		return false
	}
	
	// 客户负责人
	if (isCustomerManager && customer) {
		let { customerManager } = customer
		return Boolean(customerManager)
	}
  
	// 工单表单 人员字段
	if (isFormUser && task) {
		let { attribute = {} } = task
		let formUserValue = attribute[leader]
		return Boolean(formUserValue)
	}
  
	if (isPromoter) {
		// 后端这么写的 用来判断是否是审批发起人选择
		result.isOpt = 1
	}
  
	return isNeedApprove
}

/** 
 * @description 获取审批人名称
*/
function getApproversName(flowSetting: FlowSetting, task: Task | null, result: any = {}): string {
	let { leader = '', approvers = [], taskTemplateId } = flowSetting
	let approversName = ''
	
	// 按指定人员
	if (leader === LeaderEnum.Users) {
		approversName = approvers.map((user: LoginUser) => user.displayName).join(', ')
		return approversName
	}
  
	// 客户负责人
	if (leader === LeaderEnum.UserAdmin) {
		approversName = '客户负责人'
		return approversName
	}
  
	// 由发起人选择
	if (leader === LeaderEnum.Promoter) {
		approversName = '请选择'
		// 后端这么写的 用来判断是否是审批发起人选择
		result.isOpt = 1
		return approversName
	}
  
	// 发起人团队主管
	if (leader === LeaderEnum.Leader) {
		approversName = '发起人团队主管'
		return approversName
	}
  
	// 工单创建人
	if (leader === LeaderEnum.CreateUser) {
		approversName = '工单创建人'
		return approversName
	}
  
	// 工单派单人
	if (leader === LeaderEnum.AllotUser) {
		approversName = '工单派单人'
		return approversName
	}
  
	// 表单字段 人员字段
	if (leader.indexOf(LeaderEnum.FormUser) > -1 && taskTemplateId && task) {
		let { attribute = {} } = task
		let formUserValue = attribute[leader]
		approversName = formUserValue
		return approversName
	}
  
	// 其他
	approversName = approvers.map((user: LoginUser) => user.displayName).join(', ')
  
	return approversName
}

/** 
 * @description 是否是工单创建人
*/
export function isCreator(task: any = {}): boolean {
	let loginUser = InitData?.user || {}
	let createUser = task?.createUser || {}
	// 工单创建人存在 且 登录用户存在 且 相等
	return createUser.userId && loginUser.userId && createUser.userId == loginUser.userId
}

export default {
	checkApprove,
	getFieldValue2string
}