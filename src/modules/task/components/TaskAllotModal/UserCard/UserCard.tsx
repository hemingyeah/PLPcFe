/* api */
import * as TaskApi from '@src/api/TaskApi'
/* enum */
import DateFormatEnum from '@model/enum/DateFormatEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import UserCardInfo from '@model/entity/UserCardInfo'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* model */
import { PickerOptions } from '@src/modules/task/components/TaskAllotModal/UserCard/UserCardModel'
import { getTaskUserCardInfoResult } from '@model/param/out/Task'
/* vue */
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { CreateElement, VNode } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.scss'
/* types */
import StateColorMap from '@model/types/StateColor'
/* util */
import { dispatch } from '@src/util/emitter'
import DateUtil from '@src/util/date'
import Platform from '@src/util/Platform'
import { openTabForUserView } from '@src/util/business/openTab'
import { fmt_display_text, fmt_number_to_fixed } from '@src/filter/fmt'
import { isArray } from '@src/util/type'
import { stringArrayIntersection } from '@src/util/array'

enum UserCardEmitEventEnum {
  // 关闭事件
  Close = 'close',
  // 设置负责人事件
  SetExecutor = 'setExecutor',
  // 设置协同人事件
  SetSynergy = 'setSynergy'
}

@Component({ name: ComponentNameEnum.UserCard })
export default class UserCard extends Vue {
  // 客户团队名称列表
  @Prop() readonly customerTagNames: string[] | undefined
  // 向外发布事件的 组件名字
  @Prop() readonly emitEventComponentName: string | undefined
  // 客户负责人图标
  @Prop() readonly showCustomerManagerIcon: boolean | undefined
  // 工作状态颜色数组
  @Prop() readonly stateColorMap: StateColorMap | undefined
  // 是否显示 协同人按钮
  @Prop() readonly showSynergyButton: boolean | undefined
  // 用户id
  @Prop() readonly userId: string | undefined
  
  // 用户是否在客户团队内
  private isUserInCustomerTag: boolean = false
  // 等待状态
  private pending: boolean = false
  // 时间
  private timeRange: Date[] = []
  // 用户卡片信息
  private userCardInfo: UserCardInfo = new UserCardInfo()
  
  /* 用户信息 */
  get user(): LoginUser {
    return this.userCardInfo.user
  }
  
  @Watch('userId')
  onUserIdChanged() {
    this.computedStartAndEndTime()
    this.fetchUserTaskData()
  }
  
  /**
   * @description 设置负责人人
  */
  @Emit(UserCardEmitEventEnum.SetExecutor)
  private setExecutorUser() {
    this.dispatchEvent<LoginUser>(UserCardEmitEventEnum.SetExecutor, this.user)      
    return this.user
  }
  
  /**
    * @description 设置协同人
  */
  @Emit(UserCardEmitEventEnum.SetSynergy)
  private setSynergyUser() {
    this.dispatchEvent<LoginUser>(UserCardEmitEventEnum.SetSynergy, this.user)    
    return this.user
  }
  
  /**
    * @description 关闭
  */
  @Emit(UserCardEmitEventEnum.Close)
  private close() {
    this.dispatchEvent<boolean>(UserCardEmitEventEnum.Close, false)
    return false
  }
  
  /** 
   * @description 计算开始和结束时间
  */  
  private computedStartAndEndTime() {
    const day = 3600 * 1000 * 24
    const start = new Date()
    const end = new Date()
    
    end.setTime(end.getTime() - day)
    start.setTime(end.getTime() - day * 30)
    
    this.timeRange = [start, end]
  }
  
  /** 
   * @description 发送事件
  */
  private dispatchEvent<T>(eventName: UserCardEmitEventEnum, data: T): void {
    if (!this.emitEventComponentName) return
    
    // 支持由自定义组件 发出事件
    dispatch.call(
      this,
      this.emitEventComponentName, 
      eventName, 
      data
    )
  }
  
