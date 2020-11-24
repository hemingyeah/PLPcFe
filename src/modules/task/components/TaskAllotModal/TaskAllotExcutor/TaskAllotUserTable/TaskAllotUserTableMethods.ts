/* api */
import { getTaskAllotUserInfo, getTaskAllotDispatchTeamUserList, getTaskDispatchTagList, getTaskRedeployTagList } from '@src/api/TaskApi'
/* computed */
import TaskAllotUserTableComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableComputed'
/* directive */
import Loadmore from '@src/directive/loadmore'
/* enum */
import EelementTableSortOrderEnum from '@model/enum/ElementTableSortOrderEnum'
import EventNameEnum from '@model/enum/EventNameEnum'
import HookEnum from '@model/enum/HookEnum'
import StorageModuleEnum from '@model/enum/StorageModuleEnum'
import StorageKeyEnum from '@model/enum/StorageKeyEnum'
/* entity */
import CustomerAddress from '@model/entity/CustomerAddress'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import Tag from '@model/entity/Tag/Tag'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* interface */
import { DepeMultiUserResult } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* model */
import Page from '@model/Page'
import Column from '@model/types/Column'
import { getTaskAllotUserInfoResult, getTaskTagListResult } from '@model/param/out/Task'
import { MAX_GREATER_THAN__MIN_MESSAGE, REQUIRED_MIN_MESSAGE, REQUIRED_MAX_MESSAGE } from '@src/model/const/Alert'
import { TaskTagListSearchModel } from '@model/param/in/Task'
import { AllotSortedEnum, AllotLocationEnum, TaslAllotTableColumnFieldEnum } from './TaskAllotUserTableModel'
/* util */
import * as _ from 'lodash'
import Platform from '@src/util/platform'
import Log from '@src/util/log.ts'
import { storageGet, storageSet } from '@src/util/storage.ts'
import { isString, isObject, isArray } from '@src/util/type'
import { openTabForTaskView, openTabForCustomerView } from '@src/util/business/openTab'
import { objectArrayIntersection } from '@src/util/array'

declare let AMap: any

const SortedMap: { [x: string]: number } = {
  [TaslAllotTableColumnFieldEnum.Ufinish]: AllotSortedEnum.UnfinishedTask,
  [TaslAllotTableColumnFieldEnum.Finish]: AllotSortedEnum.FinishTaskByToday,
  [TaslAllotTableColumnFieldEnum.Plan]: AllotSortedEnum.PlanTaskByToday,
  [TaslAllotTableColumnFieldEnum.Degree]: AllotSortedEnum.TaskDegreePercentByMonth,
  [TaslAllotTableColumnFieldEnum.LineDistance]: AllotSortedEnum.Distance
}

// @ts-ignore
window.openCustomerViewFunc = function openCustomerViewFunc(customerId: string) {
  openTabForCustomerView(customerId)
}

/** 
 * @description 解析对象
 * -- 临时写的
*/
function parseObject(value: any): any {
  // 是否为数组
  if (isArray(value)) return value.map((item: any) => parseObject(item))
  // 是否字符串
  if (isString(value)) {
    try {
      return JSON.parse(value)
    } catch (error) {
      return value
    }
  }
  // 是否是对象
  if (!isObject(value)) return value
  
  let newValue: any = {}
  
  for(let key in value) {
    let item = value[key]
    newValue[key] = parseObject(item)
  }
  
  return newValue
}

