/* enum */
import EventNameEnum from '@model/enum/EventNameEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* vue */
import VC from '@model/VC'
import { CreateElement } from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
/* scss */
import '@src/component/ui/UiInput/UiInput.scss'

@Component({
  name: ComponentNameEnum.UiInput,
})
class UiInput extends VC<{}> {
  
  /* 点击事件 */
  @Prop() readonly click: Function | undefined
  /* 占位符 */
  @Prop() readonly hideIcon: boolean | undefined
  /* 占位符 */
  @Prop() readonly placeholder: string | undefined
  /* 展开切换 */
  @Prop() readonly toggle: boolean | undefined
  
  @Emit(EventNameEnum.Click)
  private clickHandler(event: MouseEvent) {
    this.click && this.click()
    return event
  }
  
  render(h: CreateElement) {
    const iconClassNames = ['el-select__caret el-input__icon el-icon-arrow-up', this.toggle && 'is-reverse']
    
    return (
      <div class='ui-input-block' onClick={(event: MouseEvent) => this.clickHandler(event)}>
        {
          this.$slots.default
          || <span class='placeholder-text'>{this.placeholder}</span>
        }
        { !this.hideIcon && <i class={iconClassNames}></i> }
      </div>
    )
  }
}

export default UiInput