/* enum */
import { RuleTypeEnum, AllotGroupEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'

export interface RoleForm {
  group: AllotGroupEnum,
  type: RuleTypeEnum
}