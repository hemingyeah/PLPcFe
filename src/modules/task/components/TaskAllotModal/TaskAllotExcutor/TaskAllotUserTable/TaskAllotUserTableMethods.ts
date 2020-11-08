/* api */
import { getUserListByTag, getTaskAllotTeamUserList } from '@src/api/TaskApi'
/* computed */
import TaskAllotUserTableComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableComputed'
/* directive */
import Loadmore from '@src/directive/loadmore'
/* enum */
import EventNameEnum from '@model/enum/EventNameEnum'
/* entity */
import CustomerAddress from '@model/entity/CustomerAddress'
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* model */
import Page from '@model/Page'
import { getUserListByTagResult } from '@model/param/out/Task'
/* util */
import Log from '@src/util/log.ts'

declare let AMap: any

class TaskAllotUserTableMethods extends TaskAllotUserTableComputed {
  
  /** 
   * @description 绑定表格滚动事件
  */
  public bindTableScrollEvent(): void {
    // 滚动元素
    let scrollEl = this.getScrollTableEl()
    // 绑定
    Loadmore.bind(
      scrollEl,
      { 
        value: {
          distance: 10,
          disabled: this.isDisableLoadmore,
          callback: () => this.fetchUsers()
        } 
      }
    )
  }
  
  /** 
   * @description 构建客户地址标记
  */
  public buildCusomterAddressMarker(): void {
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
  public buildCustomerAddressMapMarkerContent(): string {
    return '<i class="bm-location-dot"></i><div class="map-address-title">客户地址</div>';
  }
  
  /**
   * @description 构建客户地址标记内容
  */
  public buildCustomerAddressMapMarkerInfo(): string {
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
   * 构建人员标记
  */
  public buildUserMarkers(): void {
    if (this.userPage.list.length <= 0) {
      return Log.warn('userPage.list is empty', this.buildUserMarkers.name)
    }
    
    this.userPage.list.forEach((user: LoginUser) => {
      let { longitude, latitude } = user
      // 无经纬度
      if (!longitude && !latitude) return
      
      // 用户标记
      let userMarker = new AMap.Marker({
        position: [longitude, latitude],
        title: user.displayName,
        map: this.AMap,
        extData: user,
        content: `<img class='staff-header' width='42' height='42' src='${user.head || DefaultHead}' />`
      })
      
      userMarker.on(EventNameEnum.Click, (event: any) => {
        let user: LoginUser = event.target.getExtData()
        /* 设置负责人信息 */
        this.TaskAllotExcutorComponent.outsideSetSelectedExcutorUser(true, user)
      })
      
      userMarker.on(EventNameEnum.MouseOver, (event: any) => {
        let user: LoginUser = event.target.getExtData()
        if (user.userId !== this.TaskAllotExcutorComponent.selectedExcutorUser.userId) return
        
        let infoWindow = new AMap.InfoWindow({
          closeWhenClickMap: true,
          isCustom: true,
          offset: new AMap.Pixel(0, -34),
          content: '<div class="task-allot-map-excutor-window">负责人</div>'
        })
        
        infoWindow.open(this.AMap, event.target.getPosition())
      })
      
    })
  }
  
  /**
   * @description 获取地图中心
  */
  public getMapCenter(): Array<number> {
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
   * @description 获取滚动的表格元素
  */
  getScrollTableEl(): Element | null {
    return document.querySelector('.task-allot-user-table-block .el-table__body-wrapper')
  }
  
  /** 
   * @description 获取用户列表
   * -- 内部调用的
  */
  public fetchUsers(): Promise<any> {
    Log.succ(Log.Start, this.fetchUsers.name)
    
    let params = {
      pageNum: this.userPage.pageNum,
      pageSize: this.userPage.pageSize,
      customerId: this.customer.id || '',
      lat: String(this.customerAddress.adLatitude) || '',
      lng: String(this.customerAddress.adLongitude) || '',
      tagId: this.selectTeams.map(team => team.id).join()
    }
    
    return (
      getUserListByTag(params).then((result: getUserListByTagResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        this.userPage.list = this.userPage.list.concat(result.data || [])
        
        // key : userId(string) -> value: boolean
        this.userPageCheckedMap = (
          this.userPage.list
            .reduce((acc: {[x: string]: boolean}, cur: LoginUser) => {
              // @ts-ignore
              acc[cur.userId] = false
              return acc
            }, {})
        )
        
        Log.succ(Log.End, this.fetchUsers.name)
      })
    )
  }
  
  /** 
   * @description 获取团队人员列表
  */
  public fetchTeamUsers(): Promise<any> {
    Log.succ(Log.Start, this.fetchTeamUsers.name)
    
    this.teamUserPage = new Page()
    
    let { customerAddress } = this
    let { adLatitude = '', adLongitude = '' } = customerAddress || {}
    let params = {
      customerId: this.customer?.id,
      keyword: '',
      lat: adLatitude,
      lng: adLongitude,
      pageNum: this.teamUserPage.pageNum,
      tagId: this.selectTeams ? this.selectTeams.map(team => team.id).join(',') : ''
    }
    
    return (
      getTaskAllotTeamUserList(params)
        .then((result = {}) => {
          this.teamUserPage.merge(result)
          
          Log.succ(Log.End, this.fetchTeamUsers.name)
          
          result.list = result.list.map((user: LoginUser) =>
            Object.freeze({
              label: user?.displayName || '',
              value: user?.userId || '',
              ...user
          }))
          
          return result

        })
        .catch(error => {
          console.error(error)
        })
    )
  }
  
  /**
   * @description 选择团队变化事件
  */
  public handlerTeamChange(): void {
    Log.succ(Log.Start, this.handlerTeamChange.name)
    
    this.initialize()
  }
  
  /**
   * @description 选择团队成员变化事件
  */
  public handlerTeamUsersChange(users: any[]): void {
    Log.succ(Log.Start, this.handlerTeamUsersChange.name)
    
    this.selectTeamUsers = users
    this.initialize()
  }
  
  /**
   * @description 选择距离变化事件
  */
  public handlerLocationChange(value: string): void {
    Log.succ(Log.Start, this.handlerLocationChange.name)
    
    this.selectLocation = value
    this.initialize()
  }
  
  /**
   * @description 选择用户工作状态事件
  */
  public handlerUserStateChange(value: string[]): void {
    Log.succ(Log.Start, this.handlerUserStateChange.name)
    
    this.selectUserState = value
    this.initialize()
  }
  
  /**
   * @description 选择排序方式事件
  */
  public handlerSortordChange(value: string): void {
    Log.succ(Log.Start, this.handlerSortordChange.name)
    
    this.selectSortord = value
    this.initialize()
  }
  
  /** 
   * @description 设置负责人checkbox 变化
  */
  public handlerExcutorCheckedChange(checked: boolean, row: any): void {
    let userId: string = row.userId || ''
    
    for (let key in this.userPageCheckedMap) {
      let isChecked: boolean = checked && key == userId
      this.userPageCheckedMap[key] = isChecked
    }
    /* 设置负责人信息 */
    this.TaskAllotExcutorComponent.outsideSetSelectedExcutorUser(checked, row)
  }
  
  /**
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    this.userPage = new Page()
    this.isDisableLoadmore = false
    
    this.fetchUsers().then(() => {
      this.mapInit()
    })
  }
  
  /**
   * @description 地图初始化事件
  */
  public mapInit(): void {
    Log.succ(Log.Start, this.mapInit.name)
    
    this.AMap = new AMap.Map('MapContainer', {
      resizeEnable: true,
      center: this.getMapCenter(),
      zoom: 10
    })
    
    // 构建客户地址标记
    this.buildCusomterAddressMarker()
    
    // 构建人员标记
    this.buildUserMarkers()
    
    Log.succ(Log.End, this.mapInit.name)
  }
  
  /** 
   * @description 获取用户列表
   * -- 支持外部调用的
  */
  public outsideFetchUsers(): void {
    Log.succ(Log.Start, this.outsideFetchUsers.name)
    
    this.initialize()
  }
  
  /** 
   * @description 显示高级设置 选择里
  */
  public showAdvancedSetting(): void {
    this.BaseTableAdvancedSettingComponent.open(this.columns)
  }
  
  /** 
   * @description 解绑表格滚动事件
  */
  public unBindTableScrollEvent() {
    // 滚动元素
    let scrollEl = this.getScrollTableEl()
    // 绑定
    Loadmore.unbind(scrollEl)
  }
}

export default TaskAllotUserTableMethods
