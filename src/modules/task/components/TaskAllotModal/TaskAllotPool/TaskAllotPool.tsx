/* api */
import { getTaskAllotPoolUserList, getTaskAlloyPoolList } from '@src/api/TaskApi'
/* components */
import TaskAllotMap from '@src/modules/task/components/TaskAllotModal/TaskAllotMap/TaskAllotMap.tsx'
import TaskAllotPoolNotification from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolNotification/TaskAllotPoolNotification.tsx'
import TaskAllotPoolInfo from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInfo/TaskAllotPoolInfo.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import EventNameEnum from '@model/enum/EventNameEnum'
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* entity */
import Customer from '@model/entity/Customer'
import CustomerAddress from '@model/entity/CustomerAddress'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* interface */
import { TaskAllotPoolInfoData } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolInterface'
/* model */
import Page from '@model/Page'
import { getUserListByTagResult } from '@model/param/out/Task'
import { REQUIRE_OTHER_NOTIFICATION_USER_MEESSAGE } from '@src/model/const/Alert'
import { DepeMultiUserResult } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* vue */
import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* sccss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPool.scss'
/* util */
import Log from '@src/util/log.ts'
import Platform from '@src/util/Platform'
import { findComponentUpward } from '@src/util/assist'
import { openTabForTaskView, openTabForCustomerView } from '@src/util/business/openTab'
import { xor } from 'lodash'

declare let AMap: any

const ENCRYPT_FIELD_VALUE = '***'

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
    [TaskAllotMap.name]: TaskAllotMap,
    [TaskAllotPoolNotification.name]: TaskAllotPoolNotification,
    [TaskAllotPoolInfo.name]: TaskAllotPoolInfo
  }
})
export default class TaskAllotPool extends Vue {
  // 显示状态
  @Prop() readonly show: boolean | undefined
  
