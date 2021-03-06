/* api */
import { getCustomer, getCustomerExeinsyn } from '@src/api/CustomerApi'
import { 
  getTaskConfig, 
  getTaskAutoDispatchApprove, 
  taskAutoDispatch, 
  getTaskAllotApprove, 
  getTransferTaskAllotApprove,
  taskAllotExcutor, 
  taskAllotTaskPoll, 
  getTaskAllotTaskPoolApprove, 
  getTaskType,
  taskReAllot,
  taskReAllotTaskPool,
  getTaskTypesMap
} from '@src/api/TaskApi'
import { getStateColorMap } from '@src/api/SettingApi'
/* computed */
import TaskAllotModalComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComputed'
/* decorators */
import Log from '@src/decorators/LogDecorators'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import StorageModuleEnum from '@model/enum/StorageModuleEnum'
import StorageKeyEnum from '@model/enum/StorageKeyEnum'
/* entity */
import Approve from '@model/entity/Approve'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskConfig from '@model/types/TaskConfig'
import TaskApprove from '@model/entity/TaskApprove'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import TaskType from '@model/entity/TaskType'
import Tag from '@model/entity/Tag/Tag'
/* interface */
import { 
  AutoDispatchApproveParams, 
  DepeMultiUserResult,
  AutoDispatchParams,
  AllotExcutorParams,
  AllotTaskPoolParams,
  User,
  ReAllotTaskPoolParams,
  TaskAllotResult
} from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* model */
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
import { 
  TASK_NOT_AUTO_DISPATCH_RULE, 
  TASK_NO_EXECUTOR_MESSAGE, 
  TASK_ALLOT_NOT_STORAGE_RESULT, 
  TASK_NO_REALLOT_REASON_MESSAGE, 
  TASK_NO_REALLOR_CUSTOMREASON,
  TASK_REALLOT_NOT_SAME_USER_MESSAGE 
} from '@src/model/const/Alert'
import { getCustomerDetailResult } from '@model/param/out/Customer'
import { getTaskAllotApproveResult, getTaskAllotResult, getTaskAllotTaskPollApproveResult, getTaskAllotTaskPoolResult, getTaskConfigResult, getTaskTypeResult, getTaskTypesResult } from '@model/param/out/Task'
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* types */
import StateColorMap from '@model/types/StateColor'
import AutoDispatchListItem from '@model/types/AutoDispatchListItem'
/* util */
import LogUtil from '@src/util/log.ts'
import Platform from '@src/util/Platform'
import PlatformUtil from '@src/platform'
import { openTabForTaskView } from '@src/util/business/openTab'
import { isArray } from '@src/util/type'
import { storageGet, storageSet } from '@src/util/storage.ts'
import { isEmpty } from '@src/util/object'
/* vue */
import { Emit } from 'vue-property-decorator'

/* ??????????????? */
const LoadComponentMap = {
  [TaskAllotTypeEnum.Person]: ComponentNameEnum.TaskAllotExcutor,
  [TaskAllotTypeEnum.Pool]: ComponentNameEnum.TaskAllotPool,
  [TaskAllotTypeEnum.Auto]: ComponentNameEnum.TaskAllotAuto,
}

enum TaskAllotModalEmitEventEnum {
  Success = 'success',
  UpdateTask = 'updateTask',
  UpdateRecords = 'updateRecords',
}

class TaskAllotModalMethods extends TaskAllotModalComputed {
  
  /** 
   * @description ????????????
   * ?????????????????????????????????????????? ??????????????????????????????
  */
  @Emit(TaskAllotModalEmitEventEnum.Success)
  public async allotSuccess(): Promise<void> {
    LogUtil.succ(LogUtil.Start, this.allotSuccess.name)
    // ???????????????????????????
    await this.saveAllotResultToStorage()
    // @ts-ignore
    let id = window?.frameElement?.dataset?.id
    // ????????????tab
    PlatformUtil.closeTab(id)
    // ?????????tab
    openTabForTaskView(this.task.id)
  }
  
