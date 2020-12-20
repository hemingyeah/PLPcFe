/* api */
import { getTaskAllotDispatchTeamUserList, getTaskDispatchTagList, getTaskRedeployTagList, getTaskAllotRedeployTeamUserList, getTaskAllotUserInfo } from '@src/api/TaskApi'
/* computed */
import TaskAllotExecutorComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorComputed'
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
import {
  AllotSortedEnum,
  AllotLocationEnum,
  TaslAllotTableColumnFieldEnum,
  AllotLabelEnum
} from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* types */
import Column from '@model/types/Column'
/* util */
import * as _ from 'lodash'
import Log from '@src/util/log.ts'
import { isArray } from '@src/util/type'
import Platform from '@src/util/platform'
import { objectArrayIntersection } from '@src/util/array'
import { storageGet, storageSet } from '@src/util/storage.ts'
/* vue */
import { Emit, Watch } from 'vue-property-decorator'
import { parseObject } from '@src/util/parse'

/* 加载的组件 */
const LoadComponentMap: { [x: string]: string } = {
  [TaskAllotTypeModeEnum.List]: ComponentNameEnum.TaskAllotUserTable,
  [TaskAllotTypeModeEnum.Map]: ComponentNameEnum.TaskAllotUserMap,
}

const SortedMap: { [x: string]: number } = {
  [TaslAllotTableColumnFieldEnum.Ufinish]: AllotSortedEnum.UnfinishedTask,
  [TaslAllotTableColumnFieldEnum.Finish]: AllotSortedEnum.FinishTaskByToday,
  [TaslAllotTableColumnFieldEnum.Plan]: AllotSortedEnum.PlanTaskByToday,
  [TaslAllotTableColumnFieldEnum.Degree]: AllotSortedEnum.TaskDegreePercentByMonth,
  [TaslAllotTableColumnFieldEnum.LineDistance]: AllotSortedEnum.Distance
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
  SetExecutor = 'setExecutor'
}

class TaskAllotExecutorMethods extends TaskAllotExecutorComputed {
  
