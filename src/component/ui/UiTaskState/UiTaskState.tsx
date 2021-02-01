/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskStateEnum from '@model/enum/TaskStateEnum.ts'
/* vue */
import VC from '@model/VC'
import { CreateElement } from 'vue'
import { Component, Prop } from 'vue-property-decorator'
/* scss */
import '@src/component/ui/UiTaskState/UiTaskState.scss'

/**
 * @classdesc 临时复制的 肯定不能完全兼容，只是为了当前的开发用的，以后用到再拓展
*/
@Component({
  name: ComponentNameEnum.UiTaskState
})
class UiTaskState extends VC<{}> {
  /* 工单信息 */
  @Prop() readonly task: any | null
  
  /* 工单状态信息 */
  get taskState(): string {
    return this.task?.state || ''
  }
  /* 工单是否超时 */
  get isOverTime(): boolean {
    return Boolean(this.task?.overTime && new Date().getTime() > new Date(this.task?.overTime).getTime())
  }
  
  /* 工单状态样式 */
  private getTaskStateStyle(): { backgroundColor: string, color: string } {
    return {
      backgroundColor: TaskStateEnum.getBgColor(this.taskState, 0.2),
      color: TaskStateEnum.getColor(this.taskState),
    }
  }
  
  /* 工单状态class类名 */
  private getTaskStateClassNames(): string[] {
    return [ComponentNameEnum.UiTaskState, this.isOverTime ? 'ui-task-state-overtime' : '']
  }
  
  render(h: CreateElement) {
    const style = this.getTaskStateStyle()
    
    return (
      <div class={this.getTaskStateClassNames()} style={style}>
        { this.isOverTime ? '超时' : TaskStateEnum.getName(this.taskState) }
      </div>
    )
  }
}

export default UiTaskState