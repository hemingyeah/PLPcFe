/* components */
import TaskAllotMap from '@src/modules/task/components/TaskAllotModal/TaskAllotMap/TaskAllotMap.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
/* entity */
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
import TaskType from '@model/entity/TaskType'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import EventNameEnum from '@model/enum/EventNameEnum'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* model */
import Page from '@model/Page'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.scss'
/* vue */
import VC from '@model/VC'
import { Component, Emit, Prop, Ref } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import Log from '@src/util/log.ts'
/* types */
import StateColorMap from '@model/types/StateColor'

declare let AMap: any

enum TaskAllotUserMapEventEmitEnum {
  ExecutorChange = 'executorChange'
}

@Component({ 
  name: ComponentNameEnum.TaskAllotUserMap,
  components: {
    TaskAllotMap,
    UserCard
  }
})
export default class TaskAllotUserMap extends VC {
  /* 工单指派地图组件 */
  @Ref() readonly TaskAllotMapComponent !: TaskAllotMap
  
  /* 客户团队列表 */
  @Prop() readonly customerTags: Tag[] | undefined
  /* 是否显示协同人 */
  @Prop() readonly isShowSynergy: boolean | undefined
  /* 是否为客户负责人 */
  @Prop() readonly isCustomerManager: boolean | undefined
  /* 工作状态颜色数组 */
  @Prop() readonly stateColorMap: StateColorMap | undefined
  /* 选择的负责人信息 */
  @Prop() readonly selectedExcutorUser: TaskAllotUserInfo | null = null
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  /* 工单类型列表 */
  @Prop() readonly taskTypesMap: { [x: string]: TaskType} | undefined
  
  /* 地图对象 */
  private AMap: any = null
  /* 是否显示人员卡片信息 */
  private isShowUserCard: boolean = false
  /* 地图的id */
  private mapId: string = 'TaskAllotUserMapContainer'
  /* 最后一次点击的标记头像 */
  public lastClickedUserMarker: { marker: any, data: TaskAllotUserInfo | null } = { marker: null, data: null }
  /* 用户page */
  public userPage: Page =  new Page({ pageNum: 0 })
  /* 用户标记列表 */
  public userMarkers: any[] = []
  
  /* 客户团队名称列表 */
  get customerTagNames(): string[] {
    return this.customerTags ? this.customerTags.map(tag => tag.tagName || '') : []
  }
  
  /* 负责人选中变化事件 */
  @Emit(TaskAllotUserMapEventEmitEnum.ExecutorChange)
  private selectedExcutorUserChangedHandler(user: TaskAllotUserInfo): TaskAllotUserInfo {
    return user
  }
  
  /** 
   * @description 添加用户标记点击事件
  */
  public bindUserMarkerClickEvent(userMarker: any) {
    userMarker.on(EventNameEnum.Click, (event: any) => {
      /* 如果存在之前标记点击数据 则还原标记 */
      this.lastClickedUserMarker.marker && this.restoreUserMarkerIcon()
      /* 获取用户信息 */
      let user: TaskAllotUserInfo = event.target.getExtData()
      /* 构建大号头像 */
      event.target.setIcon(this.buildUserMarkerIcon(AMap, user, true))
      /* 保存点击标记信息 */
      this.lastClickedUserMarker = {
        marker: event.target,
        data: user
      }
      // 更新选中人员
      this.selectedExcutorUserChangedHandler(user)
      // 显示人员卡片
      this.isShowUserCard = true
    })
  }
  
  /** 
   * @description 构建人员标记
   * @param {Object} amap 高德地图对象
   * @param {Object} infoWindow 高德地图窗口对象
   * @param {Boolean} isSubscription 是否是订阅工单池用户列表
  */
  private buildUserMarkers(): void {
    let userPage = this.userPage
    if (userPage.list.length <= 0) {
      return Log.warn('userPage.list is empty', this.buildUserMarkers.name)
    }
    
    userPage.list.forEach((taskAllotUser: TaskAllotUserInfo) => {
      let user: TaskAllotUserInfo = taskAllotUser
      let { lng, lat } = user
      // 无经纬度
      if (!lng || !lat) return
      
      // 用户标记
      let userMarker = new AMap.Marker({
        position: [Number(lng), Number(lat)],
        title: user.displayName,
        map: this.AMap,
        extData: taskAllotUser,
        icon: this.buildUserMarkerIcon(AMap, user)
      })
      // // 添加标记
      this.userMarkers.push(userMarker)
      // 绑定点击事件
      this.bindUserMarkerClickEvent(userMarker)
    })
  }
  
  /** 
   * @description 构建人员icon
   * @param {*} aMap 高德地图对象
   * @param {TaskAllotUserInfo} user 用户信息
   * @param {Boolean} isLarge 是否是更大的标记
  */
  private buildUserMarkerIcon(aMap: any, user: TaskAllotUserInfo, isLarge: boolean = false) {
    let size = isLarge ? new aMap.Size(52, 52) : new aMap.Size(42, 42)
    
    return (
      new aMap.Icon({
        image: user.head || DefaultHead,
        size,
        imageSize: size
      })
    )
  }
  
  /** 
   * @description 关闭用户卡片
  */
  private closeUserCard() {
    this.isShowUserCard = false
    this.restoreUserMarkerIcon()
  }
  
  /** 
   * @description 构建标记
   * -- 支持外部调用的
  */
  public outdieBuildMarkers(): void {
    // 构建人员标记列表
    this.buildUserMarkers()
  }
  
  /**
   * @description 构建用户标记
   * -- 支持外部调用的
   */
  public outsideBuildeUserMarkers(list: LoginUser[]) {
    if (list.length === 0) {
      this.AMap.remove(this.userMarkers)
      return Log.warn('outsideBuilderMarkers list is empty', this.outsideBuildeUserMarkers.name)
    }
    
    this.userPage.list = list
    // 构建用户标记
    this.buildUserMarkers()
  }
  
  /**
   * @description 设置地图数据
   * -- 支持外部调用的
   */
  public outsideSetMap(AMap: any) {
    this.AMap = AMap
  }
  
  /** 
   * @description 还原地图标记
   * TODO: 
  */
  private restoreUserMarkerIcon() {
    // 
  }
  
  render(h: CreateElement) {
    const basePanelAttrs = {
      on: {
        'update:show': (show: boolean) => {
          this.isShowUserCard = show
        }
      }
    }
    
    return (
      <div class={ComponentNameEnum.TaskAllotUserMap}>
        <task-allot-map 
          ref='TaskAllotMapComponent'
          idName={this.mapId}
          handlerCustomFunc={() => this.outdieBuildMarkers()} 
          setMapFunc={(AMap: any) => this.outsideSetMap(AMap)}
        />
        <div class='task-allot-user-content'>
          <base-panel width='470px' show={this.isShowUserCard} {...basePanelAttrs}>
            <user-card
              customerTagNames={this.customerTagNames}
              emitEventComponentName={ComponentNameEnum.TaskAllotExcutor}
              stateColorMap={this.stateColorMap}
              showSynergyButton={this.isShowSynergy}
              showCustomerManagerIcon={this.isCustomerManager}
              userId={this.selectedExcutorUser?.userId}
              onClose={() => this.closeUserCard()}
            /> 
          </base-panel>
        </div>
      </div>
    )
  }
}

