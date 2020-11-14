/* api */
import * as SettingApi from '@src/api/SettingApi'
/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { RuleTypeEnum, AllotGroupEnum, AllotGroupSelectDefaultOptions, AllotGroupSelectTagOptions } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Role from '@model/entity/Role/Role'
/* interface */
import { RoleForm } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalInterface'
/* scss */
import '@src/modules/task/components/AllotRuleModal/AllotRuleModal.scss'
/* types */
import ElSelectOption from '@model/types/ElSelectOption'
/* util */
import { uuid } from '@src/util/string'

@Component({
  name: ComponentNameEnum.AllotRuleModal
})
export default class AllotRuleModal extends Vue {
  
  /* css类名 */
  private className: string = ComponentNameEnum.AllotRuleModal
  /* 表单数据 */
  private form: RoleForm = {
    // 分配给
    groupType: AllotGroupEnum.User,
    groupData: {
      [AllotGroupEnum.User]: [],
      [AllotGroupEnum.Role]: [],
      [AllotGroupEnum.Tag]: [],
      [AllotGroupEnum.TagLeader]: []
    },
    // 规则类型
    type: RuleTypeEnum.Type
  }
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
  
  private fetchUsers(params: any) {
    return SettingApi.getSettingUserList(params)
  }  
  
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
   * @description 规则类型变化
  */
  private handlerTypeChange(type: RuleTypeEnum) {
    // 设置规则类型的数据
    this.form.type = type
    // 初始化 分配给 数据
    this.form.groupType = AllotGroupEnum.User
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
   * @description 显示弹窗
  */
  public show() {
    this.showAllotRuleModal = true
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
  }
  
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
  
  private renderAllotGroupTeamSelect() {
    
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
            <el-input maxlength={50}></el-input>
          </el-form-item>
          
          <el-form-item label='规则类型：' required>
            <el-radio-group value={this.form.type} onInput={(value: RuleTypeEnum) => this.handlerTypeChange(value)}>
              <el-radio label={RuleTypeEnum.Type}>按照工单类型</el-radio>
              <el-radio label={RuleTypeEnum.Select}>按照特定条件</el-radio>
              <el-radio label={RuleTypeEnum.Tag}>按照客户所属团队</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label='分配给：' required>
            {this.renderAllotGroup()}
          </el-form-item>
          
        </el-form>
      </base-modal>
    )
  }
  
}

