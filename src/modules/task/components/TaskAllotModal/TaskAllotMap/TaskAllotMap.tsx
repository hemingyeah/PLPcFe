/* vue */
import { Vue, Component, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* entity */
import Customer from '@model/entity/Customer'
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
  
  /* 客户地址 */
  private get customerAddress(): CustomerAddress {
    return this.customer.customerAddress || new CustomerAddress()
  }
  
  /** 
   * @description 构建客户地址标记
  */
  private buildCusomterAddressMarker(): void {
    let { validAddress } = this.customerAddress
    if (!validAddress) {
      return Log.warn('customerAddress.validAddress is false', this.buildCusomterAddressMarker.name)
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
    let { lmName, lmPhone, customerAddress, name } = this.customer
    customerAddress = new CustomerAddress(customerAddress)
    
    return (
      `
        <div class="map-info-window-content">
          <div class="customer-name">${ name }</div>
          <p><label>联系人：</label>${ lmName }</p>
          <p><label>电话：</label>${ lmPhone }</p>
          <p><label>地址：</label>${ customerAddress?.toString() }</p>
          <div class="info-window-arrow"></div>
        </div>
      `
    )
  }
  
  /**
   * @description 获取地图中心
  */
  private getMapCenter(): Array<number> {
    let { customerAddress } = this
    let { adLatitude, adLongitude } = customerAddress
    let center = []
    
    // 是否为有效地址
    if(customerAddress.validAddress){
      center = [adLatitude, adLongitude]
    } else{
      // 高德地图不支持国外地址解析，那就手动设置为大首都北京吧
      center = [116.397428, 39.90923]
    }
    
    // return center as Array<number>
    return [116.397428, 39.90923]
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

