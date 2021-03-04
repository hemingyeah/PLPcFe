/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolNotification/TaskAllotPoolNotification.scss'

@Component({ 
  name: ComponentNameEnum.TaskAllotPoolNotification
})
export default class TaskAllotPoolNotification extends Vue {
  
  /* 选中的 */
  @Prop() checked: TaskPoolNotificationTypeEnum[] | undefined
  /* 选中变化方法 */
  @Prop() checkedChangeFunc: Function | undefined
  /* 默认渲染 */
  @Prop() slotDefault: Function | undefined
  
  @Emit('input')
  private onNotificationChanged(value: TaskPoolNotificationTypeEnum[]): TaskPoolNotificationTypeEnum[] {
    this.checkedChangeFunc && this.checkedChangeFunc(value)
    
    return this.checked || []
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotPoolNotification}>
        <el-checkbox-group value={this.checked} onInput={this.onNotificationChanged}>
          <el-checkbox label={TaskPoolNotificationTypeEnum.SendToTeamUser}>
            通知服务部门人员
          </el-checkbox>
          <el-checkbox label={TaskPoolNotificationTypeEnum.SendToAuthUser}>
            通知有权限接单用户
          </el-checkbox>
          <el-checkbox label={TaskPoolNotificationTypeEnum.SendToOtherUser}>
            其他需要通知的人
          </el-checkbox>
          {this.slotDefault && this.slotDefault()}
        </el-checkbox-group>
      </div>
    )
  }
  
}

