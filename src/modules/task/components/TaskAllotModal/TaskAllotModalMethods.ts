/* api */
import { getCustomer, getCustomerExeinsyn } from '@src/api/CustomerApi'
import { getTaskConfig, getTaskAutoDispatchApprove, taskAutoDispatch, getTaskAllotApprove, taskAllotExcutor, taskAllotTaskPoll, getTaskAllotTaskPoolApprove } from '@src/api/TaskApi'
import { getStateColorMap } from '@src/api/SettingApi'
/* computed */
import TaskAllotModalComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComputed'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* entity */
import Approve from '@model/entity/Approve'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskConfig from '@model/types/TaskConfig'
import TaskApprove from '@model/entity/TaskApprove'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
/* interface */
import { 
  AutoDispatchApproveParams, 
  DepeMultiUserResult,
  AutoDispatchParams, 
  TaskAllotApproveParams, 
  AllotExcutorParams,
  AllotTaskPoolParams,
  User
} from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* model */
import { TASK_NO_EXECUTOR_MESSAGE } from '@src/model/const/Alert'
import { getCustomerDetailResult } from '@model/param/out/Customer'
import { getTaskAllotApproveResult, getTaskAllotResult, getTaskAllotTaskPollApproveResult, getTaskAllotTaskPoolResult, getTaskConfigResult } from '@model/param/out/Task'
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* types */
import StateColorMap from '@model/types/StateColor'
import AutoDispatchListItem from '@model/types/AutoDispatchListItem'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
/* vue */
import { Emit } from 'vue-property-decorator'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'

/* 加载的组件 */
const LoadComponentMap = {
  [TaskAllotTypeEnum.Person]: ComponentNameEnum.TaskAllotExcutor,
  [TaskAllotTypeEnum.Pool]: ComponentNameEnum.TaskAllotPool,
  [TaskAllotTypeEnum.Auto]: ComponentNameEnum.TaskAllotAuto,
}

enum TaskAllotModalEmitEventEnum {
  Success = 'success'
}

class TaskAllotModalMethods extends TaskAllotModalComputed {
  
  /** 
   * @description 派单成功
  */
  @Emit(TaskAllotModalEmitEventEnum.Success)
  public allotSuccess() {}
  
