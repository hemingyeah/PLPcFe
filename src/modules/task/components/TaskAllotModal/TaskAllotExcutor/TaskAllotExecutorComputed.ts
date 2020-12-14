/* data */
import TaskAllotExecutorData from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorData'
/* entity */
import TaskAddress from '@model/entity/TaskAddress'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* util */
import { findComponentUpward } from '@src/util/assist'

class TaskAllotExecutorComputed extends TaskAllotExecutorData {
  /* 是否允许修改协同人 */
  get allowModifySynergyUser(): boolean {
    return Boolean(this.TaskAllotModalComponent?.allowModifySynergyUser)
  }
  
  /* 客户团队名称列表 */
  get customerTagNames(): string[] {
    return this.customerTags.map(tag => tag.tagName || '')
  }
  
  /* 当前选中的用户是客户的客户负责人，则显示专属标签（鼠标移动标签上提示“客户负责人”） */
  get isCustomerManager(): boolean {
    return Boolean(
      this.selectedExcutorUser
      && this.customer
      && this.selectedExcutorUser.userId === this.customer.customerManager
    )
  }
  
  /* 是否是按团队派单 */
  get isAllotByTag() {
    return this.taskConfig?.allotByTag === true
  }
  
  /** 
   * @description 是否显示工单派单人员表格组件
  */
  get isShowTaskAllotUserTableComponent(): boolean {
    return this.loadedComponents.includes(ComponentNameEnum.TaskAllotUserTable)
  }
  
  /** 
   * @description 是否显示工单派单人员表格组件
  */
  get isShowTaskAllotUserMapComponent(): boolean {
    return this.loadedComponents.includes(ComponentNameEnum.TaskAllotUserMap)
  }

  /**
   * @description 工单客户地址地址 
   * 工单新建后地址信息在taddress里面，新建的信息在address里面
  */
  get taskAddress(): TaskAddress {
    return new TaskAddress(this.task?.taddress || this.task?.address || {})
  }
  
  /* 工单派单组件 */
  get TaskAllotModalComponent() {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* 工单派单组件 负责人信息 */
  get taskAllotModalExcutorUser(): any {
    return this.TaskAllotModalComponent?.executorUser
  }
}

export default TaskAllotExecutorComputed