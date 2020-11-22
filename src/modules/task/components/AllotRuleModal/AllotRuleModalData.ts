import { Vue } from 'vue-property-decorator'
/* entity */
import Field from '@model/entity/Field'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { 
  RuleTypeEnum, 
  AllotGroupEnum,
  AllotOrderEnum,
  AllotOperatorEnum,
  AllotOrderOptions,
  ConditionOpeartorOptions
} from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* interface */
import { RuleForm } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalInterface'
/* types */
import ElSelectOption from '@model/types/ElSelectOption'

class AllotRuleModalData extends Vue {
  /* 派单顺序选择列表 */
  public allotOrderOptions: ElSelectOption[] = AllotOrderOptions
  /* css类名 */
  public className: string = ComponentNameEnum.AllotRuleModal
  /* 工单类型开启字段列表 */
  public enabledFields: Field[] = []
  /* 表单数据 */
  public form: RuleForm = {
    name: '',
    groupType: AllotGroupEnum.User,
    groupData: {
      [AllotGroupEnum.User]: [],
      [AllotGroupEnum.Role]: [],
      [AllotGroupEnum.Tag]: [],
      [AllotGroupEnum.TagLeader]: []
    },
    order: AllotOrderEnum.UnfinishedTask,
    // 规则类型
    type: RuleTypeEnum.Type,
    typeData: {
      [RuleTypeEnum.Type]: [],
      [RuleTypeEnum.Select]: {
        taskType: [],
        field: '',
        operator: undefined,
        value: ''
      },
      [RuleTypeEnum.Tag]: { 
        operator: AllotOperatorEnum.Contains,
        tags: []
      },
    }
  }
  /* 禁用状态 */
  public isDisabled: boolean = false
  /* 等待状态 */
  public pending: boolean = false
  /* 操作符选项列表 */
  public tagOpeartorOptions: ElSelectOption[] = ConditionOpeartorOptions
  /* 标题 */
  public title: string = ''
  /* 显示创建分配规则弹窗的状态 */
  public showAllotRuleModal: boolean = false
}

export default AllotRuleModalData