  /** 
   * @description 获取属性列表
  */
  public getAttributes() {
    return {
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
  }
  
  /** 
   * @description 获取人员工单信息
  */
  private fetchUserTaskData() {
    let params = {
      executorId: this.userId || '',
      startTime: DateUtil.format(this.timeRange[0], DateFormatEnum.YTD),
      endTime: DateUtil.format(this.timeRange[1], DateFormatEnum.YTD)
    }
    
    this.pending = true
    
    TaskApi.getTaskUserCardInfo(params)
      .then((data: getTaskUserCardInfoResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          Platform.alert(data.message)
        }
        
        this.userCardInfo = data.result
        this.matchUserInCustomerTags()
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  private getUserInfoData(value: string | null, suffix: string): string | number {
    let newValue: string | number | null = null
    if (value !== null) {
      newValue = fmt_number_to_fixed(Number(value), 2)
    }
    
    return fmt_display_text(newValue, suffix)
  }
  
  private getUserInfoUsedTime(value: string | null): string | number {
    return this.getUserInfoData(value, '小时')
  }
  
  private getUserInfoTashRate(value: string | null): string | number {
    if (value !== null) { value = value.substr(0, value.length - 1) }
    return this.getUserInfoData(value, '%')
  }
  
  /** 
   * @description 选择时间变化
  */
  private handlerTimeChange(value: Date[]): void {
    this.timeRange = value
    this.fetchUserTaskData()
  }
  
  /** 
   * @description 匹配用户是否在客户团队里
  */
  private matchUserInCustomerTags() {
    if (!isArray(this.customerTagNames)) return
    // 交集团队列表
    let intersectionTags: string[] = stringArrayIntersection(this.customerTagNames || [], this.userCardInfo.department)
    // 是否在客户团队内
    this.isUserInCustomerTag = intersectionTags.length > 0
  }
  
  /** 
   * @description 打开用户详情tab
  */
  private openUserViewTab(): void {
    openTabForUserView(this.userId, { from: 'task' })
  }
  
  /** 
   * @description 渲染用户卡片时间
  */
  private renderUserCardTime(): VNode {
    return (
      <div class='user-card-time'>
        <el-date-picker
          type='daterange'
          unlink-panels
          start-placeholder='开始日期'
          end-placeholder='结束日期'
          clearable={false}
          picker-options={PickerOptions}
          value={this.timeRange}
          onInput={this.handlerTimeChange}
        />
      </div>
    )
  }
  
  /** 
   * @description 渲染用户信息详情
  */
  private renderUserCardDetail(): VNode {
    // 平均响应用时
    let rangeAccept = this.getUserInfoUsedTime(this.userCardInfo.rangeAccept)
    // 平均工作用时
    let rangeWork = this.getUserInfoUsedTime(this.userCardInfo.rangeWork)

    return (
      <div class='user-card-detail'>
        <div class='user-card-detail-row'>
          <div class='user-card-detail-row-item'>
            未完成工单量: {fmt_display_text(this.userCardInfo.unfinished, '个')}
          </div>
          <div class='user-card-detail-row-item'>
            已完成工单量: {fmt_display_text(this.userCardInfo.finished, '个')}
          </div>
        </div>
        <div class='user-card-detail-row'>
          <div class='user-card-detail-row-item'>
            平均响应用时: 
            <el-tooltip content={rangeAccept} placement='top'>
              <span>{rangeAccept}</span>
            </el-tooltip>
          </div>
          <div class='user-card-detail-row-item'>
            平均工作用时: 
            <el-tooltip content={rangeWork} placement='top'>
              <span>{rangeWork}</span>
            </el-tooltip>
          </div>
        </div>
        <div class='user-card-detail-row'>
          <div class='user-card-detail-row-item'>
            拒单率: {this.getUserInfoTashRate(this.userCardInfo.refuse)}
          </div>
          <div class='user-card-detail-row-item'>
            转派率: {this.getUserInfoTashRate(this.userCardInfo.allot)}
          </div>
        </div>
        <div class='user-card-detail-row'>
          <div class='user-card-detail-row-item'>
            好评率: {this.getUserInfoTashRate(this.userCardInfo.degree)}
          </div>
        </div>
      </div>
    )
  }
  
  mounted() {
    this.computedStartAndEndTime()
    this.fetchUserTaskData()
  }
  
  render(h: CreateElement) {
    const attrs = this.getAttributes()
    
    return (
      <div class='user-card' {...attrs}>
          <div class='user-card-close' onClick={() => this.close()}>
            <i class='iconfont icon-fe-close'></i>
          </div>
          <div class='user-card-header'>
            <div class='user-card-header-head'>
              <img src={this.user?.head || DefaultHead} />
            </div>
            <div class='user-card-header-content'>
              <div class='user-card-header-content-top'>
                
                <div class='user-card-header-content-top-left'>
                  <div class='user-card-header-content-name' onClick={() => this.openUserViewTab()}>
                    {this?.user?.displayName}
                    { this.showCustomerManagerIcon && (
                      <el-tooltip content='客户负责人' placement='top'>
                        <i class='iconfont icon-huangguan'></i>
                      </el-tooltip>
                    )}
                  </div>
                  
                  <div class='user-card-header-content-state'>
                    <span class='user-state-round' style={{
                      backgroundColor: this.stateColorMap && this.stateColorMap[this.user?.state || '']
                    }}>
                    </span>
                    <span>{this.user?.state}</span>
                    <span>{this.user?.cellPhone}</span>
                  </div>
                </div>
                
                <div class='user-card-header-button-group'>
                  <base-button class='excutor-button' type='ghost' onEvent={this.setExecutorUser}>设为负责人</base-button>
                  {
                    this.showSynergyButton
                    && <base-button class='synergy-button' type='ghost' onEvent={this.setSynergyUser}>设为协同人</base-button>
                  }
                </div>
                
              </div>
              
              <div class='user-card-header-content-team'>
                {
                  this.isUserInCustomerTag && (
                    <el-tooltip content='客户的服务团队' placement='top'>
                      <i class='iconfont icon-favorfill'></i>
                    </el-tooltip>
                  )
                }
                { this.userCardInfo.department.join(', ') }
              </div>
              
            </div>
          </div>
          {this.renderUserCardTime()}
          {this.renderUserCardDetail()}
          
      </div>
    )
  }

}


