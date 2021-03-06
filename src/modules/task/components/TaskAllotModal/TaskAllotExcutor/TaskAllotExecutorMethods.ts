/* api */
import { getTaskAllotDispatchTeamUserList, getTaskDispatchTagList, getTaskRedeployTagList, getTaskAllotRedeployTeamUserList, getTaskAllotUserInfo } from '@src/api/TaskApi'
/* computed */
import TaskAllotExecutorComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorComputed'
/* decorators */
import Log from '@src/decorators/LogDecorators'
/* enum */
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import HookEnum from '@model/enum/HookEnum'
import EelementTableSortOrderEnum from '@model/enum/ElementTableSortOrderEnum'
import StorageModuleEnum from '@model/enum/StorageModuleEnum'
import StorageKeyEnum from '@model/enum/StorageKeyEnum'
/* entity */
import Tag from '@model/entity/Tag/Tag'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import PageInfo from '@model/entity/PageInfo'
/* directive */
import Loadmore from '@src/directive/loadmore'
/* interface */
import { DepeMultiUserResult } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* model */
import Page from '@model/Page'
import { TaskAllotUserSearchModel, TaskTagListSearchModel } from '@model/param/in/Task'
import { getTaskAllotUserInfoResult, getTaskTagListResult } from '@model/param/out/Task'
import { MAX_SELECT_USER_COUNT } from '@src/model/const/Number'
import { MAX_GREATER_THAN__MIN_MESSAGE, REQUIRED_MIN_MESSAGE, REQUIRED_MAX_MESSAGE } from '@src/model/const/Alert'
import {
  AllotSortedEnum,
  AllotLocationEnum,
  TaskAllotTableColumnFieldEnum,
  AllotLabelEnum
} from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* types */
import Column from '@model/types/Column'
/* util */
import * as _ from 'lodash'
import LogUtil from '@src/util/log.ts'
import { isArray, isElement } from '@src/util/type'
import Platform from '@src/util/platform'
import { objectArrayIntersection } from '@src/util/array'
import { storageGet, storageSet } from '@src/util/storage.ts'
/* vue */
import { Emit, Watch } from 'vue-property-decorator'
import { parseObject } from '@src/util/parse'

/* ??????????????? */
const LoadComponentMap: { [x: string]: string } = {
  [TaskAllotTypeModeEnum.List]: ComponentNameEnum.TaskAllotUserTable,
  [TaskAllotTypeModeEnum.Map]: ComponentNameEnum.TaskAllotUserMap,
}

const SortedMap: { [x: string]: number } = {
  [TaskAllotTableColumnFieldEnum.Ufinish]: AllotSortedEnum.UnfinishedTask,
  [TaskAllotTableColumnFieldEnum.Finish]: AllotSortedEnum.FinishTaskByToday,
  [TaskAllotTableColumnFieldEnum.Plan]: AllotSortedEnum.PlanTaskByToday,
  [TaskAllotTableColumnFieldEnum.Degree]: AllotSortedEnum.TaskDegreePercentByMonth,
  [TaskAllotTableColumnFieldEnum.LineDistance]: AllotSortedEnum.Distance
}

const OrderMap: { [x: number]: boolean } = {
  [AllotSortedEnum.Distance]: true,
  [AllotSortedEnum.TaskDegreePercentByMonth]: false,
  [AllotSortedEnum.TaskWorkUsedTimeByMonth]: true,
  [AllotSortedEnum.ExecutorTaskByMonth]: false,
  [AllotSortedEnum.TaskAcceptTimeByMonth]: true,
  [AllotSortedEnum.FinishTaskByMonth]: false
}

enum TaskAllotExecutorEmitEventEnum {
  DeleteSynergyUser = 'deleteSynergyUser',
  SetSynergys = 'setSynergys',
  SetExecutor = 'setExecutor',
  SetCustomerTags = 'setCustomerTags',
  SetReason = 'setReason',
  SetCustomReason = 'setCustomReason'
}

