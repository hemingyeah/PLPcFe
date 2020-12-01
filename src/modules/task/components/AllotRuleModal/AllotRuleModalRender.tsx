/* enum */
import { 
  RuleTypeEnum, 
  AllotGroupEnum,
  AllotOrderEnum,
  AllotOperatorEnum
} from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* entity */
import Role from '@model/entity/Role/Role'
import Tag from '@model/entity/Tag/Tag'
import TaskType from '@model/entity/TaskType'
/* methods */
import AllotRuleModalMethods from '@src/modules/task/components/AllotRuleModal/AllotRuleModalMethods'
/* types */
import ElSelectOption from '@model/types/ElSelectOption'
/* util */
import { uuid } from '@src/util/string'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import { VNode } from 'vue'

class AllotRuleModalRender extends AllotRuleModalMethods {
  
  /** 
   * @description 工单类型清除按钮
  */
  public renderTaskTypeClear(): VNode | null {
    /* 是否为空 */
    let isTaskTypeEmpty = this.form.typeData[RuleTypeEnum.Select].taskType.length <= 0
    if (isTaskTypeEmpty || this.isDisabled) return null
    
    return (
      <button
        type='button'
        class='biz-user-select-clear task-type-select-clear' 
        key='task-type-clear'
        onClick={() => this.form.typeData[RuleTypeEnum.Select].taskType = []}
      >
        <i class="iconfont icon-yemianshanchu"></i>
      </button>
    )
  }
  
  /** 
   * @description 渲染 规则类型 对应的列表
  */
  public renderAllotType(): VNode | null {    
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
    
    return null
  }
  
  /** 
   * @description 渲染 规则类型 按照工单类型
  */
  public renderAllotTypeWithTaskType(): VNode {
    let text = '当工单类型符合以下条件时：'
    let value = this.form.typeData[RuleTypeEnum.Type]
    let changedHandler = (value: TaskType[]) => this.handlerTaskTypeSelectChanged(value)
    
    return this.renderTaskTypesSelect(value, changedHandler, true, text)
  }
  
  /** 
   * @description 渲染 规则类型 按照特定条件
  */
  public renderAllotTypeWithConditions(): VNode {
    let text = '选择工单类型，当工单类型为：'
    let { taskType, field, operator, value } = this.form.typeData[RuleTypeEnum.Select]
    let changedHandler = (value: TaskType[]) => this.handlerCustomTaskTypeSelectChanged(value)
    
    return (
      <div class={`${this.className}-condition`}>
        {this.renderTaskTypesSelect(taskType, changedHandler, false, text)}
        <div class={`${this.className}-condition-field`}>
          <span>选择应用条件，当字段</span>
          <el-select
            disabled={this.isDisabled}
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
            disabled={this.isDisabled}
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
            disabled={this.isDisabled}
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
  
  public renderTaskTypesSelect(
    value: TaskType[] | undefined, 
    changedHandler: (value: TaskType[]) => void,
    multiple: boolean = true,
    text?: string
  ): VNode {
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
      <div class={`${this.className}-task-type`}>
        <span>{text}</span>
        <biz-form-remote-select
          class={`${this.className}-type-select`}
          inputDisabled={this.isDisabled}
          multiple={multiple}
          value={value}
          onInput={changedHandler}
          placeholder='全部工单类型'
          remoteMethod={this.fetchTaskTypes}
          scopedSlots={ScopedSlots}
        />
        {!multiple && this.renderTaskTypeClear()}
      </div>
    )
  }
  
  /** 
   * @description 渲染 规则类型 按照客户所属团队
  */
  public renderAllotGroupWithTag(): VNode {
    let tagData = this.form.typeData[RuleTypeEnum.Tag]
    let { tags, operator } = tagData
    
    return (
      <div class={`${this.className}-customer-tag`}>
        <div class={`${this.className}-customer-tag-operator`}>
          当客户所属团队
          {
            <el-select disabled={this.isDisabled} value={operator} onInput={(value: AllotOperatorEnum) => this.handlerOperatorSelectChanged(value)}>
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
          disabled={this.isDisabled}
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
  public renderAllotGroup(): VNode {    
    return (
      <div class={`${this.className}-group`}>
        {this.renderAllotGroupSelect()}
        {this.renderAllotGroupSelectForm()}
      </div>
    )
  }
  
  /** 
   * @description 渲染 分配给 select选择
  */
  public renderAllotGroupSelect(): VNode {
    // 数据变化
    const HandlerGroupChange = (value: AllotGroupEnum) => this.form.groupType = value
    
    return (
      <el-select disabled={this.isDisabled} value={this.form.groupType} onInput={HandlerGroupChange}>
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
  public renderAllotGroupSelectForm(): VNode | null {
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
    
    return null
  }
  
  /** 
   * @description 渲染 分配给 用户select
  */
  public renderAllotGroupUserSelect(): VNode {
    let value = this.form.groupData[AllotGroupEnum.User]
    
    return (
      <biz-user-select
        disabled={this.isDisabled}
        value={value}
        onInput={(value: LoginUser[]) => this.handlerUserSelectChanged(value)}
        fetch={this.fetchUsers} 
        multiple
      />
    )
  }
  
  /** 
   * @description 渲染 分配给 角色权限select
  */
  public renderAllotGroupRoleSelect(): VNode {
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
        class={`${this.className}-role-select`}
        disabled={this.isDisabled}
        value={value}
        onInput={(value: Role[]) => this.handlerRoleSelectChanged(value)}
        placeholder='请选择角色'
        remoteMethod={this.fetchRoles}
        scopedSlots={ScopedSlots}
      />
    )
  }
  
  /** 
   * @description 渲染 分配给 团队select
  */
  public renderAllotGroupTeamSelect(isLeader = false): VNode {
    let value = (
      isLeader 
        ? this.form.groupData[AllotGroupEnum.TagLeader]
        : this.form.groupData[AllotGroupEnum.Tag]
    )
    return (
      <biz-team-select
        disabled={this.isDisabled}
        value={value} 
        onInput={(value: Tag[]) => this.handlerTeamChanged(value, isLeader)}
      />
    )
  }
  
  /** 
   * @description 渲染 派单顺序 select
  */
  public renderAllotOrder(): VNode {
    // 数据变化
    const HandlerOrderChange = (value: AllotOrderEnum) => this.form.order = value
    
    return (
      <el-select disabled={this.isDisabled} class={`${this.className}-order`} value={this.form.order} onInput={HandlerOrderChange}>
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
  
  /** 
   * @description 渲染确定按钮
  */
  public renderConfirmButton(): VNode | null {
    if (this.isDisabled) return null

    return (
      <el-button type='primary' disabled={this.pending} onClick={() => this.submit()}>
        确 定
      </el-button>
    )
  }
}

export default AllotRuleModalRender
