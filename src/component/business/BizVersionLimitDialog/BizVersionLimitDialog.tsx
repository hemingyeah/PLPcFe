/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* image */
// @ts-ignore
import VersionLimitImage from '@src/assets/img/version_limit.png'
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
  
  /**
   * @description: 升级 跳转升级版本地址
   * @return {void}
  */  
  private upgrade(): void {
    // do some things ...
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
              <el-button class='service-button' type='ghost' onClick={() => this.submit()}>
                联系专属客服
              </el-button>
              <el-button class='upgrade-button' type='primary' onClick={() => this.upgrade()}>
                立即升级
              </el-button>
            </div>
          </div>
        </base-modal>
        <sale-manager/>
      </div>
    )
  }
}

