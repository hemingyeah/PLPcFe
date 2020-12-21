/* component */
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
/* enum */
import AuthEnum from '@model/enum/AuthEnum'
import TaskStateEnum from '@model/enum/TaskStateEnum'
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import Field from '@model/entity/Field'
/* data */
import TaskAllotModalData from '@src/modules/task/components/TaskAllotModal/TaskAllotModalData'
/* util */
import { findComponentDownward } from '@src/util/assist'
/* types */
import TaskConfig from '@model/types/TaskConfig'

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
  get isCreator(): boolean {
    let loginUser = this.loginUser || {}
    let createUser = this.task?.createUser || {}
    return Boolean(createUser.userId && loginUser.userId && createUser.userId == loginUser.userId)
  }
  
  /** 
   * @description 是否是工单负责人
  */
  get isExecutor(): boolean {
    let loginUser = this.loginUser || {}
    let executorUser = this.task?.executor || {}
    return Boolean(executorUser.userId && loginUser.userId && executorUser.userId == loginUser.userId)
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
  
  /** 
   * @description 是否是工单创建人
   * -- 供外部获取的
  */
  get outsideIsCreator(): boolean {
    return this.isCreator
  }
  
  /** 
   * @description 是否是工单负责人
   * -- 供外部获取的
  */
  get outsideIsExecutor(): boolean {
    return this.isExecutor
  }
  
  /** 
   * @description 工单字段列表
   * -- 供外部获取的
  */
  get outsideFields(): Field[] {
    return this.fields || []
  }
  
  /** 
   * @description 工单信息
   * -- 供外部获取的
  */
  get outsideTask(): any {
    return this.task
  }
  
  /** 
   * @description 工单配置
   * -- 供外部获取的
  */
  get outsideTaskConfig(): TaskConfig {
    return this.taskConfig
  }
  
  /* 工单派单负责人地图 人员卡片组件 */
  get UserCardComponentWithTaskAllotExecutorMap(): UserCard {
    return findComponentDownward(this.TaskAllotExcutorComponent, ComponentNameEnum.UserCard)
  }
  
  /* 工单派单负责人地图 人员卡片组件 */
  get UserCardComponentWithTaskAllotPool(): UserCard {
    return findComponentDownward(this.TaskAllotPoolComponent, ComponentNameEnum.UserCard)
  }
}

export default TaskAllotModalComputed
