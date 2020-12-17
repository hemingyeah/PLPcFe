/* vue */
import { Vue, Component, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* entity */
import Customer from '@model/entity/Customer'
import TaskAddress from '@model/entity/TaskAddress'
import CustomerAddress from '@model/entity/CustomerAddress'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import EventNameEnum from '@model/enum/EventNameEnum'
/* util */
import { findComponentUpward } from '@src/util/assist'
import Log from '@src/util/log.ts'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotMap/TaskAllotMap.scss'

declare let AMap: any

@Component({ 
  name: ComponentNameEnum.TaskAllotMap
})
export default class TaskAllotMap extends Vue {
  
  // 地图 id
  @Prop() readonly idName: string | undefined
  // 自定义事件
  @Prop() readonly handlerCustomFunc: Function | undefined
  
  /* 地图对象 */
  private AMap: any = null
  /* 地图弹窗对象 */
  private AMapInfoWindow: any = null
  
  /* 工单派单组件 */
  private get TaskAllotModalComponent() {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* 客户 */
  private get customer(): Customer {
    // 默认是获取的工单派单组件的，如需自定义 需要自己写
    return this.TaskAllotModalComponent.customer || {}
  }
  
  /* 工单 */
  private get task(): any {
    // 默认是获取的工单派单组件的，如需自定义 需要自己写
    return this.TaskAllotModalComponent.task || {}
  }
  
  /**
   * @description 工单客户地址地址 
   * 工单新建后地址信息在taddress里面，新建的信息在address里面
  */
  get taskAddress(): TaskAddress {
    return new TaskAddress(this.task.taddress || this.task.address || {})
  }
  
  /** 
   * @description 构建客户地址标记
  */
  private buildCusomterAddressMarker(): void {
    let { validAddress } = this.taskAddress
    if (!validAddress) {
      return Log.warn('taskAddress.validAddress is false', this.buildCusomterAddressMarker.name)
    }
    
    // 添加自定义点标记
    let customerAddressMarker = new AMap.Marker({
      map: this.AMap,
      // 基点位置
      position: this.getMapCenter(),
      // 相对于基点的偏移位置
      offset: new AMap.Pixel(-17, -42),
      // 自定义点标记覆盖物内容
      content: this.buildCustomerAddressMapMarkerContent()
    })
    
    // 鼠标悬停 显示客户信息
    customerAddressMarker.on(EventNameEnum.MouseOver, (event: any) => {
      this.AMapInfoWindow = new AMap.InfoWindow({
        closeWhenClickMap: true,
        isCustom: true,
        offset: new AMap.Pixel(0, -34),
        content: this.buildCustomerAddressMapMarkerInfo()
      })
      
      this.AMapInfoWindow.open(this.AMap, event.target.getPosition())
    })
  }

  /**
   * @description 构建客户地址标记内容
  */
  private buildCustomerAddressMapMarkerContent(): string {
    return '<i class="bm-location-dot"></i><div class="map-address-title">客户地址</div>';
  }
  
  /**
   * @description 构建客户地址标记内容
  */
  private buildCustomerAddressMapMarkerInfo(): string {
    let { tlmName = '', tlmPhone = '' } = this.task
    let { name = '', id = ''} = this.task?.customer
    let { taskAddress } = this
    
    return (
      `
        <div class="map-info-window-content">
          <div class="customer-name" onclick="openCustomerViewFunc('${id}')">${ name }</div>
          <p><label>联系人：</label>${ tlmName }</p>
          <p><label>电话：</label>${ tlmPhone }</p>
          <p><label>地址：</label>${ taskAddress?.toString() }</p>
          <div class="info-window-arrow"></div>
        </div>
      `
    )
  }
  
  /**
   * @description 获取地图中心
  */
  private getMapCenter(): Array<number> {
    let { taskAddress } = this
    let { latitude, longitude } = taskAddress
    let center = []
    
    // 是否为有效地址
    if (taskAddress.validAddress) {
      center = [Number(longitude), Number(latitude)]
    } else {
      // 高德地图不支持国外地址解析，那就手动设置为大首都北京吧
      center = [116.397428, 39.90923]
    }
    
    return center
  }
  
  /**
   * @description 地图初始化事件
  */
  private mapInit(): void {
    if (!this.idName) {
      return Log.error('TaskAllotMap component props idName is empty', this.mapInit.name)
    }
    
    Log.succ(Log.Start, this.mapInit.name)
    
    this.AMap = new AMap.Map(this.idName, {
      resizeEnable: true,
      center: this.getMapCenter(),
      zoom: 10
    })
    
    // 构建客户地址标记
    this.buildCusomterAddressMarker()
    
    // 自定义操作
    this.handlerCustomFunc && this.handlerCustomFunc(this.AMap, this.AMapInfoWindow)
    
    Log.succ(Log.End, this.mapInit.name)
  }
  
  /**
   * @description 地图初始化事件
   * -- 支持外部调用的
  */
  public outsideMapInit() {
    this.mapInit()
  }
  
  mounted() {
    this.mapInit()
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotMap}>
        <div id={this.idName}></div>
      </div>
    )
  }
  
}

