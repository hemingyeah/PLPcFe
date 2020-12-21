/* api */
import { getTaskPoolAuthUserList, getTaskPoolSubscriptionUserList, getCustomerTagTaskPoolCount, getTaskPoolList } from '@src/api/TaskApi'
/* components */
import TaskAllotMap from '@src/modules/task/components/TaskAllotModal/TaskAllotMap/TaskAllotMap.tsx'
import TaskAllotPoolNotification from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolNotification/TaskAllotPoolNotification.tsx'
import TaskAllotPoolInfo from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInfo/TaskAllotPoolInfo.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
import TaskMapInfoWindow from '@src/modules/task/components/TaskAllotModal/TaskMapInfoWindow/TaskMapInfoWindow.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import EventNameEnum from '@model/enum/EventNameEnum'
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* entity */
import Customer from '@model/entity/Customer'
import CustomerAddress from '@model/entity/CustomerAddress'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
import TaskPoolUser from '@model/entity/TaskPoolUser'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import TaskType from '@model/entity/TaskType'
/* enum */
import DateFormatEnum from '@model/enum/DateFormatEnum'
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
import { Vue, Component, Watch, Prop, Ref } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* sccss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPool.scss'
/* types */
import StateColorMap from '@model/types/StateColor'
import TaskConfig from '@model/types/TaskConfig'
/* util */
import Log from '@src/util/log.ts'
import { formatDate } from '@src/util/lang'
import Platform from '@src/util/Platform'
import { findComponentUpward } from '@src/util/assist'
import { openTabForTaskView, openTabForCustomerView } from '@src/util/business/openTab'
import { fmt_address, fmt_number } from '@src/filter/fmt'
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
  /* 工单地图信息弹窗组件 */
  @Ref() readonly TaskMapInfoWindowComponent!: TaskMapInfoWindow
  
  /* 客户团队列表 */
  @Prop() readonly customerTags: Tag[] | undefined
  /* 是否显示协同人 */
  @Prop() readonly isShowSynergy: boolean | undefined
  /* 显示状态 */
  @Prop() readonly show: boolean | undefined
  /* 工作状态颜色数组 */
  @Prop() readonly stateColorMap: StateColorMap | undefined
  /* 选择的负责人信息 */
  @Prop() readonly selectedExcutorUser: TaskAllotUserInfo | undefined
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  /* 工单设置 */
  @Prop() readonly taskConfig: TaskConfig | undefined
  /* 工单类型列表 */
  @Prop() readonly taskTypesMap: { [x: string]: TaskType} | undefined
  
  /* 地图用户信息弹窗 */
  private AMapUserInfoWindow: any = null
  /* 工单信息弹窗 */
  private AMapTaskInfoWindow: any = null
  /* 是否在地图显示工单池订阅用户 */
  private isShowMapTaskPoolSubscriptionUsers: boolean = false
  /* 是否在地图显示有权限接单用户 */
  private isShowMapTaskPoolAuthUsers: boolean = false
  /* 是否显示人员卡片信息 */
  private isShowUserCard: boolean = false
  /* 地图的id */
  private mapId: string = 'TaskAllotPoolMapContainer'
  /* 通知方式复选 */
  private notificationCheckd: TaskPoolNotificationTypeEnum[] = []
  /* 当前选择地图工单 */
  private selectedMapTask: any = {}
  /* 工单池通知自定义人员 */
  private taskPoolNotificationUsers: LoginUser[] = []
  /* 工单池统计数据信息 */
  private taskPoolInfo: TaskAllotPoolInfoData = {
    taskPoolAllCount: 0,
    customerTeamUnAcceptCount: 0,
    subscriptionUserCount: 0,
    havePermissionUserCount: 0,
  }
  /* 工单池列表 */
  private taskPoolList: any[] = []
  /* 订阅用户page */
  private userSubscriptionPage: Page =  new Page()
  /* 有权限接单用户page */
  private userAuthPage: Page =  new Page()
  
  /* 工单派单组件 */
  get TaskAllotModalComponent() {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* 客户 */
  get customer(): Customer {
    return this.TaskAllotModalComponent.customer || {}
  }
  
  /* 客户地址 */
  get customerAddress(): CustomerAddress {
    return this.customer.customerAddress || new CustomerAddress()
  }
  
  /* 客户团队名称列表 */
  get customerTagNames(): string[] {
    return this.customerTags ? this.customerTags.map(tag => tag.tagName || '') : []
  }
  
  /* 是否开启 按服务团队划分工单池 */
  get isPoolByTag(): boolean {
    return this.taskConfig?.poolByTag === true
  }
  
  /** 
   * @description 构建标记
  */
  private buildMarkers(amap: any): void {
    // 构建工单池订阅人员标记
    this.isShowMapTaskPoolSubscriptionUsers && this.buildUserMarkers(amap)
    // 构建有权限接单人员标记
    this.isShowMapTaskPoolAuthUsers && this.buildUserMarkers(amap, false)
    // 构建工单标记
    this.buildTaskMarkers(amap)
  }
  
  /** 
   * @description 构建人员标记
   * @param {Object} amap 高德地图对象
   * @param {Object} infoWindow 高德地图窗口对象
   * @param {Boolean} isSubscription 是否是订阅工单池用户列表
  */
  public buildUserMarkers(amap: any, isSubscription: boolean = true): void {
    let userPage = isSubscription ? this.userSubscriptionPage : this.userAuthPage
    if (userPage.list.length <= 0) {
      return Log.warn('userPage.list is empty', this.buildUserMarkers.name)
    }
    
    userPage.list.forEach((taskPoolUser: TaskPoolUser) => {
      let user: LoginUser = taskPoolUser.user
      let { longitude, latitude } = user
      // 无经纬度
      if (!longitude || !latitude) return
      
      // 用户标记
      let userMarker = new AMap.Marker({
        position: [longitude, latitude],
        title: user.displayName,
        map: amap,
        extData: taskPoolUser,
        content: `<img class='staff-header' width='42' height='42' src='${user.head || DefaultHead}' />`
      })
      
      userMarker.on(EventNameEnum.Click, (event: any) => {
        this.$nextTick(() => {
          this.isShowUserCard = true
        })
      })
      
    })
  }
  
  /** 
   * @description 构建工单标记
   * @param {Object} amap 高德地图对象
   * @param {Object} infoWindow 高德地图窗口对象
  */
  public buildTaskMarkers(amap: any): void {
    if (this.taskPoolList.length <= 0) {
      return Log.warn('taskPoolList is empty', this.buildTaskMarkers.name)
    }
    
    this.taskPoolList.forEach((task: any) => {
      let { longitude, latitude } = task?.address || {}
      // 无经纬度
      if (!longitude || !latitude) return
      
      // 工单标记
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
   * @description 构建人员信息弹窗
  */
  private buildUserMarkerInfo(event: any, amap: any) : string {
    let taskAllotUser: TaskPoolUser = event?.target?.getExtData()
    let user = taskAllotUser.user
    
    return (
      `
        <div class="task-pool-user-content">
          <div class="task-pool-user-info">
            <div class="task-pool-user-info-left">
              <span class='task-pool-user-name'>${user.displayName}</span>
              <span class='user-state-round' style="background-color: ${this.stateColorMap && this.stateColorMap[user.state || '']}">
              </span>
              <span class='task-pool-user-state'>
                ${user.state || ''}
              </span>
            </div>
            <div class='task-pool-user-phone'>${user.cellPhone || ''}</div>
          </div>
          <div class="task-pool-user-team">
            服务团队: 
            ${
              Array.isArray(user.tagList) 
              ? (
                user.tagList.map((tag: Tag) => {
                  return `<span>${tag.tagName || tag}</span>`
                }).join(', ')
              )
              : ''
            }
          </div>
          <div class="task-pool-user-count">
            <span>未完成工单: ${taskAllotUser.unFinished || ''}</span>
          </div>
        </div>
      `
    )
  }
  
  /**
   * @description 构建工单信息弹窗
  */
  private buildTaskMarkerInfo(event: any) : string {
    let task: any = event?.target?.getExtData() || {}
    let {
      customerEntity = {},
      description = '',
      taskId,
      taskUUID,
      taskNo = '',
      linkMan = {},
      address = {},
      planTime = '',
      serviceContent = '',
      serviceType = '',
      isTimeout
    } = task
    
    return (
      `
      <div class="map-info-window-content map-task-content-window">
        <div class="map-task-content-window-header">
          <div class="customer-name link-text" onclick="openCustomerViewFunc('${customerEntity?.id}')">${ customerEntity?.name || '' }</div>
          ${isTimeout ? '<div class="map-task-content-window-header-timeout">超时接单</div>' : ''}
        </div>
        <p><label>工单编号：</label><span class="link-text" onclick="openTaskViewFunc('${taskId || taskUUID}')">${ taskNo }</span></p>
        <p><label>联系人：</label>${ linkMan.name || '' }</p>
        <p><label>电话：</label>${ linkMan.phone || '' }</p>
        <p><label>地址：</label>${ fmt_address(address) || '' }</p>
        <p><label>计划时间：</label>${ formatDate(planTime, DateFormatEnum.YTMHMS) || '' }</p>
        <p><label>服务类型：</label>${ serviceType || '' }</p>
        <p><label>服务内容：</label>${ serviceContent || '' }</p>
        <p><label>描述：</label>${ description || '' }</p>
        <div class="info-window-arrow"></div>
      </div>
    `
    )
  }
  
  /** 
   * @description 选择工单池通知其他人
  */
  public chooseTaskPoolNotificationUsers(): void {
    let options = {
      title: '请选择通知人员',
      seeAllOrg: true,
      selected: this.taskPoolNotificationUsers,
      max: 14
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // 工单池通知人员赋值
        this.taskPoolNotificationUsers = result?.data?.users || []
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description 关闭用户卡片
  */
  private closeUserCard() {
    this.isShowUserCard = false
  }
  
  /** 
   * @description 获取有权限接单用户列表
   * -- 内部调用的
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
   * @description 获取订阅用户列表
   * -- 内部调用的
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
   * @description 查询客户团队工单池数量
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
   * @description 获取工单池列表
  */
  private fetchTaskPoolList() {
    return (
      getTaskPoolList({ ids: [], page: 1, pageSize: 1000 }).then((data: getTaskSearchListResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        
        // 工单池列表数据
        this.taskPoolList = data?.result?.content.map((task: any) => {
          let isTimeout = isBeforeTime(task.overTime)
          task.isTimeout = isTimeout
          return task
        }) || []
        // 工单池总量
        this.taskPoolInfo.taskPoolAllCount = fmt_number(data.result?.totalElements, '')
        
      })
    )
  }
  
  private handleAddNotificationUser() {
    // 判断是否选中 可以通知其他人
    if (!this.notificationCheckd || !this.notificationCheckd.includes(TaskPoolNotificationTypeEnum.SendToOtherUser)) {
      return Platform.alert(REQUIRE_OTHER_NOTIFICATION_USER_MEESSAGE)
    }
    // 选择工单池通知其他人
    this.chooseTaskPoolNotificationUsers()
  }
  
  /** 
   * @description 工单池详细信息 订阅工单池用户 checkbox变化
  */
  private handlerTaskPoolInfoSubscriptionChanged(value: boolean): void {
    this.isShowMapTaskPoolSubscriptionUsers = value
    this.mapInit()
  }
  
  /** 
   * @description 工单池详细信息 有权限接单用户 checkbox变化
  */
  private handlerTaskPoolInfoAuthChanged(value: boolean): void {
    this.isShowMapTaskPoolAuthUsers = value
    this.mapInit()
  }
  
  /**
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    this.userSubscriptionPage = new Page()
    this.userAuthPage = new Page()
    
    // 查询工单池工单列表
    this.fetchTaskPoolList().then(() => {
      this.mapInit()
    })
    // 查询有权限接单人员列表
    this.fetcAuthhUsers()
    // 查询订阅工单池人员列表
    this.fetchSubscriptionUsers()
    // 查询客户团队统计工单池数量
    this.isPoolByTag && this.fetchCustomerTagTaskPoolCount()
  }
  
  /**
   * @description 地图初始化事件
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
   * @description 工单池通知方式改变
  */
  private onNotificationCheckedChanged(value: TaskPoolNotificationTypeEnum[]): void {
    this.notificationCheckd = value
  }
  
  /** 
   * @description 构建数据
   * -- 支持外部调用的
  */
  public outsideBuildData(): { checked: TaskPoolNotificationTypeEnum[], users: LoginUser[] } {
    return {
      checked: this.notificationCheckd,
      users: this.taskPoolNotificationUsers
    }
  }
  
  /**
   * @description 移除通知用户
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
   * @description 渲染选择通知用户
  */
  private renderNotificationAddUser() {
    let isNotificationUsersEmpty = this.taskPoolNotificationUsers.length <= 0
    
    return (
      <div class='task-allot-pool-notification-input' onClick={() => this.handleAddNotificationUser()}>
        {
          isNotificationUsersEmpty 
          ? <span class='task-allot-pool-notification-placeholder'>请选择人员</span>
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
        
        <task-allot-map 
          ref='TaskAllotMap' 
          idName={this.mapId} 
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
          task={this.selectedMapTask}
        />
        
        <div class='task-allot-user-content'>
          <base-panel width='470px' show={this.isShowUserCard} {...basePanelAttrs}>
            <user-card
              customer={this.customer}
              customerTagNames={this.customerTagNames}
              emitEventComponentName={ComponentNameEnum.TaskAllotExcutor}
              stateColorMap={this.stateColorMap}
              showSynergyButton={this.isShowSynergy}
              task={this.task}
              userId={this.selectedExcutorUser?.userId}
              onClose={() => this.closeUserCard()}
            />
          </base-panel>
        </div>
        
      </div>
    )
  }
  
}

