/* enum */
import EventNameEnum from '@model/enum/EventNameEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* mixin */
import FormMixin from '@src/component/form/mixin/form'
/* vue */
import VC from '@model/VC'
import { VNode } from 'vue'
import { CreateElement } from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
/* scss */
import '@src/component/business/BizRemoteSelect/BizRemoteSelect.scss'

@Component({
  name: ComponentNameEnum.BizRemoteSelect,
  mixins: [FormMixin]
})
class BizRemoteSelect extends VC<{}> {
  
  /* 收缩状态 */
  @Prop({ default: false }) readonly collapsed: boolean | undefined
  /* 清除状态 */
  @Prop({ default: false }) readonly cleared: boolean | undefined
  /* 禁用状态 (与混入FormMixin的computed中disabled做区分) */
  @Prop({ default: false }) readonly inputDisabled: boolean | undefined
  /* 多选 */
  @Prop({ default: false }) readonly multiple: boolean | undefined
  /* 占位符 */
  @Prop() readonly placeholder: string | undefined
  /* 远程搜索方法 */
  @Prop() readonly remoteMethod: Function | undefined
  /* 值 */
  @Prop() readonly value: Array<any> | undefined
  /* select数据值的键名 */
  @Prop({ default: 'value' }) readonly valueKey: string | undefined
  
  @Emit(EventNameEnum.Clear)
  private clearHandler(value: any[]) {
    return value
  }
  
  @Emit(EventNameEnum.Input)
  private inputHandler() {
    return []
  }
  
  /**
   * @description: 是否显示清除按钮
   * @return {Boolean} 是否显示
  */
  get showClearButton(): boolean {
    return Boolean(this.cleared && this.value && this.value?.length > 0 && !this.inputDisabled)
  }
  
  /**
   * @description: 渲染清除按钮
   * @return {VNode | null}
  */
  private renderClearButton(): VNode | null {
    if (!this.showClearButton) return null
    
    return (
      <div class="biz-form-remote-select-clear" onClick={(event: any) => this.clearHandler(event)}>
        <i class="el-icon-error" style="color:rgba(211, 214, 217, 0.69);"></i>
      </div>
    )
  }
  
  render(h: CreateElement) {
    return (
      <div class='biz-form-remote-select'>
        <base-select
          value-key={this.valueKey}
          onInput={this.inputHandler}
          placeholder={this.placeholder}
          remoteMethod={this.remoteMethod}
          value={this.value}
          scopedSlots={ this.$scopedSlots }
          multiple={ this.multiple }
          disabled={ this.inputDisabled }
          collapsed={ this.collapsed }
        >
        </base-select>
        {this.renderClearButton()}
      </div>
    )
  }
}

export default BizRemoteSelect