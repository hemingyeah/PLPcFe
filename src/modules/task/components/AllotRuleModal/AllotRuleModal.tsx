/* api */
import * as SettingApi from '@src/api/SettingApi'
/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { 
  RuleTypeEnum, 
  AllotGroupEnum,
  AllotOrderEnum,
  AllotOperatorEnum,
  AllotGroupSelectDefaultOptions, 
  AllotGroupSelectTagOptions,
  AllotOrderOptions,
  ConditionOpeartorOptions,
  EqualOpeartorOptions
} from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
import { TaskFieldNameMappingEnum, FieldTypeMappingEnum } from '@model/enum/FieldMappingEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Role from '@model/entity/Role/Role'
import Tag from '@model/entity/Tag/Tag'
import Field from '@model/entity/Field'
import TaskType from '@model/entity/TaskType'
/* interface */
import { RoleForm } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalInterface'
/* scss */
import '@src/modules/task/components/AllotRuleModal/AllotRuleModal.scss'
/* types */
import ElSelectOption from '@model/types/ElSelectOption'
/* util */
import { uuid } from '@src/util/string'
import validate from '@src/modules/task/components/AllotRuleModal/AllotRuleModalVidate'
import Platform from '@src/util/Platform'

const SelectFieldNames = [TaskFieldNameMappingEnum.ServiceContent, TaskFieldNameMappingEnum.ServiceType, TaskFieldNameMappingEnum.Level]

@Component({
  name: ComponentNameEnum.AllotRuleModal
})
export default class AllotRuleModal extends Vue {
  
