/* enum */
import { RuleTypeEnum, AllotGroupEnum, AllotOrderEnum, AllotOperatorEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Role from '@model/entity/Role/Role'
import Tag from '@model/entity/Tag/Tag'
import TaskType from '@model/entity/TaskType'

export interface RuleForm {
  // 名称
  name: string,
  // 分配给
  groupType: AllotGroupEnum,
  groupData: {
    [AllotGroupEnum.User]: LoginUser[],
    [AllotGroupEnum.Role]: Role[],
    [AllotGroupEnum.Tag]: Tag[],
    [AllotGroupEnum.TagLeader]: Tag[]
  },
  // 派单顺序
  order: AllotOrderEnum,
  // 派单类型
  type: RuleTypeEnum,
  // 派单类型数据
  typeData: {
    // 工单类型
    [RuleTypeEnum.Type]: TaskType[],
    // 特定条件
    [RuleTypeEnum.Select]: {
      // 工单类型
      taskType: TaskType[],
      // 字段
      field: string,
      // 操作符
      operator: AllotOperatorEnum | string | undefined,
      // 值
      value: string
    },
    // 按客户所属服务团队
    [RuleTypeEnum.Tag]: {
      // 操作符
      operator: AllotOperatorEnum,
      // 团队列表
      tags: Tag[]
    },
  }
}

export interface RuleParams {
  // 模块
  module: string | 'task'
  // 名称
  name: string,
  // 规则类型
  according: string,
  // 条件
  condition: {
    group: AllotGroupEnum,
    orderBy: AllotOrderEnum,
    // 按工单类型
    typeInfo?: { id: string | undefined, name: string | undefined }[]
    // 按特定条件 字段
    fieldName?: string
    // 按特定条件 字段值
    value?: string
    // 按特定条件 工单类型id
    templateId?: string
    // 按特定条件 工单类型名称
    templateName?: string
    // 按特定条件 或 按客户团队 操作符
    operator?: string
    // 按客户团队
    tagInfo?: { id: string | undefined, name: string | undefined }[]
  },
  // 候选
  candidate: {
    info?: { userId: string | undefined, userName: string | undefined, times: number}[],
    groupId?: string,
    groupName?: string
  }
}