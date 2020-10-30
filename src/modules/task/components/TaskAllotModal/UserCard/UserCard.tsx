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
  // 用户id
  @Prop() userId: string | undefined
  
  // 时间
  private timeRange: string = ''
  // 用户信息
  private user: TaskAllotUser | null = null

  @Watch('userId', { immediate: true })
  onUserIdChanged(newVal: string, oldVal: string) {
    this.fetchUserTaskData()
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
  private handlerTimeChange(value: string): void {
    this.timeRange = value
  }
  
  /**
   * @description 设置负责人人
  */
  private setExecutorUser() {
    
  }
  
  /**
   * @description 设置协同人
  */
  private setSynergyUser() {
    
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
              <base-button type="ghost" onEvent={this.setExecutorUser}>设为负责人</base-button>
              <base-button type="ghost" onEvent={this.setSynergyUser}>设为协同人</base-button>
            </div>
          </div>
          
          <div class='user-card-time'>
            <el-date-picker
              type='daterange'
              unlink-panels
              start-placeholder='开始日期'
              end-placeholder='结束日期'
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


