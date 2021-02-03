/* api */
import * as SettingApi from '@src/api/SettingApi'
/* computed */
import AllotRuleModalComputed from '@src/modules/task/components/AllotRuleModal/AllotRuleModalComputed'
/* enum */
import { RuleTypeEnum, AllotGroupEnum, AllotOperatorEnum, AllotOrderEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Field from '@model/entity/Field'
import Role from '@model/entity/Role/Role'
import Tag from '@model/entity/Tag/Tag'
import TaskType from '@model/entity/TaskType'
import DispatchRule from '@model/entity/DispatchRule'
/* interface */
import { RuleForm, RuleParams } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalInterface'
/* util */
import validate from '@src/modules/task/components/AllotRuleModal/AllotRuleModalVidate'
import Platform from '@src/util/Platform'
/* vue */
import { Emit } from 'vue-property-decorator'

const RuleAccordingMap = {
  [RuleTypeEnum.Type]: '工单类型',
  [RuleTypeEnum.Select]: '选择项',
  [RuleTypeEnum.Tag]: '客户部门'
}

class AllotRuleModalMethods extends AllotRuleModalComputed {
  
  /**
   * @description 构建form
  */
  public buildForm(): RuleForm {
    return {
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
  }
  
  /** 
   * @description 构建参数
  */
  public buildParams(): RuleParams {
    let { name, groupType, groupData, order, type, typeData } = this.form
    // 后续需要注意 默认规则
    let according: string = RuleAccordingMap[type]
    let params: RuleParams = {
      module: DispatchRule.Task,
      // 规则名称
      name,
      // 规则类型
      according,
      // 条件
      condition: {
        // 分配给
        group: groupType,
        // 排序方式
        orderBy: order
      },
      candidate: {}
    }
    
    /* start 构造 condition */
    // 按工单类型
    if (type === RuleTypeEnum.Type) {
      let taskTypes = typeData[RuleTypeEnum.Type]
      params.condition.typeInfo = taskTypes.map((taskType: TaskType) => {
        return { id: taskType.id, name: taskType.name}
      })
    }
    
    // 按特定条件
    if (type === RuleTypeEnum.Select) {
      let { field, value, operator, taskType } = typeData[RuleTypeEnum.Select]
      params.condition.fieldName = field
      params.condition.operator = operator
      params.condition.value = value
      if (taskType && taskType.length > 0) {
        params.condition.templateId = taskType[0].id
        params.condition.templateName = taskType[0].name
      }
    }
    
    // 按客户所属团队
    if (type === RuleTypeEnum.Tag) {
      let { tags, operator } = typeData[RuleTypeEnum.Tag]
      params.condition.operator = operator
      params.condition.tagInfo = tags.map((tag: Tag) => {
        return { id: tag.id, name: tag.tagName }
      })
    }
    /* end 构造 condition */
    
    /* start 构造candidate */
    // 指定人员
    if (groupType === AllotGroupEnum.User) {
      let users = groupData[AllotGroupEnum.User]
      params.candidate.info = users.map((user: LoginUser) => {
        return { userId: user.userId, userName: user.displayName, times: 0 }
      })
    }
    
    // 指定角色 
    if (groupType === AllotGroupEnum.Role) {
      let roles = groupData[AllotGroupEnum.Role]
      let role = roles[0] || {}
      params.candidate.groupId = role.id
      params.candidate.groupName = role.name
    }
    
    // 指定服务团队
    if (groupType === AllotGroupEnum.Tag) {
      let tags = groupData[AllotGroupEnum.Tag]
      let tag = tags[0] || {}
      params.candidate.groupId = tag.id
      params.candidate.groupName = tag.tagName
    }
    
    // 指定服务团队主管
    if (groupType === AllotGroupEnum.TagLeader) {
      let tags = groupData[AllotGroupEnum.TagLeader]
      let tag = tags[0] || {}
      params.candidate.groupId = tag.id
      params.candidate.groupName = tag.tagName
    }
    /* end 构造candidate */
    
    return params
  }
  
  /** 
   * @description 关闭弹窗
  */
  public close(): void {
    this.showAllotRuleModal = false
  }
  
  /* 创建成功 */
  @Emit('success')
  public emitSuccess() {
    this.close()
  }
  
  /** 
   * @description 获取属性
  */
  public getAttributes() {
    return {
      props: {
        title: this.title
      },
      on: {
        'update:show': (val: boolean) => {
          this.showAllotRuleModal = val
        }
      },
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
  }
  
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
  public fetchEnabledFields(): Promise<Field[] | void> {
    this.pending = true
    
    let params: { typeId: string, tableName: string } = {
      typeId: this.form.typeData[RuleTypeEnum.Select].taskType?.[0]?.id || 'allSelect',
      tableName: 'task'
    }
    
    return (
      SettingApi.getSettingTaskTypeEnabledFields(params)
        .then((result: Field[]) => {
          this.enabledFields = result || []
          this.form.typeData[RuleTypeEnum.Select].field = this.enabledFieldsOptions?.[0].value
          this.setFormTypeData()
          
          return result
        })
        .catch(error => {
          console.warn(error)
        })
        .finally(() => {
          this.pending = false
        })
    )
  }
  
  /**
   * @description 规则名称变化
  */
  public handlerNameChange(value: string) {
    // 设置规则名称
    this.form.name = value
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
  
  public ruleCreate(params: RuleParams) {
    SettingApi.saveSettingDispatchRule(params)
      .then((result = {}) => {
        let isSuccess = result.succ
        if (!isSuccess) {
          Platform.alert(result.message)
        }
        
        // 创建成功
        this.emitSuccess()
      })
      .catch(error => {
        console.warn('AllotRuleModalMethods -> ruleCreate -> error', error)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  /** 
   * @description 显示弹窗
   * -- 支持外部调用的
  */
  public outsideShow(data: RuleParams, options: { isDisabled: boolean, title: string } = { isDisabled: false, title: '新建分配规则' }) {
    // 是否为禁用状态
    this.isDisabled = options.isDisabled
    this.title = options.title
    this.show(data)
  }
  
  /** 
   * @description 显示弹窗
  */
  public show(data?: RuleParams) {
    // 初始化构建form
    this.form = this.buildForm()
    // 解析数据
    data && this.unpack(data)
    // 获取开启的字段列表
    !this.isDisabled && this.fetchEnabledFields()
    // 显示
    this.showAllotRuleModal = true
  }
  
  /** 
   * @description 设置表单字段数据
  */
  public setFormTypeData() {
    this.form.typeData[RuleTypeEnum.Select].operator = this.taskTypeSelectedFieldOperatorOptions[0].value
    this.form.typeData[RuleTypeEnum.Select].value = this.taskTypeSelectedFieldValueOptions?.[0].value || ''
  }
  
  /** 
   * @description 提交
  */
  public submit() {
    if (this.pending) return
    
    this.pending = true
    
    validate(this.form)
      .then((validated: boolean) => {
        if (!validated) {
          return this.pending = false
        }
        
        let params: RuleParams = this.buildParams()
        // 目前只支持创建规则
        this.ruleCreate(params)
      })
      .catch((error: string) => {
        Platform.alert(error)
        this.pending = false
      }) 
  }
  
  /** 
   * @description 将数据转换为组件数据
  */
  public unpack(data: RuleParams) {
    let { according, condition, candidate, name } = data
    // @ts-ignore
    let { typeInfo = [], group, orderBy, tagInfo = [], templateId = '', templateName = '', fieldName = '', groupId = '', groupName = '' } = condition
    let { info } = candidate
    let { groupData, typeData } = this.form
    
    // 按工单类型
    if (according === RuleAccordingMap[RuleTypeEnum.Type]) {
      this.form.type = RuleTypeEnum.Type
      typeData[RuleTypeEnum.Type] = typeInfo.map(taskType => {
        return { id: taskType.id || '', name: taskType.name || '', value: taskType.id || '', label: taskType.name || '', templateId: taskType.id || '' }
      })
    }
    
    // 按特定条件
    if (according === RuleAccordingMap[RuleTypeEnum.Select]) {
      this.form.type = RuleTypeEnum.Select
      // @ts-ignore
      this.form.typeData[RuleTypeEnum.Select].taskType = [{ id: templateId, name: templateName, label: templateName, value: templateId }]
      // 获取字段列表
      this.fetchEnabledFields().then(() => {
        this.form.typeData[RuleTypeEnum.Select].field = fieldName
        this.form.typeData[RuleTypeEnum.Select].operator = condition.operator
        this.form.typeData[RuleTypeEnum.Select].value = condition.value || ''
      })
    }
    
    // 按客户服务团队
    if (according === RuleAccordingMap[RuleTypeEnum.Tag]) {
      this.form.type = RuleTypeEnum.Tag
      // 团队列表
      typeData[RuleTypeEnum.Tag].tags = tagInfo.map(tag => {
        return { id: tag.id || '', tagName: tag.name || '' }
      })
      // 操作符
      typeData[RuleTypeEnum.Tag].operator = <AllotOperatorEnum>condition.operator
    }
    
    // 指定人员用户
    if (group === AllotGroupEnum.User) {
      groupData[AllotGroupEnum.User] = (
        info 
          ? (
            info.map(user => {
              return { userId: user.userId || '', displayName: user.userName, times: user.times }
            })
          )
          : []
      )
    }
    
    // 指定角色
    if (group === AllotGroupEnum.Role) {
      // @ts-ignore
      groupData[AllotGroupEnum.Role] = [{ id: groupId, name: groupName, value: groupId, label: groupName }]
    }
    
    // 指定服务团队
    if (group === AllotGroupEnum.Tag) {
      groupData[AllotGroupEnum.Tag] = [{ id: groupId, tagName: groupName }]
    }
    
    // 指定服务团队主管
    if (group === AllotGroupEnum.TagLeader) {
      groupData[AllotGroupEnum.TagLeader] = [{ id: groupId, tagName: groupName }]
    }
    
    // 分配给
    this.form.groupType = group
    // 排序方式
    this.form.order = orderBy
    // 名称
    this.form.name = name
  }
}

export default AllotRuleModalMethods
