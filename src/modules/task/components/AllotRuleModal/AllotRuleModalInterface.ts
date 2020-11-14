/* enum */
import { RuleTypeEnum, AllotGroupEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Role from '@model/entity/Role/Role'
import Tag from '@model/entity/Tag/Tag'

export interface RoleForm {
  groupType: AllotGroupEnum,
  groupData: {
    [AllotGroupEnum.User]: LoginUser[],
    [AllotGroupEnum.Role]: Role[],
    [AllotGroupEnum.Tag]: Tag[],
    [AllotGroupEnum.TagLeader]: Tag[],
  }
  type: RuleTypeEnum
}