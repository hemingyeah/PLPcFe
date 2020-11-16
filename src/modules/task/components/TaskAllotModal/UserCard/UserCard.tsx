/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* model */
import { PickerOptions } from '@src/modules/task/components/TaskAllotModal/UserCard/UserCardModel'
/* vue */
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.scss'
/* util */
import { dispatch } from '@src/util/emitter'

enum UserCardEmitEventEnum {
  SetExecutor = 'setExecutor',
  SetSynergy = 'setSynergy'
}

interface TaskAllotUser extends LoginUser {
  // 未完成工单量
  unFinishedTaskCount: number,
  // 已完成工单量
  finishTaskCount: number,
  // 平均响应用时
  averageResponseTime: number | string,
  // 平均工作用时
  averageWorkTime: number | string,
  // 拒单率
  rejectionRate: number | string
  // 转派率
  allotRate: number | string,
  // 好评率
  favorableRate: number | string
}

@Component({ name: 'user-card' })
export default class UserCard extends Vue {
  // 向外发布事件的 组件名字
  @Prop() emitEventComponentName: string | undefined
  // 用户id
  @Prop() userId: string | undefined
  
  // 时间
  private timeRange: Date[] = []
  // 用户信息
  private user: TaskAllotUser | null = null

  @Watch('userId', { immediate: true })
  onUserIdChanged(newVal: string, oldVal: string) {
    this.fetchUserTaskData()
  }
  
  /**
   * @description 设置负责人人
  */
  @Emit(UserCardEmitEventEnum.SetExecutor)
  private setExecutorUser() {
    // 支持由自定义组件 发出事件
    if (this.emitEventComponentName) {
      dispatch.call(this, this.emitEventComponentName, UserCardEmitEventEnum.SetExecutor, this.user)
    }
    
    return this.user
  }
  
  /**
    * @description 设置协同人
  */
  @Emit(UserCardEmitEventEnum.SetSynergy)
  private setSynergyUser() {
    // 支持由自定义组件 发出事件
    if (this.emitEventComponentName) {
      dispatch.call(this, this.emitEventComponentName, UserCardEmitEventEnum.SetSynergy, this.user)
    }
    
    return this.user
  }

  private computedStartAndEndTime() {
    const day = 3600 * 1000 * 24
    const start = new Date()
    const end = new Date()
    
    end.setTime(end.getTime() - day)
    start.setTime(end.getTime() - day * 30)
    
    this.timeRange = [start, end]
  }
  
  /** 
   * @description 获取人员工单信息
  */
  private fetchUserTaskData() {
    this.user = {
      displayName: '黄宝成',
      tagList: [{tagName: '测试团队'}],
      state: '工作中',
      cellPhone: '17664666980',
      userId: this.userId || '',
      unFinishedTaskCount: 1,
      finishTaskCount: 2,
      averageResponseTime: '2h',
      averageWorkTime: '3h',
      rejectionRate: '30%',
      allotRate: '20%',
      favorableRate: '10%'
    }
  }
  
  /** 
   * @description 选择时间变化
  */
  private handlerTimeChange(value: Date[]): void {
    this.timeRange = value
  }
  
  mounted() {
    this.computedStartAndEndTime()
    this.fetchUserTaskData()
  }
  
  render(h: CreateElement) {
    return (
      <div class='user-card'>
          
          <div class='user-card-header'>
            <div class='user-card-header-head'>
              <img src={this.user?.head || DefaultHead} />
            </div>
            <div class='user-card-header-content'>
              <div class='user-card-header-content-name'>
                {this?.user?.displayName}
              </div>
              <div class='user-card-header-content-state'>
                <i class='iconfont icon-zhuangtai'></i>
                <span>{this.user?.state}</span>
                <span>{this.user?.cellPhone}</span>
              </div>
              <div class='user-card-header-content-team'>
                { this.user?.tagList && this?.user?.tagList.map(tag => tag.tagName).join(',') }
              </div>
            </div>
            <div class='user-card-header-button-group'>
              <base-button class='excutor-button' type='ghost' onEvent={this.setExecutorUser}>设为负责人</base-button>
              <base-button class='synergy-button' type='ghost' onEvent={this.setSynergyUser}>设为协同人</base-button>
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
              <div class='user-card-detail-row-item'>未完成工单量: {this.user?.unFinishedTaskCount} 个</div>
              <div class='user-card-detail-row-item'>已完成工单量: {this.user?.finishTaskCount} 个</div>
            </div>
            <div class='user-card-detail-row'>
              <div class='user-card-detail-row-item'>平均响应用时: {this.user?.averageResponseTime}</div>
              <div class='user-card-detail-row-item'>平均工作用时: {this.user?.averageWorkTime}</div>
            </div>
            <div class='user-card-detail-row'>
              <div class='user-card-detail-row-item'>拒单率: {this.user?.rejectionRate} %</div>
              <div class='user-card-detail-row-item'>转派率: {this.user?.allotRate} %</div>
            </div>
            <div class='user-card-detail-row'>
              <div class='user-card-detail-row-item'>好评率: {this.user?.favorableRate} %</div>
            </div>
          </div>
          
      </div>
    )
  }

}


