/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* types */
import TaskConfig from '@model/types/TaskConfig'

@Component({ 
  name: ComponentNameEnum.TaskAllotType
})
export default class TaskAllotType extends Vue {
  
  /* 派单方式 */
  @Prop() type: TaskAllotTypeEnum | undefined
  /* 派单方式 */
  @Prop() taskConfig: TaskConfig | undefined
  
  /* 派单类型值变化 */
  @Emit('change')
  private handlerTypeChange(typeValue: TaskAllotTypeEnum): TaskAllotTypeEnum {
    return typeValue
  }
  
  /* 渲染自动分配 单选 */
  private renderAutoDispatchRadio(disabled: boolean = false) {
    return (
      <el-radio disabled={disabled} value={this.type} onInput={this.handlerTypeChange} label="checkAutoDispatch">自动分配</el-radio>
    )
  }
  
  /* 渲染派单到工单池 单选 */
  private renderTaskPoolRadio(disabled: boolean = false) {
    return (
      <el-radio disabled={disabled} value={this.type} onInput={this.handlerTypeChange} label="checkTaskPool">指派到工单池</el-radio>
    )
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotType}>
        <el-radio value={this.type} onInput={this.handlerTypeChange} label="checkTaskPerson">指派给工单负责人</el-radio>
        {
          this.taskConfig?.taskPoolOn
            ? this.renderTaskPoolRadio()
            : (
              <el-tooltip content='尚未启用工单池派单功能，如需开启请到系统管理-工单功能设置中配置'  placement='top'>
                {this.renderTaskPoolRadio(true)}
              </el-tooltip>
            )
        }
        {
          this.taskConfig?.autoDispatch
            ? this.renderAutoDispatchRadio()
            : (
              <el-tooltip content='尚未启用自动分配功能，如需开启请到系统管理-工单功能设置中配置'  placement='top'>
                {this.renderAutoDispatchRadio(true)}
              </el-tooltip>
            )
        }
      </div>
    )
  }
  
}

