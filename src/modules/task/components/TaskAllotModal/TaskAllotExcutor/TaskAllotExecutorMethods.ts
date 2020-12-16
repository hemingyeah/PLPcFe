/* api */
import { getTaskAllotDispatchTeamUserList, getTaskDispatchTagList, getTaskRedeployTagList, getTaskAllotRedeployTeamUserList, getTaskAllotUserInfo } from '@src/api/TaskApi'
/* computed */
import TaskAllotExecutorComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorComputed'
/* enum */
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import HookEnum from '@model/enum/HookEnum'
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
/* util */
import * as _ from 'lodash'
import Log from '@src/util/log.ts'
import { isString, isObject, isArray } from '@src/util/type'
import Platform from '@src/util/platform'
/* vue */
import { Watch } from 'vue-property-decorator'

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


class TaskAllotExecutorMethods extends TaskAllotExecutorComputed {
  
  @Watch('mode')
  onModeChangedHandler(newValue: string) {
    this.loadedComponents.push(LoadComponentMap[newValue])
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
      map: isMapMode
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
        this.synergyUserList = result?.data?.users || []
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
    if (this.pending) return Promise.resolve([])
    
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
          
          return data?.result || null
          
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
          order: OrderMap[this.selectSortord] === undefined ? true : OrderMap[this.selectSortord]
        }
    )
    
    return orderDetail
  }
  
  /** 
   * @description 获取位置参数
  */
  public getParamDistance(): number[] | null {
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
   * @description 初始化 获取用户列表并且初始化地图
  */
  public initialize(): void {
    Log.succ(Log.Start, this.initialize.name)
    
    // 清空用户列表数据
    this.isMapMode
      ? this.mapUserPage = new Page({ pageNum: 0 })
      : this.tableUserPage = new Page({ pageNum: 0 })
    // TODO: 
    // this.changePending && this.changePending(true)
    
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
        // TODO: 
        // this.changePending && this.changePending(false)
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
   * @description 获取团队用户
   * -- 支持外部调用的
  */
  public outsideFetchUsers() {
    Log.succ(Log.End, `TaskAllotExcutor -> ${this.outsideFetchUsers.name}`)
    // @ts-ignore
    this.$refs?.TaskAllotUserTableComponent.outsideFetchUsers()
  }
  
  /**
   * @description 设置选择的负责人
   * -- 支持外部调用的
  */
  public outsideSetSelectedExcutorUser(isSelected: boolean, user: TaskAllotUserInfo) {
    let excutorUser = isSelected ? user : null
    this.isShowUserCard = isSelected
    this.selectedExcutorUser = excutorUser
  }
  
  /**
   * @description 获取团队用户
   * -- 支持外部调用的
  */
  public outsideSetCustomerTags(tags: Tag[]) {
    this.customerTags = tags
  }
  
  /**
   * @description 向上 设置选择的负责人
   * -- 支持外部调用的
  */
  public outsideUpwardSetSelectedExcutorUser(isSelected: boolean, user: any) {
    this.outsideSetSelectedExcutorUser(isSelected, user)
    this.TaskAllotModalComponent.outsideSetExcutorUser(isSelected ? user : null)
  }
  
  /**
   * @description 设置等待状态
   * -- 支持外部调用的
  */
  public outsideSetPending(pending: boolean): void {
    this.pending = pending
  }
  
  /** 
   * @description 还原地图标记
  */
  private restoreUserMarkerIcon() {
    // @ts-ignore
    this.$refs.TaskAllotUserTableComponent?.outsideRestoreUserMarkerIcon()
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
   * @description 表格用户列表处理
  */
  public tableUserPageHandler(result: PageInfo<TaskAllotUserInfo>) {
    try {
      
      Log.succ(Log.Start, this.tableUserPageHandler.name)
      
      // 合并数据
      this.tableUserPage.merge(result)
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