class TaskAllotExecutorMethods extends TaskAllotExecutorComputed {
  
  @Watch('mode')
  onModeChangedHandler(newValue: string) {
    // ???????????? ??? ???????????????????????? ??? ??????????????? ????????????
    const isInitMapData = (
      this.isMapMode
      && this.mapUserPage.list.length <= 0
      && !this.isShowTaskAllotUserMapComponent
    )
    // ?????????????????????
    if (isInitMapData) {
      this.initialize()
    } else {
      // ???????????????????????????????????? ??????????????????
      let isEqualsParams = this.judgeListParamsEqualsMapParams()
      // ???????????????????????????????????????
      !isEqualsParams && this.initialize()
    }
    // ?????????????????????????????????
    this.loadedComponents.push(LoadComponentMap[newValue])
  }
  
  @Watch('executor', { immediate: true })
  onExecutorChangedHandler(newValue: LoginUser | null) {
    if (!newValue) {
      this.selectTeamUsers = []
      this.selectDeptUsers = []
    } else {
      this.selectTeamUsers = [newValue]
      this.selectDeptUsers = [newValue]
    }
  }
  
  /**
   * @description ???????????????????????????
   */
  @Emit(TaskAllotExecutorEmitEventEnum.DeleteSynergyUser)
  public synergyUserCloseHandler(user: LoginUser): LoginUser {
    return user
  }
  
  /**
   * @description ?????????????????????????????????
   */
  @Emit(TaskAllotExecutorEmitEventEnum.SetSynergys)
  public synergyUserListChangedHandler(users: LoginUser[]): LoginUser[] {
    return users
  }
  
  /**
   * @description ???????????????????????????
   */
  @Emit(TaskAllotExecutorEmitEventEnum.SetExecutor)
  public executorChangedHandler(user: LoginUser | null): LoginUser | null {
    return user
  }
  
  /**
   * @description ????????????????????????
   */
  @Emit(TaskAllotExecutorEmitEventEnum.SetCustomerTags)
  public customerTagsChangedHandler(tags: Tag[]): Tag[] {
    return tags
  }
  
  /**
   * @description ????????????????????????
   */
  @Emit(TaskAllotExecutorEmitEventEnum.SetReason)
  public reasonChangedHandler(reason: string): string {
    return reason
  }

  @Emit(TaskAllotExecutorEmitEventEnum.SetCustomReason)
  /**
   * @description  ????????????
   */
  public customReasonChangedHandler(customReason: string):string {
    return customReason
  }
  
  /** 
   * @description ????????????????????????
  */
  public bindTableScrollEvent(): void {
    // ????????????
    let scrollEl = this.getScrollTableEl()
    // ??????
    Loadmore.bind(
      scrollEl,
      {
        value: {
          distance: 10,
          disabled: this.isDisableLoadmore,
          callback: () => this.loadmore()
        }
      }
    )
    
    // ????????????
    this.$once(HookEnum.Destroyed, () => {
      Loadmore.unbind(scrollEl)
    })
    
  }
  
