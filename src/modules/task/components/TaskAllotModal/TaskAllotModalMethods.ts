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

/* 加载的组件 */
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
   * @description 派单成功
   * 默认实现。跳转到工单详情页面 如果有需要可以自定义
  */
  @Emit(TaskAllotModalEmitEventEnum.Success)
  public async allotSuccess(): Promise<void> {
    LogUtil.succ(LogUtil.Start, this.allotSuccess.name)
    // 保存派单结果到缓存
    await this.saveAllotResultToStorage()
    // @ts-ignore
    let id = window?.frameElement?.dataset?.id
    // 关闭当前tab
    PlatformUtil.closeTab(id)
    // 打开新tab
    openTabForTaskView(this.task.id)
  }
  
  /** 
   * @description 更新工单信息
  */
  @Emit(TaskAllotModalEmitEventEnum.UpdateTask)
  public updateTaskHandler(task: any) {
    LogUtil.succ(LogUtil.Start, this.updateTaskHandler.name)
    return task
  }
  
  /** 
   * @description 更新工单动态
  */
  @Emit(TaskAllotModalEmitEventEnum.UpdateRecords)
  public updateTaskRecordsHandler() {
    LogUtil.succ(LogUtil.Start, this.updateTaskRecordsHandler.name)
  }
  
  /** 
   * @description 构建自动派单审批参数
  */
  public buildAutoDispatchApproveParams(): AutoDispatchApproveParams {
    let params: AutoDispatchApproveParams = {
      taskId: this?.task?.id || ''
    }
    
    // 有使用匹配的规则并且使用预估结果
    if (this.matchRule && this.isUsedResult) {
      params.estimatedMatches = this.getParamsMatchRule()
    }
    
    // 存在协同人信息
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description 构建派单到负责人参数
  */
  public buildAllotExcutorParams(): AllotExcutorParams {
    let params: AllotExcutorParams = {
      taskId: this.task?.id || '',
      executorId: this.executorUser?.userId || ''
    }
    
    // 存在协同人信息
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description 构建派单到工单池参数
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
    
    // 存在协同人信息
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description 构建自动派单参数
  */
  public buildAutoDispatchParams(): AutoDispatchParams {
    let params: AutoDispatchParams = {
      taskId: this?.task?.id || '',
      executorId: 'auto_dispatch'
    }
    
    // 有使用匹配的规则
    if (this.matchRule) {
      params.autoDispatchInfo = this.getParamsMatchRule()
    }
    
    // 存在协同人信息
    if (this.synergyUserList.length > 0) {
      params.synergies = this.getParamsSynergies()
    }
    
    return params
  }
  
  /** 
   * @description 构建转派到负责人参数
  */
  public buildReAllotParams(): AllotExcutorParams {
    let reAllotParams = this.buildAllotExcutorParams()
    reAllotParams.reason = this.reason
    reAllotParams.customReason = this.customReason
    
    return reAllotParams
  }
  
  /** 
   * @description 构建转派到工单池参数
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
   * @description 选择协同人
  */
  public chooseSynergyUser(): void {
    let options = {
      title: '请选择协同人',
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
        
        // 协同人赋值
        this.synergyUserList = result?.data?.users || []
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description 关闭弹窗
  */
  public close(): void {
    this.showTaskAllotModal = false
  }
  
  /**
   * @description 清空派单结果
  */
  public clearTaskAllotResult(event: MouseEvent): void {
    // @ts-ignore 取消按钮的焦点
    event?.target?.parentNode?.blur()
    // 清空上次派单结果
    const allotType = TaskAllotTypeEnum.Person
    this.handlerAllotTypeChange(allotType)
    this.executorUser = null
    this.synergyUserList = []
    // 隐藏清空派单结果按钮
    this.showClearTaskAllotResultButton = false
  }
  
  /**
   * @description 清空人员卡片
   */
  public clearUserCardSynergyChecked(user: LoginUser) {
    this.UserCardComponentWithTaskAllotExecutorMap?.clearSynergyChecked(user)
    this.UserCardComponentWithTaskAllotPool?.clearSynergyChecked(user)
  }
  
  /** 
   * @description 删除协同人
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
   * @description 获取属性列表
  */
  public getAttributes() {
    return {
      class: ['task-allot-modal', this.isReAllot && 'task-reallot-modal'],
      props: {
        title: '派单'
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
   * @description 获取匹配规则参数
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
   * @description 获取协同人信息参数
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
   * @description 从缓存获取数据
  */
  public async getDataToStorage(key: string, data: any) {
    return await storageGet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description 查询所有的工单类型列表
   */
  public fetchTaskTypesMap() {
    // 如果工单类型列表数据已存在则不查询
    if (this.taskTypes.length > 0) return
    
    LogUtil.succ(LogUtil.Start, `TaskAllotModalMethods -> ${this.fetchTaskTypesMap.name}`)
    
    return (
      getTaskTypesMap().then((data: getTaskTypesResult) => {
        let isSuccess = data.success
        if (!isSuccess) return
        
        this.taskTypes = data?.result || []
        // key : 工单类型id(string) -> value: TaskType
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
   * @description 获取客户信息
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
        
        // 查询用户数据
        this.TaskAllotExcutorComponent?.outsideFetchUsers()
        
      }).catch(err => {
        console.error(err)
      })
    )
  }
  
  /** 
   * @description 查询工单配置
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
   * @description 查询工单类型配置
  */
  public fetchTaskType() {
    let params = { id: this.task.templateId }
    // 查询工单类型数据
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
   * @description 根据客户id获取客户信息和客户负责人信息和开关 
  */
  public fetchSynergyUserWithCustomerManager() {
    let customerId = this.customerId
    if(!customerId) return console.warn('fetchExeinsynWithCustomerManager paramer not have customerId')
    
    return (
      getCustomerExeinsyn({ id: customerId}).then(result => {
        let exeInSynOfTaskOrEvent = result?.data?.exeInSynOfTaskOrEvent;
        // 允许自动将客户负责人带入工单或事件协同人
        if (exeInSynOfTaskOrEvent) {
          // 判断用户id是否存在 且 目前的协同人列表中是否已存在
          let userId: string = result?.data?.userId
          let isHaveUserId = Boolean(userId)
          let isRepeatUser = isHaveUserId ? this.synergyUserList.some(user => user.userId == userId) : false
          isHaveUserId && !isRepeatUser && this.synergyUserList.push(result.data)
        }
      })
    )
    
  }
  
  /** 初始化工作状态的颜色 */
  public fetchStateColor(): Promise<any> {
    return (
      getStateColorMap()
        .then((res: StateColorMap) => {
          this.stateColorMap = res || {}
        })
        .catch(err => console.error(err))
    )
  }
  
  /* 派单审批 */
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
  
  /* 指派到工单池审批 */
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
  
  /* 自动派单审批状态 */
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
  
  /* 派单到负责人提交 */
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
  
  /* 派单到工单池提交 */
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
  
  /* 自动派单 */
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
  
  /* 转派工单到负责人提交 */
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
  
  /* 转派工单到工单池提交 */
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
   * @description 派单方式变化
  */
  @Log()
  public handlerAllotTypeChange(type: TaskAllotTypeEnum) {
    this.allotType = type
    this.loadedComponents.push(LoadComponentMap[type])
    this.fetchTaskTypesMap()
  }
  
    /** 
   * @description 派单方式模式变化
  */
  public handlerAllotTypeModeChange(type: TaskAllotTypeModeEnum) {
    this.allotTypeMode = type
    this.fetchTaskTypesMap()
  }
  
  /** 
   * @description 初始化
  */
  public async initialize() {
    try {
      
      await this.fetchStateColor()
      // 异步获取客户信息
      await this.fetchCustomer()
      // 非转派时获取客户负责人带入协同人
      !this.isReAllot && await this.fetchSynergyUserWithCustomerManager()
      
    } catch (error) {
      this.toggleTaskAllotExecutorComponentPending()
      LogUtil.error(error, this.initialize.name)
    } finally {
      this.pending = false
    }
  }
  
  /** 
   * @description 转派匹配负责人显示
  */
  public matchExcutorWithReAllot(): void {
    if (!this.isReAllot) return
    
    let executor: LoginUser = this.task?.executor
    executor ? executor.selfSelected = true : null
    this.executorUser = executor || null
  }
  
  /** 
   * @deprecated
   * @description 工单池通知方式变动
  */
  public onTaskNotificationCheckedChanged(value: TaskPoolNotificationTypeEnum[]): void {
    this.taskPoolNotificationCheckd = value
  }
  
  /** 
   * @description 是否使用自动匹配预估结果
  */
  public onIsUsedResultChanged(used: boolean) {
    this.isUsedResult = used
  }
  
  /** 
   * @deprecated
   * @description 工单池通知人员信息变动
  */
  public onTaskNotificationUsersChanged(value: LoginUser[]): void {
    LogUtil.succ(LogUtil.Start, this.onTaskNotificationUsersChanged.name)
    this.taskPoolNotificationUsers = value
  }
  
  /** 
   * @description 设置负责人信息
   * -- 支持外部调用的
  */
  public outsideSetExcutorUser(user: LoginUser | TaskAllotUserInfo | null) {
    LogUtil.succ(LogUtil.Start, this.outsideSetExcutorUser.name)
    this.setExecutorUser(user)
  }
  
  /** 
   * @description 设置匹配的规则
   * -- 支持外部调用的
  */
  public outsideSetMatchRule(rule: AutoDispatchListItem | null) {
    LogUtil.succ(LogUtil.Start, this.outsideSetMatchRule.name)
    this.matchRule = rule
  }
  
  /** 
   * @description 设置工单信息
   * -- 支持外部调用的
  */
  public outsideSetTask(task: any) {
    LogUtil.succ(LogUtil.Start, this.outsideSetTask.name)
    this.updateTaskHandler(task)
    this.updateTaskRecordsHandler()
  }
  
  /** 
   * @description 删除协同人信息
   * -- 支持外部调用的
  */
  public outsideDeleteSynergyUser(user: LoginUser) {
    LogUtil.succ(LogUtil.Start, this.outsideDeleteSynergyUser.name)
    this.deleteSynergyUser(user)
    this.clearUserCardSynergyChecked(user)
  }
  
  /** 
   * @description 设置协同人列表
   * -- 支持外部调用的
  */
  public outsideSetSynergyUsers(users: LoginUser[]) {
    LogUtil.succ(LogUtil.Start, this.outsideSetSynergyUsers.name)
    this.setSynergyUsers(users)
  }
  
  /**
   * @description 设置客户团队信息列表
   * -- 支持外部调用的
   */
  public outsideSetCustomerTags(tags: Tag[]) {
    LogUtil.succ(LogUtil.Start, this.outsideSetCustomerTags.name)
    this.customerTags = tags
  }
  
  /**
   * @description 设置转派说明信息
   * -- 支持外部调用的
   */
  public outsideSetReason(value: string) {
    LogUtil.succ(LogUtil.Start, this.outsideSetReason.name)
    this.reason = value
  }

  /**
   * @description 工单转派
   */
  public outsideSetCustomReason(value: string) {
    this.customReason = value
  }
  
  /** 
   * @description 显示弹窗
   * --支持外部调用的
  */
  public async outsideShow() {
    LogUtil.succ(LogUtil.Start, this.outsideShow.name)
    // 等待状态
    this.pending = true
    this.toggleTaskAllotExecutorComponentPending(false)
    // 初始化派单类型
    this.allotType = TaskAllotTypeEnum.Person
    // 初始化视图模式
    this.allotTypeMode = TaskAllotTypeModeEnum.List
    // 匹配负责人显示
    this.matchExcutorWithReAllot()
    // 初始化协同人显示
    this.synergyUserList = isArray(this.task?.synergies) ? this.task.synergies.slice() : []
    // 获取工单配置
    await this.fetchTaskConfig()
    // 初始化
    this.initialize()
    // 显示
    this.show()
  }
  
  /** 
   * @description 设为负责人
  */
  public setExecutorUser(user: LoginUser | TaskAllotUserInfo | null) {
    LogUtil.succ(LogUtil.Start, this.setExecutorUser.name)
    this.executorUser = user
  }
  
  /** 
   * @description 设为协同人
  */
  public setSynergyUser(user: LoginUser) {
    LogUtil.succ(LogUtil.Start, this.setSynergyUser.name)
    // 判断是否已存在该用户
    const IsNotRepeat = this.synergyUserList.every(synergyUser => synergyUser.userId !== user.userId)
    IsNotRepeat && this.synergyUserList.push(user)
  }
  
  /** 
   * @description 设置协同人列表数据
  */
  public setSynergyUsers(users: LoginUser[]) {
    this.synergyUserList = users
  }
  
  /** 
   * @description 显示弹窗
  */
  public show() {
    // 显示弹窗
    this.showTaskAllotModal = true
  }
  
  /** 
   * @description 显示审批弹窗
  */
  public showApproveDialog(data: TaskApprove, customReason:String = '') {
    // @ts-ignore
    this.$refs?.ApproveDialog?.openDialog(data, customReason ? {customReason} : '')
  }
  
  /**
   * @description 保存数据到缓存
  */
  public async saveDataToStorage(key: string, data: any): Promise<void> {
    await storageSet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description 保存派单结果到缓存
  */
  public async saveAllotResultToStorage(): Promise<void> {
    LogUtil.succ(LogUtil.Start, this.saveAllotResultToStorage.name)
    // 工单派单结果
    const taskAllotResult: TaskAllotResult = {
      // 派单方式
      allotType: this.allotType,
      // 负责人
      executorUser: this.executorUser as LoginUser,
      // 协同人列表
      synergyUserList: this.synergyUserList
    }
    // 保存数据
    await this.saveDataToStorage(StorageKeyEnum.TaskAllotResult, taskAllotResult)
  }
  
  /** 
   * @description 提交
  */
  public submit() {
    this.pending = true
    // 转派 提交
    if (this.isReAllot) {
      return this.submitWithReAllot()
    }
    
    // 按工单负责人
    if (this.allotType === TaskAllotTypeEnum.Person) {
      return this.submitWithExcutor()
    }
    
    // 派单到工单池
    if (this.allotType === TaskAllotTypeEnum.Pool) {
      return this.submitWithTaskPool()
    }
    
    // 自动分配
    if (this.allotType === TaskAllotTypeEnum.Auto) {
      return this.submitWithAutoDispatch()
    }
  }
  
  /** 
   * @description 转派提交
  */
  public async submitWithReAllot() {
    try {      
      // 效验
      if (this.reallotRemarkNotNull && !this.reason) {
        this.pending = false
        return Platform.alert(TASK_NO_REALLOT_REASON_MESSAGE)
      }
      
      // 按工单负责人
      if (this.allotType === TaskAllotTypeEnum.Person) {
        return this.submitReAllotWithExecutor()
      }
      
      // 派单到工单池
      if (this.allotType === TaskAllotTypeEnum.Pool) {
        return this.submitWithTaskPool()
      }
      
    } catch(err) {
      this.pending = false
      console.error(err)
    }
  }
  
  /** 
   * @description 转派提交到负责人
  */
  public async submitReAllotWithExecutor() {
    // 验证负责人是否存在
    console.log(this.buildReAllotParams())
    let executor = this.executorUser?.userId
    if (!executor) {
      this.pending = false
      return Platform.alert(TASK_NO_EXECUTOR_MESSAGE)
    }
    // 验证负责人是否相同
    if (executor === this.task?.executor.userId) {
      this.pending = false
      return Platform.alert(TASK_REALLOT_NOT_SAME_USER_MESSAGE)
    }
    
    // 验证审批
    const allotExecutorParams = this.buildAllotExcutorParams()
    const reAllotParams = this.buildReAllotParams()
    let approve: any | null = await this.fetchApproveWithTaskAllot(allotExecutorParams, true)
    if (!approve) return
    
    let isNeedApprove = approve.isNeedApprove === true
    // 有审批
    if (isNeedApprove) {
      this.pending = false
      return this.showApproveDialog(approve.data, reAllotParams.customReason || '')
    }
    // 提交
    this.fetchReAllotSubmit(reAllotParams)
  }
  
  /** 
   * @description 派单到负责人提交
  */
  public async submitWithExcutor() {
    try {
      // 验证负责人是否存在
      let excutor = this.executorUser?.userId
      if (!excutor) {
        this.pending = false
        return Platform.alert(TASK_NO_EXECUTOR_MESSAGE)
      }
      
      // 验证审批
      const allotExcutorParams = this.buildAllotExcutorParams()
      let approve: any | null = await this.fetchApproveWithTaskAllot(allotExcutorParams)
      if (!approve) return
      
      let isNeedApprove = approve.isNeedApprove === true
      // 有审批
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(approve.data)
      }
      
      // 派单到负责人提交
      this.fetchExcutorSubmit(allotExcutorParams)
      
    } catch (error) {
      this.pending = false
      console.warn('TaskAllotModalMethods -> submitWithExcutor -> error', error)
    }
  }
  
  /** 
   * @description 派单到工单池提交
  */
  public async submitWithTaskPool() {
    try {
      // 构建参数
      const allotTaskPoolParams = this.buildAllotTaskPoolParams()
      // 验证审批
      let approve: { isNeedApprove: boolean, data: TaskApprove } | null = await this.fetchTaskAllotTaskPoolApprove(allotTaskPoolParams)
      if (!approve) return
      
      let isNeedApprove = approve.isNeedApprove === true
      // 有审批
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(approve.data)
      }
      
      // 派单到工单池提交
      allotTaskPoolParams.executorId = 'task_pool'
      this.fetchTaskPoolSubmit(allotTaskPoolParams)
      
    } catch (error) {
      this.pending = false
      console.warn('TaskAllotModalMethods -> submitWithTaskPool -> error', error)
    }
  }
  
  /** 
   * @description 自动派单提交
  */
  public async submitWithAutoDispatch() {
    try {
      // 验证
      if (!this.matchRule) {
        this.pending = false
        return Platform.alert(TASK_NOT_AUTO_DISPATCH_RULE)
      }
      
      const autoDispatchApproveParams: AutoDispatchApproveParams = this.buildAutoDispatchApproveParams()
      let approve = await this.fetchApproveWithAutoDispatch(autoDispatchApproveParams) || null
      if (!approve) return
      
      const { isNeedApprove, data } = approve
      // 有审批
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(data)
      }
      
      // 自动派单提交
      const autoDispatchParams = this.buildAutoDispatchParams()
      this.fetchAutoDispatchSubmit(autoDispatchParams)
      
    } catch (error) {
      this.pending = false
      console.warn('TaskAllotModalMethods -> submitWithAutoDispatch -> error', error)
    }
  }
  
  /** 
   * @description 切换负责人组件状态
  */
  public toggleTaskAllotExecutorComponentPending(pending: boolean = false) {
    this.TaskAllotExcutorComponent?.outsideSetPending(pending)
  }
  
  /** 
   * @description 使用上次派单结果
  */
  public async useLastTaskAllotResult(event: MouseEvent): Promise<void> {
    // @ts-ignore 取消按钮的焦点
    event?.target?.parentNode?.blur()
    // 取出存储数据
    const taskAllotResult: TaskAllotResult = await this.getDataToStorage(StorageKeyEnum.TaskAllotResult, {})
    // 存储数据是否为空
    if (isEmpty(taskAllotResult)) {
      return Platform.alert(TASK_ALLOT_NOT_STORAGE_RESULT)
    }
    
    // 还原上次派单结果
    let allotType = null
    // 显示工单池且上次派单结果为工单池
    if (this.isShowTaskPoolType && taskAllotResult.allotType === TaskAllotTypeEnum.Pool) {
      allotType = taskAllotResult.allotType
    }
    // 显示自动派单且上次派单结果为自动派单
    else if (this.isShowAutoDispatchType && taskAllotResult.allotType === TaskAllotTypeEnum.Auto) {
      allotType = taskAllotResult.allotType
    }
    // 其他为 派单给负责人
    else {
      allotType = TaskAllotTypeEnum.Person
    }
    
    this.handlerAllotTypeChange(allotType)
    this.executorUser = taskAllotResult.executorUser || null
    this.synergyUserList = taskAllotResult.synergyUserList || []
    // 显示清空派单结果按钮
    this.showClearTaskAllotResultButton = true
  }
  
}

export default TaskAllotModalMethods