  @Watch('mode')
  onModeChangedHandler(newValue: string) {
    // 地图模式 且 地图用户列表为空 且 第一次加载 则初始化
    if (
      this.isMapMode 
      && this.mapUserPage.list.length <= 0 
      && !this.isShowTaskAllotUserMapComponent
    ) {
      this.initialize()
    }
    // 添加到已加载的组件列表
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
   * @description 协同人用户删除事件
   */
  @Emit(TaskAllotExecutorEmitEventEnum.DeleteSynergyUser)
  public sysnergyUserCloseHandler(user: LoginUser): LoginUser {
    return user
  }
  
  /**
   * @description 协同人用户列表变化事件
   */
  @Emit(TaskAllotExecutorEmitEventEnum.SetSynergys)
  public synergyUserListChangedHanlder(users: LoginUser[]): LoginUser[] {
    return users
  }
  
  /**
   * @description 负责人用户变化事件
   */
  @Emit(TaskAllotExecutorEmitEventEnum.SetExecutor)
  public executorChangedHanlder(user: LoginUser | null): LoginUser | null {
    return user
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
          callback: () => this.loadmore()
        } 
      }
    )
    
    // 解除绑定
    this.$once(HookEnum.Destroyed, () => {
      Loadmore.unbind(scrollEl)
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
   * @description 构建搜索人员参数
   * @param {Boolean} isMapMode 是否为地图模式
   */
  public buildSearchUserParams(isMapMode: boolean = false): TaskAllotUserSearchModel {
    let distance: number[] | null = this.getParamDistance()
    let users: LoginUser[] = this.isAllotByTag ? this.selectTeamUsers : this.selectDeptUsers
    let orderDetail: { order: boolean, code: number} = this.getParamOrderDetail()
    let page = isMapMode ? this.mapUserPage : this.tableUserPage
    
    let params: any = {
      order: orderDetail.order,
      code: orderDetail.code,
      customerId: this.customer?.id || '',
      lat: this.taskAddress.latitude,
      lng: this.taskAddress.longitude,
      pageNum: ++page.pageNum,
      pageSize: page.pageSize,
      states: this.selectUserState,
      userIds: users.map(user => user.userId),
      // 地图模式需要此参数，可以不传code参数
      // map: isMapMode
    }
    
    Log.info(this.selectTeams.slice(), this.buildSearchUserParams.name, this.buildSearchUserParams.name)
    
    // 团队数据
    if (this.selectTeams.length > 0) {
      params.tagIds = this.selectTeams.map(team => (team.id || ''))
    }
    // 位置信息
    if (distance && isArray(distance)) {
      params.startDistance = String(distance[0])
      params.endDistance = String(distance[1])
    }
    
    return params
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
      customerId: this.customer?.id || ''
    }
  }
  
  /** 
   * @description 关闭用户卡片
  */
  public closeUserCard() {
    this.isShowUserCard = false
    this.restoreUserMarkerIcon()
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
      max: 1
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // 负责人
        this.executorChangedHanlder(result?.data?.users?.[0])
        // 初始化
        this.$nextTick(() => {
          this.initialize()
        })
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description 选择协同人
  */
  public chooseSynergyUser(): void {
    let options = {
      title: '请选择协同人',
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
        
        // 协同人赋值
        this.synergyUserListChangedHanlder(result?.data?.users || [])
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
   * @description 获取团队人员列表
  */
  public fetchTeamUsers(selectParams: { keyword: string, pageNum: number, pageSize: number }): Promise<any> {
    Log.succ(Log.Start, this.fetchTeamUsers.name)
    
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
   * @description 获取团队列表
  */
  public fetchTagList(params: TaskTagListSearchModel) {
    // 指派 转派需要区分
    let fetchTagListFunc = this.isReAllot ? getTaskRedeployTagList : getTaskDispatchTagList
    
    params.customerId = this.customer?.id || ''
    
    Log.info(params, this.fetchTagList.name, this.fetchTagList.name)
    
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
  public fetchUsers(): Promise<PageInfo<getTaskAllotUserInfoResult> | null | any> {
    if (this.pending) return Promise.resolve({})
    
    Log.succ(Log.Start, this.fetchUsers.name)
    
    this.pending = true
    const params: TaskAllotUserSearchModel = this.buildSearchUserParams(this.isMapMode)
    
    Log.info(params, this.fetchUsers.name)
    
    return (
      getTaskAllotUserInfo(params)
        .then((data: getTaskAllotUserInfoResult) => {
          let isSuccess = data.success
          if (!isSuccess) {
            Platform.alert(data.message)
            return []
          }
          
          Log.succ(Log.End, this.fetchUsers.name)
          
          data.result = data?.result || []      
          return data.result
          
        })
        .catch(err => {
          Log.error(err, this.fetchUsers.name)
        })
        .finally(() => this.pending = false)
    )
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
          // @ts-ignore
          order: OrderMap[this.selectSortord] === undefined ? true : OrderMap[this.selectSortord]
        }
    )
    
    return orderDetail
  }
  
  /** 
   * @description 获取位置参数
  */
  public getParamDistance(): number[] | null {
    // 米
    let m = 1000
    
    try {
      // 全部
      if (this.selectLocation === AllotLocationEnum.All) {
        return null
      }
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
  
  public getAttributes() {
    const attrs = {
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
    
    return attrs
  }
  
  /** 
   * @description 获取滚动的表格元素
  */
  public getScrollTableEl(): Element | null {
    return document.querySelector('.task-allot-user-table-block .el-table__body-wrapper')
  }
  
  /**
   * @description 从缓存获取数据
  */
  public async getDataToStorage(key: string, data: any) {
    return await storageGet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description 标签变化事件
  */
  public handlerLabelChange(value: AllotLabelEnum): void {
    Log.succ(Log.Start, this.handlerLabelChange.name)
    
    this.selectLabel = value
    // 初始化
    this.initialize()
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

    // 负责人
    this.executorChangedHanlder(users?.[0])
    // 初始化
    this.$nextTick(() => {
      this.initialize()
    })
  }
  
  /**
   * @description 表格标签变化事件
  */
  public handlerSortLabelChange(value: AllotSortedEnum): void {
    Log.succ(Log.Start, this.handlerSortLabelChange.name)
    // 赋值
    this.selectSortord = value === this.selectSortord ? AllotSortedEnum.Distance : value
    // 清除负责人人员表格排序
    this.TaskAllotUserTableComponent?.TaskAllotUserElTableComponent?.clearSort()
    // 初始化
    this.initialize()
  }
  
  /** 
   * @description 排序变化
  */
  public handlerTableSortChanged(option: { prop?: any, order?: any } = {}) {
    Log.succ(Log.Start, this.handlerTableSortChanged.name)
    
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
   * @description 表格拖动事件
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
    
    const columns = this.simplifyTableColumsProperty(this.columns)
    this.saveDataToStorage(StorageKeyEnum.TaskAllotTableColumns, columns)
  }
  
  /**
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    // 清空用户列表数据
    this.isMapMode
      ? this.mapUserPage = new Page({ pageNum: 0, pageSize: 999 })
      : this.tableUserPage = new Page({ pageNum: 0, pageSize: 20 })
    // 抓取用户列表数据
    this.fetchUsers()
      .then((result: PageInfo<TaskAllotUserInfo | LoginUser>) => {
        if (!result) return
        // 解析对象数据
        result.list = parseObject(result.list)
        // 用户列表/地图处理
        this.isMapMode 
          ? this.mapUserPageHandler(result as PageInfo<LoginUser>) 
          : this.tableUserPageHandler(result as PageInfo<TaskAllotUserInfo>)
      })
      .catch((err: any) => {
        Log.error(err, this.fetchUsers.name)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  /** 
   * @description 加载更多
  */
  public loadmore() {
    if (this.isDisableLoadmore) {
      return Log.warn('Caused: this.isDisableLoadmore is true', this.loadmore.name)
    }
    
    Log.succ(Log.Start, this.loadmore.name)
    
    // 抓取用户列表数据
    this.fetchUsers()
      .then((result: PageInfo<TaskAllotUserInfo>) => {
        if (!result) return
        // 解析对象数据
        result.list = parseObject(result.list)
        // 用户列表处理
        this.tableUserPageHandler(result)
      })
      .catch((err: any) => {
        Log.error(err, this.fetchUsers.name)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  /**
   * @description 地图用户列表处理
  */
  public mapUserPageHandler(result: PageInfo<LoginUser>) {
    try {
      
      // log start
      Log.succ(Log.Start, this.mapUserPageHandler.name)
      // 合并数据
      this.mapUserPage.merge(result)
      // 构建人员标记
      this.TaskAllotUserMapComponent?.outsideBuildeUserMarkers(result.list)
      // log end
      Log.succ(Log.End, this.mapUserPageHandler.name)
      
    } catch (error) {
      Log.error(error, this.mapUserPageHandler.name)
    }
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
      let customerTags: Tag[] = this.customer?.tags || []
      let tags: Tag[] = []
      
      // 按客户服务团队派单 取可见团队
      if (this.allotByExclusiveTag) {
        tags = tagList
      }
      // 按服务团队派单 取可见团队和客户团队的交集
      else if (this.isAllotByTag) {
        tags = objectArrayIntersection<Tag, Tag>(customerTags, tagList)
      }
      
      this.customerTags = tags.slice()
      
      Log.info(this.customerTags.slice(), 'customerTags', this.matchTags.name)
      
    } catch (error) {
      Log.error(error, this.matchTags.name)
    }
  }
  
  /**
   * @description 获取团队用户
   * -- 支持外部调用的
  */
  public async outsideFetchUsers() {
    Log.succ(Log.Start, `TaskAllotExcutor -> ${this.outsideFetchUsers.name}`)
    // 匹配团队
    await this.matchTags()
    // 初始化
    this.initialize()
  }
  
  /**
   * @description 设置选择的负责人
   * -- 支持外部调用的
  */
  public outsideSetSelectedExcutorUser(isSelected: boolean, user: TaskAllotUserInfo) {
    for (let key in this.userPageCheckedMap) {
      let isChecked: boolean = isSelected && key == user?.userId
      this.userPageCheckedMap[key] = isChecked
    }
    
    let excutorUser = isSelected ? user : null
    this.isShowUserCard = isSelected
    this.selectedExcutorUser = excutorUser
    this.selectTeamUsers = (
      isSelected 
        ? [{
            userId: excutorUser?.userId || '', 
            displayName: excutorUser?.displayName || '' ,
            value: excutorUser?.userId || '',
            label: excutorUser?.displayName || '',
          }]
        : []
    )
  }
  
  /**
   * @description 向上 设置选择的负责人
   * -- 支持外部调用的
  */
  public outsideUpwardSetSelectedExcutorUser(isSelected: boolean, user: any) {
    if (isSelected) {
      user.selfSelected = true
    }
    this.outsideSetSelectedExcutorUser(isSelected, user)
    this.TaskAllotModalComponent?.outsideSetExcutorUser(isSelected ? user : null)
  }
  
  /**
   * @description 设置等待状态
   * -- 支持外部调用的
  */
  public outsideSetPending(pending: boolean): void {
    this.pending = pending
  }
  
  /**
   * @description 拖动变化事件
   * -- 支持外部调用的
  */
  public outsideDragendHandler(newWidth: number, oldWidth: number, tableColumn: any = {}) {
    Log.succ(Log.Start, this.outsideDragendHandler.name)
    this.handlerHeaderDragend(newWidth, tableColumn)
  }
  
  /**
   * @description 排序变化事件
   * -- 支持外部调用的
  */
  public outsideSortChangedHandler(option: { prop?: any, order?: any } = {}) {
    Log.succ(Log.Start, this.outsideSortChangedHandler.name)
    this.handlerTableSortChanged(option)
  }
  
  /** 
   * @description 还原地图标记
  */
  private restoreUserMarkerIcon() {
    this.TaskAllotUserTableComponent?.outsideRestoreUserMarkerIcon()
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
    // 用户自己选择的，不需要重新加载
    if (user.selfSelected) return 
    
    this.initialize()
  }
  
  /** 
   * @description 显示高级设置 选择列
  */
  public showAdvancedSetting(): void {
    this.BaseTableAdvancedSettingComponent.open(this.columns)
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
  public simplifyTableColumsProperty(columns: Column[]): Column[] {
    return (
      columns.map((column: Column) => ({
        field: column.field,
        show: column.show,
        width: column.width
      }))
    )
  }
  
  /**
   * @description 保存数据到缓存
  */
  public saveDataToStorage(key: string, data: any) {
    storageSet(key, data, StorageModuleEnum.Task)
  }
  
  /**
   * @description 表格用户列表处理
  */
  public tableUserPageHandler(result: PageInfo<TaskAllotUserInfo>) {
    try {
      
      Log.succ(Log.Start, this.tableUserPageHandler.name)
      
      // 合并page数据
      this.tableUserPage.merge(result)
      // key : userId(string) -> value: boolean
      this.userPageCheckedMap = (
        this.tableUserPage.list
          .reduce((acc: {[x: string]: boolean}, cur: LoginUser) => {
            acc[cur.userId] = false
            return acc
          }, {})
      )
      // 设置人员列表数据
      this.TaskAllotUserTableComponent?.outsideSetUserPage(this.tableUserPage.list)
      // 是否禁用加载更多
      this.isDisableLoadmore = !(result?.hasNextPage === true)
      // 解绑滚动事件
      this.unBindTableScrollEvent()
      // 添加滚动事件
      this.$nextTick(() => {
        this.bindTableScrollEvent()
      })
      
      Log.succ(Log.End, this.tableUserPageHandler.name)
      
    } catch (error) {
      Log.error(error, this.tableUserPageHandler.name)
    }
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

export default TaskAllotExecutorMethods