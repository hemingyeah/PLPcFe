/* api */
import * as SettingApi from '@src/api/SettingApi'
/* computed */
import AllotRuleModalComputed from '@src/modules/task/components/AllotRuleModal/AllotRuleModalComputed'
/* enum */
import { RuleTypeEnum, AllotGroupEnum, AllotOperatorEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Field from '@model/entity/Field'
import Role from '@model/entity/Role/Role'
import Tag from '@model/entity/Tag/Tag'
import TaskType from '@model/entity/TaskType'
/* util */
import validate from '@src/modules/task/components/AllotRuleModal/AllotRuleModalVidate'
import Platform from '@src/util/Platform'

class AllotRuleModalMethods extends AllotRuleModalComputed {
  /** 
   * @description 获取用户列表
  */
  public fetchUsers(params: any) {
    return SettingApi.getSettingUserList(params)
  }  
  
  /** 
   * @description 获取权限列表
  */
  public fetchRoles(params: any) {
    return (
      SettingApi.getSettingRoleList(params).then((result = {}) => {
        result.list = result.list.map((role: Role) =>
          Object.freeze({
            label: role.name || '',
            value: role.id || '',
            ...role
        }))
        return result
      })
    )
  }
  
  /** 
   * @description 获取工单类型列表
  */
  public fetchTaskTypes(params: any) {
    return (
      SettingApi.getSettingTaskTypeList(params).then((result = {}) => {
        result.list = result.list.map((taskType: TaskType) =>
          Object.freeze({
            label: taskType.name || '',
            value: taskType.id || '',
            ...taskType
        }))
        return result
      })
    )
  }
  
  /** 
   * @description 获取工单类型开启的系统字段列表
  */
  public fetchEnabledFields(): void {
    let params: { typeId: string, tableName: string } = {
      typeId: this.form.typeData[RuleTypeEnum.Select].taskType?.[0]?.id || 'allSelect',
      tableName: 'task'
    }
    
    SettingApi.getSettingTaskTypeEnabledFields(params)
      .then((result: Field[]) => {
        this.enabledFields = result || []
        this.form.typeData[RuleTypeEnum.Select].field = this.enabledFieldsOptions?.[0].value
        this.setFormTypeData()
      })
      .catch(error => {
        console.warn(error)
      })
  }
  
  /**
   * @description 规则类型变化
  */
  public handlerTypeChange(type: RuleTypeEnum) {
    // 设置规则类型的数据
    this.form.type = type
    // 初始化 分配给 数据
    this.form.groupType = AllotGroupEnum.User
  }
  
  /**
   * @description 选择客户所属团队变化事件
  */
  public handlerCustomerTeamChanged(value: Tag[]): void {
    this.form.typeData[RuleTypeEnum.Tag].tags = value
  }
  
  /** 
   * @description 工单类型变化
  */
  public handlerOperatorSelectChanged(value: AllotOperatorEnum) { 
    this.form.typeData[RuleTypeEnum.Tag].operator = value
  }
  
  /** 
   * @description 人员列表变化
  */
  public handlerUserSelectChanged(value: LoginUser[]) { 
    this.form.groupData[AllotGroupEnum.User] = value
  }
  
  /** 
   * @description 角色列表变化
  */
  public handlerRoleSelectChanged(value: Role[]) { 
    this.form.groupData[AllotGroupEnum.Role] = value
  }
  
  /**
   * @description 选择团队变化事件
  */
  public handlerTeamChanged(value: Tag[], isTagLeader = false): void {
    if (isTagLeader) {
      this.form.groupData[AllotGroupEnum.TagLeader] = value
    } else {
      this.form.groupData[AllotGroupEnum.Tag] = value
    }
  }
  
  /** 
   * @description 按工单类型 工单类型变化
  */
  public handlerTaskTypeSelectChanged(value: TaskType[]) { 
    this.form.typeData[RuleTypeEnum.Type] = value
  }
  
  /** 
   * @description 按特定条件 工单类型变化工单类型变化
  */
  public handlerCustomTaskTypeSelectChanged(value: TaskType[]) { 
    this.form.typeData[RuleTypeEnum.Select] = {
      taskType: value,
      operator: undefined,
      field: '',
      value: ''
    }
    this.fetchEnabledFields()
  }
  
  public isMulti(field: Field) {
    return field?.setting?.isMulti === true
  }
  
  /** 
   * @description 显示弹窗
  */
  public show() {
    this.showAllotRuleModal = true
  }
  
  public setFormTypeData() {
    this.form.typeData[RuleTypeEnum.Select].operator = this.taskTypeSelectedFieldOperatorOptions[0].value
    this.form.typeData[RuleTypeEnum.Select].value = this.taskTypeSelectedFieldValueOptions?.[0].value || ''
  }
  
  public submit() {
    validate(this.form)
      .then((validated: boolean) => {
        if (!validated) return
      })
      .catch((error: string) => {
        Platform.alert(error)
      }) 
  }
}

export default AllotRuleModalMethods
