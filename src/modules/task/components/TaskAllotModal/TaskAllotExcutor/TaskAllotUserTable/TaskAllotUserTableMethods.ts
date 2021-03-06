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
import Platform from '@src/util/Platform'
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

/* TODO: ?????????????????????????????? */
class TaskAllotUserTableMethods extends TaskAllotUserTableComputed {
  /** 
   * @description ??????????????????????????????
  */
  public bindUserMarkerClickEvent(userMarker: any) {
    userMarker.on(EventNameEnum.Click, (event: any) => {
      /* ???????????????????????????????????? ??????????????? */
      this.lastClickedUserMarker.marker && this.restoreUserMarkerIcon()
      /* ?????????????????? */
      let user: TaskAllotUserInfo = event.target.getExtData()
      /* ?????????????????? */
      event.target.setIcon(this.buildUserMarkerIcon(AMap, user, true))
      /* ????????????????????? */
      this.TaskAllotExcutorComponent?.outsideSetSelectedExcutorUser(true, user)
      /* ???????????????????????? */
      this.lastClickedUserMarker = {
        marker: event.target,
        data: user
      }
    })
  }
  
  /** 
   * @description ????????????????????????????????????
  */
  public bindUserMarkerMouseOverEvent(userMarker: any) {
    userMarker.on(EventNameEnum.MouseOver, (event: any) => {
      let user: TaskAllotUserInfo = event.target.getExtData()
      if (user.userId !== this.TaskAllotModalComponent?.executorUser?.userId) return
      
      let infoWindow = new AMap.InfoWindow({
        closeWhenClickMap: true,
        isCustom: true,
        offset: new AMap.Pixel(0, -34),
        content: '<div class="task-allot-map-excutor-window">?????????</div>'
      })
      
      infoWindow.open(this.AMap, event.target.getPosition())
    })
  }
  
  /** 
   * @description ????????????icon
   * @param {*} aMap ??????????????????
   * @param {TaskAllotUserInfo} user ????????????
   * @param {Boolean} isLarge ????????????????????????
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
   * @description ??????????????????????????????
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
   * @description ??????????????????
  */
  public chooseDepartmentUsers(): void {
    let options = {
      allot: true,
      title: '???????????????',
      seeAllOrg: true,
      selected: this.selectDeptUsers,
      max: 14
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // ????????????
        this.selectDeptUsers = result?.data?.users || []
        // ?????????
        this.initialize()
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description ???????????????????????????
  */
  public getScrollTableEl(): Element | null {
    return document.querySelector('.task-allot-user-table-block .el-table__body-wrapper')
  }
  
  /** 
   * @description ??????????????????
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
   * @description ??????????????????
  */
  public fetchTagList(params: TaskTagListSearchModel) {
    // ?????? ??????????????????
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
   * @description ??????????????????
   * -- ???????????????
  */
  public fetchUsers(): Promise<any> {
    return Promise.resolve()
  }
  
  /** 
   * @description ????????????????????????
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
    // ???????????? ??????
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
   * @description ?????????????????????
  */
  public async getDataToStorage(key: string, data: any) {
    return await storageGet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description ????????????????????????
  */
  public handlerLocationChange(value: number): void {
    LogUtil.succ(LogUtil.Start, this.handlerLocationChange.name)
    
    this.selectLocation = value
    this.initialize()
  }
  
  /**
   * @description ?????????????????? ??????
  */
  public handlerLocationOtherChange() {
    let { minValue, maxValue } = this.locationOtherData
    let minValueIsNull = minValue == null
    let maxValueIsNull = maxValue == null
    
    // ??????
    // @ts-ignore
    let validated = minValueIsNull || maxValueIsNull || Boolean(maxValue > minValue)
    this.locationOtherData.isChecked = validated
    
    // ???????????????
    if (minValueIsNull) {
      return Platform.alert(REQUIRED_MIN_MESSAGE)
    }
    // ???????????????
    if (maxValueIsNull) {
      return Platform.alert(REQUIRED_MAX_MESSAGE)
    }
    // ??????????????????????????????
    if (!validated) {
      return Platform.alert(MAX_GREATER_THAN__MIN_MESSAGE)
    }
    // ?????? ?????????select?????????
    // @ts-ignore
    this.$refs.TaskAllotTableLocaionSelect.blur()
    this.selectLocation = Number(this.locationOptions[this.locationOptions.length - 1].value)
    
    this.initialize()
  }
  
  /**
   * @description ??????????????????????????????
  */
  public handlerUserStateChange(value: string[]): void {
    LogUtil.succ(LogUtil.Start, this.handlerUserStateChange.name)
    
    this.selectUserState = value
    this.initialize()
  }
  
  /** 
   * @description ??????????????????
  */
  public handlerHeaderDragend(newWidth: number, oldWidth: number, tableColumn: any = {}) {
    LogUtil.succ(LogUtil.Start, this.handlerHeaderDragend.name)
    this.dragendFunc && this.dragendFunc(newWidth, oldWidth, tableColumn)
  }
  
  /** 
   * @description ??????????????????????????????
  */
  public handlerTableSortChanged(option: { prop?: any, order?: any } = {}) {
    LogUtil.succ(LogUtil.Start, this.handlerTableSortChanged.name)
    this.sortChangeFunc && this.sortChangeFunc(option)
  }
  
  /** 
   * @description ???????????????checkbox ??????
  */
  @Log()
  public handlerExcutorCheckedChange(checked: boolean, row: TaskAllotUserInfo): void {
    /* ????????????????????? */
    this.TaskAllotExcutorComponent?.outsideUpwardSetSelectedExcutorUser(checked, row)
  }
  
  /**
   * @description ????????? ???????????????????????????????????????
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
   * @description ??????????????????
  */
  public async matchTags(): Promise<void> {
    try {
      if (!this.isAllotByTag && !this.allotByExclusiveTag) return
      
      let searchTagParams = this.buildSearchTagParams()
      let result: any = await this.fetchTagList(searchTagParams) || {}
      // ????????????
      let tagList: Tag[] = result.list || []
      // ??????????????????
      let customerTags: Tag[] = this.customer.tags || []
      let tags: Tag[] = []
      
      // ??????????????????????????? ???????????????
      if (this.allotByExclusiveTag) {
        tags = tagList
      }
      // ????????????????????? ???????????????????????????????????????
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
   * @description ??????????????????
   * -- ?????????????????????
  */
  public outsideRestoreUserMarkerIcon() {
    this.restoreUserMarkerIcon()
  }
  
  /** 
   * @description ????????????????????????????????????
   * -- ????????????????????????????????????
  */
  public outsideSetUserPage(userList: TaskAllotUserInfo[]) {
    this.taskAllotUserList = userList
  }
  
  /** 
   * @description ????????????????????????
  */
  public async revertSort() {
    this.selectSortord = await this.getDataToStorage(StorageKeyEnum.TaskAllotTableSort, AllotSortedEnum.FinishTaskByMonth)
  }
  
  /** 
   *  @description ?????????????????????????????????
  */
  public restoreUserMarkerIcon() {
    let { marker, data } = this.lastClickedUserMarker
    if (!marker || !data) return
    
    marker.setIcon(this.buildUserMarkerIcon(AMap, data))
  }
  
}

export default TaskAllotUserTableMethods
