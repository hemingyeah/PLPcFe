/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { TaskPoolInfoEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskPoolUser from '@model/entity/TaskPoolUser'
import Tag from '@model/entity/Tag/Tag'
/* filter */
import { fmt_number, fmt_number_limit } from '@src/filter/fmt'
/* interface */
import { TaskAllotPoolInfoData } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInterface'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInfo/TaskAllotPoolInfo.scss'
/* types */
import StateColorMap from '@model/types/StateColor'
/* util */
import { openTabForUserView } from '@src/util/business/openTab'

enum TaskAllotPoolInfoEmitEventEnum {
  // 订阅人员变化
  SubscriptionChange = 'subscriptionChange',
  // 有权限人员变化
  AuthChange = 'authChange'
}

@Component({ 
  name: ComponentNameEnum.TaskAllotPoolInfo
})

export default class TaskAllotPoolInfo extends Vue {
  /* 选中状态 */
  @Prop() readonly checked: {
    subscription: boolean,
    auth: boolean
  } | undefined
  /* 隐藏客户团队数据信息 */
  @Prop() readonly hideCustomerTagInfo: boolean | undefined
  /* 工作状态颜色数组 */
  @Prop() readonly stateColorMap: StateColorMap | undefined
  /* 选中状态 */
  @Prop() readonly users: {
    subscription: TaskPoolUser[],
    auth: TaskPoolUser[],
  } | undefined
  
  /* 详细信息 */
  @Prop() readonly info: TaskAllotPoolInfoData | undefined
  
  private className: string = ComponentNameEnum.TaskAllotPoolInfo
  
  @Emit(TaskAllotPoolInfoEmitEventEnum.SubscriptionChange)
  private handleSubscriptionCheckedChange(value: boolean) {
    return value
  }
  
  @Emit(TaskAllotPoolInfoEmitEventEnum.AuthChange)
  private handleAuthCheckedChange(value: boolean) {
    return value
  }
  
  /** 
   * @description 渲染客户团队信息
  */
  private renderCusomterTagInfo() {
    if (this.hideCustomerTagInfo) return null
    
    return (
      <div class={[`${this.className}-row`, 'no-border']}>
        {`客户服务团队待接单量: ${fmt_number(this.info?.customerTeamUnAcceptCount, '')}`}
      </div>
    )
  }
  
  private renderUserItem(info: TaskPoolUser) {
    const user: LoginUser = info.user
    
    return (
      <div class='task-pool-user-content' onClick={() => openTabForUserView(user.userId, { from: 'task' })}>
        <div class={`${this.className}-user-head`}> <img src={user.head || DefaultHead} /></div>
        <div class="">
          <div class="task-pool-user-info">
            <div class="task-pool-user-info-left">
              <span class='task-pool-user-name'>{user.displayName}</span>
              <span class='user-state-round' style={{ backgroundColor: this.stateColorMap && this.stateColorMap[user.state || ''] }}></span>
              <span class='task-pool-user-state'>{user.state || ''}</span>
            </div>
            <div class='task-pool-user-phone'>{user.cellPhone || ''}</div>
          </div>
          <div class="task-pool-user-team">
            服务团队: 
            {
              Array.isArray(user.tagList) 
              ? user.tagList.map(tag => tag.tagName).join(', ')
              : ''
            }
          </div>
          <div class="task-pool-user-count">
            <span>未完成工单: {info.unFinished}</span>
          </div>
        </div>
      </div>
    )
  }
  
  render(h: CreateElement) {
    return (
      <div class={this.className}>
        <div class={`${this.className}-row`}>
          {`工单池工单总量: ${fmt_number_limit((fmt_number(this.info?.taskPoolAllCount, '')))}`}
        </div>
        {this.renderCusomterTagInfo()}
        <el-collapse>
          <el-collapse-item>
            <template slot="title">
              <el-checkbox value={this.checked?.subscription} onInput={this.handleSubscriptionCheckedChange}></el-checkbox>
              {`订阅工单池用户: ${fmt_number(this.users?.subscription?.length, '')}`}
            </template>
            <div>
              {
                this.users?.subscription
                && this.users.subscription.map(info => this.renderUserItem(info))
              }
            </div>
          </el-collapse-item>
          <el-collapse-item>
            <template slot="title">
              <el-checkbox value={this.checked?.auth} onInput={this.handleAuthCheckedChange}></el-checkbox>
              {`有权限接单用户: ${fmt_number(this.users?.auth?.length, '')}`}
            </template>
            <div>
              {
                this.users?.auth
                && this.users.auth.map(info => this.renderUserItem(info))
              }
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    )
  }
  
}

