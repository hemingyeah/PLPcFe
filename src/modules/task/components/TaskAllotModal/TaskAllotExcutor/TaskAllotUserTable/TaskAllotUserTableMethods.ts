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
    if(this.justGuide){
      return Promise.resolve({"pageNum":1,"pageSize":10,"size":5,"orderBy":"","startRow":1,"endRow":5,"total":5,"pages":1,"list":[{"userId":"c3cc9ac4-45e7-11eb-9baf-00163e0d174e","loginName":"缘启","displayName":"缘启","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":"lHv91JKOLUn10frZoVMZeQJ9YVPkszQAOHRZrs7POrAYZxxD1JWsQftLbURU7DZL8aAgN5BTnmhLTX8tLrSCdCczohJ3X0X5VPUFyjiGrHJf4f8MIlMV4mjXTJOBEeSk","head":"https://static-legacy.dingtalk.com/media/lADPGo_k79cLTE_NA__NAxg_792_1023.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{},"openid":"$:LWCP_v1:$J/XQLdeCXOStVRehq2v2Ug==","longitude":null,"latitude":null,"isDelete":0,"synOpenid":"authorized","staffId":"04353241221030167","tenantId":"2fe245f4-31f0-11ea-9ddd-00163e0f1a1b","mainTeamId":"fbbd4dc1-4979-11eb-9baf-00163e0d174e","unfinishedTask":0,"todayFinishedTask":0,"state":"工作中","cusDistance":null,"wechat":"0","superAdmin":0,"isTeamLeader":0},{"userId":"59a6f69f-3f7c-11eb-9baf-00163e0d174e","loginName":"浩克","displayName":"浩克","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":"ojvGRRNBNeCM1cLGm3iAhRbjoxzrEVZt5GHd3PbzgyHAXMdKBK4IzM61IiGC1TfavQvKJ9bcKI3T6O63KY4lde6HMCA99irqaTUpYf4MsnMXTazt4ZzmQzUmG6NTvhzJ","head":"https://static-legacy.dingtalk.com/media/lADPGojJ8b586_nNA8LNA8A_960_962.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{"lastLocateTime":"2020-12-17 16:54:09"},"openid":"$:LWCP_v1:$jpkKb+WzVcFor60ollVPxOymzVXUfqxh","longitude":120.01718723,"latitude":30.28609836,"isDelete":0,"synOpenid":"authorized","staffId":"1962305529889090","tenantId":"2fe245f4-31f0-11ea-9ddd-00163e0f1a1b","mainTeamId":"6f51dd10-354f-11eb-9baf-00163e0d174e","unfinishedTask":1,"todayFinishedTask":0,"state":"工作中","cusDistance":1019816.0,"wechat":"0","superAdmin":0,"isTeamLeader":0},{"userId":"4c67e321-45e9-11eb-9baf-00163e0d174e","loginName":"沐籽","displayName":"沐籽","email":null,"cellPhone":"15669089475","lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":"TYa6376eGP7lgUrIUKVBQHrrPYS1YNS7N2Ubx34W5U3jPsaml4rdZymGvUX3uDTRgmH2bCea7I40sXkb9P954Y1O6ERG4anFnT2ZJXeniTQWJw5r7DfmXozzp2iXdPTe","head":"https://static-legacy.dingtalk.com/media/lADPD3lGsVeCKWTNBDjNBDg_1080_1080.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{"lastLocateTime":"2021-01-07 20:26:26"},"openid":"$:LWCP_v1:$t5u9ZS/AA3u1fUUtiMiOrQ==","longitude":120.01716905,"latitude":30.28602186,"isDelete":0,"synOpenid":"authorized","staffId":"1765463702893421","tenantId":"2fe245f4-31f0-11ea-9ddd-00163e0f1a1b","mainTeamId":"6f51dd10-354f-11eb-9baf-00163e0d174e","unfinishedTask":0,"todayFinishedTask":0,"state":"工作中","cusDistance":1019823.0,"wechat":"0","superAdmin":0,"isTeamLeader":0},{"userId":"58dbac06-18c5-11eb-9baf-00163e0d174e","loginName":"洪一帆(秋水)","displayName":"洪一帆(秋水)","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":"yzHCdZEPRAV60ZZIuiH1pRpAFGh3g6feyyvAIRZl6BPGbKPTN34276DCUUd1m482cC4tc4izZKt43TfJmekAuCtFUiZ92lgDgypxZPV1zH6ugN3HTbrC6uBeVuoEqdpf","head":"https://static-legacy.dingtalk.com/media/lADPDhYBMvZgrErNAzrNAzo_826_826.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{"lastLocateTime":"2020-12-24 10:59:55"},"openid":"$:LWCP_v1:$oC0ziscRO0TQc7AWTtAckQ==","longitude":120.01721870,"latitude":30.28604275,"isDelete":0,"synOpenid":"authorized","staffId":"0600242010-35700984","tenantId":"2fe245f4-31f0-11ea-9ddd-00163e0f1a1b","mainTeamId":"6f51dd10-354f-11eb-9baf-00163e0d174e","unfinishedTask":3,"todayFinishedTask":0,"state":null,"cusDistance":1019823.0,"wechat":"0","superAdmin":0,"isTeamLeader":0},{"userId":"b4fed75f-4368-11eb-9baf-00163e0d174e","loginName":"托尼","displayName":"托尼","email":null,"cellPhone":null,"lastLoginTime":null,"enabled":1,"weixinid":null,"powercode":"XbOTXrBS52huPX7o5cqoGmI8UfvXER83eKLTejBp4UqxB4bMI6Q91iMXWdVkthFL91yb66H6EdQFlFRfhHdeGyCMpPr2kFwVwqRtbnuU7XBqxqj1pguepKk5oFILEJVu","head":"https://static-legacy.dingtalk.com/media/lADPD3W5M2gL2f3NAmbNAmY_614_614.jpg","sex":null,"firstLogin":0,"tagList":[],"departments":null,"roles":null,"attribute":{"lastLocateTime":"2021-01-06 13:40:58"},"openid":"$:LWCP_v1:$0X+K9a3d8Ak+zx2xESpVMoSBS9Tg81+F","longitude":120.01730400,"latitude":30.28604800,"isDelete":0,"synOpenid":"authorized","staffId":"2017354400804068","tenantId":"2fe245f4-31f0-11ea-9ddd-00163e0f1a1b","mainTeamId":"6f51dd10-354f-11eb-9baf-00163e0d174e","unfinishedTask":1,"todayFinishedTask":0,"state":"工作中","cusDistance":1019827.0,"wechat":"0","superAdmin":0,"isTeamLeader":0}],"firstPage":1,"prePage":0,"nextPage":0,"lastPage":1,"isFirstPage":true,"isLastPage":true,"hasPreviousPage":false,"hasNextPage":false,"navigatePages":8,"navigatepageNums":[1]})
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
