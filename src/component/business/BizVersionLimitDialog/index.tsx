/* component */
import BizVersionLimitDialog from '@src/component/business/BizVersionLimitDialog/BizVersionLimitDialog.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* util */
import fastCall from '@src/component/util/fastCall'
import { destroyComponent } from '@src/util/dom'
import { mount } from '@src/util/vue'
/* vue */
import VC from '@model/VC'
import { Component, Ref } from 'vue-property-decorator'
import Vue, { VueConstructor } from 'vue'

/**
 * @description: 初始化版本限制弹窗
 * @return {Vue} vue组件实例
*/
export function initVersionLimitDialog(): Vue {
  
  @Component({
    components: {
      [ComponentNameEnum.BizVersionLimitDialog]: BizVersionLimitDialog
    }
  })
  class BizVersionLimitDialogHOC extends VC {
    
    /* 版本数量限制弹窗组件 */
    @Ref() BizVersionLimitDialogComponent!: BizVersionLimitDialog
    
    /** 销毁 */
    private destroy() {
      setTimeout(() => destroyComponent(this), 1500)
    }
    
    mounted() {
      // 打开版本数量限制弹窗
      this.BizVersionLimitDialogComponent?.outsideShow()
    }
    
    render() {
      return (
        <biz-version-limit-dialog
          ref='BizVersionLimitDialogComponent'
          onDestroy={() => this.destroy()}
        >
        </biz-version-limit-dialog>
      )
    }
  }
  
  return mount(BizVersionLimitDialogHOC, ComponentNameEnum.BizVersionLimitDialogHOC) as Vue
}

const BizVersionLimitDialogComponent = {
  install(vue: VueConstructor) {
    // 注册到全局组件
    vue.component(BizVersionLimitDialog.name, BizVersionLimitDialog)
    // 注册快速调用方法
    fastCall(vue, 'biz', { initVersionLimitDialog })
  },
  namespace: 'biz',
  props: { initVersionLimitDialog }
}

export default BizVersionLimitDialogComponent