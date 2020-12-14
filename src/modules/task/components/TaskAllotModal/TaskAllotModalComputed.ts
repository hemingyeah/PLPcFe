/* enum */
import AuthEnum from '@model/enum/AuthEnum'
import TaskStateEnum from '@model/enum/TaskStateEnum'
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* data */
import TaskAllotModalData from '@src/modules/task/components/TaskAllotModal/TaskAllotModalData'
/* util */
import { findComponentDownward } from '@src/util/assist'

class TaskAllotModalComputed extends TaskAllotModalData {
  
  get allotContentStyle() {
    return {
      [TaskAllotTypeEnum.Person]: { display: this.allotType === TaskAllotTypeEnum.Person ? 'block' : 'none' },
      [TaskAllotTypeEnum.Pool]: { display: this.allotType === TaskAllotTypeEnum.Pool ? 'block' : 'none' },
      [TaskAllotTypeEnum.Auto]: { display: this.allotType === TaskAllotTypeEnum.Auto ? 'block' : 'none' },
    }
  }
  
  /** 
   * @description 是否允许修改协同人
   *  1. 状态为 已指派 已接受 进行中 其中一个, PC端开启允许修改协同人，并且是负责人
   *  2. 工单创建人
   *  3. 编辑工单权限
  */
  get allowModifySynergyUser(): boolean {
    let states = [TaskStateEnum.ALLOCATED.value, TaskStateEnum.ACCEPTED.value, TaskStateEnum.PROCESSING.value]
    let allowModify = this.taskConfig.taskSynergy
    let authorities = this.loginUser?.authorities || {}
    
    return Boolean(
      (states.indexOf(this.task?.state) >= 0 && allowModify && this.isExecutor)
      || this.isCreator
      || authorities[AuthEnum.TASK_EDIT]
    )
  }
  
  /* 客户id */
  get customerId() {
    return this.task?.customer?.id || ''
  }
  
  /** 
   * @description 是否是工单创建人
  */
  get isCreator() {
    let loginUser = this.loginUser || {}
    let createUser = this.task?.createUser || {}
    return createUser.userId && loginUser.userId && createUser.userId == loginUser.userId
  }
  
  /** 
   * @description 是否是工单负责人
  */
  get isExecutor() {
    let loginUser = this.loginUser || {}
    let executorUser = this.task?.executor || {}
    return executorUser.userId && loginUser.userId && executorUser.userId == loginUser.userId
  }
  
  /** 
   * @description 是否显示工单池组件
  */
  get isShowTaskPoolComponent() {
    return this.loadedComponents.includes(ComponentNameEnum.TaskAllotPool)
  }
  
  /** 
   * @description 是否显示自动派单组件
  */
  get isShowTaskAutoDispatchComponent() {
    return this.loadedComponents.includes(ComponentNameEnum.TaskAllotAuto)
  }
  
  /** 
   * @description 当前工单是否在工单池中
  */
  get isTaskInTaskPool(): boolean {
    return this.task?.state === TaskStateEnum.TASK_POOL.value
  }
  
  /** 
   * @description 转派说明是否必填
  */
  get reallotRemarkNotNull(): boolean {
    return this.taskConfig?.reallotRemarkNotNull === true
  }
  
  /* 工单派单负责人表格组件 */
  get TaskAllotExcutorTableComponent(): any {
    return findComponentDownward(this, ComponentNameEnum.TaskAllotUserTable)
  }
}

export default TaskAllotModalComputed
