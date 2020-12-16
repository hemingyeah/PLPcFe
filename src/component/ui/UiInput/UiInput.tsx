import VC from '@model/VC'
import { CreateElement } from 'vue'
import { Component } from 'vue-property-decorator'
/* scss */
import '@src/component/ui/UiInput/UiInput.scss'

@Component({
  name: 'ui-input',
})
class UiInput extends VC<{}> {
  
  render(h: CreateElement) {
    return (
      <div class='ui-input-block'>
        {this.$slots.default}
        <i class='el-select__caret el-input__icon el-icon-arrow-up'></i>
      </div>
    )
  }
}

export default UiInput