class TaskAllotUserTableMethods extends TaskAllotUserTableComputed {
  /**
   * @deprecated 
   * @description 绑定位置select 点击事件
   * TODO: 可以包装成组件实现 或者是 函数
  */
  public bindLocationSelectClickEvent(): void {
    let className: string = 'task-allot-user-table-location-select-other'
    let minInputEl = document.querySelector(`.${className} .location-min-input .el-input__inner`)
    let maxInputEl = document.querySelector(`.${className} .location-max-input .el-input__inner`)
    let confirmBtntEl = document.querySelector(`.${className} .location-confirm-button`)
    
    const InputEventFunc = (event: Event) => {
      // 阻止事件冒泡
      event.stopPropagation()
    }
    
    // 添加事件
    minInputEl?.addEventListener(EventNameEnum.Click, InputEventFunc)
    maxInputEl?.addEventListener(EventNameEnum.Click, InputEventFunc)
    confirmBtntEl?.addEventListener(EventNameEnum.Click, InputEventFunc)
    
    // 销毁事件
    this.$once(HookEnum.Destroyed, () => {
      minInputEl?.removeEventListener(EventNameEnum.Click, InputEventFunc)
      maxInputEl?.removeEventListener(EventNameEnum.Click, InputEventFunc)
      confirmBtntEl?.removeEventListener(EventNameEnum.Click, InputEventFunc)
    })
  }
  
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
    
    // 解除绑定
    this.$once(HookEnum.Destroyed, () => {
      Loadmore.unbind(scrollEl)
    })

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
    let { lmName, lmPhone, customerAddress, name, id } = this.customer
    customerAddress = new CustomerAddress(customerAddress)
    
