import ElSelectOption from '@model/types/ElSelectOption'

/* 规则类型 */
export enum RuleTypeEnum {
  Type = 'type',
  Select = 'select',
  Tag = 'cusTag'
}

/* 分配枚举 */
export enum AllotGroupEnum {
  // 指定人员
  User = 'user',
  // 指定角色
  Role = 'role',
  // 指定服务团队
  Tag = 'tag',
  // 指定服务团队主管
  TagLeader = 'tagLeader',
  // 指定客户负责人
  CustomerManager = 'customerManager',
  // 客户所属服务团队
  CustomerTag = 'cusTag',
  // 客户所属服务团队主管
  CustomerTagLeader = 'cusTagLeader'
}

/* 分配select默认选项列表 */
export const AllotGroupSelectDefaultOptions: ElSelectOption[] = [
  { label: '指定人员', value: AllotGroupEnum.User },
  { label: '指定角色', value: AllotGroupEnum.Role },
  { label: '指定服务团队', value: AllotGroupEnum.Tag },
  { label: '指定服务团队主管', value: AllotGroupEnum.TagLeader }
]

/* 分配select团队选项列表 */
export const AllotGroupSelectTagOptions: ElSelectOption[] = [
  { label: '客户所属服务团队', value: AllotGroupEnum.CustomerTag },
  { label: 'CustomerTagLeader', value: AllotGroupEnum.CustomerTagLeader }
]