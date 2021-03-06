import ElSelectOption from '@model/types/ElSelectOption'

/* 规则类型 */
export enum RuleTypeEnum {
  // 按照工单类型
  Type = 'type',
  // 按照特定条件
  Select = 'select',
  // 按照客户所属部门
  Tag = 'cusTag'
}

/* 分配枚举 */
export enum AllotGroupEnum {
  // 指定人员
  User = 'user',
  // 指定角色
  Role = 'role',
  // 指定服务部门
  Tag = 'tag',
  // 指定服务部门主管
  TagLeader = 'tagLeader',
  // 指定客户负责人
  CustomerManager = 'customerManager',
  // 客户所属服务部门
  CustomerTag = 'cusTag',
  // 客户所属服务部门主管
  CustomerTagLeader = 'cusTagLeader'
}

/* 优先顺序枚举 */
export enum AllotOrderEnum {
  // 未完成工作数量少优先派单
  UnfinishedTask = 'unfinishedTask',
  // 距离越近优先派单
  Distance = 'cusDistance',
  // 按顺序平均分配
  Polling = 'polling'
}

/* 操作符枚举 */
export enum AllotOperatorEnum {
  // 包含
  Contains = '包含',
  // 不包含
  UnContains = '不包含',
  // 等于
  Equal = '等于',
  // 不等于
  UnEqual = '不等于',
}

/* 分配select默认选项列表 */
export const AllotGroupSelectDefaultOptions: ElSelectOption[] = [
  { label: '指定人员', value: AllotGroupEnum.User },
  { label: '指定角色', value: AllotGroupEnum.Role },
  { label: '指定服务部门', value: AllotGroupEnum.Tag },
  { label: '指定服务部门主管', value: AllotGroupEnum.TagLeader },
  { label: '指定客户负责人', value: AllotGroupEnum.CustomerManager }
]

/* 分配select部门选项列表 */
export const AllotGroupSelectTagOptions: ElSelectOption[] = [
  { label: '客户所属服务部门', value: AllotGroupEnum.CustomerTag },
  { label: '客户所属服务部门主管', value: AllotGroupEnum.CustomerTagLeader }
]

/* 分配select默认选项列表 */
export const AllotOrderOptions: ElSelectOption[] = [
  { label: '未完成工作数量少优先派单', value: AllotOrderEnum.UnfinishedTask },
  { label: '距离越近优先派单', value: AllotOrderEnum.Distance },
  { label: '按顺序平均分配', value: AllotOrderEnum.Polling }
]

/* 包含 操作符选项列表 */
export const ConditionOpeartorOptions: ElSelectOption[] = [
  { label: '包含', value: AllotOperatorEnum.Contains },
  { label: '不包含', value: AllotOperatorEnum.UnContains },
]

/* 等于 操作符选项列表 */
export const EqualOpeartorOptions: ElSelectOption[] = [
  { label: '等于', value: AllotOperatorEnum.Equal },
  { label: '不等于', value: AllotOperatorEnum.UnEqual },
]