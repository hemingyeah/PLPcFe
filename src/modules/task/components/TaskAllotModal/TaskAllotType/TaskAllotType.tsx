/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'

@Component({ name: 'task-allot-type' })
export default class TaskAllotType extends Vue {
  
  /* 派单方式 */
  @Prop() type: TaskAllotTypeEnum | undefined
  
  /* 派单类型值变化 */
  @Emit()
  private change(typeValue: TaskAllotTypeEnum): TaskAllotTypeEnum {
    return typeValue
  }
  
  render(h: CreateElement) {
    return (
      <div class='task-allot-type'>
        <el-radio value={this.type} onInput={this.change} label="checkTaskPerson">指派给工单负责人</el-radio>
        <el-radio value={this.type} onInput={this.change} label="checkTaskPool">指派到工单池</el-radio>
        <el-radio value={this.type} onInput={this.change} label="checkAutoDispatch">自动分配</el-radio>
      </div>
    )
  }
  
}

