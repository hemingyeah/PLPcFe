/* api */
import { getTaskAlloyPoolUserList } from '@src/api/TaskApi'
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

declare let AMap: any

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
  /* 用户page */
  private userPage: Page =  new Page()
  
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
   * @description 构建人员标记
   * @param {Object} amap 高德地图对象
   * @param {Object} infoWindow 高德地图窗口对象
  */
  public buildMarkers(amap: any, infoWindow: any): void {
    if (this.userPage.list.length <= 0) {
      return Log.warn('userPage.list is empty', this.buildMarkers.name)
    }
    
    this.userPage.list.forEach((user: LoginUser) => {
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
      
      userMarker.on(EventNameEnum.Click, (event: any) => {
        // TODO: 打开人员卡片
      })
      
    })
  }
  
  /** 
   * @description 选择工单池通知其他人
  */
  public chooseTaskPoolNotificationUsers(): void {
    let options = {
      title: '请选择通知人员',
      seeAllOrg: true,
      selected: this.taskPoolNotificationUsers,
      max: -1
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
      getTaskAlloyPoolUserList(params).then((result: getUserListByTagResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        this.userPage.list = result.data || []
        
        Log.succ(Log.End, this.fetchUsers.name)
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
   * @description 地图初始化事件
  */
  public mapInit(): void {
    // @ts-ignore
    this.$refs.TaskAllotMap.outsideMapInit()
  }
  
  /**
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    this.userPage = new Page()
    
    this.fetchUsers().then(() => {
      this.mapInit()
    })
  }
  
  /** 
   * @description 工单池通知方式改变
  */
  private onNotificationCheckedChanged(value: TaskPoolNotificationTypeEnum[]): void {
    this.notificationCheckd = value
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
              return <span>{user.displayName}</span>
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
          handlerCustomFunc={(amap: any, infoWindow: any) => this.buildMarkers(amap, infoWindow)} 
        />
        <task-allot-pool-notification 
          checked={this.notificationCheckd} 
          checkedChangeFunc={(value: TaskPoolNotificationTypeEnum[]) => this.onNotificationCheckedChanged(value)}
          slotDefault={this.renderNotificationAddUser}
        >
        </task-allot-pool-notification>
        <task-allot-pool-info info={this.taskPoolInfo} />
      </div>
    )
  }
  
}

