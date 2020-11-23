import { getTaskType } from '@src/api/TaskApi'
/* entity */
import TaskType from '@model/entity/TaskType'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskActionEnum from '@model/enum/TaskActionEnum'
/* model */
import { getTaskTypeResult } from '@model/param/out/Task'
/* vue */
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskProcessSteps/TaskProcessSteps.scss'

interface TaskProcessStep {
  name: string,
  value: string
}

/* 步骤条对象 */
const StepMap: { [x: string]: TaskProcessStep } = {
  // 新建
  [TaskActionEnum.CREATE.value]: { name: TaskActionEnum.CREATE.name, value: TaskActionEnum.CREATE.value },
  // 指派
  [TaskActionEnum.ALLOT.value]: { name: TaskActionEnum.ALLOT.name, value: TaskActionEnum.ALLOT.value },
  // 接受
  [TaskActionEnum.ACCEPT.value]: { name: TaskActionEnum.ACCEPT.name, value: TaskActionEnum.ACCEPT.value },
  // 开始
  [TaskActionEnum.START.value]: { name: TaskActionEnum.START.name, value: TaskActionEnum.START.value },
  // 完成
  [TaskActionEnum.FINISH.value]: { name: TaskActionEnum.CREATE.name, value: TaskActionEnum.FINISH.value }
}

@Component({ 
  name: ComponentNameEnum.TaskProcessSteps 
})
export default class TaskProcessSteps extends Vue {
  /* 工单类型id */
  @Prop() templateId: string | undefined
  
  /* 当前的步骤流程 */
  private active: number = 0
  /* 步骤条列表 */
  private steps: TaskProcessStep[] = []
  /* 工单类型数据 */
  private taskType: TaskType | null = null
  
  @Watch('templateId')
  onTemplateIdChanged() {
    this.fetchTaskType()
  }
  
  /** 
   * @description 查询工单类型配置
  */
  public fetchTaskType() {
    if (!this.templateId) {
      return console.warn('Caused: [TaskProcessSteps] templateId is empty')
    }
    
    let params = { id: this.templateId || '' }
    
    return (
      getTaskType(params)
        .then((result: getTaskTypeResult) => {
          let isSuccess = result.succ
          if (!isSuccess) return
          
          this.taskType = result.data || null
          this.setSteps()
          
        })
        .catch(err => {
          console.error(err)
        })
    )
  }
  
  private getScopedSlots() {
    const scopedSlots = {
      description: (props: any) => {
        return (
          <div>title</div>
        )
      }
    }
    
    return scopedSlots
  }
  
  /** 
   * @description 设置步骤条数据
  */
  public setSteps() {
    if (!this.taskType) {
      return console.warn('Caused: [TaskProcessSteps] taskType is empty')
    }
    
    let { flowSetting = {} } = this.taskType || {}
    
  }
  
  mounted() {
    this.fetchTaskType()
  }
  
  render(h: CreateElement) {    
    return (
      <div class={ComponentNameEnum.TaskProcessSteps}>
        <el-steps active={this.active} finish-status='success'>
          <el-step title='新建' scopedSlots={this.getScopedSlots()}></el-step>
          <el-step title='指派'></el-step>
          <el-step title='接受'></el-step>
          <el-step title='开始'></el-step>
          <el-step title='完成'></el-step>
        </el-steps>
      </div>
    )
  }
  
}

