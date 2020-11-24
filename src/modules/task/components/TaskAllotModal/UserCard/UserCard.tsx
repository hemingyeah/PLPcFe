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
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.scss'
/* types */
import StateColorMap from '@model/types/StateColor'
/* util */
import { dispatch } from '@src/util/emitter'
import DateUtil from '@src/util/date'
import Platform from '@src/util/Platform'
import { openTabForUserView } from '@src/util/business/openTab'

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
  // 向外发布事件的 组件名字
  @Prop() readonly emitEventComponentName: string | undefined
  // 负责人图标
  @Prop() readonly showExcutorIcon: boolean | undefined
  // 工作状态颜色数组
  @Prop() readonly stateColorMap: StateColorMap | undefined
  // 是否显示 协同人按钮
  @Prop() readonly showSynergyButton: boolean | undefined
  // 用户id
  @Prop() readonly userId: string | undefined
  
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
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  /** 
   * @description 格式化显示文字
  */
  private formatDisplayText(value: any, text?: string) {
    return value ? `${value}${text || ''}` : (value || UserCardInfo.Placeholder)
  }
  
  /** 
   * @description 选择时间变化
  */
  private handlerTimeChange(value: Date[]): void {
    this.timeRange = value
    this.fetchUserTaskData()
  }
  
  /** 
   * @description 打开用户详情tab
  */
  private openUserViewTab(): void {
    openTabForUserView(this.userId)
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
                    { this.showExcutorIcon && <i class='iconfont icon-huangguan'></i> }
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
                { this.userCardInfo.department.join(', ') }
              </div>
              
            </div>
          </div>
          
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
          
          <div class='user-card-detail'>
            <div class='user-card-detail-row'>
              <div class='user-card-detail-row-item'>
                未完成工单量: {this.formatDisplayText(this.userCardInfo.unfinished, '个')}
              </div>
              <div class='user-card-detail-row-item'>
                已完成工单量: {this.formatDisplayText(this.userCardInfo.finished, '个')}
              </div>
            </div>
            <div class='user-card-detail-row'>
              <div class='user-card-detail-row-item'>
                平均响应用时: {this.userCardInfo.rangeAccept}
              </div>
              <div class='user-card-detail-row-item'>
                平均工作用时: {this.userCardInfo.rangeWork}
              </div>
            </div>
            <div class='user-card-detail-row'>
              <div class='user-card-detail-row-item'>
                拒单率: {this.formatDisplayText(this.userCardInfo.refuse, '%')}
              </div>
              <div class='user-card-detail-row-item'>
                转派率: {this.formatDisplayText(this.userCardInfo.allot, '%')}
              </div>
            </div>
            <div class='user-card-detail-row'>
              <div class='user-card-detail-row-item'>
                好评率: {this.formatDisplayText(this.userCardInfo.degree, '%')}
              </div>
            </div>
          </div>
          
      </div>
    )
  }

}


