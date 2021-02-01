/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import TaskPoolUser from '@model/entity/TaskPoolUser'
/* filter */
import { fmt_number, fmt_number_limit } from '@src/filter/fmt'
/* interface */
import { TaskAllotPoolInfoData } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInterface'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInfo/TaskAllotPoolInfo.scss'
/* types */
import StateColorMap from '@model/types/StateColor'

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
  
  render(h: CreateElement) {
    return (
      <div class={this.className}>
        <div class={`${this.className}-item`}>
          <span class={`${this.className}-item-label`}>
            工单池工单总量: 
          </span>
          <span class={`${this.className}-item-content`}>
            {fmt_number_limit((fmt_number(this.info?.taskPoolAllCount, '')))}
          </span>
        </div>
        {
          !this.hideCustomerTagInfo && (
            <div class={`${this.className}-item`}>
              <span class={`${this.className}-item-label`}>
                客户服务团队待接单量: 
              </span>
              <span class={`${this.className}-item-content`}>
                {fmt_number(this.info?.customerTeamUnAcceptCount, '')}
              </span>
            </div>
          )
        }
        <div class={`${this.className}-item`}>
          <el-checkbox value={this.checked?.subscription} onInput={this.handleSubscriptionCheckedChange}></el-checkbox>
          <span class={`${this.className}-item-label`}>
            订阅工单池用户: 
          </span>
          <span class={`${this.className}-item-content`}>
            {fmt_number(this.users?.subscription?.length, '')}
          </span>
        </div>
        <div class={`${this.className}-item`}>
          <el-checkbox value={this.checked?.auth} onInput={this.handleAuthCheckedChange}></el-checkbox>
          <span class={`${this.className}-item-label`}>
            有权限接单用户: 
          </span>
          <span class={`${this.className}-item-content`}>
            {fmt_number(this.users?.auth?.length, '')}
          </span>
        </div>
      </div>
    )
  }
  
}

