/* data */
import AllotRuleModalData from '@src/modules/task/components/AllotRuleModal/AllotRuleModalData'
/* enum */
import { 
  RuleTypeEnum, 
  ConditionOpeartorOptions,   
  AllotGroupSelectDefaultOptions, 
  AllotGroupSelectTagOptions,
  EqualOpeartorOptions,
  AllotGroupEnum
} from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
import { TaskFieldNameMappingEnum, FieldTypeMappingEnum } from '@model/enum/FieldMappingEnum'
/* entity */
import Field from '@model/entity/Field'
/* types */
import ElSelectOption from '@model/types/ElSelectOption'

const SelectFieldNames = [TaskFieldNameMappingEnum.ServiceContent, TaskFieldNameMappingEnum.ServiceType, TaskFieldNameMappingEnum.Level]

function isMultiField(field: Field) {
  return field?.setting?.isMulti === true
}

class AllotRuleModalComputed extends AllotRuleModalData {
  /* 分配 选择列表 */
  get allotGroupOptions(): ElSelectOption[] {
    // 规则类型为团队时，添加对应的团队选择项
    let isTag = this.form.type === RuleTypeEnum.Tag
    
    return (
      isTag 
        ? [...AllotGroupSelectDefaultOptions, ...AllotGroupSelectTagOptions] 
        : [...AllotGroupSelectDefaultOptions]
    )
  }
  
  /* 工单类型开启字段select列表 */
  get enabledFieldsOptions(): ElSelectOption[] {
    return (
      this.enabledFields.filter((field: Field) => {
        // 是否是select类型
        let isSelectType: boolean = (
          // @ts-ignore
          SelectFieldNames.indexOf(field.fieldName) >= 0
          || field.formType === FieldTypeMappingEnum.Select
        )
        
        return isSelectType
        
      }).map((field: Field) => {
        // 是否是多选类型
        let isMulti = isMultiField(field)
        
        return {
          label: `${field.displayName}(${isMulti ? '多选' : '单选'})`,
          value: field.fieldName
        }
        
      })
    )
  }
  
  /* 是否为 指定客户负责人 */
  get isCustomerManager(): boolean {
    return this.form.groupType === AllotGroupEnum.CustomerManager
  }
  
  /* 当前选择的字段 */
  get taskTypeSelectedField(): Field {
    let { field } = this.form.typeData[RuleTypeEnum.Select]
    let selectedField = this.enabledFields.filter((f: Field) => f.fieldName == field)[0] || {}
    
    return selectedField
  }
  
  /* 当前选择的字段 对应的操作符 配置列表 */
  get taskTypeSelectedFieldOperatorOptions(): ElSelectOption[] {
    // 是否是多选类型
    let isMulti = isMultiField(this.taskTypeSelectedField)
    
    return isMulti ? ConditionOpeartorOptions : EqualOpeartorOptions
  }
  
  /* 当前选择的字段 对应的值 配置列表 */
  get taskTypeSelectedFieldValueOptions(): ElSelectOption[] {
    let { dataSource = [] } = this.taskTypeSelectedField?.setting || {}
    
    return dataSource.map((item: string) => {
      return { label: item, value: item}
    })
  }
}

export default AllotRuleModalComputed
