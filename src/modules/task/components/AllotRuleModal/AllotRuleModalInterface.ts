/* enum */
import { RuleTypeEnum, AllotGroupEnum, AllotOrderEnum, AllotOperatorEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Role from '@model/entity/Role/Role'
import Tag from '@model/entity/Tag/Tag'
import TaskType from '@model/entity/TaskType'

export interface RoleForm {
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
    [RuleTypeEnum.Type]: TaskType | undefined,
    [RuleTypeEnum.Select]: any,
    // 按客户所属服务团队
    [RuleTypeEnum.Tag]: {
      // 操作符
      operator: AllotOperatorEnum,
      // 团队列表
      tags: Tag[]
    },
  }
}