/* api */
import { getTaskAllotDispatchTeamUserList, getTaskDispatchTagList, getTaskRedeployTagList, getTaskAllotRedeployTeamUserList } from '@src/api/TaskApi'
/* computed */
import TaskAllotUserTableComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableComputed'
/* decorators */
import Log from '@src/decorators/LogDecorators'
/* enum */
import EventNameEnum from '@model/enum/EventNameEnum'
import StorageModuleEnum from '@model/enum/StorageModuleEnum'
import StorageKeyEnum from '@model/enum/StorageKeyEnum'
/* entity */
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
import { getTaskTagListResult } from '@model/param/out/Task'
import { MAX_GREATER_THAN__MIN_MESSAGE, REQUIRED_MIN_MESSAGE, REQUIRED_MAX_MESSAGE } from '@src/model/const/Alert'
import { TaskTagListSearchModel } from '@model/param/in/Task'
import {
  AllotSortedEnum
} from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* util */
import Platform from '@src/util/platform'
import LogUtil from '@src/util/log.ts'
import { storageGet } from '@src/util/storage.ts'
import { openTabForCustomerView } from '@src/util/business/openTab'
import { objectArrayIntersection } from '@src/util/array'

declare let AMap: any

const OrderMap: { [x: number]: boolean } = {
  [AllotSortedEnum.Distance]: true,
  [AllotSortedEnum.TaskDegreePercentByMonth]: false,
  [AllotSortedEnum.TaskWorkUsedTimeByMonth]: true,
  [AllotSortedEnum.ExecutorTaskByMonth]: false,
  [AllotSortedEnum.TaskAcceptTimeByMonth]: true,
  [AllotSortedEnum.FinishTaskByMonth]: false
}

// @ts-ignore
window.openCustomerViewFunc = function openCustomerViewFunc(customerId: string) {
  openTabForCustomerView(customerId)
}

/* TODO: 拆分，之前放在一起了 */
class TaskAllotUserTableMethods extends TaskAllotUserTableComputed {
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
      /* 设置负责人信息 */
      this.TaskAllotExcutorComponent?.outsideSetSelectedExcutorUser(true, user)
      /* 保存点击标记信息 */
      this.lastClickedUserMarker = {
        marker: event.target,
        data: user
      }
    })
  }
  
  /** 
   * @description 添加用户标记鼠标悬浮事件
  */
  public bindUserMarkerMouseOverEvent(userMarker: any) {
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
   * @description 获取滚动的表格元素
  */
  public getScrollTableEl(): Element | null {
    return document.querySelector('.task-allot-user-table-block .el-table__body-wrapper')
  }
  
  /** 
   * @description 获取排序参数
  */
  public getParamOrderDetail(): { order: boolean, code: number } {
    let orderDetail: any = (
      Object.keys(this.orderDetail).length > 0 
        ? this.orderDetail
        : {
          code: this.selectSortord,
          order: OrderMap[this.selectSortord] === undefined ? true : OrderMap[this.selectSortord]
        }
    )
    
    return orderDetail
  }
  
  /** 
   * @description 获取团队列表
  */
  public fetchTagList(params: TaskTagListSearchModel) {
    // 指派 转派需要区分
    let fetchTagListFunc = this.isReAllot ? getTaskRedeployTagList : getTaskDispatchTagList
    
    params.customerId = this.customer.id || ''
    
    LogUtil.info(params, this.fetchTagList.name, this.fetchTagList.name)
    
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
    return Promise.resolve()
  }
  
  /** 
   * @description 获取团队人员列表
  */
  public fetchTeamUsers(selectParams: { keyword: string, pageNum: number, pageSize: number }): Promise<any> {
    LogUtil.succ(LogUtil.Start, this.fetchTeamUsers.name)
    
    this.teamUserPage = new Page()
    
    let { taskAddress } = this
    let { latitude = null, longitude = null } = taskAddress || {}
    let params = {
      customerId: this.customer?.id || '',
      keyword: selectParams.keyword,
      lat: latitude,
      lng: longitude,
      pageNum: selectParams.pageNum,
      tagId: this.selectTeams ? this.selectTeams.map(team => team.id).join(',') : ''
    }
    // 区分指派 转派
    let fetchTeamUsersFunc = this.isReAllot ? getTaskAllotRedeployTeamUserList : getTaskAllotDispatchTeamUserList
    
    return (
      fetchTeamUsersFunc(params)
        .then((result = {}) => {
          this.teamUserPage.merge(result)
          
          LogUtil.succ(LogUtil.End, this.fetchTeamUsers.name)
          
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
   * @description 选择距离变化事件
  */
  public handlerLocationChange(value: number): void {
    LogUtil.succ(LogUtil.Start, this.handlerLocationChange.name)
    
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
    LogUtil.succ(LogUtil.Start, this.handlerUserStateChange.name)
    
    this.selectUserState = value
    this.initialize()
  }
  
  /** 
   * @description 表格拖动事件
  */
  public handlerHeaderDragend(newWidth: number, oldWidth: number, tableColumn: any = {}) {
    LogUtil.succ(LogUtil.Start, this.handlerHeaderDragend.name)
    this.dragendFunc && this.dragendFunc(newWidth, oldWidth, tableColumn)
  }
  
  /** 
   * @description 选择排序方式变化事件
  */
  public handlerTableSortChanged(option: { prop?: any, order?: any } = {}) {
    LogUtil.succ(LogUtil.Start, this.handlerTableSortChanged.name)
    this.sortChangeFunc && this.sortChangeFunc(option)
  }
  
  /** 
   * @description 设置负责人checkbox 变化
  */
  @Log()
  public handlerExcutorCheckedChange(checked: boolean, row: TaskAllotUserInfo): void {
    /* 设置负责人信息 */
    this.TaskAllotExcutorComponent?.outsideUpwardSetSelectedExcutorUser(checked, row)
  }
  
  /**
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    LogUtil.succ(LogUtil.Start, this.initialize.name)
    
    this.userPage = new Page({ pageNum: 0 })
    this.changePending && this.changePending(true)
    
    this.fetchUsers()
      .catch((err: any) => {
        console.error(err)
      })
      .finally(() => {
        this.changePending && this.changePending(false)
      })
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
      
      this.visibleTeams = tags
      
      LogUtil.info(this.visibleTeams.slice(), 'visibleTeams', this.matchTags.name)
      
    } catch (error) {
      LogUtil.error(error, this.matchTags.name)
    }
  }
  
  /** 
   * @description 还原用户标记
   * -- 支持外部调用的
  */
  public outsideRestoreUserMarkerIcon() {
    this.restoreUserMarkerIcon()
  }
  
  /** 
   * @description 设置工单指派人员列表信息
   * -- 支持向上的外部调用的方法
  */
  public outsideSetUserPage(userList: TaskAllotUserInfo[]) {
    this.taskAllotUserList = userList
  }
  
  /** 
   * @description 还原排序方式数据
  */
  public async revertSort() {
    this.selectSortord = await this.getDataToStorage(StorageKeyEnum.TaskAllotTableSort, AllotSortedEnum.FinishTaskByMonth)
  }
  
  /** 
   *  @description 还原之前点击的用户标记
  */
  public restoreUserMarkerIcon() {
    let { marker, data } = this.lastClickedUserMarker
    if (!marker || !data) return
    
    marker.setIcon(this.buildUserMarkerIcon(AMap, data))
  }
  
}

export default TaskAllotUserTableMethods
