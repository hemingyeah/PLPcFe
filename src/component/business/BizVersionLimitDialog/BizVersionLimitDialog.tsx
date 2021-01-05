/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* vue */
import VC from '@model/VC'
import { Component, Emit, Prop, Ref } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
/* scss */
import '@src/component/business/BizVersionLimitDialog/BizVersionLimitDialog.scss'

@Component({ 
  name: ComponentNameEnum.BizVersionLimitDialog
})
export default class BizVersionLimitDialog extends VC {
  
  /* 等待状态 */
  private pending: boolean = false
  /* 是否显示版本数量限制弹窗 */
  private showBizVersionLimitDialog: boolean = false
  
  /**
   * @description 获取属性
  */
  private getAttributes() {
    return {
      props: {
        show: this.showBizVersionLimitDialog
      },
      on: {
        'update:show': (val: boolean) => {
          this.showBizVersionLimitDialog = val
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
   * @description 打开弹窗
   * -- 支持外部调用的
  */
  public outsideShow() {
    this.showBizVersionLimitDialog = true
  }
  
  render(h: CreateElement) {
    const attrs = this.getAttributes()
    
    return (
      <base-modal class={ComponentNameEnum.BizVersionLimitDialog} {...attrs}>
        
      </base-modal>
    )
  }
}