  /* 地图用户信息弹窗 */
  private AMapUserInfoWindow: any = null
  /* 工单信息弹窗 */
  private AMapTaskInfoWindow: any = null
  /* 是否在地图显示工单池订阅用户 */
  private isShowMapTaskPoolSubscriptionUsers: boolean = false
  /* 是否在地图显示有权限接单用户 */
  private isShowMapTaskPoolAuthUsers: boolean = false
  /* 地图的id */
  private mapId: string = 'TaskAllotPoolMapContainer'
  /* 通知方式复选 */
  private notificationCheckd: TaskPoolNotificationTypeEnum[] = []
  /* 工单池通知自定义人员 */
  private taskPoolNotificationUsers: LoginUser[] = []
  /* 工单池统计数据信息 */
  private taskPoolInfo: TaskAllotPoolInfoData = {
    taskPoolAllCount: 1,
    customerTeamUnAcceptCount: 1,
    subscriptionUserCount: 1,
    havePermissionUserCount: 2,
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
  
  @Watch('show')
  onShowChanged(newValue: boolean) {
    if (newValue) {
      this.initialize()
    }
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
    
    userPage.list.forEach((user: LoginUser) => {
      let { longitude, latitude } = user
      // 无经纬度
      if (!longitude && !latitude) return
      
      // 用户标记
      let userMarker = new AMap.Marker({
        position: [longitude, latitude],
        title: user.displayName,
        map: amap,
        extData: user,
        content: `<img class='staff-header' width='42' height='42' src='${user.head || DefaultHead}' />`
      })
      
      userMarker.on(EventNameEnum.MouseOver, (event: any) => {
        
        this.AMapUserInfoWindow = new AMap.InfoWindow({
          closeWhenClickMap: true,
          isCustom: true,
          offset: new AMap.Pixel(0, -34),
          content: this.buildUserMarkerInfo(event)
        })
        
        this.AMapUserInfoWindow.open(amap, event.target.getPosition())
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
      let { longitude, latitude } = task?.taddress || {}
      // 无经纬度
      if (!longitude && !latitude) return
      
      // 用户标记
      let taskMarker = new AMap.Marker({
        position: [longitude, latitude],
        title: task.taskNo,
        map: amap,
        extData: task,
        content: `<i class="iconfont task-pool-icon icon-address ${task.isTimeout ? 'task-pool-timeout' : ''}"></i>`
      })
      
      taskMarker.on(EventNameEnum.MouseOver, (event: any) => {
        this.AMapTaskInfoWindow = new AMap.InfoWindow({
          closeWhenClickMap: true,
          isCustom: true,
          offset: new AMap.Pixel(0, -34),
          content: this.buildTaskMarkerInfo(event)
        })
        
        this.AMapTaskInfoWindow.open(amap, event.target.getPosition())
      })
      
    })
  }
  
  /**
   * @description 构建人员信息弹窗
  */
  private buildUserMarkerInfo(event: any) : string {
    let user: LoginUser = event?.target?.getExtData() || new LoginUser()
    
    return (
      `
        <div class="task-pool-user-content">
          <div class="task-pool-user-info">
            <div class="task-pool-user-info-left">
              <span class='task-pool-user-name'>${user.displayName}</span>
              <span class='task-pool-user-state'>${user.state || ''}</span>
            </div>
            <div class='task-pool-user-phone'>${user.cellPhone || ''}</div>
          </div>
          <div class="task-pool-user-team">
            服务团队: 
            ${
              Array.isArray(user.tagList) 
              ? (
                user.tagList.map((tag: Tag) => {
                  return `<span>${tag.tagName}</span>`
                }).join()
              )
              : ''
            }
          </div>
          <div class="task-pool-user-count">
            <span>未完成工单: ${user.unfinishedTask || ''}</span>
            <span>本月已完成工单量: ${user.todayFinishedTask || ''}</span>
          </div>
        </div>
      `
    )
  }
  
    /**
   * @description 构建人员信息弹窗
  */
  private buildTaskMarkerInfo(event: any) : string {
    let task: any = event?.target?.getExtData() || {}
    let {
      customerId = '',
      customerName = '', 
      taskId,
      taskNo = '', 
      lmName = '', 
      lmPhone = '', 
      customerAddress,
      planTime = '',
      havePermissionUserCount,
      isTimeout
    } = task
    customerAddress = new CustomerAddress(customerAddress)
    
    return (
      `
      <div class="map-info-window-content map-task-content-window">
        <div class="map-task-content-window-header">
          <div class="customer-name link-text" onclick="openCustomerViewFunc('${customerId}')">${ customerName }</div>
          ${isTimeout ? '<div class="map-task-content-window-header-timeout">超时接单</div>' : ''}
        </div>
        <p><label>工单编号：</label><span class="link-text" onclick="openTaskViewFunc('${taskId}')">${ taskNo }</span></p>
        <p><label>联系人：</label>${ lmName }</p>
        <p><label>电话：</label>${ lmPhone }</p>
        <p><label>地址：</label>${ customerAddress?.toString() }</p>
        <p><label>计划时间：</label>${ planTime || '' }</p>
        <p><label>有权限接单人员：</label>${ havePermissionUserCount ? `${havePermissionUserCount}个` : '' }</p>
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
   * @description 获取用户列表
   * -- 内部调用的
  */
  public fetchUsers(): Promise<any> {
    Log.succ(Log.Start, this.fetchUsers.name)
    
    let params = {
      customerId: this.customer.id || '',
      lat: String(this.customerAddress.adLatitude) || '',
      lng: String(this.customerAddress.adLongitude) || ''
    }
    
    return (
      getTaskAllotPoolUserList(params).then((result: getUserListByTagResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        this.userSubscriptionPage.list = result.data || []
        this.userAuthPage.list = result.data || []
        
        Log.succ(Log.End, this.fetchUsers.name)
      })
    )
  }
  
  /** 
   * @description 获取工单池列表
  */
  private fetchTaskPoolList() {
    return (
      getTaskAlloyPoolList({}).then(result => {
        let isSuccess = result.success
        if (!isSuccess) {
          return Platform.alert(result.message)
        }
        
        this.taskPoolList = result?.result?.list.map((task: any) => {
          let isTimeout = task.overTime ? task.overTime < new Date().getTime() : false
          task.isTimeout = isTimeout
          return task
        }) || []
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
  * @description 是否加密字段
  */
  private isEncryptField(value: string): boolean {
    return value === ENCRYPT_FIELD_VALUE
  }
  
  /**
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    this.userSubscriptionPage = new Page()
    this.userAuthPage = new Page()
    
    this.fetchUsers().then(() => {
      this.fetchTaskPoolList().then(() => {
        this.mapInit()
      })
    })
  }
  
  /**
   * @description 地图初始化事件
  */
  public mapInit(): void {
    try {
      // @ts-ignore
      this.$refs.TaskAllotMap.outsideMapInit()
    } catch (error) {
      console.warn('mapInit -> error', error)
    }
  }
  
  /** 
   * @description 工单池通知方式改变
  */
  private onNotificationCheckedChanged(value: TaskPoolNotificationTypeEnum[]): void {
    this.notificationCheckd = value
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
          : 
          (
            this.taskPoolNotificationUsers.map((user: LoginUser) => {
              let test = user
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
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotPool}>
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
        <task-allot-pool-info 
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
      </div>
    )
  }
  
}

