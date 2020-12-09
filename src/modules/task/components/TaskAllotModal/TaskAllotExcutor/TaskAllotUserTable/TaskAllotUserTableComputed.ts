/* data */
import TaskAllotUserTableData from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableData'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import Customer from '@model/entity/Customer'
import TaskAddress from '@model/entity/TaskAddress'
/* interface */
import { UserState } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* types */
import StateColorMap from '@model/types/StateColor'
/* util */
import { findComponentUpward, findComponentDownward } from '@src/util/assist'
import { getRootWindow } from '@src/util/dom'
import Task from '@model/entity/Task'

class TaskAllotUserTableComputed extends TaskAllotUserTableData {
  /* 是否是按服务团队派单 */
  get allotByExclusiveTag() {
    return this.TaskAllotModalComponent?.taskConfig?.allotByExclusiveTag === true
  }
  
  /* 选择列 组件 */
  get BaseTableAdvancedSettingComponent(): any { 
    return findComponentDownward(this, ComponentNameEnum.BaseTableAdvancedSetting)
  }
  
  /* 客户 */
  get customer(): Customer {
    return this.TaskAllotModalComponent?.customer || {}
  }
  
  /* 是否是按团队派单 */
  get isAllotByTag() {
    return this.TaskAllotModalComponent?.taskConfig?.allotByTag === true
  }
  
  /* 是否为转派 */
  get isReAllot() {
    return this.TaskAllotModalComponent?.isReAllot === true
  }
  
  /* 根窗口 用户状态对象 */
  get rootWindowUserStateMap(): StateColorMap {
    let userStateMap: StateColorMap = {}
    
    try {
      let rootWindow: any = getRootWindow(window)
      let initData: any = JSON.parse(rootWindow?._init || '{}')
      userStateMap = initData.userStateMap
    } catch (error) {
      userStateMap = {}
      console.error('TaskAllotUserTableComputed ~ rootWindowUserStateMap ~ error', error)
    }
    
    return userStateMap
  }
  
  /* 工单信息 */
  get task(): any {
    return this.TaskAllotModalComponent?.task || {}
  }
  
  /**
   * @description 工单客户地址地址 
   * 工单新建后地址信息在taddress里面，新建的信息在address里面
  */
  get taskAddress(): TaskAddress {
    return new TaskAddress(this.task.taddress || this.task.address || {})
  }
  
  /* 工单派单组件 */
  get TaskAllotModalComponent(): any {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* 工单派单负责人组件 */
  get TaskAllotExcutorComponent(): any {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotExcutor) || {}
  }
  
  /* 用户状态 列表 */
  get userStateList(): UserState[] {
    let list: UserState[] = []
    
    for (let userStateKey in this.rootWindowUserStateMap) {
      let userState: UserState = {
        key: userStateKey,
        value: userStateKey,
        label: userStateKey,
        color: this.userStateMap[userStateKey]
      }
      list.push(userState)
    }
    
    return list
  }
  
  /* 用户状态 对象 */
  get userStateMap() {
    return this.TaskAllotModalComponent?.stateColorMap || {}
  }
}

export default TaskAllotUserTableComputed