  /* 派单顺序选择列表 */
  private allotOrderOptions: ElSelectOption[] = AllotOrderOptions
  /* css类名 */
  private className: string = ComponentNameEnum.AllotRuleModal
  /* 工单类型开启字段列表 */
  private enabledFields: Field[] = []
  /* 表单数据 */
  private form: RoleForm = {
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
  /* 等待状态 */
  private pending: boolean = false
  /* 操作符选项列表 */
  private tagOpeartorOptions: ElSelectOption[] = ConditionOpeartorOptions
  /* 显示创建分配规则弹窗的状态 */
  private showAllotRuleModal: boolean = false
  
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
        let isMulti = this.isMulti(field)
        
        return {
          label: `${field.displayName}(${isMulti ? '多选' : '单选'})`,
          value: field.fieldName
        }
        
      })
    )
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
    let isMulti = this.isMulti(this.taskTypeSelectedField)
    
    return isMulti ? ConditionOpeartorOptions : EqualOpeartorOptions
  }
  
  /* 当前选择的字段 对应的值 配置列表 */
  get taskTypeSelectedFieldValueOptions(): ElSelectOption[] {
    let { dataSource = [] } = this.taskTypeSelectedField?.setting || {}
    
    return dataSource.map((item: string) => {
      return { label: item, value: item}
    })
  }
  
  /** 
   * @description 获取用户列表
  */
  private fetchUsers(params: any) {
    return SettingApi.getSettingUserList(params)
  }  
  
  /** 
   * @description 获取权限列表
  */
  private fetchRoles(params: any) {
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
  private fetchTaskTypes(params: any) {
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
  private fetchEnabledFields(): void {
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
  private handlerTypeChange(type: RuleTypeEnum) {
    // 设置规则类型的数据
    this.form.type = type
    // 初始化 分配给 数据
    this.form.groupType = AllotGroupEnum.User
  }
  
  /**
   * @description 选择客户所属团队变化事件
  */
  private handlerCustomerTeamChanged(value: Tag[]): void {
    this.form.typeData[RuleTypeEnum.Tag].tags = value
  }
  
  /** 
   * @description 工单类型变化
  */
  private handlerOperatorSelectChanged(value: AllotOperatorEnum) { 
    this.form.typeData[RuleTypeEnum.Tag].operator = value
  }
  
  /** 
   * @description 人员列表变化
  */
  private handlerUserSelectChanged(value: LoginUser[]) { 
    this.form.groupData[AllotGroupEnum.User] = value
  }
  
  /** 
   * @description 角色列表变化
  */
  private handlerRoleSelectChanged(value: Role[]) { 
    this.form.groupData[AllotGroupEnum.Role] = value
  }
  
  /**
   * @description 选择团队变化事件
  */
  private handlerTeamChanged(value: Tag[], isTagLeader = false): void {
    if (isTagLeader) {
      this.form.groupData[AllotGroupEnum.TagLeader] = value
    } else {
      this.form.groupData[AllotGroupEnum.Tag] = value
    }
  }
  
  /** 
   * @description 按工单类型 工单类型变化
  */
  private handlerTaskTypeSelectChanged(value: TaskType[]) { 
    this.form.typeData[RuleTypeEnum.Type] = value
  }
  
  /** 
   * @description 按特定条件 工单类型变化工单类型变化
  */
  private handlerCustomTaskTypeSelectChanged(value: TaskType[]) { 
    this.form.typeData[RuleTypeEnum.Select] = {
      taskType: value,
      operator: undefined,
      field: '',
      value: ''
    }
    this.fetchEnabledFields()
  }
  
  private isMulti(field: Field) {
    return field?.setting?.isMulti === true
  }
  
  /** 
   * @description 显示弹窗
  */
  public show() {
    this.showAllotRuleModal = true
  }
  
  /** 
   * @description 渲染 规则类型 对应的列表
  */
  public renderAllotType() {    
    // 按照工单类型
    if (this.form.type === RuleTypeEnum.Type) {
      return this.renderAllotTypeWithTaskType()
    }
    
    // 按照特定条件
    if (this.form.type === RuleTypeEnum.Select) {
      return this.renderAllotTypeWithConditions()
    }
    
    // 按照客户所属团队
    if (this.form.type === RuleTypeEnum.Tag) {
      return this.renderAllotGroupWithTag()
    }
  }
  
  /** 
   * @description 渲染 规则类型 按照工单类型
  */
  private renderAllotTypeWithTaskType() {
    let text = '当工单类型符合以下条件时：'
    let value = this.form.typeData[RuleTypeEnum.Type]
    let changedHandler = this.handlerTaskTypeSelectChanged
    
    return this.renderTaskTypesSelect(value, changedHandler, text)
  }
  
  /** 
   * @description 渲染 规则类型 按照特定条件
  */
  private renderAllotTypeWithConditions() {
    let text = '选择工单类型，当工单类型为：'
    let { taskType, field, operator, value } = this.form.typeData[RuleTypeEnum.Select]
    let changedHandler = this.handlerCustomTaskTypeSelectChanged
    
    return (
      <div>
        {this.renderTaskTypesSelect(taskType, changedHandler, text)}
        <div>
          选择应用条件，当字段
          <el-select 
            value={field} 
            onInput={(value: string) => {
              this.form.typeData[RuleTypeEnum.Select].field = value
              this.setFormTypeData()
            }}
          >
            {
              this.enabledFieldsOptions.map((option: ElSelectOption) => {
                return (
                  <el-option key={uuid()} label={option.label} value={option.value} />
                )
              })
            }
          </el-select>
          <el-select
            value={operator} 
            onInput={(value: AllotOperatorEnum) => {this.form.typeData[RuleTypeEnum.Select].operator = value}}
          >
            {
              this.taskTypeSelectedFieldOperatorOptions.map((option: ElSelectOption) => {
                return (
                  <el-option key={uuid()} label={option.label} value={option.value} />
                )
              })
            }
          </el-select>
          <el-select
            value={value} 
            onInput={(value: string) => this.form.typeData[RuleTypeEnum.Select].value = value}
          >
            {
              this.taskTypeSelectedFieldValueOptions.map((option: ElSelectOption) => {
                return (
                  <el-option key={uuid()} label={option.label} value={option.value} />
                )
              })
            }
          </el-select>
        </div>
      </div>
    )
  }
  
  private renderTaskTypesSelect(
    value: TaskType[] | undefined, 
    changedHandler: (value: TaskType[]) => void,
    text?: string
  ) {
    const ScopedSlots = {
      option: (props: { option: TaskType }) => {
        return (
          <div key={props.option.id}>
            {props.option.name}
          </div>
        )
      }
    }
    
    return (
      <div>
        <span>{text}</span>
        <biz-form-remote-select
          value={value}
          onInput={changedHandler}
          placeholder='全部工单类型'
          remoteMethod={this.fetchTaskTypes}
          scopedSlots={ScopedSlots}
        />
      </div>
    )
  }
  
  /** 
   * @description 渲染 规则类型 按照客户所属团队
  */
  private renderAllotGroupWithTag() {
    let tagData = this.form.typeData[RuleTypeEnum.Tag]
    let { tags, operator } = tagData
    
    return (
      <div>
        <div>
          当客户所属团队
          {
            <el-select value={operator} onInput={this.handlerOperatorSelectChanged}>
              {
                this.tagOpeartorOptions.map((option: ElSelectOption) => {
                  return (
                    <el-option key={uuid()} label={option.label} value={option.value} />
                  )
                })
              }
            </el-select>
          }
          以下任意团队时
        </div>
        <biz-team-select 
          value={tags} 
          onInput={(value: Tag[]) => this.handlerCustomerTeamChanged(value)} 
          multiple 
        />
      </div>
    )
  }
  
  /** 
   * @description 渲染 分配对象
  */
  public renderAllotGroup() {    
    return (
      <div>
        {this.renderAllotGroupSelect()}
        {this.renderAllotGroupSelectForm()}
      </div>
    )
  }
  
  /** 
   * @description 渲染 分配给 select选择
  */
  public renderAllotGroupSelect() {
    // 数据变化
    const HandlerGroupChange = (value: AllotGroupEnum) => this.form.groupType = value
    
    return (
      <el-select value={this.form.groupType} onInput={HandlerGroupChange}>
        {
          this.allotGroupOptions.map((option: ElSelectOption) => {
            return (
              <el-option key={uuid()} label={option.label} value={option.value} />
            )
          })
        }
      </el-select>
    )
  }
  
  /** 
   * @description 渲染 分配给 select选择对应的表单
  */
  private renderAllotGroupSelectForm() {
    // 人员列表
    if (this.form.groupType === AllotGroupEnum.User) {
      return this.renderAllotGroupUserSelect()
    }
    
    // 角色列表
    if (this.form.groupType === AllotGroupEnum.Role) {
      return this.renderAllotGroupRoleSelect()
    }
    
    // 指定服务团队
    if (this.form.groupType === AllotGroupEnum.Tag) {
      return this.renderAllotGroupTeamSelect()
    }
    
    // 指定服务团队主管
    if (this.form.groupType === AllotGroupEnum.TagLeader) {
      return this.renderAllotGroupTeamSelect(true)
    }
  }
  
  /** 
   * @description 渲染 分配给 用户select
  */
  private renderAllotGroupUserSelect() {
    let value = this.form.groupData[AllotGroupEnum.User]
    
    return (
      <biz-user-select 
        value={value}
        onInput={this.handlerUserSelectChanged}
        fetch={this.fetchUsers} 
        multiple
      />
    )
  }
  
  /** 
   * @description 渲染 分配给 角色权限select
  */
  private renderAllotGroupRoleSelect() {
    const ScopedSlots = {
      option: (props: { option: Role }) => {
        return (
          <div key={props.option.id}>
            {props.option.name}
          </div>
        )
      }
    }
    let value = this.form.groupData[AllotGroupEnum.Role]
    
    return (
      <biz-form-remote-select
        value={value}
        onInput={this.handlerRoleSelectChanged}
        multiple
        placeholder='请选择角色'
        remoteMethod={this.fetchRoles}
        scopedSlots={ScopedSlots}
      />
    )
  }
  
  /** 
   * @description 渲染 分配给 团队select
  */
  private renderAllotGroupTeamSelect(isLeader = false) {
    let value = (
      isLeader 
        ? this.form.groupData[AllotGroupEnum.TagLeader]
        : this.form.groupData[AllotGroupEnum.Role]
    )
    return (
      <biz-team-select 
        value={value} 
        onInput={(value: Tag[]) => this.handlerTeamChanged(value, isLeader)} 
        multiple 
      />
    )
  }
  
  /** 
   * @description 渲染 派单顺序 select
  */
  private renderAllotOrder() {
    // 数据变化
    const HandlerOrderChange = (value: AllotOrderEnum) => this.form.order = value
    
    return (
      <el-select value={this.form.order} onInput={HandlerOrderChange}>
        {
          this.allotOrderOptions.map((option: ElSelectOption) => {
            return (
              <el-option key={uuid()} label={option.label} value={option.value} />
            )
          })
        }
      </el-select>
    )
  }
  
  private setFormTypeData() {
    this.form.typeData[RuleTypeEnum.Select].operator = this.taskTypeSelectedFieldOperatorOptions[0].value
    this.form.typeData[RuleTypeEnum.Select].value = this.taskTypeSelectedFieldValueOptions?.[0].value || ''
  }
  
  private submit() {
    validate(this.form)
      .then((validated: boolean) => {
        if (!validated) return
      })
      .catch((error: string) => {
        Platform.alert(error)
      }) 
  }
  
  mounted() {
    this.fetchEnabledFields()
  }
  
  
  render(h: CreateElement) {
    const attrs = {
      props: {
        title: '新建分配规则'
      },
      on: {
        'update:show': (val: boolean) => {
          this.showAllotRuleModal = val
        }
      }
    }
    
    return (
      <base-modal class={this.className} show={this.showAllotRuleModal} {...attrs}>
        <el-form ref='form' model={this.form} label-width='140px' label-position='left'>
          
          <el-form-item label='名称：' required>
            <el-input value={this.form.name} maxlength={50}></el-input>
          </el-form-item>
          
          <el-form-item label='规则类型：' required>
            <el-radio-group value={this.form.type} onInput={(value: RuleTypeEnum) => this.handlerTypeChange(value)}>
              <el-radio label={RuleTypeEnum.Type}>按照工单类型</el-radio>
              <el-radio label={RuleTypeEnum.Select}>按照特定条件</el-radio>
              <el-radio label={RuleTypeEnum.Tag}>按照客户所属团队</el-radio>
            </el-radio-group>
            {this.renderAllotType()}
          </el-form-item>
          
          <el-form-item label='分配给：' required>
            {this.renderAllotGroup()}
          </el-form-item>
          
          <el-form-item label='派单优先顺序：' required>
            {this.renderAllotOrder()}
          </el-form-item>
          
        </el-form>
        
        <div slot='footer' class='dialog-footer'>
            <el-button >取 消</el-button>
            <el-button type='primary' disabled={this.pending} onClick={this.submit}>确 定</el-button>
        </div>
        
      </base-modal>
    )
  }
  
}