  /** 
   * @description ?????????
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
   * @description ????????????????????????
   * @param {Boolean} isMapMode ?????????????????????
   */
  public buildSearchUserParams(isMapMode: boolean = false): TaskAllotUserSearchModel {
    let distance: number[] | null = this.getParamDistance()
    let users: LoginUser[] = this.isAllotByTag ? this.selectTeamUsers : this.selectDeptUsers
    let orderDetail: { order: boolean, code: number} = this.getParamOrderDetail()
    let page = isMapMode ? this.mapUserPage : this.tableUserPage
    
    let params: any = {
      order: orderDetail.order,
      // ??????????????? code ??? ?????????
      code: isMapMode ? AllotSortedEnum.Distance : orderDetail.code,
      customerId: this.customer?.id || '',
      lat: this.taskAddress.latitude,
      lng: this.taskAddress.longitude,
      label: this.selectLabel,
      pageNum: ++page.pageNum,
      pageSize: page.pageSize,
      states: this.selectUserState,
      taskId: this.task?.id,
      userIds: users.filter(user => !user.selfSelected).map(user => user.userId),
      // ???????????????????????????
      map: isMapMode
    }
    
    // ????????????
    if (this.selectTeams.length > 0) {
      params.tagIds = this.selectTeams.map(team => (team.id || ''))
    }
    // ????????????
    if (distance && isArray(distance)) {
      params.startDistance = String(distance[0])
      params.endDistance = String(distance[1])
    }
    
    return params
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
      customerId: this.customer?.id || ''
    }
  }
  
  /**
   * @description ??????????????????
   */
  public computedTableHeight() {
    // ????????????
    let windowHeight = window.innerHeight || document.body.clientHeight
    // ??????????????????
    let otherElHeight = 386 + (this.isReAllot ? 48 : 0)
    this.tableHeight = windowHeight - otherElHeight
  }
  
  /** 
   * @description ??????????????????
  */
  public closeUserCard() {
    this.isShowUserCard = false
    this.restoreUserMarkerIcon()
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
      max: 1
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // ?????????
        this.executorChangedHandler(result?.data?.users?.[0])
        // ?????????
        this.$nextTick(() => {
          this.initialize()
        })
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description ???????????????
  */
  public chooseSynergyUser(): void {
    let options = {
      title: '??????????????????',
      seeAllOrg: true,
      selected: this.synergyUserList,
      max: MAX_SELECT_USER_COUNT,
      showUserState: true
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // ???????????????
        this.synergyUserListChangedHandler(result?.data?.users || [])
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /**
   * @description ????????????????????????
   * -- ????????????
  */
  public debouncedRemoveDepartmentUser(user: any) {
    _.debounce(() => {
      this.removeDepartmentUser(user)
    }, 250)()
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
   * @description ??????????????????
  */
  public fetchTagList(params: TaskTagListSearchModel) {
    // ?????? ??????????????????
    let fetchTagListFunc = this.isReAllot ? getTaskRedeployTagList : getTaskDispatchTagList
    
    params.customerId = this.customer?.id || ''
    
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
  public fetchUsers(): Promise<PageInfo<getTaskAllotUserInfoResult> | null | any> {
    
    LogUtil.succ(LogUtil.Start, this.fetchUsers.name)
    
    this.pending = true
    const params: TaskAllotUserSearchModel = this.buildSearchUserParams(this.isMapMode)
    // ??????????????????
    this.isMapMode
      ? this.backupFetchUserParams.map = params
      : this.backupFetchUserParams.list = params
    // Log
    LogUtil.info(params, this.fetchUsers.name)
    
    return (
      getTaskAllotUserInfo(params)
        .then((data: getTaskAllotUserInfoResult) => {
          let isSuccess = data.success
          if (!isSuccess) {
            Platform.alert(data.message)
            return []
          }
          
          LogUtil.succ(LogUtil.End, this.fetchUsers.name)
          
          data.result = data?.result || []      
          return data.result
          
        })
        .catch(err => {
          LogUtil.error(err, this.fetchUsers.name)
        })
        .finally(() => this.pending = false)
    )
  }
  
  /** 
   * @description ??????????????????
  */
  public getParamOrderDetail(): { order: boolean, code: number } {
    let orderDetail: any = null
    // ??????????????????????????????
    if (Object.keys(this.orderDetail).length > 0) {
      orderDetail = this.orderDetail
    } else {
      // @ts-ignore
      let orderData: any = OrderMap[this.selectSortord]
      orderDetail = {
        code: this.selectSortord || AllotSortedEnum.Distance,
        order: (
          this.selectSortord == null || orderData === undefined ? true : orderData
        )
      }
    }
    
    return orderDetail
  }
  
  /** 
   * @description ??????????????????
  */
  public getParamDistance(): number[] | null {
    // ???
    let m = 1000
    
    try {
      // ??????
      if (this.selectLocation === AllotLocationEnum.All) {
        return null
      }
      // 5????????????
      if (this.selectLocation === AllotLocationEnum.Five) {
        return [0, AllotLocationEnum.Five * m]
      }
      // 10????????????
      if (this.selectLocation === AllotLocationEnum.Ten) {
        return [0, AllotLocationEnum.Ten * m]
      }
      // 20????????????
      if (this.selectLocation === AllotLocationEnum.Twenty) {
        return [0, AllotLocationEnum.Twenty * m]
      }
      // 50????????????
      if (this.selectLocation === AllotLocationEnum.Fifty) {
        return [0, AllotLocationEnum.Fifty * m]
      }
      
      // ??????
      return [Number(this.locationOtherData.minValue) * m, Number(this.locationOtherData.maxValue) * m]
      
    } catch (error) {
      console.error('TaskAllotUserTableMethods -> err', error)
      return [0, AllotLocationEnum.Fifty * m]
    }
    
  }
  
  public getAttributes(): any {
    return {
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
  }
  
  /** 
   * @description ???????????????????????????
  */
  public getScrollTableEl(): Element | null {
    return document.querySelector('.task-allot-user-table-block .el-table__body-wrapper')
  }
  
  /**
   * @description ?????????????????????
  */
  public async getDataToStorage(key: string, data: any) {
    return await storageGet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description ??????????????????
  */
  public handlerLabelChange(value: AllotLabelEnum): void {
    LogUtil.succ(LogUtil.Start, this.handlerLabelChange.name)
    
    this.selectLabel = value
    // ?????????
    this.initialize()
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
   * @description ????????????????????????
  */
  public handlerTeamChange(value: Tag[]): void {
    LogUtil.succ(LogUtil.Start, this.handlerTeamChange.name)
    
    this.selectTeams = value
    this.initialize()
  }
  
  /**
   * @description ??????????????????????????????
  */
  public handlerTeamUsersChange(users: any[]): void {
    // Log
    LogUtil.succ(LogUtil.Start, this.handlerTeamUsersChange.name)
    // ???????????????????????????
    const nextTickInitialize = () => {
      this.$nextTick(() => {
        this.initialize()
      })
    }
    
    // ???????????????????????????????????????????????????????????????
    if (this.tableUserPage.list?.[0]?.userId == this.executor?.userId && users.length == 0) {
      // ?????????????????????
      this.executorChangedHandler(users?.[0])
      nextTickInitialize()
      return
    }
  
    // ?????????????????????
    this.executorChangedHandler(users?.[0])
    // ?????????????????????????????????????????? ?????????????????????????????????
    if (this.executor?.selfSelected && users.length == 0) return
    
    // ?????????
    nextTickInitialize()
  }
  
  /**
   * @description ????????????????????????
  */
  public handlerSortLabelChange(value: AllotSortedEnum): void {
    LogUtil.succ(LogUtil.Start, this.handlerSortLabelChange.name)
    // ??????
    this.selectSortord = value === this.selectSortord ? null : value
    // ?????????????????????????????????
    this.TaskAllotUserTableComponent?.TaskAllotUserElTableComponent?.clearSort()
    // ?????????
    this.initialize()
  }
  
  /** 
   * @description ????????????
  */
  public handlerTableSortChanged(option: { prop?: any, order?: any } = {}) {
    LogUtil.succ(LogUtil.Start, this.handlerTableSortChanged.name)
    
    const { prop, order } = option
    
    if (!order) {
      this.orderDetail = {}
      this.selectSortord = null
      return this.initialize()
    }
    
    let isDescending: boolean = order === EelementTableSortOrderEnum.DESC
    
    this.orderDetail = {
      order: !isDescending,
      code: SortedMap[prop],
    }
    this.selectSortord = null
    this.initialize()
  }
  
  /** 
   * @description ??????????????????
  */
  public handlerHeaderDragend(newWidth: number, tableColumn: any = {}) {
    let field: string = tableColumn.property || ''
    let column: Column | null = null
    
    for (let i = 0; i < this.columns.length; i++) {
      column = this.columns[i]
      if (column.field === field) {
        column.width = newWidth
      }
    }
    
    const columns = this.simplifyTableColumnsProperty(this.columns)
    this.saveDataToStorage(StorageKeyEnum.TaskAllotTableColumns, columns)
  }
  
  public handlerExecutorSelectFocus(selectElement: Element): void {
    if (!isElement(selectElement)) return
    
    const executorSelectMaxHeight = 400
    const executorSelectClientHeight = selectElement.clientHeight
    const executorSelectRectData = selectElement.getBoundingClientRect()
    const taskAllotModalElement = this.$parent.$el
    const taslAllotModalFoolterElement = taskAllotModalElement.querySelector('.task-allot-modal-dialog-footer')
    
    if (!isElement(taslAllotModalFoolterElement)) return
    
    const taslAllotModalFoolterElementRectData = taslAllotModalFoolterElement?.getBoundingClientRect()
    const middleHeight = Number(taslAllotModalFoolterElementRectData?.y) - executorSelectRectData.y - executorSelectClientHeight
    
    if (middleHeight >= executorSelectMaxHeight) return
    
    // @ts-ignore
    const executorSelecePanelElement = this.$refs?.TeamUserBizFormRemoteSelect?.$refs?.BizFormRemoteBaseSelect?.$refs.searchDom
    if (!isElement(executorSelecePanelElement)) return
    
    executorSelecePanelElement.style.height = `${middleHeight - 40}px`
    
  }
  
  public handlerNumberFormat(value: string): number | null {
    const NumberReg = /^(([0-9]+)|([0-9]+\.[0-9]{0,2}))$/
    const DecimalReg = /\./
    const DecimalLimit = 2
    const MaxLength = 5
    
    // ?????????????????????????????????
    if (value === '') {
      return null
    }
    
    if (NumberReg.test(value)) {
      let number = DecimalReg.test(value) ? MaxLength + DecimalLimit  : MaxLength
      return Number(value.substr(0, number))
    }
    
    let decimalExec = DecimalReg.exec(value)
    let poorLength = value.length - 1 - (decimalExec?.index || 0)
    // ?????????????????????
    let decimalMoreLimit = decimalExec === null ? false : poorLength > DecimalLimit
    if (decimalMoreLimit) {
      return Number(`${value.substr(0, value.length - (poorLength - DecimalLimit))}`)
    }
    
    return null
  }
  
  /**
   * @description ????????? ???????????????????????????????????????
  */
  public initialize(): void {
    LogUtil.succ(LogUtil.Start, this.initialize.name)
    
    // ????????????????????????
    this.isMapMode
      ? this.mapUserPage = new Page({ pageNum: 0, pageSize: 0 })
      : this.tableUserPage = new Page({ pageNum: 0, pageSize: 20 })
    // ????????????????????????
    this.fetchUsers()
      .then((result: PageInfo<TaskAllotUserInfo> | LoginUser[]) => {
        if (!result) return
        // ????????????/????????????
        this.isMapMode 
          ? this.mapUserPageHandler(result as LoginUser[])
          : this.tableUserPageHandler(result as PageInfo<TaskAllotUserInfo>)
      })
      .catch((err: any) => {
        LogUtil.error(err, this.fetchUsers.name)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  /**
   * @description ?????????????????????????????????????????????????????????????????????
   */
  public judgeListParamsEqualsMapParams(): boolean {
    // ????????????
    let isEquals: boolean = false
    // ????????????
    let listParams = this.backupFetchUserParams.list
    // ????????????
    let mapParams = this.backupFetchUserParams.map
    // ????????????????????????????????????????????????????????????????????????????????????????????????????????????
    isEquals = (
      _.isEqual(listParams?.userIds, mapParams?.userIds)
      && _.isEqual(listParams?.tagIds, mapParams?.tagIds)
      && _.isEqual(listParams?.label, mapParams?.label)
      && _.isEqual(listParams?.states, mapParams?.states)
      && _.isEqual(listParams?.startDistance, mapParams?.startDistance)
      && _.isEqual(listParams?.endDistance, mapParams?.endDistance)
      && _.isEqual(listParams?.states, mapParams?.states)
    )
  
    return isEquals
  }
  
  /** 
   * @description ????????????
  */
  public loadmore() {
    if (this.isDisableLoadmore) {
      return LogUtil.warn('Caused: this.isDisableLoadmore is true', this.loadmore.name)
    }
    
    LogUtil.succ(LogUtil.Start, this.loadmore.name)
    
    // ????????????????????????
    this.fetchUsers()
      .then((result: PageInfo<TaskAllotUserInfo>) => {
        if (!result) return
        // ??????????????????
        this.tableUserPageHandler(result)
      })
      .catch((err: any) => {
        LogUtil.error(err, this.fetchUsers.name)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  /**
   * @description ????????????????????????
   * @param {LoginUser[]} userList ????????????
  */
  public mapUserPageHandler(userList: LoginUser[]) {
    try {
      
      // log start
      LogUtil.succ(LogUtil.Start, this.mapUserPageHandler.name)
      // ????????????
      this.mapUserPage.list = userList
      // ??????????????????
      this.TaskAllotUserMapComponent?.outsideBuildeUserMarkers(userList)
      // log end
      LogUtil.succ(LogUtil.End, this.mapUserPageHandler.name)
      
    } catch (error) {
      LogUtil.error(error, this.mapUserPageHandler.name)
    }
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
      let customerTags: Tag[] = this.customer?.tags || []
      let tags: Tag[] = []
      
      // ??????????????????????????? ???????????????
      if (this.allotByExclusiveTag) {
        tags = tagList
      }
      // ????????????????????? ???????????????????????????????????????
      else if (this.isAllotByTag) {
        tags = objectArrayIntersection<Tag, Tag>(customerTags, tagList)
      }
      
      this.customerTags = tags.slice()
      this.customerTagsChangedHandler(this.customerTags)
      
      LogUtil.info(this.customerTags.slice(), 'customerTags', this.matchTags.name)
      
    } catch (error) {
      LogUtil.error(error, this.matchTags.name)
    }
  }
  
  /**
   * @description ??????????????????
   * -- ?????????????????????
  */
  public async outsideFetchUsers() {
    LogUtil.succ(LogUtil.Start, `TaskAllotExcutor -> ${this.outsideFetchUsers.name}`)
    this.$nextTick(async() => {
      // ????????????
      await this.matchTags()
      // ?????????
      this.initialize()
    })
  }
  
  /**
   * @description ????????????????????????
   * @param {Boolean} isSelected ????????????
   * @param {TaskAllotUserInfo} user ????????????
   * -- ?????????????????????
  */
  public outsideSetSelectedExcutorUser(isSelected: boolean, user: TaskAllotUserInfo) {
    let isChecked: boolean = false
    for (let key in this.userPageCheckedMap) {
      isChecked = isSelected && key == user?.userId
      this.userPageCheckedMap[key] = isChecked
    }
    
    let executorUser = isSelected ? user : null
    this.isShowUserCard = isSelected
    this.selectedExcutorUser = executorUser
    this.selectTeamUsers = (
      isSelected 
        ? [{
            userId: executorUser?.userId || '',
            displayName: executorUser?.displayName || '' ,
            value: executorUser?.userId || '',
            label: executorUser?.displayName || '',
          }]
        : []
    )
  }
  
  /**
   * @description ?????? ????????????????????????
   * -- ?????????????????????
  */
  public outsideUpwardSetSelectedExcutorUser(isSelected: boolean, user: any) {
    if (isSelected) {
      user.selfSelected = true
    }
    this.outsideSetSelectedExcutorUser(isSelected, user)
    this.TaskAllotModalComponent?.outsideSetExcutorUser(isSelected ? user : null)
  }
  
  /**
   * @description ??????????????????
   * -- ?????????????????????
  */
  public outsideSetPending(pending: boolean): void {
    this.pending = pending
  }
  
  /**
   * @description ??????????????????
   * -- ?????????????????????
  */
  public outsideDragendHandler(newWidth: number, oldWidth: number, tableColumn: any = {}) {
    LogUtil.succ(LogUtil.Start, this.outsideDragendHandler.name)
    this.handlerHeaderDragend(newWidth, tableColumn)
  }
  
  /**
   * @description ??????????????????
   * -- ?????????????????????
  */
  public outsideSortChangedHandler(option: { prop?: any, order?: any } = {}) {
    LogUtil.succ(LogUtil.Start, this.outsideSortChangedHandler.name)
    this.handlerTableSortChanged(option)
  }
  
  /** 
   * @description ??????????????????
  */
  private restoreUserMarkerIcon() {
    this.TaskAllotUserTableComponent?.outsideRestoreUserMarkerIcon()
  }
  
  /**
   * @description ????????????????????????
  */
  public removeDepartmentUser(user: LoginUser) {
    this.selectDeptUsers = (
      this.selectDeptUsers
        .filter((departmentUser: LoginUser) => {
          return departmentUser.userId !== user.userId
        })
    )
    // ?????????????????????????????????????????????
    if (user.selfSelected) return 
    
    this.initialize()
  }
  
  /**
   * @description ???????????????
   */
  public removeSynergyUser(user: LoginUser) {
    this.synergyUserCloseHandler(user)
  }
  
  /** 
   * @description ?????????????????? ?????????
  */
  public showAdvancedSetting(): void {
    this.BaseTableAdvancedSettingComponent.open(this.columns)
  }
  
  /**
   * @description ?????????????????????
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
    
    const showColumns = this.simplifyTableColumnsProperty(this.columns)
    
    this.saveDataToStorage(StorageKeyEnum.TaskAllotTableColumns, showColumns)
  }

  /* ??????????????? */
  public simplifyTableColumnsProperty(columns: Column[]): Column[] {
    return (
      columns.map((column: Column) => ({
        field: column.field,
        show: column.show,
        width: column.width
      }))
    )
  }
  
  /**
   * @description ?????????????????????
  */
  public saveDataToStorage(key: string, data: any) {
    storageSet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description ????????????????????????
  */
  public tableUserPageHandler(result: PageInfo<TaskAllotUserInfo>) {
    try {
      LogUtil.succ(LogUtil.Start, this.tableUserPageHandler.name)
      
      // ??????page??????
      this.tableUserPage.merge(result)
      // key : userId(string) -> value: boolean
      this.userPageCheckedMap = (
        this.tableUserPage.list
          .reduce((acc: {[x: string]: boolean}, cur: LoginUser) => {
            acc[cur.userId] = Boolean(this.executor?.userId === cur?.userId)
            return acc
          }, {})
      )
      // ????????????????????????
      this.TaskAllotUserTableComponent?.outsideSetUserPage(this.tableUserPage.list)
      // ????????????????????????
      this.isDisableLoadmore = !(result?.hasNextPage === true)
      // ??????????????????
      this.unBindTableScrollEvent()
      // ??????????????????
      this.$nextTick(() => {
        this.bindTableScrollEvent()
      })
      
      LogUtil.succ(LogUtil.End, this.tableUserPageHandler.name)
      
    } catch (error) {
      LogUtil.error(error, this.tableUserPageHandler.name)
    }
  }
  
  /** 
   * @description ????????????????????????
  */
  public unBindTableScrollEvent() {
    // ????????????
    let scrollEl = this.getScrollTableEl()
    // ??????
    Loadmore.unbind(scrollEl)
  }
}

export default TaskAllotExecutorMethods