/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* types */
import RootWindowInitData from '@model/types/RootWindowInitData'
/* vue */
import VC from '@model/VC'
import { Component, Emit, Prop, Ref, Watch } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
import { getRootWindowInitData } from '@src/util/window'
// @ts-ignore
import QRCode from 'qrcodejs2'

enum ApplicationUpgradePromptDialogEmitEventNameEnum {
  Input = 'input'
}

@Component({
  name: ComponentNameEnum.ApplicationUpgradePromptDialog
})
class ApplicationUpgradePromptDialog extends VC {
  
  /* 是否显示 */
  @Prop() show: boolean | undefined
  
  /* 是否显示应用升级提示弹窗 */
  private showApplicationUpgradePromptDialog: boolean = false
  
  get rootWindowInitData(): RootWindowInitData {
    return getRootWindowInitData()
  }
  
  @Watch('show')
  private onShowChangedHandler(newValue: boolean, oldValue: boolean) {
    this.showApplicationUpgradePromptDialog = newValue
  }
  
  /**
   * @description: 触发提交显示变更事件
   * @param {Boolean} show 显示值
   * @return {Boolean} 显示值
  */
  @Emit(ApplicationUpgradePromptDialogEmitEventNameEnum.Input)
  private emitShowChangedHandler(show: boolean) {
    return show
  }
  
  /**
   * @description: 创建升级二维码
   * @return {void}
  */
  private createUpgradeQRCode() {
    new QRCode(
      this.$refs.ApplicationUpgradePromptDialogQRCode, 
      {
        text: this.getMarketUrl(),
        width: 268,
        height: 268,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      }
    )
  }
  
  /**
   * @description: 获取钉钉商店市场应用地址
   * @return {String} 商店市场地址
  */
  private getMarketUrl() {
    const corpId: string = this.rootWindowInitData?.ddConfig?.corpId || ''
    return `https://h5.dingtalk.com/appcenter/detail.html?showmenu=false&dd_share=false&goodsCode=FW_GOODS-1000446990&corpId=${corpId}`
  }
  
  /**
   * @description 获取属性
  */
  private getAttributes() {
    return {
      props: {
        title: '立即升级',
        show: this.showApplicationUpgradePromptDialog
      },
      on: {
        'update:show': (value: boolean) => {
          this.showApplicationUpgradePromptDialog = value
          this.emitShowChangedHandler(value)
        }
      }
    }
  }
  
  mounted() {
    this.createUpgradeQRCode()
  }
  
  render(h: CreateElement) {
    const attrs = this.getAttributes()
    
    return (
      <div class={ComponentNameEnum.ApplicationUpgradePromptDialog}>
        <base-modal {...attrs}>
          <div class='application-upgrade-prompt-dialog-qrcode' ref='ApplicationUpgradePromptDialogQRCode'>
          </div>
          <div class='application-upgrade-prompt-dialog-message'>
            请使用手机钉钉扫码
          </div>
        </base-modal>
      </div>
    )
  }
}

export default ApplicationUpgradePromptDialog