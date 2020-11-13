/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { RuleTypeEnum, AllotGroupEnum, AllotGroupSelectDefaultOptions, AllotGroupSelectTagOptions } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
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
    group: AllotGroupEnum.User,
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
  
  /** 
   * @description 规则类型变化
  */
  private handlerTypeChange(type: RuleTypeEnum) {
    this.form.type = type
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
    // 数据变化
    const HandlerGroupChange = (value: AllotGroupEnum) => this.form.group = value
    
    return (
      <div>
        {this.renderAllotGroupSelect()}
      </div>
    )
  }
  
  /** 
   * @description 渲染 分配给 select选择
  */
  public renderAllotGroupSelect() {
    // 数据变化
    const HandlerGroupChange = (value: AllotGroupEnum) => this.form.group = value
    
    return (
      <el-select value={this.form.group} onInput={HandlerGroupChange}>
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