  /** 
   * @description ??????????????????
  */
  @Emit(TaskAllotModalEmitEventEnum.UpdateTask)
  public updateTaskHandler(task: any) {
    LogUtil.succ(LogUtil.Start, this.updateTaskHandler.name)
    return task
  }
  
  /** 
   * @description ??????????????????
  */
  @Emit(TaskAllotModalEmitEventEnum.UpdateRecords)
  public updateTaskRecordsHandler() {
    LogUtil.succ(LogUtil.Start, this.updateTaskRecordsHandler.name)
  }
  
  /** 
   * @description ??????????????????????????????
  */
  public buildAutoDispatchApproveParams(): AutoDispatchApproveParams {
    let params: AutoDispatchApproveParams = {
      taskId: this?.task?.id || ''
    }
    
    // ????????????????????????????????????????????????
    if (this.matchRule && this.isUsedResult) {
      params.estimatedMatches = this.getParamsMatchRule()
    }
    
    // ?????????????????????
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description ??????????????????????????????
  */
  public buildAllotExcutorParams(): AllotExcutorParams {
    let params: AllotExcutorParams = {
      taskId: this.task?.id || '',
      executorId: this.executorUser?.userId || ''
    }
    
    // ?????????????????????
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description ??????????????????????????????
  */
  public buildAllotTaskPoolParams(): AllotTaskPoolParams {
    let taskPoolData: { checked: TaskPoolNotificationTypeEnum[], users: LoginUser[] } = (
      // @ts-ignore
      this.$refs?.TaskAllotPoolComponent?.outsideBuildData() 
      || { checked: [], users: [] }
    )
    
    let params: AllotTaskPoolParams = {
      taskId: this.task?.id || '',
      noticeCusTag: taskPoolData.checked.includes(TaskPoolNotificationTypeEnum.SendToTeamUser),
      authTaskPoolUser: taskPoolData.checked.includes(TaskPoolNotificationTypeEnum.SendToAuthUser),
      otherNotifier: (
        taskPoolData.checked.includes(TaskPoolNotificationTypeEnum.SendToOtherUser)
        ? taskPoolData.users
        : []
      )
    }
    
    // ?????????????????????
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description ????????????????????????
  */
  public buildAutoDispatchParams(): AutoDispatchParams {
    let params: AutoDispatchParams = {
      taskId: this?.task?.id || '',
      executorId: 'auto_dispatch'
    }
    
    // ????????????????????????
    if (this.matchRule) {
      params.autoDispatchInfo = this.getParamsMatchRule()
    }
    
    // ?????????????????????
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description ??????????????????????????????
  */
  public buildReAllotParams(): AllotExcutorParams {
    let reAllotParams = this.buildAllotExcutorParams()
    reAllotParams.reason = this.reason
    reAllotParams.customReason = this.customReason
    
    return reAllotParams
  }
  
  /** 
   * @description ??????????????????????????????
  */
  public buildReAllotTaskPoolParams(): ReAllotTaskPoolParams {
    let reAllotTaskPoolParams: any = this.buildAllotExcutorParams()
    reAllotTaskPoolParams.reason = this.reason
    reAllotTaskPoolParams.executorId = 'task_pool'
    reAllotTaskPoolParams.toPool = true
    reAllotTaskPoolParams.state = this.task?.state
    
    return reAllotTaskPoolParams
  }
  
  /** 
   * @description ???????????????
  */
  public chooseSynergyUser(): void {
    let options = {
      title: '??????????????????',
      seeAllOrg: true,
      selected: this.synergyUserList,
      max: this.maxSynergyUserCount,
      showUserState: true
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // ???????????????
        this.synergyUserList = result?.data?.users || []
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description ????????????
  */
  public close(): void {
    this.showTaskAllotModal = false
  }
  
  /**
   * @description ??????????????????
  */
  public clearTaskAllotResult(event: MouseEvent): void {
    // @ts-ignore ?????????????????????
    event?.target?.parentNode?.blur()
    // ????????????????????????
    const allotType = TaskAllotTypeEnum.Person
    this.handlerAllotTypeChange(allotType)
    this.executorUser = null
    this.synergyUserList = []
    // ??????????????????????????????
    this.showClearTaskAllotResultButton = false
  }
  
  /**
   * @description ??????????????????
   */
  public clearUserCardSynergyChecked(user: LoginUser) {
    this.UserCardComponentWithTaskAllotExecutorMap?.clearSynergyChecked(user)
    this.UserCardComponentWithTaskAllotPool?.clearSynergyChecked(user)
  }
  
  /** 
   * @description ???????????????
  */
  public deleteSynergyUser(user: LoginUser) {
    this.synergyUserList = (
      this.synergyUserList
      .filter((synergyUser: LoginUser) => {
        return synergyUser.userId !== user.userId
      })
    )
  }
  
  /** 
   * @description ??????????????????
  */
  public getAttributes() {
    return {
      class: ['task-allot-modal', this.isReAllot && 'task-reallot-modal'],
      props: {
        title: '??????'
      },
      on: {
        'update:show': (val: any) => {
          this.showTaskAllotModal = val
        }
      },
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
  }
  
  /** 
   * @description ????????????????????????
  */
  public getParamsMatchRule() {
    let { finalExecutorId, finalExecutorName, finalRuleId, finalRuleName } = this.matchRule || {}
      
    return {
      finalExecutorId: finalExecutorId || '',
      finalExecutorName: finalExecutorName || '',
      finalRuleId: finalRuleId || '',
      finalRuleName: finalRuleName || '',
    }
  }
  
  /** 
   * @description ???????????????????????????
  */
  public getParamsSynergies(): User[] {
    return (
      this.synergyUserList.map((user: LoginUser) => {
        return {
          displayName: user.displayName,
          head: user.head,
          userId: user.userId,
          staffId: user.staffId,
        }
      })
    )
  }
  
  /**
   * @description ?????????????????????
  */
  public async getDataToStorage(key: string, data: any) {
    return await storageGet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description ?????????????????????????????????
   */
  public fetchTaskTypesMap() {
    // ???????????????????????????????????????????????????
    if (this.taskTypes.length > 0) return
    
    LogUtil.succ(LogUtil.Start, `TaskAllotModalMethods -> ${this.fetchTaskTypesMap.name}`)
    
    return (
      getTaskTypesMap().then((data: getTaskTypesResult) => {
        let isSuccess = data.success
        if (!isSuccess) return
        
        this.taskTypes = data?.result || []
        // key : ????????????id(string) -> value: TaskType
        this.taskTypesMap = (
          this.taskTypes
            .reduce((acc: {[x: string]: TaskType }, currentTaskType: TaskType) => {
              acc[currentTaskType.templateId] = currentTaskType
              return acc
            }, {})
        )
        
      }).catch(err => {
        console.error(err)
      })
    )
  }
  
  /**
   * @description ??????????????????
  */
  public fetchCustomer() {
    let id = this.customerId
    if (!id) {
      return console.warn('Caused: TaskAllotModal fetchCustomer not have customerId')
    }
    
    LogUtil.succ(LogUtil.Start, `TaskAllotModalMethods -> ${this.fetchCustomer.name}`)
    
    return (
      getCustomer(id).then((result: getCustomerDetailResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        LogUtil.succ(LogUtil.End, `TaskAllotModalMethods -> ${this.fetchCustomer.name}`)
        
        this.customer = Object.freeze(result.data || {})
        
        // ??????????????????
        this.TaskAllotExcutorComponent?.outsideFetchUsers()
        
      }).catch(err => {
        console.error(err)
      })
    )
  }
  
  /** 
   * @description ??????????????????
  */
  public fetchTaskConfig() {
    return (
      getTaskConfig()
      .then((result: getTaskConfigResult) => {
        this.taskConfig = result.taskConfig || new TaskConfig()
      })
      .catch(err => {
        console.warn(err)
      })
    )
  }
  
  /** 
   * @description ????????????????????????
  */
  public fetchTaskType() {
    let params = { id: this.task.templateId }
    // ????????????????????????
    return (
      getTaskType(params)
        .then((result: getTaskTypeResult) => {
          let isSuccess = result.succ
          if (!isSuccess) return
          
          this.taskType = result.data || null
          
        })
        .catch(err => {
          console.error(err)
        })
    )
  }
  
  /** 
   * @description ????????????id??????????????????????????????????????????????????? 
  */
  public fetchSynergyUserWithCustomerManager() {
    let customerId = this.customerId
    if(!customerId) return console.warn('fetchExeinsynWithCustomerManager paramer not have customerId')
    
    return (
      getCustomerExeinsyn({ id: customerId}).then(result => {
        let exeInSynOfTaskOrEvent = result?.data?.exeInSynOfTaskOrEvent;
        // ????????????????????????????????????????????????????????????
        if (exeInSynOfTaskOrEvent) {
          // ????????????id???????????? ??? ??????????????????????????????????????????
          let userId: string = result?.data?.userId
          let isHaveUserId = Boolean(userId)
          let isRepeatUser = isHaveUserId ? this.synergyUserList.some(user => user.userId == userId) : false
          isHaveUserId && !isRepeatUser && this.synergyUserList.push(result.data)
        }
      })
    )
    
  }
  
  /** ?????????????????????????????? */
  public fetchStateColor(): Promise<any> {
    return (
      getStateColorMap()
        .then((res: StateColorMap) => {
          this.stateColorMap = res || {}
        })
        .catch(err => console.error(err))
    )
  }
  
  /* ???????????? */
  public fetchApproveWithTaskAllot(params: AllotExcutorParams, isReAllot: Boolean = false): Promise<any | null> {
    let fetchAllotApproveAction = isReAllot ? getTransferTaskAllotApprove : getTaskAllotApprove;
    return (
      fetchAllotApproveAction(params)
      .then((result: getTaskAllotApproveResult) => {
        let isSuccess = result.succ
        let isNeedApprove = !isSuccess && result.message === Approve.message
        
        return {
          isNeedApprove,
          data: result.data || {}
        }
        
      }).catch((err) => {
        this.pending = false
        console.error(err)
        return null
      })
    )
  }
  
  /* ???????????????????????? */
  public fetchTaskAllotTaskPoolApprove(params: AllotTaskPoolParams): Promise<TaskApprove | any | null> {
    return (
      getTaskAllotTaskPoolApprove(params)
      .then((result: getTaskAllotTaskPollApproveResult) => {
        let isSuccess = result.succ
        let isNeedApprove = !isSuccess && result.message === Approve.message
        
        return {
          isNeedApprove,
          data: result.data || {}
        }
        
      }).catch((err) => {
        this.pending = false
        console.error(err)
        return null
      })
    )
  }
  
  /* ???????????????????????? */
  public fetchApproveWithAutoDispatch(params: AutoDispatchApproveParams): Promise<{ isNeedApprove: boolean, data: TaskApprove } | null> {
    return (
      getTaskAutoDispatchApprove(params)
      .then((result) => {
        let isSuccess = result.succ
        let isNeedApprove = !isSuccess && result.message === Approve.message
        
        return {
          isNeedApprove,
          data: result.data || {}
        }
        
      }).catch((err) => {
        this.pending = false
        console.error(err)
        return null
      })
    )
  }
  
  /* ???????????????????????? */
  public fetchExcutorSubmit(params: AllotExcutorParams) {
    return (
      taskAllotExcutor(params)
      .then((data: getTaskAllotResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        data?.result?.stateDisplayName 
          && (
            Platform.notification({
            title: data?.result?.stateDisplayName || '',
            type: 'success',
          })
        )
        
        this.allotSuccess()
      })
      .catch((err: any) => {
        console.error(err)
      })
      .finally(() => {
        this.pending = false
      })
    )
  }
  
  /* ???????????????????????? */
  public fetchTaskPoolSubmit(params: AllotTaskPoolParams) {
    return (
      taskAllotTaskPoll(params)
      .then((data: getTaskAllotTaskPoolResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        data?.result?.stateDisplayName 
          && (
            Platform.notification({
            title: data?.result?.stateDisplayName || '',
            type: 'success',
          })
        )
        
        this.allotSuccess()
      })
      .catch((err: any) => {
        console.error(err)
      })
      .finally(() => {
        this.pending = false
      })
    )
  }
  
  /* ???????????? */
  public fetchAutoDispatchSubmit(params: AutoDispatchParams) {
    return (
      taskAutoDispatch(params)
      .then((data: any) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        data?.result?.stateDisplayName 
          && (
            Platform.notification({
            title: data?.result?.stateDisplayName || '',
            type: 'success',
          })
        )
        
        this.allotSuccess()
      })
      .catch((err: any) => {
        console.error(err)
      })
      .finally(() => {
        this.pending = false
      })
    )
  }
  
  /* ?????????????????????????????? */
  public fetchReAllotSubmit(params: AllotExcutorParams) {
    return (
      taskReAllot(params)
      .then((data: getTaskAllotResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        this.allotSuccess()
      })
      .catch((err: any) => {
        console.error(err)
      })
      .finally(() => {
        this.pending = false
      })
    )
  }
  
  /* ?????????????????????????????? */
  public fetchReAllotTaskPoolSubmit(params: ReAllotTaskPoolParams) {
    return (
      taskReAllotTaskPool(params)
      .then((data: getTaskAllotResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        data?.result?.stateDisplayName 
          && (
            Platform.notification({
            title: data?.result?.stateDisplayName || '',
            type: 'success',
          })
        )
        
        this.allotSuccess()
      })
      .catch((err: any) => {
        console.error(err)
      })
      .finally(() => {
        this.pending = false
      })
    )
  }
  
  /** 
   * @description ??????????????????
  */
  @Log()
  public handlerAllotTypeChange(type: TaskAllotTypeEnum) {
    this.allotType = type
    this.loadedComponents.push(LoadComponentMap[type])
    this.fetchTaskTypesMap()
  }
  
    /** 
   * @description ????????????????????????
  */
  public handlerAllotTypeModeChange(type: TaskAllotTypeModeEnum) {
    this.allotTypeMode = type
    this.fetchTaskTypesMap()
  }
  
  /** 
   * @description ?????????
  */
  public async initialize() {
    try {
      
      await this.fetchStateColor()
      // ????????????????????????
      await this.fetchCustomer()
      // ????????????????????????????????????????????????
      !this.isReAllot && await this.fetchSynergyUserWithCustomerManager()
      
    } catch (error) {
      this.toggleTaskAllotExecutorComponentPending()
      LogUtil.error(error, this.initialize.name)
    } finally {
      this.pending = false
    }
  }
  
  /** 
   * @description ???????????????????????????
  */
  public matchExcutorWithReAllot(): void {
    if (!this.isReAllot) return
    
    let executor: LoginUser = this.task?.executor
    executor ? executor.selfSelected = true : null
    this.executorUser = executor || null
  }
  
  /** 
   * @deprecated
   * @description ???????????????????????????
  */
  public onTaskNotificationCheckedChanged(value: TaskPoolNotificationTypeEnum[]): void {
    this.taskPoolNotificationCheckd = value
  }
  
  /** 
   * @description ????????????????????????????????????
  */
  public onIsUsedResultChanged(used: boolean) {
    this.isUsedResult = used
  }
  
  /** 
   * @deprecated
   * @description ?????????????????????????????????
  */
  public onTaskNotificationUsersChanged(value: LoginUser[]): void {
    LogUtil.succ(LogUtil.Start, this.onTaskNotificationUsersChanged.name)
    this.taskPoolNotificationUsers = value
  }
  
  /** 
   * @description ?????????????????????
   * -- ?????????????????????
  */
  public outsideSetExcutorUser(user: LoginUser | TaskAllotUserInfo | null) {
    LogUtil.succ(LogUtil.Start, this.outsideSetExcutorUser.name)
    this.setExecutorUser(user)
  }
  
  /** 
   * @description ?????????????????????
   * -- ?????????????????????
  */
  public outsideSetMatchRule(rule: AutoDispatchListItem | null) {
    LogUtil.succ(LogUtil.Start, this.outsideSetMatchRule.name)
    this.matchRule = rule
  }
  
  /** 
   * @description ??????????????????
   * -- ?????????????????????
  */
  public outsideSetTask(task: any) {
    LogUtil.succ(LogUtil.Start, this.outsideSetTask.name)
    this.updateTaskHandler(task)
    this.updateTaskRecordsHandler()
  }
  
  /** 
   * @description ?????????????????????
   * -- ?????????????????????
  */
  public outsideDeleteSynergyUser(user: LoginUser) {
    LogUtil.succ(LogUtil.Start, this.outsideDeleteSynergyUser.name)
    this.deleteSynergyUser(user)
    this.clearUserCardSynergyChecked(user)
  }
  
  /** 
   * @description ?????????????????????
   * -- ?????????????????????
  */
  public outsideSetSynergyUsers(users: LoginUser[]) {
    LogUtil.succ(LogUtil.Start, this.outsideSetSynergyUsers.name)
    this.setSynergyUsers(users)
  }
  
  /**
   * @description ??????????????????????????????
   * -- ?????????????????????
   */
  public outsideSetCustomerTags(tags: Tag[]) {
    LogUtil.succ(LogUtil.Start, this.outsideSetCustomerTags.name)
    this.customerTags = tags
  }
  
  /**
   * @description ????????????????????????
   * -- ?????????????????????
   */
  public outsideSetReason(value: string) {
    LogUtil.succ(LogUtil.Start, this.outsideSetReason.name)
    this.reason = value
  }

  /**
   * @description ????????????
   */
  public outsideSetCustomReason(value: string) {
    this.customReason = value
  }
  
  /** 
   * @description ????????????
   * --?????????????????????
  */
  public async outsideShow() {
    LogUtil.succ(LogUtil.Start, this.outsideShow.name)
    // ????????????
    this.pending = true
    this.toggleTaskAllotExecutorComponentPending(false)
    // ?????????????????????
    this.allotType = TaskAllotTypeEnum.Person
    // ?????????????????????
    this.allotTypeMode = TaskAllotTypeModeEnum.List
    // ?????????????????????
    this.matchExcutorWithReAllot()
    // ????????????????????????
    this.synergyUserList = isArray(this.task?.synergies) ? this.task.synergies.slice() : []
    // ??????????????????
    await this.fetchTaskConfig()
    // ?????????
    this.initialize()
    // ??????
    this.show()
  }
  
  /** 
   * @description ???????????????
  */
  public setExecutorUser(user: LoginUser | TaskAllotUserInfo | null) {
    LogUtil.succ(LogUtil.Start, this.setExecutorUser.name)
    this.executorUser = user
  }
  
  /** 
   * @description ???????????????
  */
  public setSynergyUser(user: LoginUser) {
    LogUtil.succ(LogUtil.Start, this.setSynergyUser.name)
    // ??????????????????????????????
    const IsNotRepeat = this.synergyUserList.every(synergyUser => synergyUser.userId !== user.userId)
    IsNotRepeat && this.synergyUserList.push(user)
  }
  
  /** 
   * @description ???????????????????????????
  */
  public setSynergyUsers(users: LoginUser[]) {
    this.synergyUserList = users
  }
  
  /** 
   * @description ????????????
  */
  public show() {
    // ????????????
    this.showTaskAllotModal = true
  }
  
  /** 
   * @description ??????????????????
  */
  public showApproveDialog(data: TaskApprove, customReason:String = '') {
    // @ts-ignore
    this.$refs?.ApproveDialog?.openDialog(data, customReason ? {customReason} : '')
  }
  
  /**
   * @description ?????????????????????
  */
  public async saveDataToStorage(key: string, data: any): Promise<void> {
    await storageSet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description ???????????????????????????
  */
  public async saveAllotResultToStorage(): Promise<void> {
    LogUtil.succ(LogUtil.Start, this.saveAllotResultToStorage.name)
    // ??????????????????
    const taskAllotResult: TaskAllotResult = {
      // ????????????
      allotType: this.allotType,
      // ?????????
      executorUser: this.executorUser as LoginUser,
      // ???????????????
      synergyUserList: this.synergyUserList
    }
    // ????????????
    await this.saveDataToStorage(StorageKeyEnum.TaskAllotResult, taskAllotResult)
  }
  
  /** 
   * @description ??????
  */
  public submit() {
    this.pending = true
    // ?????? ??????
    if (this.isReAllot) {
      return this.submitWithReAllot()
    }
    
    // ??????????????????
    if (this.allotType === TaskAllotTypeEnum.Person) {
      return this.submitWithExcutor()
    }
    
    // ??????????????????
    if (this.allotType === TaskAllotTypeEnum.Pool) {
      return this.submitWithTaskPool()
    }
    
    // ????????????
    if (this.allotType === TaskAllotTypeEnum.Auto) {
      return this.submitWithAutoDispatch()
    }
  }
  
  /** 
   * @description ????????????
  */
  public async submitWithReAllot() {
    try {      
      // ??????
      if (this.reallotRemarkNotNull && !this.customReason) {
        this.pending = false
        return Platform.alert(TASK_NO_REALLOR_CUSTOMREASON)
      }

      if (this.reallotRemarkNotNull && !this.reason) {
        this.pending = false
        return Platform.alert(TASK_NO_REALLOT_REASON_MESSAGE)
      }
      
      // ??????????????????
      if (this.allotType === TaskAllotTypeEnum.Person) {
        return this.submitReAllotWithExecutor()
      }
      
      // ??????????????????
      if (this.allotType === TaskAllotTypeEnum.Pool) {
        return this.submitWithTaskPool()
      }
      
    } catch(err) {
      this.pending = false
      console.error(err)
    }
  }
  
  /** 
   * @description ????????????????????????
  */
  public async submitReAllotWithExecutor() {
    // ???????????????????????????
    console.log(this.buildReAllotParams())
    let executor = this.executorUser?.userId
    if (!executor) {
      this.pending = false
      return Platform.alert(TASK_NO_EXECUTOR_MESSAGE)
    }
    // ???????????????????????????
    if (executor === this.task?.executor.userId) {
      this.pending = false
      return Platform.alert(TASK_REALLOT_NOT_SAME_USER_MESSAGE)
    }
    
    // ????????????
    const allotExecutorParams = this.buildAllotExcutorParams()
    const reAllotParams = this.buildReAllotParams()
    let approve: any | null = await this.fetchApproveWithTaskAllot(allotExecutorParams, true)
    if (!approve) return
    
    let isNeedApprove = approve.isNeedApprove === true
    // ?????????
    if (isNeedApprove) {
      this.pending = false
      return this.showApproveDialog(approve.data, reAllotParams.customReason || '')
    }
    // ??????
    this.fetchReAllotSubmit(reAllotParams)
  }
  
  /** 
   * @description ????????????????????????
  */
  public async submitWithExcutor() {
    try {
      // ???????????????????????????
      let excutor = this.executorUser?.userId
      if (!excutor) {
        this.pending = false
        return Platform.alert(TASK_NO_EXECUTOR_MESSAGE)
      }
      
      // ????????????
      const allotExcutorParams = this.buildAllotExcutorParams()
      let approve: any | null = await this.fetchApproveWithTaskAllot(allotExcutorParams)
      if (!approve) return
      
      let isNeedApprove = approve.isNeedApprove === true
      // ?????????
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(approve.data)
      }
      
      // ????????????????????????
      this.fetchExcutorSubmit(allotExcutorParams)
      
    } catch (error) {
      this.pending = false
      console.warn('TaskAllotModalMethods -> submitWithExcutor -> error', error)
    }
  }
  
  /** 
   * @description ????????????????????????
  */
  public async submitWithTaskPool() {
    try {
      // ????????????
      const allotTaskPoolParams = this.buildAllotTaskPoolParams()
      // ????????????
      let approve: { isNeedApprove: boolean, data: TaskApprove } | null = await this.fetchTaskAllotTaskPoolApprove(allotTaskPoolParams)
      if (!approve) return
      
      let isNeedApprove = approve.isNeedApprove === true
      // ?????????
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(approve.data)
      }
      
      // ????????????????????????
      allotTaskPoolParams.executorId = 'task_pool'
      this.fetchTaskPoolSubmit(allotTaskPoolParams)
      
    } catch (error) {
      this.pending = false
      console.warn('TaskAllotModalMethods -> submitWithTaskPool -> error', error)
    }
  }
  
  /** 
   * @description ??????????????????
  */
  public async submitWithAutoDispatch() {
    try {
      // ??????
      if (!this.matchRule) {
        this.pending = false
        return Platform.alert(TASK_NOT_AUTO_DISPATCH_RULE)
      }
      
      const autoDispatchApproveParams: AutoDispatchApproveParams = this.buildAutoDispatchApproveParams()
      let approve = await this.fetchApproveWithAutoDispatch(autoDispatchApproveParams) || null
      if (!approve) return
      
      const { isNeedApprove, data } = approve
      // ?????????
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(data)
      }
      
      // ??????????????????
      const autoDispatchParams = this.buildAutoDispatchParams()
      this.fetchAutoDispatchSubmit(autoDispatchParams)
      
    } catch (error) {
      this.pending = false
      console.warn('TaskAllotModalMethods -> submitWithAutoDispatch -> error', error)
    }
  }
  
  /** 
   * @description ???????????????????????????
  */
  public toggleTaskAllotExecutorComponentPending(pending: boolean = false) {
    this.TaskAllotExcutorComponent?.outsideSetPending(pending)
  }
  
  /** 
   * @description ????????????????????????
  */
  public async useLastTaskAllotResult(event: MouseEvent): Promise<void> {
    // @ts-ignore ?????????????????????
    event?.target?.parentNode?.blur()
    // ??????????????????
    const taskAllotResult: TaskAllotResult = await this.getDataToStorage(StorageKeyEnum.TaskAllotResult, {})
    // ????????????????????????
    if (isEmpty(taskAllotResult)) {
      return Platform.alert(TASK_ALLOT_NOT_STORAGE_RESULT)
    }
    
    // ????????????????????????
    let allotType = null
    // ????????????????????????????????????????????????
    if (this.isShowTaskPoolType && taskAllotResult.allotType === TaskAllotTypeEnum.Pool) {
      allotType = taskAllotResult.allotType
    }
    // ??????????????????????????????????????????????????????
    else if (this.isShowAutoDispatchType && taskAllotResult.allotType === TaskAllotTypeEnum.Auto) {
      allotType = taskAllotResult.allotType
    }
    // ????????? ??????????????????
    else {
      allotType = TaskAllotTypeEnum.Person
    }
    
    this.handlerAllotTypeChange(allotType)
    this.executorUser = taskAllotResult.executorUser || null
    this.synergyUserList = taskAllotResult.synergyUserList || []
    // ??????????????????????????????
    this.showClearTaskAllotResultButton = true
  }
  
}

export default TaskAllotModalMethods
