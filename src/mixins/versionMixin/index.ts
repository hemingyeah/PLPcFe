/* api */
import * as SettingApi from '@src/api/SettingApi'
/* components */
import BizVersionLimitDialog from '@src/component/business/BizVersionLimitDialog/BizVersionLimitDialog'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TenantDataLimitSourceEnum from '@model/enum/TenantDataLimitSourceEnum'
/* model */
import MsgModel from '@model/MsgModel'
/* vue */
import VC from '@model/VC'
import { CreateElement } from 'vue'
import { Component, Emit, Prop, Ref } from 'vue-property-decorator'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
import { isExperienceEdition } from '@src/util/version'
import { isFunction } from '@src/util/type'
import Result from '@model/Result'
import ErrorCodeEnum from '@model/enum/ErrorCodeEnum'

@Component({ 
  name: ComponentNameEnum.VersionMixin,
  components: {
    BizVersionLimitDialog
  }
})
export default class VersionMixin extends VC {
  
  /* 版本数量限制弹窗组件 */
  @Ref() BizVersionLimitDialogComponent !: BizVersionLimitDialog
  
  /* 等待状态 */
  private pending: boolean = false
  
  /** 
  * @description 是否为体验版
  * ! 体验版限制了导入功能
 */
  get isExperienceEdition() {
    return isExperienceEdition()
  }
  
  /**
   * @description: 检查数量是否超过上限 (仅限体验版)
   * @param {TenantDataLimitSourceEnum} source 需要检查的模块名称
   * @return {Boolean} 是否超过上限
  */
  private async fetchCheckNumExceedLimit(source: TenantDataLimitSourceEnum): Promise<boolean> {
    // 非体验版无需效验
    if (!this.isExperienceEdition) return false
    
    // 参数
    let params: any = {}
    // 是否超出上限
    let isExceed: boolean = false
    
    try {
      let result = await SettingApi.checkNumExceedLimit(params)
      isExceed =  Boolean(result && result.data)
    } catch (error) {
      Log.error(error, this.fetchCheckNumExceedLimit.name)
      isExceed = false
    }
    
    return isExceed
  }
  
  /**
   * @description: 初始化检查数量是否超过上限 (仅限体验版)之前的事件操作
   * @param {TenantDataLimitSourceEnum} source 需要检查的模块名称
   * @param {Function} successCallback 成功回调函数
   * @param {Function} errorCallback 失败回调函数
   * @return {*}
  */
  private async checkNumExceedLimitBeforeHandler(
    source: TenantDataLimitSourceEnum,
    successCallback: Function,
    errorCallback: Function
  ) {
    try {
      // 等待状态
      this.pending = true
      
      // 是否超出上限
      let isExceed = await this.fetchCheckNumExceedLimit(source)
      isExceed = true
      if (isExceed) {
        // 打开版本数量限制弹窗
        // @ts-ignore
        this.$fast.biz?.initVersionLimitDialog()
        // 失败的回调函数
        isFunction(errorCallback) && errorCallback()
      } else {
        // 成功的回调函数
        isFunction(successCallback) && successCallback()
      }
      
    } catch (error) {
      // 失败的回调函数
      isFunction(errorCallback) && errorCallback()
      // Log
      Log.error(error, this.checkNumExceedLimitBeforeHandler.name)
    } finally {
      this.pending = false
    }
  }
  
  /**
   * @description: 提交后 检查数量是否超过上限 (仅限体验版) 的事件操作
   * @param {TenantDataLimitSourceEnum} source 需要检查的模块名称
   * @param {Function} successCallback 成功回调函数
   * @param {Function} errorCallback 失败回调函数
   * @return {*}
  */
  private async checkNumExceedLimitAfterHandler<T = MsgModel<any> | Result<any>>(submitEventPromise: Promise<T>) {
    try {
      submitEventPromise.then((responseData: any) => {
        // 是否超出上限
        let isExceed = (
          responseData?.code == ErrorCodeEnum.DataLimit 
          || responseData?.status == ErrorCodeEnum.DataLimit
        )
        
        if (isExceed) {
          
        }
        
      })
      
    } catch (error) {
      // Log
      Log.error(error, this.checkNumExceedLimitAfterHandler.name)
    } finally {
      this.pending = false
    }
  }

}

