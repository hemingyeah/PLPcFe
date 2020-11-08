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
  
  private className: string = ComponentNameEnum.TaskAllotPoolInfo
  
  render(h: CreateElement) {
    return (
      <div class={this.className}>
        <div class={`${this.className}-row`}>
          {`工单池工单总量: ${fmt_number(this.info?.taskPoolAllCount, '')}`}
        </div>
        <div class={[`${this.className}-row`, 'no-border']}>
          {`客户服务团队待接单量: ${fmt_number(this.info?.customerTeamUnAcceptCount, '')}`}
        </div>
        <el-collapse>
          <el-collapse-item>
            <template slot="title">
              <el-checkbox></el-checkbox>
              {`订阅工单池用户: ${fmt_number(this.info?.subscriptionUserCount, '')}`}
            </template>
            <div>订阅工单池用户: 列表</div>
          </el-collapse-item>
          <el-collapse-item>
            <template slot="title">
              <el-checkbox></el-checkbox>
              {`有权限接单用户: ${fmt_number(this.info?.havePermissionUserCount, '')}`}
            </template>
            <div>有权限接单用户：列表</div>
          </el-collapse-item>
        </el-collapse>
      </div>
    )
  }
  
}

