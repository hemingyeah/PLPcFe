/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* vue */
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.scss'

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
  
  // 用户信息
  private user: TaskAllotUser | null = null

  @Watch('userId')
  onUserIdChanged(newVal: string, oldVal: string) {
    this.fetchUserTaskData()
  }
  
  /** 
   * @description 获取人员工单信息
  */
  private fetchUserTaskData() {
    this.user = {
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
      </div>
    )
  }

}


