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
    const attrs = this.getAttributes() 
    
    return (
      <base-modal class={[this.className, this.isDisabled && `${this.className}-disabled`]} id={this.className} show={this.showAllotRuleModal} {...attrs}>
        <el-form ref='form' model={this.form} label-width='120px' label-position='left'>
          
          <el-form-item label='名称：' required>
            <el-input
              disabled={this.isDisabled}
              placeholder='规则名称 [最多十个字] '
              value={this.form.name} 
              onInput={(value: string) => this.handlerNameChange(value)}  
              maxlength={10}
            />
          </el-form-item>
          
          <el-form-item label='规则类型：' required>
            <el-radio-group disabled={this.isDisabled} value={this.form.type} onInput={(value: RuleTypeEnum) => this.handlerTypeChange(value)}>
              <el-radio label={RuleTypeEnum.Type}>按照工单类型</el-radio>
              <el-radio label={RuleTypeEnum.Select}>按照特定条件</el-radio>
              <el-radio label={RuleTypeEnum.Tag}>按照客户所属团队</el-radio>
            </el-radio-group>
            {this.renderAllotType()}
          </el-form-item>
          
          <el-form-item label='分配给：' required>
            {this.renderAllotGroup()}
          </el-form-item>
          
          {
            !this.isCustomerManager && (
              <el-form-item label='派单优先顺序：' required>
                {this.renderAllotOrder()}
              </el-form-item>
            )
          }
          
        </el-form>
        
        <div slot='footer' class='dialog-footer'>
          <el-button onClick={() => this.close()}>
            关 闭
          </el-button>
          {this.renderConfirmButton()}
        </div>
        
      </base-modal>
    )
  }
  
}

