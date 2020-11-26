/* component */
import TaskAllotUserTableComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableComponents'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
/* interface */
import { ElSelectOption } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* model */
import Page from '@model/Page'
import { AllotSortedEnum, AllotLocationEnum, TaskAllotUserTableEnterpriseEditionColumns, TaskAllotUserTableStandEditionColumns } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* types */
import Column from '@model/types/Column'
/* util */
import { isEnterpriseEdition } from '@src/util/version'
/* vue */
import { Prop } from 'vue-property-decorator'

class TaskAllotUserTableData extends TaskAllotUserTableComponents {
  /* 改变等待状态的方法 */
  @Prop() readonly changePending: Function | undefined
  
  /* 地图对象 */
  public AMap: any = null
  /* 地图弹窗对象 */
  public AMapInfoWindow: any = null
  /* 是否禁用加载更多 */
  public isDisableLoadmore: boolean = false
  /* 最后一次点击的标记头像 */
  public lastClickedUserMarker: { marker: any, data: TaskAllotUserInfo | null } = { marker: null, data: null }
  /* 表格排序数据 */
  public orderDetail: { order: boolean, code: number } | {} = {}
  /* 等待状态 */
  public pending: boolean = false
  /* 当前选择的负责人 */
  public selectExecutorUser: TaskAllotUserInfo = new TaskAllotUserInfo()
  /* 当前选择的团队 */
  public selectTeams: Tag[] = []
  /* 当前选择的团队人员列表 */
  public selectTeamUsers: LoginUser[] = []
  /* 当前选择的部门人员列表 */
  public selectDeptUsers: LoginUser[] = []
  /* 当前选择的距离 */
  public selectLocation: number = AllotLocationEnum.All
  /* 当前选择的工作状态 */
  public selectUserState: string[] = []
  /* 当前选择的排序方式 */
  public selectSortord: number | null = AllotSortedEnum.Distance
  /* 当前选择的排序方式 备份数据 */
  public backupSelectSorted: number | null = AllotSortedEnum.Distance
  /* 表格key 随机数 */
  public tableKey: number = Math.random() * 1000 >> 2
  /* 团队用户page */
  public teamUserPage: Page =  new Page()
  /* 用户page */
  public userPage: Page =  new Page({ pageNum: 0 })
  /* 用户选择状态 */
  public userPageCheckedMap: {[x: number]: boolean} = {}
  /* 用户标记列表 */
  public userMarkers: any[] = []
  /* 距离选项列表 */
  public locationOptions: ElSelectOption[] = [
    { label: '距离', value: AllotLocationEnum.All },
    { label: '5公里以内', value: AllotLocationEnum.Five },
    { label: '10公里以内', value: AllotLocationEnum.Ten },
    { label: '20公里以内', value: AllotLocationEnum.Twenty },
    { label: '50公里以内', value: AllotLocationEnum.Fifty },
    { label: '其他', value: AllotLocationEnum.Other },
  ]
  /* 距离 其他数据 */
  public locationOtherData: {
    minValue: number | null ,
    maxValue: number | null ,
    isChecked?: boolean
  } = { 
    minValue: 0,
    maxValue: null,
    isChecked: false
  }
  /* 排序方式列表 */
  public sortordOptions: ElSelectOption[] = [
    { label: '距离最近', value: AllotSortedEnum.Distance },
    { label: '30天内好评率最高', value: AllotSortedEnum.TaskDegreePercentByMonth },
    { label: '30天工作用时最短', value: AllotSortedEnum.TaskWorkUsedTimeByMonth },
    { label: '30天内接单最多', value: AllotSortedEnum.ExecutorTaskByMonth },
    { label: '30天内接单响应最快', value: AllotSortedEnum.TaskAcceptTimeByMonth },
    { label: '30天内完成最多', value: AllotSortedEnum.FinishTaskByMonth },
  ]
  /* 表格列 */
  public columns: Column[] = (
    // 企业版 和 标准版 有所区分 (企业版支持 车程, 驾车距离)
    isEnterpriseEdition() ? TaskAllotUserTableEnterpriseEditionColumns : TaskAllotUserTableStandEditionColumns
  )
}

export default TaskAllotUserTableData