  /** 
   * @description 构建自动派单审批参数
  */
  public buildAutoDispatchApproveParams(): AutoDispatchApproveParams {
    let params: AutoDispatchApproveParams = {
      taskId: this?.task?.id || ''
    }
    
    // 有使用匹配的规则
    if (this.matchRule) {
      params.estimatedMatches = this.getParamsMatchRule()
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
  public buildAutpDispatchParams(): AutoDispatchParams {
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
      executorId: this.executorUser?.userId || '',
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
   * @description 检查自动派单审批
  */
  public checkApproveWithAutoDispatch(): void {
    this.showTaskAllotModal = false
  }
  
  /** 
   * @description 删除负责人
  */
  public deleteExcutorUser(user: LoginUser) {
    this.executorUser = null
    /* 清除选择负责人表格列表 负责人信息 */
    this.TaskAllotExcutorTableComponent?.outsideUpwardSetClearExcutorUser()
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
      class: 'task-allot-modal',
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
   * @description 获取客户信息
  */
  public fetchCustomer() {
    let id = this.customerId
    if (!id) {
      return console.warn('Caused: TaskAllotModal fetchCustomer not have customerId')
    }
    
    Log.succ(Log.Start, `TaskAllotModalMethods -> ${this.fetchCustomer.name}`)
    
    getCustomer(id).then((result: getCustomerDetailResult) => {
      let isSuccess = result.status == 0
      if (!isSuccess) return
      
      Log.succ(Log.End, `TaskAllotModalMethods -> ${this.fetchCustomer.name}`)
      
      this.customer = Object.freeze(result.data || {})
      
      // @ts-ignore
      this.$refs.TaskAllotExcutorComponent.outsideFetchUsers()
      
    }).catch(err => {
      console.error(err)
    })
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
   * @description 根据客户id获取客户信息和客户负责人信息和开关 
  */
  public fetchSynergyUserWithCustomerManager() {
    let customerId = this.customerId
    if(!customerId) return console.warn('fetchExeinsynWithCustomerManager paramer not have customerId')
    
    getCustomerExeinsyn({ id: customerId}).then(result => {
      let exeInSynOfTaskOrEvent = result?.data?.exeInSynOfTaskOrEvent;
      // 允许自动将客户负责人带入工单或事件协同人
      if (exeInSynOfTaskOrEvent) {
        result?.data?.userId && this.synergyUserList.push(result.data)
      }
    })
    
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
  public fetchApproveWithTaskAllot(params: TaskAllotApproveParams): Promise<TaskApprove | void> {
    return (
      getTaskAllotApprove(params)
      .then((data: getTaskAllotApproveResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        return data.result || {}
        
      }).catch((err) => {
        this.pending = false
        console.error(err)
      })
    )
  }
  
  /* 指派到工单池审批 */
  public fetchTaskAllotTaskPoolApprove(params: AllotTaskPoolParams): Promise<TaskApprove | any | void> {
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
      })
    )
  }
  
  /* 自动派单审批状态 */
  public fetchApproveWithAutoDispatch(params: AutoDispatchApproveParams): Promise<{ isNeedApprove: boolean, data: TaskApprove } | void> {
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
        let isSuccess = data.succ
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
  
  /* 自动派单 */
  public fetchAutoDispatchSubmit(params: AutoDispatchParams) {
    return (
      taskAutoDispatch(params)
      .then((data: any) => {
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
  
  /** 
   * @description 派单方式变化
  */
  public handlerAllotTypeChange(type: TaskAllotTypeEnum) {
    this.allotType = type
    this.loadedComponents.push(LoadComponentMap[type])
  }
  
  /** 
   * @description 初始化
  */
  public async initialize() {
    await this.fetchStateColor()
    await this.fetchCustomer()
    this.fetchSynergyUserWithCustomerManager()
  }
  
  /** 
   * @deprecated
   * @description 工单池通知方式变动
  */
  public onTaskNotificationCheckedChanged(value: TaskPoolNotificationTypeEnum[]): void {
    this.taskPoolNotificationCheckd = value
  }
  
  /** 
   * @deprecated
   * @description 工单池通知人员信息变动
  */
  public onTaskNotificationUsersChanged(value: LoginUser[]): void {
    this.taskPoolNotificationUsers = value
  }
  
  /** 
   * @description 设置负责人信息
   * -- 支持外部调用的
  */
  public outsideSetExcutorUser(user: LoginUser | TaskAllotUserInfo | null) {
    this.setExecutorUser(user)
  }
  
  /** 
   * @description 设置匹配的规则
   * -- 支持外部调用的
  */
  public outsideSetMatchRule(rule: AutoDispatchListItem | null) {
    this.matchRule = rule
  }
  
  /** 
   * @description 设为负责人
  */
  public setExecutorUser(user: LoginUser | TaskAllotUserInfo | null) {
    this.executorUser = user
  }
  
  /** 
   * @description 设为协同人
  */
  public setSynergyUser(user: LoginUser) {
    // 判断是否已存在该用户
    const IsNotRepeat = this.synergyUserList.every(synergyUser => synergyUser.userId !== user.userId)
    IsNotRepeat && this.synergyUserList.push(user)
  }
  
  /** 
   * @description 显示弹窗
  */
  public show() {
    this.showTaskAllotModal = true
    this.fetchTaskConfig()
    this.initialize()
  }
  
  /** 
   * @description 显示审批弹窗
  */
  public showApproveDialog(data: TaskApprove) {
    // @ts-ignore
    this.$refs.ApproveDialog && this.$refs.ApproveDialog.openDialog(data)
  }
  
  /** 
   * @description 提交
  */
  public submit() {
    this.pending = true
    
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
      const params = { taskId: this.task.id }
      let approve: TaskApprove | void = await this.fetchApproveWithTaskAllot(params)
      if (!approve) return
      
      let isNeedApprove = approve.needApprove === true
      // 有审批
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(approve)
      }
      
      // 派单到负责人提交
      const allotExcutorParams = this.buildAllotExcutorParams()
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
      let approve: { isNeedApprove: boolean, data: TaskApprove } | void = await this.fetchTaskAllotTaskPoolApprove(allotTaskPoolParams)
      if (!approve) return
      
      let isNeedApprove = approve.isNeedApprove === true
      // 有审批
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(approve.data)
      }
      
      // 派单到工单池提交
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
      const autoDispatchApproveParams: AutoDispatchApproveParams = this.buildAutoDispatchApproveParams()
      let approve = await this.fetchApproveWithAutoDispatch(autoDispatchApproveParams) || {
        isNeedApprove: false,
        data: new TaskApprove()
      }
      const { isNeedApprove, data } = approve
      
      // 有审批
      if (isNeedApprove) {
        this.pending = false
        return this.showApproveDialog(data)
      }
      
      // 自动派单提交
      const autoDispatchParams = this.buildAutpDispatchParams()
      this.fetchAutoDispatchSubmit(autoDispatchParams)
      
    } catch (error) {
      this.pending = false
      console.warn('TaskAllotModalMethods -> submitWithAutoDispatch -> error', error)
    }
  }
}

export default TaskAllotModalMethods
