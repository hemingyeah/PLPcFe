/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { TaskPoolInfoEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* filter */
import { fmt_number } from '@src/filter/fmt'
/* interface */
import { TaskAllotPoolInfoData } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInterface'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInfo/TaskAllotPoolInfo.scss'

@Component({ 
  name: ComponentNameEnum.TaskAllotPoolInfo
})

export default class TaskAllotPoolInfo extends Vue {
  
  @Prop() readonly info: TaskAllotPoolInfoData | undefined
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotPoolInfo}>
        <el-collapse>
          <el-collapse-item title={`工单池工单总量: ${fmt_number(this.info?.taskPoolAllCount, '')}`} name={TaskPoolInfoEnum.TaskPoolAllCount} disabled>
          </el-collapse-item>
          <el-collapse-item title={`客户服务团队待接单量: ${fmt_number(this.info?.customerTeamUnAcceptCount, '')}`} name={TaskPoolInfoEnum.CustomerTeamUnAcceptCount} disabled>
          </el-collapse-item>
          <el-collapse-item title={`订阅工单池用户: ${fmt_number(this.info?.subscriptionUserCount, '')}`} name={TaskPoolInfoEnum.SubscriptionUserCount}>
          <div>订阅工单池用户: 列表</div>
          </el-collapse-item>
          <el-collapse-item title={`有权限接单用户: ${fmt_number(this.info?.havePermissionUserCount, '')}`} name={TaskPoolInfoEnum.HavePermissionUserCount}>
            <div>有权限接单用户：列表</div>
          </el-collapse-item>
        </el-collapse>
      </div>
    )
  }
  
}

