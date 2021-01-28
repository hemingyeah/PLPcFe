/* component */
import TaskAllotModal from '@src/modules/task/components/TaskAllotModal/TaskAllotModal.tsx'
/* data */
import TaskAllotExecutorData from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorData'
/* entity */
import TaskAddress from '@model/entity/TaskAddress'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
/* interface */
import { UserState } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* types */
import StateColorMap from '@model/types/StateColor'
/* util */
import { findComponentUpward, findComponentDownward } from '@src/util/assist'
import { getRootWindow } from '@src/util/dom'

class TaskAllotExecutorComputed extends TaskAllotExecutorData {
  
  /* 是否是按服务团队派单 */
  get allotByExclusiveTag() {
    return this.taskConfig?.allotByExclusiveTag === true
  }
  
  /* 选择列 组件 */
  get BaseTableAdvancedSettingComponent(): any { 
    return findComponentDownward(this, ComponentNameEnum.BaseTableAdvancedSetting)
  }
  
  /* 客户团队名称列表 */
  get customerTagNames(): string[] {
    return this.customerTags.map(tag => tag.tagName || '')
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
   * @description 是否为地图模式
  */
  get isMapMode(): boolean {
    return this.mode === TaskAllotTypeModeEnum.Map
  }
  
  get modeComponents(): { [x: string]: { [y: string]: string } } {
    return {
      [TaskAllotTypeModeEnum.List]: { display: this.mode === TaskAllotTypeModeEnum.List ? 'block' : 'none' },
      [TaskAllotTypeModeEnum.Map]: { display: this.mode === TaskAllotTypeModeEnum.Map ? 'block' : 'none' }
    }
  }
  
  /**
   * @description 转派说明是否必填
   */
  get reallotRemarkNotNull(): boolean {
    return this.taskConfig?.reallotRemarkNotNull === true
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
  
  /**
   * @description 工单客户地址地址 
   * 工单新建后地址信息在taddress里面，新建的信息在address里面
  */
  get taskAddress(): TaskAddress {
    return new TaskAddress(this.task?.taddress || this.task?.address || {})
  }
  
  /* 工单派单组件 */
  get TaskAllotModalComponent(): TaskAllotModal {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* 用户状态 列表 */
  get userStateList(): UserState[] {
    let list: UserState[] = []
    
    for (let userStateKey in this.rootWindowUserStateMap) {
      let userState: UserState = {
        key: userStateKey,
        value: userStateKey,
        label: userStateKey,
        color: this.stateColorMap?.[userStateKey] || ''
      }
      list.push(userState)
    }
    
    return list
  }
  
}

export default TaskAllotExecutorComputed