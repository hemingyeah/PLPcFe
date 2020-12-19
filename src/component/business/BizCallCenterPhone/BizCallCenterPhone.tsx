/* api */
import { dialout } from '@src/api/TaskApi'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* vue */
import VC from '@model/VC'
import { Component, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'

/* 加密字段值 */
const ENCRYPT_FIELD_VALUE = '***'

@Component({ 
  name: ComponentNameEnum.BizCallCenterPhone
})
export default class BizCallCenterPhone extends VC {
  /* 工单信息 */
  @Prop() readonly phoneNumber: string | number | undefined
  
  /* FIXME: 喵喵喵 */
  /** 
   * @description 是否开启呼叫中心模块
  */
  get hasCallCenterModule(): boolean {
    return localStorage.getItem('call_center_module') == '1'
  }
  
  /** 
  * @description 显示拨打电话
  * 1. 开通呼叫中心
  * 2. 且联系人未加密
  */
  get showCallPhone(): boolean {
    // 未加密
    let notEncrypt = !this.isEncryptField(this.phoneNumber)
    return Boolean(this.hasCallCenterModule && this.phoneNumber && notEncrypt)
  }
  
  /** 
   * @description 呼出电话
  */
  private async call(event: Event) {
    event.stopPropagation()
    
    try {
      const result = await dialout({ taskType: 'task', phone: this.phoneNumber })
      // 呼出失败
      if (!result.succ) {
        return Platform.notification({
          title: "呼出失败",
          message: result.message || '',
          type: 'error'
        })
      }
      
    } catch (error) {
      Log.error(error, this.call.name)
      
    }
  }
  
  /**
   * @description 是否加密字段
  */
  private isEncryptField(value: any): boolean {
    return value === ENCRYPT_FIELD_VALUE
  }
  
  render(h: CreateElement) {
    // 是否显示拨打电话
    if (!this.showCallPhone) return null
    
    return (
      <div class={ComponentNameEnum.BizCallCenterPhone}>
        <el-tooltip content='拨打电话' placement='top'>
          <i class='iconfont icon-dianhua2' onClick={(event: Event) => this.call(event)}></i>
        </el-tooltip>
      </div>
    )
  }
}

