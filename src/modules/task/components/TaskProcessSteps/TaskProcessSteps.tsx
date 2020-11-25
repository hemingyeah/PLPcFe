import { getTaskType } from '@src/api/TaskApi'
/* entity */
import TaskType from '@model/entity/TaskType'
import TaskApprove from '@model/entity/TaskApprove'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskActionEnum from '@model/enum/TaskActionEnum'
import TaskStateProcessEnum from '@model/enum/TaskStateProcessEnum'
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
  // 节点名称
  name: string,
  // 节点值
  value: string,
  // 图标
  icon: string,
  // 工单状态
  state: string | string[],
  // 当前节点流程信息
  flow?: any
}

/* 步骤条对象 */
const StepMap: { [x: string]: TaskProcessStep } = {
  // 新建
  [TaskActionEnum.CREATE.value]: { name: TaskActionEnum.CREATE.name, value: TaskActionEnum.CREATE.value, icon: 'xinjian', state: TaskStateProcessEnum.CREATED.value },
  // 指派
  [TaskActionEnum.ALLOT.value]: { name: TaskActionEnum.ALLOT.name, value: TaskActionEnum.ALLOT.value, icon: 'zhipai', state: TaskStateProcessEnum.ALLOCATED.value },
  // 接受
  [TaskActionEnum.ACCEPT.value]: { name: TaskActionEnum.ACCEPT.name, value: TaskActionEnum.ACCEPT.value, icon: 'jieshou', state: TaskStateProcessEnum.ACCEPTED.value },
  // 开始
  [TaskActionEnum.START.value]: { name: TaskActionEnum.START.name, value: TaskActionEnum.START.value, icon: 'kaishi', state: TaskStateProcessEnum.PROCESSING.value },
  // 完成
  [TaskActionEnum.FINISH.value]: { name: TaskActionEnum.FINISH.name, value: TaskActionEnum.FINISH.value, icon: 'wancheng', state: TaskStateProcessEnum.FINISHED.value }
}

@Component({ 
  name: ComponentNameEnum.TaskProcessSteps 
})
export default class TaskProcessSteps extends Vue {
  /* 工单节点状态 */
  @Prop() state: string | undefined
  /* 工单类型id */
  @Prop() templateId: string | undefined
  
  /* 步骤条列表 */
  private steps: TaskProcessStep[] = []
  /* 工单类型数据 */
  private taskType: TaskType | null = null
  
  @Watch('templateId')
  onTemplateIdChanged() {
    this.fetchTaskType()
  }
  
  /** 
   * @description 获取当前状态的索引 当前的步骤流程
  */
  private get active(): number {
    let index = 0
    let step: TaskProcessStep | null = null
    
    for(let i = 0; i < this.steps.length; i++) {
      step = this.steps[i]
      if (this.isCurrentState(step.state)) {
        index = i + 1
        break
      }
    }
    
    return index
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
  
  private getScopedSlots(step: TaskProcessStep) {
    let { flow, value, icon } = step
    // 判空
    if (!flow) {
      return console.warn('Caused: [TaskProcessSteps] getScopedSlots flow is empty')
    }
    
    // 审批信息
    let taskApprove: TaskApprove | null = this.taskType ? checkApprove(this.taskType, value, { id: '' }, {}) : null
    // 超时时间
    let overTime: string | null = flow?.overTime ? flow.overTime : null
    
    const scopedSlots = {
      icon: (props: any) => {
        return <i class={['iconfont', `icon-${icon}`]}></i>
      },
      description: (props: any) => {
        return (
          <div class='task-step-flow'>
            {
              taskApprove
              && taskApprove.needApprove
              && <div class='task-step-flow-approve'>需审批</div>
            }
            {
              overTime
              && <div class='task-step-flow-overtime'>{overTime}小时超时</div>
            }
          </div>
        )
      }
    }
    
    return scopedSlots
  }
  
  /* 判断是否是当前状态 */
  private isCurrentState(state: string | string[]): boolean {
    return state == this.state || (Array.isArray(state) && state.indexOf(this.state || '') > -1)
  }
  
  /** 
   * @description 设置步骤条数据
  */
  public setSteps() {
    if (!this.taskType) {
      return console.warn('Caused: [TaskProcessSteps] taskType is empty')
    }
    
    this.steps = []

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
                <el-step title={step.name} scopedSlots={this.getScopedSlots(step)}></el-step>
              )
            })
          }
        </el-steps>
      </div>
    )
  }
  
}

