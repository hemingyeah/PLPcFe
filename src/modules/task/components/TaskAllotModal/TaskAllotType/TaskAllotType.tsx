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
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotType}>
        <el-radio value={this.type} onInput={this.handlerTypeChange} label="checkTaskPerson">指派给工单负责人</el-radio>
        {
          this.taskConfig?.taskPoolOn &&
          <el-radio value={this.type} onInput={this.handlerTypeChange} label="checkTaskPool">指派到工单池</el-radio>
        }
        {
          this.taskConfig?.autoDispatch && 
          <el-radio value={this.type} onInput={this.handlerTypeChange} label="checkAutoDispatch">自动分配</el-radio>
        }
      </div>
    )
  }
  
}

