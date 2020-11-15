/* vue */
import { Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { RuleTypeEnum } from '@src/modules/task/components/AllotRuleModal/AllotRuleModalModel'
/* scss */
import '@src/modules/task/components/AllotRuleModal/AllotRuleModal.scss'
/* render */
import AllotRuleModalRender from '@src/modules/task/components/AllotRuleModal/AllotRuleModalRender.tsx'

@Component({
  name: ComponentNameEnum.AllotRuleModal
})
export default class AllotRuleModal extends AllotRuleModalRender {
  
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
            <el-button type='primary' disabled={this.pending} onClick={() => this.submit()}>确 定</el-button>
        </div>
        
      </base-modal>
    )
  }
  
}

