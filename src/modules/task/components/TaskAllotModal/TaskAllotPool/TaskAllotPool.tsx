/* api */
import { getTaskPoolAuthUserList, getTaskPoolSubscriptionUserList, getCustomerTagTaskPoolCount, getTaskPoolList } from '@src/api/TaskApi'
/* components */
import TaskAllotMap from '@src/modules/task/components/TaskAllotModal/TaskAllotMap/TaskAllotMap.tsx'
import TaskAllotPoolNotification from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolNotification/TaskAllotPoolNotification.tsx'
import TaskAllotPoolInfo from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInfo/TaskAllotPoolInfo.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
import TaskMapInfoWindow from '@src/modules/task/components/TaskAllotModal/TaskMapInfoWindow/TaskMapInfoWindow.tsx'
import TaskAllotExcutor from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import EventNameEnum from '@model/enum/EventNameEnum'
import TaskStateEnum from '@model/enum/TaskStateEnum'
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* entity */
import Customer from '@model/entity/Customer'
import CustomerAddress from '@model/entity/CustomerAddress'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
import TaskPoolUser from '@model/entity/TaskPoolUser'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import TaskType from '@model/entity/TaskType'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* interface */
import { TaskAllotPoolInfoData } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInterface'
/* model */
import Page from '@model/Page'
import { getCustomerTagTaskPoolCountResult, getTaskPoolAuthUsersResult, getTaskPoolSubscriptionUsersResult, getTaskSearchListResult } from '@model/param/out/Task'
import { REQUIRE_OTHER_NOTIFICATION_USER_MEESSAGE } from '@src/model/const/Alert'
import { DepeMultiUserResult } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* vue */
import { Vue, Component, Prop, Ref, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import { VNode } from 'vue'
/* sccss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPool.scss'
/* types */
import StateColorMap from '@model/types/StateColor'
import TaskConfig from '@model/types/TaskConfig'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
import { findComponentUpward } from '@src/util/assist'
import { openTabForTaskView, openTabForCustomerView } from '@src/util/business/openTab'
import { fmt_number } from '@src/filter/fmt'
import { isBeforeTime } from '@src/util/time'

declare let AMap: any

// @ts-ignore
window.openTaskViewFunc = function openTaskViewFunc(taskId: string) {
  openTabForTaskView(taskId)
}
// @ts-ignore
window.openCustomerViewFunc = function openCustomerViewFunc(customerId: string) {
  openTabForCustomerView(customerId)
}


enum TaskAllotPoolEmitEventEnum {
  SetReason = 'setReason',
  SetCustomReason = 'setCustomReason'
}

@Component({ 
  name: ComponentNameEnum.TaskAllotPool,
  components: {
    TaskAllotMap,
    TaskAllotPoolNotification,
    TaskAllotPoolInfo,
    UserCard,
    TaskMapInfoWindow
  }
})
export default class TaskAllotPool extends Vue {
  /* ?????????????????????????????? */
  @Ref() readonly TaskMapInfoWindowComponent!: TaskMapInfoWindow
  /* ????????????????????? */
  @Ref() readonly TaskAllotPoolInfoComponent!: TaskAllotPoolInfo
  
  /* ?????????????????? */
  @Prop() readonly customerTags: Tag[] | undefined
  /* ????????????????????? */
  @Prop() readonly isShowSynergy: boolean | undefined
  /* ??????????????? */
  @Prop() readonly isReAllot: boolean | undefined
  /* ???????????? */
  @Prop() readonly reason: string | undefined
  /* ???????????? */
  @Prop() readonly show: boolean | undefined
  /* ???????????????????????? */
  @Prop() readonly stateColorMap: StateColorMap | undefined
  /* ???????????????????????? */
  @Prop() readonly selectedExcutorUser: TaskAllotUserInfo | undefined
  /* ???????????? */
  @Prop() readonly task: any | undefined
  /* ???????????? */
  @Prop() readonly taskConfig: TaskConfig | undefined
  /* ?????????????????? */
  @Prop() readonly taskTypesMap: { [x: string]: TaskType} | undefined

  /* ????????????????????? */
  @Prop() public customReason: string = ''
  /*???????????? */
  @Prop()
  readonly backList: Array<string>  = []
  /*?????????????????? */ 
  @Prop() readonly systemAdmin: any | undefined
  
  /* ?????????????????? */
  private AMapTaskInfoWindow: any = null
  /* ?????????????????????????????????????????? */
  private isShowMapTaskPoolSubscriptionUsers: boolean = false
  /* ?????????????????????????????????????????? */
  private isShowMapTaskPoolAuthUsers: boolean = false
  /* ?????????????????????????????? */
  private isShowUserCard: boolean = false
  /* ?????????id */
  private mapId: string = 'TaskAllotPoolMapContainer'
  /* ?????????????????? */
  private notificationCheckd: TaskPoolNotificationTypeEnum[] = []
  /* ???????????????????????? */
  private selectedMapTask: any = {}
  /* ???????????????????????? */
  private selectedMapUser: LoginUser | null = null
  /* ?????????????????????????????? */
  private taskPoolNotificationUsers: LoginUser[] = []
  /* ??????????????????????????? */
  private taskPoolInfo: TaskAllotPoolInfoData = {
    taskPoolAllCount: 0,
    customerTeamUnAcceptCount: 0,
    subscriptionUserCount: 0,
    havePermissionUserCount: 0,
  }
  /* ??????????????? */
  private taskPoolList: any[] = []
  /* ????????????page */
  private userSubscriptionPage: Page =  new Page()
  /* ?????????????????????page */
  private userAuthPage: Page =  new Page()
  
  /** 
   * @description ?????????????????????????????????????????????
   * 1. ????????????????????????????????????
   * 3. ????????????????????????????????????
  */
  get allowModifyPlanTime(): boolean {
    let states = [TaskStateEnum.CREATED.value, TaskStateEnum.REFUSED.value]
    let { state } = this.task
    return Boolean(this.taskConfig?.taskPlanTime === true && states.indexOf(state) >= 0)
  }
  
  /* ?????????????????? */
  get TaskAllotModalComponent() {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* ?????? */
  get customer(): Customer {
    return this.TaskAllotModalComponent.customer || {}
  }
  
  /* ???????????? */
  get customerAddress(): CustomerAddress {
    return this.customer.customerAddress || new CustomerAddress()
  }
  
  /* ???????????????????????? */
  get customerTagNames(): string[] {
    return this.customerTags ? this.customerTags.map(tag => tag.tagName || '') : []
  }
  
  /* ???????????? ?????????????????????????????? */
  get isPoolByTag(): boolean {
    return this.taskConfig?.poolByTag === true
  }
  
  /**
   * @description ????????????????????????
   */
  get reallotRemarkNotNull(): boolean {
    return this.taskConfig?.reallotRemarkNotNull === true
  }
  
  /**
   * @description ????????????????????????
   */
  @Emit(TaskAllotPoolEmitEventEnum.SetReason)
  public reasonChangedHandler(reason: string): string {
    return reason
  }
  
  @Emit(TaskAllotPoolEmitEventEnum.SetCustomReason)
  /**
   * @description  ????????????
   */
  public customReasonChangedHandler(customReason: string):string {
    return customReason
  }
  /** 
   * @description ????????????
  */
  private buildMarkers(amap: any): void {
    // ?????????????????????????????????
    this.isShowMapTaskPoolSubscriptionUsers && this.buildUserMarkers(amap)
    // ?????????????????????????????????
    this.isShowMapTaskPoolAuthUsers && this.buildUserMarkers(amap, false)
    // ??????????????????
    this.buildTaskMarkers(amap)
  }
  
  /** 
   * @description ??????????????????
   * @param {Object} amap ??????????????????
   * @param {Object} infoWindow ????????????????????????
   * @param {Boolean} isSubscription ????????????????????????????????????
  */
  public buildUserMarkers(amap: any, isSubscription: boolean = true): void {
    let userPage = isSubscription ? this.userSubscriptionPage : this.userAuthPage
    if (userPage.list.length <= 0) {
      return Log.warn('userPage.list is empty', this.buildUserMarkers.name)
    }
    
    userPage.list.forEach((taskPoolUser: TaskPoolUser) => {
      let user: LoginUser = taskPoolUser.user
      let { longitude, latitude } = user
      // ????????????
      if (!longitude || !latitude) return
      
      // ????????????
      let userMarker = new AMap.Marker({
        position: [longitude, latitude],
        title: user.displayName,
        map: amap,
        extData: user,
        content: `<img class='staff-header' width='42' height='42' src='${user.head || DefaultHead}' />`
      })
      
      userMarker.on(EventNameEnum.Click, (event: any) => {
        const user: LoginUser = event.target.getExtData() || null
        this.selectedMapUser = user
        this.$nextTick(() => {
          this.isShowUserCard = true
        })
      })
      
    })
  }
  
  /** 
   * @description ??????????????????
   * @param {Object} amap ??????????????????
   * @param {Object} infoWindow ????????????????????????
  */
  public buildTaskMarkers(amap: any): void {
    if (this.taskPoolList.length <= 0) {
      return Log.warn('taskPoolList is empty', this.buildTaskMarkers.name)
    }
    
    this.taskPoolList.forEach((task: any) => {
      let { longitude, latitude } = task?.address || {}
      // ????????????
      if (!longitude || !latitude) return
      
      // ????????????
      let taskMarker = new AMap.Marker({
        position: [longitude, latitude],
        title: task.taskNo,
        map: amap,
        extData: task,
        content: `<i class="iconfont task-pool-icon icon-address ${task.isTimeout ? 'task-pool-timeout' : ''}"></i>`
      })
      
      taskMarker.on(EventNameEnum.MouseOver, (event: any) => {
        const task: any = event.target.getExtData() || {}
        this.selectedMapTask = task
        
        this.AMapTaskInfoWindow = new AMap.InfoWindow({
          autoMove: true,
          closeWhenClickMap: true,
          isCustom: true,
          offset: new AMap.Pixel(0, -34),
          content: this.TaskMapInfoWindowComponent?.$el
        })
        
        this.AMapTaskInfoWindow.open(amap, event.target.getPosition())
      })
      
    })
  }
  
  /** 
   * @description ??????????????????????????????
  */
  public chooseTaskPoolNotificationUsers(): void {
    let options = {
      title: '?????????????????????',
      seeAllOrg: true,
      selected: this.taskPoolNotificationUsers,
      max: 14
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // ???????????????????????????
        this.taskPoolNotificationUsers = result?.data?.users || []
         // ?????????????????? ?????????????????????
        if (!this.notificationCheckd || !this.notificationCheckd.includes(TaskPoolNotificationTypeEnum.SendToOtherUser)) {
          this.notificationCheckd.push(TaskPoolNotificationTypeEnum.SendToOtherUser)
        }
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description ??????????????????
  */
  private closeUserCard() {
    this.isShowUserCard = false
  }
  
  /**
   * @description ????????????????????????
   */
  private closeInfoWindowHandler() {
    this.AMapTaskInfoWindow?.close()
  }
  
  /** 
   * @description ?????????????????????????????????
   * -- ???????????????
  */
  public fetcAuthhUsers(): Promise<any> {
    Log.succ(Log.Start, this.fetcAuthhUsers.name)
    
    let params = {
      taskId: this.task?.id || '',
    }
    
    return (
      getTaskPoolAuthUserList(params).then((result: getTaskPoolAuthUsersResult) => {
        let isSuccess = result.succ
        if (!isSuccess) {
          return Platform.alert(result.message)
        }
        
        this.userAuthPage.list = result.data || []
        
        Log.succ(Log.End, this.fetcAuthhUsers.name)
      })
    )
  }
  
  /** 
   * @description ????????????????????????
   * -- ???????????????
  */
  public fetchSubscriptionUsers(): Promise<any> {
    Log.succ(Log.Start, this.fetchSubscriptionUsers.name)
    
    return (
      getTaskPoolSubscriptionUserList().then((data: getTaskPoolSubscriptionUsersResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        this.userSubscriptionPage.list = data.result || []
        
        Log.succ(Log.End, this.fetchSubscriptionUsers.name)
      })
    )
  }
  
  /** 
   * @description ?????????????????????????????????
  */
  private fetchCustomerTagTaskPoolCount() {
    Log.succ(Log.Start, this.fetchCustomerTagTaskPoolCount.name)
    
    let params = {
      cusTagIds: this.customer.tags?.map((tag: Tag) => tag.id) || []
    }
    
    return (
      getCustomerTagTaskPoolCount(params)
      .then((data: getCustomerTagTaskPoolCountResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        this.taskPoolInfo.customerTeamUnAcceptCount = data.result
        
        Log.succ(Log.End, this.fetchCustomerTagTaskPoolCount.name)
      })
      .catch((err: any) => {
        console.error(err)
      })
    )
  }
  
  /** 
   * @description ?????????????????????
  */
  private fetchTaskPoolList() {
    return (
      getTaskPoolList({ ids: [], page: 1, pageSize: 1000 }).then((data: getTaskSearchListResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        // ?????????????????????
        this.taskPoolList = data?.result?.content.map((task: any) => {
          let isTimeout = isBeforeTime(task.overTime)
          task.isTimeout = isTimeout
          return task
        }) || []
        // ???????????????
        this.taskPoolInfo.taskPoolAllCount = fmt_number(data.result?.totalElements, '')
        
      })
    )
  }
  
  private handleAddNotificationUser() {
    // ??????????????????????????????
    this.chooseTaskPoolNotificationUsers()
  }
  
  /** 
   * @description ????????????????????? ????????????????????? checkbox??????
  */
  private handlerTaskPoolInfoSubscriptionChanged(value: boolean): void {
    this.isShowMapTaskPoolSubscriptionUsers = value
    this.TaskAllotPoolInfoComponent?.$nextTick(() => {
      this.mapInit()
    })
  }
  
  /** 
   * @description ????????????????????? ????????????????????? checkbox??????
  */
  private handlerTaskPoolInfoAuthChanged(value: boolean): void {
    this.isShowMapTaskPoolAuthUsers = value
    this.TaskAllotPoolInfoComponent?.$nextTick(() => {
      this.mapInit()
    })
  }
  
  /**
   * @description ????????? ???????????????????????????????????????
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    this.userSubscriptionPage = new Page()
    this.userAuthPage = new Page()
    
    // ???????????????????????????
    this.fetchTaskPoolList().then(() => {
      this.mapInit()
    })
    // ?????????????????????????????????
    this.fetcAuthhUsers()
    // ?????????????????????????????????
    this.fetchSubscriptionUsers()
    // ???????????????????????????????????????
    this.isPoolByTag && this.fetchCustomerTagTaskPoolCount()
  }
  
  /**
   * @description ?????????????????????
  */
  public mapInit(): void {
    try {
      // @ts-ignore
      this.$refs.TaskAllotMap.outsideMapInit()
    } catch (error) {
      console.warn('TaskAllotPool -> mapInit -> error', error)
    }
  }
  
  /** 
   * @description ???????????????????????????
  */
  private onNotificationCheckedChanged(value: TaskPoolNotificationTypeEnum[]): void {
    this.notificationCheckd = value
  }
  
  /** 
   * @description ????????????
   * -- ?????????????????????
  */
  public outsideBuildData(): { checked: TaskPoolNotificationTypeEnum[], users: LoginUser[] } {
    return {
      checked: this.notificationCheckd,
      users: this.taskPoolNotificationUsers
    }
  }
  
  /**
   * @description ??????????????????
  */
  private removeNotificationUser(user: LoginUser) {
    this.taskPoolNotificationUsers = (
      this.taskPoolNotificationUsers
      .filter((notificationUser: LoginUser) => {
        return notificationUser.userId !== user.userId
      })
    )
  }
  
  /** 
   * @description ????????????????????????
  */
  private renderNotificationAddUser() {
    let isNotificationUsersEmpty = this.taskPoolNotificationUsers.length <= 0
    
    return (
      <div class='task-allot-pool-notification-input' onClick={() => this.handleAddNotificationUser()}>
        {
          isNotificationUsersEmpty 
          ? <span class='task-allot-pool-notification-placeholder'>???????????????</span>
          : (
            this.taskPoolNotificationUsers.map((user: LoginUser) => {
              return (
                <el-tag key={user.userId} size='mini' disable-transitions closable type='info' onClose={() => this.removeNotificationUser(user)}>
                  {user.displayName}
                </el-tag>
              )
            })
          )
        }
      </div>
    )
  }
  
  /**
   * @description ??????????????????????????????
   */
  private renderTaskAllotReason(): VNode | null {
    return (
      <el-input
        autocomplete="off"
        class='task-allot-reason-input'
        placeholder={`${this.reallotRemarkNotNull ? '[??????]' : '[??????]'} ????????????`}
        type='text'
        value={this.reason}
        onInput={(value: string) => this.reasonChangedHandler(value)}
      />
    )
  }
  
  /**
   * @description ?????????????????????????????????
   * -- TODO: ???????????????
   */
  private renderTaskAllotReasonRow(): VNode | null {
    if (!this.isReAllot) return null
    
    const taskAllotExcutor: TaskAllotExcutor = new TaskAllotExcutor()
    
    return (
      <div class='task-allot-reason-row task-allot-executor-header'>
        <div class="task-flex task-ai task-mr12">       
          ??????????????? 
          <el-select value={this.customReason} placeholder={`${this.reallotRemarkNotNull ? '[??????]' : '[??????]'}?????????????????????`}  onChange={(v: string) => this.customReasonChangedHandler(v)}>
            {
              this.backList.map(item => {
                return (
                  <el-option
                    key={item}
                    label={item}
                    value={item}
                  />
                )
              })
            }
          </el-select>
          {
            this.systemAdmin ? <div class="task-font12 task-c13 task-ml12 task-pointer" onClick={() => {window.location.href = '/setting/task/taskSet'}}>???????????????</div> : null
          }</div>
        { taskAllotExcutor.renderTaskAllotExecutorHeaderRow('???????????????', this.renderTaskAllotReason()) }
      </div>
    )
  }
  
  mounted() {
    this.initialize()
  }
  
  render(h: CreateElement) {
    const basePanelAttrs = {
      on: {
        'update:show': (show: boolean) => {
          // this.isShowUserCard = show
        }
      }
    }
    
    return (
      <div class={ComponentNameEnum.TaskAllotPool}>
        
        <task-allot-pool-info
          ref='TaskAllotPoolInfoComponent' 
          hideCustomerTagInfo={!this.isPoolByTag}
          stateColorMap={this.stateColorMap}
          info={this.taskPoolInfo}
          checked={{
            subscription: this.isShowMapTaskPoolSubscriptionUsers,
            auth: this.isShowMapTaskPoolAuthUsers
          }}
          users={{
            subscription: this.userSubscriptionPage.list,
            auth: this.userAuthPage.list
          }}
          onSubscriptionChange={(value: boolean) => this.handlerTaskPoolInfoSubscriptionChanged(value)}
          onAuthChange={(value: boolean) => this.handlerTaskPoolInfoAuthChanged(value)}
        />
        
        { this.renderTaskAllotReasonRow() }
        
        <task-allot-map
          ref='TaskAllotMap' 
          idName={this.mapId}
          taskTypesMap={this.taskTypesMap}
          handlerCustomFunc={(amap: any) => this.buildMarkers(amap)} 
        />
        
        <task-allot-pool-notification
          checked={this.notificationCheckd} 
          checkedChangeFunc={(value: TaskPoolNotificationTypeEnum[]) => this.onNotificationCheckedChanged(value)}
          slotDefault={this.renderNotificationAddUser}
        >
        </task-allot-pool-notification>
        
        <task-map-info-window
          ref='TaskMapInfoWindowComponent'
          showModifyPlanTime={this.allowModifyPlanTime}
          task={this.selectedMapTask}
          onClose={() => this.closeInfoWindowHandler()}
        />
        
        <div class='task-allot-user-content'>
          this.isShowUserCard && (
            <base-panel width='470px' show={this.isShowUserCard} {...basePanelAttrs}>
              <user-card
                customer={this.customer}
                customerTagNames={this.customerTagNames}
                emitEventComponentName={ComponentNameEnum.TaskAllotPool}
                isReAllot={this.isReAllot}
                stateColorMap={this.stateColorMap}
                showExecutorButton={false}
                showSynergyButton={this.isShowSynergy}
                task={this.task}
                userId={this.selectedMapUser?.userId}
                onClose={() => this.closeUserCard()}
              />
            </base-panel>
          )
        </div>
        
      </div>
    )
  }
  
}

