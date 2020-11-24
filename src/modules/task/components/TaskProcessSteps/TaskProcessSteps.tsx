import { getTaskType } from '@src/api/TaskApi'
/* entity */
import TaskType from '@model/entity/TaskType'
import TaskApprove from '@model/entity/TaskApprove'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskActionEnum from '@model/enum/TaskActionEnum'
/* model */
import { getTaskTypeResult } from '@model/param/out/Task'
/* types */
import FlowSetting from '@model/types/FlowSetting'
/* vue */
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* service */
import { checkApprove } from '@service/TaskService'
/* scss */
import '@src/modules/task/components/TaskProcessSteps/TaskProcessSteps.scss'

interface TaskProcessStep {
  name: string,
  value: string,
  flow?: any
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
  [TaskActionEnum.FINISH.value]: { name: TaskActionEnum.FINISH.name, value: TaskActionEnum.FINISH.value }
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
  
  private getScopedSlots(flow: any, action: string) {
    // 判空
    if (!flow) {
      return console.warn('Caused: [TaskProcessSteps] getScopedSlots flow is empty')
    }
    // 审批信息
    let taskApprove: TaskApprove | null = this.taskType ? checkApprove(this.taskType, action, { id: '' }, {}) : null
    
    const scopedSlots = {
      description: (props: any) => {
        return (
          <div class='task-step-flow'>
            {
              taskApprove
              && taskApprove.needApprove
              && <div class='task-step-flow-approve'>需审批</div>
            }
            {
              <div class='task-step-flow-overtime'></div>
            }
          </div>
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
    
    // 工单流程设置
    let flowSetting: any = this.taskType.flowSetting
    let currentFlow: FlowSetting = new FlowSetting()
    // 遍历添加步骤信息
    for (let flow in flowSetting) {
      currentFlow = flowSetting[flow]
      // 是否开启该流程
      let isEnabled = currentFlow?.state === true
      // 开启则 添加该流程
      isEnabled
      && StepMap[flow]
      && this.steps.push({ ...StepMap[flow],  flow: currentFlow})
    }
    
  }
  
  mounted() {
    this.fetchTaskType()
  }
  
  render(h: CreateElement) {    
    return (
      <div class={ComponentNameEnum.TaskProcessSteps}>
        <el-steps active={this.active} finish-status='success'>
          {
            this.steps.map((step: TaskProcessStep) => {
              return (
                <el-step title={step.name} scopedSlots={this.getScopedSlots(step.flow)}></el-step>
              )
            })
          }
        </el-steps>
      </div>
    )
  }
  
}

