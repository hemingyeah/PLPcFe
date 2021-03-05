/* component */
import SaleManager from '@src/modules/system/frame/component/SaleManager.vue'
import ApplicationUpgradePromptDialog from '@src/component/business/BizVersionLimitDialog/components/ApplicationUpgradePromptDialog.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* image */
// @ts-ignore
import VersionLimitImage from '@src/assets/img/version_limit.png'
/* scss */
import '@src/component/business/BizVersionLimitDialog/BizVersionLimitDialog.scss'
/* types */
import RootWindowInitData from '@model/types/RootWindowInitData'
/* vue */
import VC from '@model/VC'
import { Component, Emit, Prop, Provide, Ref } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
import { getRootWindowInitData } from '@src/util/window'

// @ts-ignore
@Component({
  name: ComponentNameEnum.BizVersionLimitDialog,
  components: {
    [SaleManager.name]: SaleManager,
    ApplicationUpgradePromptDialog
  }
})
class BizVersionLimitDialog extends VC {
  /* 初始化数据 */
  @Provide() initData: RootWindowInitData = getRootWindowInitData()
  
  /* 等待状态 */
  private pending: boolean = false
  /* 是否显示版本数量限制弹窗 */
  private showBizVersionLimitDialog: boolean = false
  /* 是否显示专属客服 */
  private visibleSaleManager: boolean = false
  /* 是否显示升级提示 */
  private visibleUpgradePromptDialog: boolean = false
  
  get rootWindowInitData(): RootWindowInitData {
    return getRootWindowInitData()
  }
  /**
   * @description 联系客户
   */
  private contactServiceManager() {
    this.visibleSaleManager = true
  }
  
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
  
  private getSaleManagerAttributes() {
    return {
      props: {
        show: this.visibleSaleManager
      },
      on: {
        'update:show': (value: boolean) => {
          this.visibleSaleManager = value
        }
      }
    }
  }
  
  /** 
   * @description 打开弹窗
   * -- 支持外部调用的
  */
  public outsideShow() {
    this.showBizVersionLimitDialog = true
  }
  
  /**
   * @description: 升级 跳转升级版本地址
   * @return {void}
  */  
  private upgrade(): void {
    this.visibleUpgradePromptDialog = true
  }
  
  render(h: CreateElement) {
    const attrs = this.getAttributes()
    
    return (
      <div class={ComponentNameEnum.BizVersionLimitDialog}>
        <base-modal {...attrs}>
          <div class='biz-version-limit-dialog-header'>
            <img src={VersionLimitImage} />
          </div>
          <div class='biz-version-limit-dialog-body'>
            <div class='biz-version-limit-dialog-body-text'>
              体验版最多可创建10条数据，升级至正式版可解锁更多权益
            </div>
            <div class='biz-version-limit-dialog-body-btn-group'>
              <el-button class='service-button' type='ghost' onClick={() => this.contactServiceManager()}>
                联系专属客服
              </el-button>
              <el-button class='upgrade-button' type='primary' onClick={() => this.upgrade()}>
                立即升级
              </el-button>
            </div>
          </div>
        </base-modal>
        <sale-manager
          serviceGroupUrl={this.rootWindowInitData.serviceGroupUrl}
          qrcode={this.rootWindowInitData.saleManagerQRCode}
          {...this.getSaleManagerAttributes()}
        />
        <application-upgrade-prompt-dialog
          show={this.visibleUpgradePromptDialog}
          onInput={(value: boolean) => this.visibleUpgradePromptDialog = value}
        />
      </div>
    )
  }
}

export default BizVersionLimitDialog