    return (
      `
        <div class="map-info-window-content">
          <div class="customer-name" onclick="openCustomerViewFunc('${id}')">${ name }</div>
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
    
    this.userPage.list.forEach((user: TaskAllotUserInfo) => {
      let { lat, lng } = user
      // 无经纬度
      if (!lat && !lng) {
        return console.warn(`${user.displayName} not have lat and lng`)
      }
      
      // 用户标记
      let userMarker = new AMap.Marker({
        position: [Number(lng), Number(lat)],
        title: user.displayName,
        map: this.AMap,
        extData: user,
        content: `<img class='staff-header' width='42' height='42' src='${user.head || DefaultHead}' />`
      })
      
      userMarker.on(EventNameEnum.Click, (event: any) => {
        let user: TaskAllotUserInfo = event.target.getExtData()
        /* 设置负责人信息 */
        this.TaskAllotExcutorComponent.outsideSetSelectedExcutorUser(true, user)
      })
      
      userMarker.on(EventNameEnum.MouseOver, (event: any) => {
        let user: TaskAllotUserInfo = event.target.getExtData()
        if (user.userId !== this.TaskAllotModalComponent?.executorUser?.userId) return
        
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
   * @description 构建列
  */
  public async buildColumns() {
    let localColumns = await this.getDataToStorage(StorageKeyEnum.TaskAllotTableColumns, [])
    if (localColumns.length <= 0) return
    
    let columnMap = localColumns.reduce((acc: any, current: Column) => {
      acc[current.field || ''] = current
      return acc
    }, {})
    
    this.columns = this.columns.map((column: Column) => {
      column.show = columnMap[column.field || '']?.show || false
      column.width = columnMap[column.field || '']?.width || undefined
      return column
    })
  }
  
  /** 
   * @description 构建搜索团队列表参数
  */
  public buildSearchTagParams() {
    return {
      pageSize: 0,
      pageNum: 1,
      keyword: '',
      onlyParent: true,
      customerId: this.customer.id || ''
    }
  }
  
  /** 
   * @description 部门选择人员
  */
  public chooseDepartmentUsers(): void {
    let options = {
      allot: true,
      title: '请选择人员',
      seeAllOrg: true,
      selected: this.selectDeptUsers,
      max: 14
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // 部门人员
        this.selectDeptUsers = result?.data?.users || []
        // 初始化
        this.initialize()
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /**
   * @description 移除部门人员用户
   * -- 支持防抖
  */
  public debouncedRemoveDepartmentUser(user: any) {
    _.debounce(() => {
      this.removeDepartmentUser(user)
    }, 250)()
  }
  
  /**
   * @description 获取地图中心
  */
  public getMapCenter(): Array<number> {
    let { customerAddress } = this
    let { adLatitude, adLongitude } = customerAddress || {}
    let center = []
    
    // 是否为有效地址
    if(customerAddress.validAddress){
      center = [Number(adLongitude), Number(adLatitude)]
    } else{
      // 高德地图不支持国外地址解析，那就手动设置为大首都北京吧
      center = [116.397428, 39.90923]
    }
    
    return center
  }
  
  /** 
   * @description 获取滚动的表格元素
  */
  public getScrollTableEl(): Element | null {
    return document.querySelector('.task-allot-user-table-block .el-table__body-wrapper')
  }
  
  /** 
   * @description 获取位置参数
  */
  public getParamDistance(): number[] {
    let m = 1000
    
    try {
      // 5公里以内
      if (this.selectLocation === AllotLocationEnum.Five) {
        return [0, AllotLocationEnum.Five * m]
      }
      // 10公里以内
      if (this.selectLocation === AllotLocationEnum.Ten) {
        return [0, AllotLocationEnum.Ten * m]
      }
      // 20公里以内
      if (this.selectLocation === AllotLocationEnum.Twenty) {
        return [0, AllotLocationEnum.Twenty * m]
      }
      // 50公里以内
      if (this.selectLocation === AllotLocationEnum.Fifty) {
        return [0, AllotLocationEnum.Fifty * m]
      }
      
      // 其他
      return [Number(this.locationOtherData.minValue) * m, Number(this.locationOtherData.maxValue) * m]
      
    } catch (error) {
      console.error('TaskAllotUserTableMethods -> err', error)
      return [0, AllotLocationEnum.Fifty * m]
    }
    
  }
  
  /** 
   * @description 获取团队列表
  */
  public fetchTagList(params: TaskTagListSearchModel) {
    // TODO: 指派 转派需要区分
    let fetchTagListFunc = getTaskDispatchTagList
    
    params.customerId = this.customer.id || ''
    
    return (
      fetchTagListFunc(params)
        .then((data: getTaskTagListResult) => {
          return data
        })
        .catch((err: any) => {
          console.log(err)
        })
    )
  }
  
  /** 
   * @description 获取用户列表
   * -- 内部调用的
  */
  public fetchUsers(): Promise<any> {
    if (this.isDisableLoadmore) return Promise.resolve()
    
    Log.succ(Log.Start, this.fetchUsers.name)
    
    let distance = this.getParamDistance()
    let users: LoginUser[] = this.isAllotByTag ? this.selectTeamUsers : this.selectDeptUsers
    let orderDetail: any = (
      Object.keys(this.orderDetail).length > 0 
        ? this.orderDetail
        : { code: this.selectSortord, order: true  }
    )
    let params = {
      order: orderDetail.order,
      code: orderDetail.code,
      customerId: this.customer.id || '',
      lat: Number(this.customerAddress.adLatitude),
      lng: Number(this.customerAddress.adLongitude),
      pageNum: ++this.userPage.pageNum,
      pageSize: this.userPage.pageSize,
      startDistance: String(distance[0]),
      endDistance: String(distance[1]),
      states: this.selectUserState,
      tagIds: this.selectTeams.map(team => (team.id || '')),
      userIds: users.map(user => user.userId)
    }
    
    return (
      getTaskAllotUserInfo(params).then((data: getTaskAllotUserInfoResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          return Platform.alert(data.message)
        }
        // 解析数据
        data.result?.list ? data.result.list = parseObject(data.result.list) : null
        // 合并数据
        this.userPage.merge(data.result || {})
        // key : userId(string) -> value: boolean
        this.userPageCheckedMap = (
          this.userPage.list
            .reduce((acc: {[x: string]: boolean}, cur: LoginUser) => {
              // @ts-ignore
              acc[cur.userId] = false
              return acc
            }, {})
        )
        
        this.isDisableLoadmore = !(data.result.hasNextPage)
        // this.bindTableScrollEvent()

        Log.succ(Log.End, this.fetchUsers.name)
      })
    )
  }
  
  /** 
   * @description 获取团队人员列表
  */
  public fetchTeamUsers(selectParams: { keyword: string, pageNum: number, pageSize: number }): Promise<any> {
    Log.succ(Log.Start, this.fetchTeamUsers.name)
    
    this.teamUserPage = new Page()
    
    let { customerAddress } = this
    let { adLatitude = '', adLongitude = '' } = customerAddress || {}
    let params = {
      customerId: this.customer?.id || '',
      keyword: selectParams.keyword,
      lat: Number(adLatitude),
      lng: Number(adLongitude),
      pageNum: selectParams.pageNum,
      tagId: this.selectTeams ? this.selectTeams.map(team => team.id).join(',') : ''
    }
    // TODO: 区分指派 转派
    let fetchTeamUsersFunc = getTaskAllotDispatchTeamUserList
    
    return (
      fetchTeamUsersFunc(params)
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
   * @description 从缓存获取数据
  */
  public async getDataToStorage(key: string, data: any) {
    return await storageGet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description 选择团队变化事件
  */
  public handlerTeamChange(value: Tag[]): void {
    Log.succ(Log.Start, this.handlerTeamChange.name)
    
    this.selectTeams = value
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
  public handlerLocationChange(value: number): void {
    Log.succ(Log.Start, this.handlerLocationChange.name)
    
    this.selectLocation = value
    this.initialize()
  }
  
  /**
   * @description 选择距离其他 事件
  */
  public handlerLocationOtherChange() {
    let { minValue, maxValue } = this.locationOtherData
    let minValueIsNull = minValue == null
    let maxValueIsNull = maxValue == null
    
    // 效验
    // @ts-ignore
    let validated = minValueIsNull || maxValueIsNull || Boolean(maxValue > minValue)
    this.locationOtherData.isChecked = validated
    
    // 最小值提示
    if (minValueIsNull) {
      return Platform.alert(REQUIRED_MIN_MESSAGE)
    }
    // 最大值提示
    if (maxValueIsNull) {
      return Platform.alert(REQUIRED_MAX_MESSAGE)
    }
    // 最大值大于最小值提示
    if (!validated) {
      return Platform.alert(MAX_GREATER_THAN__MIN_MESSAGE)
    }
    // 失焦 ，隐藏select下拉框
    // @ts-ignore
    this.$refs.TaskAllotTableLocaionSelect.blur()
    this.selectLocation = Number(this.locationOptions[this.locationOptions.length - 1].value)
    
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
   * @description 表格拖动事件
  */
  public handlerHeaderDragend(newWidth: number, oldWidth: number, tableColumn: any = {}) {
    let field: string = tableColumn.property || ''
    let column: Column | null = null
    
    for (let i = 0; i < this.columns.length; i++) {
      column = this.columns[i]
      if (column.field === field) {
        column.width = newWidth
      }
    }
    
    const columns = this.simplifyTableColumsProperty(this.columns)
    this.saveDataToStorage(StorageKeyEnum.TaskAllotTableColumns, columns)
  }
  
  /** 
   * @description 排序变化
  */
  public handlerTableSortChanged(option: { prop?: any, order?: any } = {}) {
    const { prop, order } = option
    if (!order) {
      this.orderDetail = {}
      this.selectSortord = AllotSortedEnum.Distance
      return this.initialize()
    }
    
    let isDescending: boolean = order === EelementTableSortOrderEnum.DESC
    
    let orderDetail = {
      order: !isDescending,
      code: SortedMap[prop],
    }
    
    this.orderDetail = orderDetail
    this.selectSortord = null
    this.initialize()
  }
  
  /**
   * @description 选择排序方式事件
  */
  public handlerSortordChange(value: number): void {
    Log.succ(Log.Start, this.handlerSortordChange.name)
    
    // @ts-ignore
    // 清空表格排序
    this.$refs.TaskAllotUserTable?.clearSort()
    this.orderDetail = {}
    // 赋值
    this.selectSortord = value
    // 保存
    this.saveDataToStorage(StorageKeyEnum.TaskAllotTableSort, value)
    // 初始化
    this.initialize()
  }
  
  /** 
   * @description 设置负责人checkbox 变化
  */
  public handlerExcutorCheckedChange(checked: boolean, row: TaskAllotUserInfo): void {
    let userId: string = row.userId || ''
    
    for (let key in this.userPageCheckedMap) {
      let isChecked: boolean = checked && key == userId
      this.userPageCheckedMap[key] = isChecked
    }
    /* 设置负责人信息 */
    this.selectExecutorUser = row
    this.TaskAllotExcutorComponent.outsideUpwardSetSelectedExcutorUser(checked, row)
    /* 地图联动 */
    if (row.lng && row.lat) {
      this.AMap.setZoomAndCenter(16, [row.lng, row.lat])
    }
  }
  
  /**
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    this.userPage = new Page({ pageNum: 0 })
    this.isDisableLoadmore = false
    this.changePending && this.changePending(true)
    
    this.fetchUsers()
      .then(() => {
        this.mapInit()
      })
      .catch((err: any) => {
        console.error(err)
      })
      .finally(() => {
        this.changePending && this.changePending(false)
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
   * @description 匹配服务团队
  */
  public async matchTags(): Promise<void> {
    try {
      if (!this.isAllotByTag && !this.allotByExclusiveTag) return
      
      let searchTagParams = this.buildSearchTagParams()
      let result: any = await this.fetchTagList(searchTagParams) || {}
      // 团队列表
      let tagList: Tag[] = result.list || []
      // 客户团队列表
      let customerTags: Tag[] = this.customer.tags || []
      let tags: Tag[] = []
      
      // 按客户服务团队派单 取可见团队
      if (this.allotByExclusiveTag) {
        tags = tagList
      }
      // 按服务团队派单 取可见团队和客户团队的交集
      else if (this.isAllotByTag) {
        tags = objectArrayIntersection<Tag, Tag>(customerTags, tagList)
      }
      
      this.selectTeams = tags
      
    } catch (error) {
      console.warn('TaskAllotUserTableMethods -> matchTags -> error', error)
    }
  }
  
  /** 
   * @description 获取用户列表
   * -- 支持外部调用的
  */
  public async outsideFetchUsers(): Promise<void> {
    Log.succ(Log.Start, this.outsideFetchUsers.name)
    
    await this.matchTags()
    this.initialize()
  }
  
  /** 
   * @description 清除负责人信息
   * -- 支持向上的外部调用的方法
  */
  public outsideUpwardClearExcutorUser() {
    this.handlerExcutorCheckedChange(false, this.selectExecutorUser)
  }
  
  /**
   * @description 移除部门人员用户
  */
  public removeDepartmentUser(user: LoginUser) {
    this.selectDeptUsers = (
      this.selectDeptUsers
      .filter((departmentUser: LoginUser) => {
        return departmentUser.userId !== user.userId
      })
    )
    
    this.initialize()
  }
  
  /** 
   * @description 还原排序方式数据
  */
  public async revertSort() {
    this.selectSortord = await this.getDataToStorage(StorageKeyEnum.TaskAllotTableSort, AllotSortedEnum.Distance)
  }
  
  /**
   * @description 保存数据到缓存
  */
  public saveDataToStorage(key: string, data: any) {
    // TODO: loginUser Id
    storageSet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description 保存指派表格列
  */
  public saveTaskAllotTableColumn(value: { type: string, data: any[] }) {
    let columns = value.data || []
    let columnMap = columns.reduce(
      (acc, col) => (acc[col.field] = col) && acc,
      {}
    )
    
    this.columns = this.columns.map((column: Column) => {
      let newCol = columnMap[column.field || ''] || {}
      
      column.show = newCol.show
      column.width = newCol.width
      
      return column
    })
    
    const showColumns = this.simplifyTableColumsProperty(this.columns)
    
    this.saveDataToStorage(StorageKeyEnum.TaskAllotTableColumns, showColumns)
  }
  
  /* 精简列属性 */
  simplifyTableColumsProperty(columns: Column[]): Column[] {
    return (
      columns.map((column: Column) => ({
        field: column.field,
        show: column.show,
        width: column.width
      }))
    )
  }
  
  /** 
   * @description 显示高级设置 选择列
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
