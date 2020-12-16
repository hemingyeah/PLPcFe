/* components */
import TaskAllotMap from '@src/modules/task/components/TaskAllotModal/TaskAllotMap/TaskAllotMap.tsx'
/* entity */
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* model */
import Page from '@model/Page'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.scss'
/* vue */
import VC from '@model/VC'
import { Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import Log from '@src/util/log.ts'

declare let AMap: any

@Component({ 
  name: ComponentNameEnum.TaskAllotUserMap,
  components: {
    TaskAllotMap
  }
})
export default class TaskAllotUserMap extends VC {
  
  /* 地图对象 */
  private AMap: any = AMap
  /* 地图的id */
  private mapId: string = 'TaskAllotUserMapContainer'
  /* 用户page */
  public userPage: Page =  new Page({ pageNum: 0 })
  /* 用户标记列表 */
  public userMarkers: any[] = []
  
  /** 
   * @description 构建标记
  */
  private buildMarkers(): void {
    // 构建人员标记列表
    this.buildUserMarkers()
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
    })
  }
  
  /** 
   * @description 构建人员icon
   * @param {*} aMap 高德地图对象
   * @param {TaskAllotUserInfo} user 用户信息
   * @param {Boolean} isLarge 是否是更大的标记
  */
  public buildUserMarkerIcon(aMap: any, user: TaskAllotUserInfo, isLarge: boolean = false) {
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
   * @description 构建用户标记
   * -- 支持外部调用的
   */
  public outsideBuildeUserMarkers(list: LoginUser[]) {
    if (list.length === 0) {
      this.AMap.remove(this.userMarkers)
      return Log.warn('outsideBuilderMarkers list is empty', this.outsideBuildeUserMarkers.name)
    }
    
    this.userPage.list = list
    this.buildUserMarkers()
  }
  
  /**
   * @description 设置地图数据
   * -- 支持外部调用的
   */
  public outsideSetMap(AMap: any) {
    this.AMap = AMap
  }
  
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotUserMap}>
        <task-allot-map 
          ref='TaskAllotUserMap'
          idName={this.mapId}
          handlerCustomFunc={() => this.buildMarkers()} 
          setMapFunc={(AMap: any) => this.outsideSetMap(AMap)}
        />
      </div>
    )
  }
}

