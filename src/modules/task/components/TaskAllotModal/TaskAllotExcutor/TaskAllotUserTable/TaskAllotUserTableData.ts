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
import { 
  AllotSortedEnum, 
  AllotLocationEnum, 
  TaskAllotUserTableEnterpriseEditionColumns, 
  TaskAllotUserTableStandEditionColumns,
  AllotLabelEnum
} from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* types */
import Column from '@model/types/Column'
/* util */
import { isEnterpriseEdition } from '@src/util/version'
/* vue */
import { Prop } from 'vue-property-decorator'

class TaskAllotUserTableData extends TaskAllotUserTableComponents {
  /* 表格列 */
  @Prop() readonly columns: Column[] | undefined
  /* 改变等待状态的方法 */
  @Prop() readonly changePending: Function | undefined
  /* 拖动变化方法 */
  @Prop() readonly dragendFunc: Function | undefined
  /* 是否禁用加载更多 */
  @Prop() readonly isDisableLoadmore: boolean | undefined
  /* 排序变化方法 */
  @Prop() readonly sortChangeFunc: Function | undefined
  /* 表格高度 */
  @Prop() readonly tableHeight: string | undefined
  /* 用户选择状态 */
  @Prop() readonly userPageCheckedMap: {[x: number]: boolean} | undefined
  /* 是否是引导展示 */
  @Prop() readonly justGuide: any | undefined
  
  /* 地图对象 */
  public AMap: any = null
  /* 地图弹窗对象 */
  public AMapInfoWindow: any = null
  /* 最后一次点击的标记头像 */
  public lastClickedUserMarker: { marker: any, data: TaskAllotUserInfo | null } = { marker: null, data: null }
  /* 表格排序数据 */
  public orderDetail: { order: boolean, code: number } | {} = {}
  /* 等待状态 */
  public pending: boolean = false
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
  public selectSortord: number = AllotSortedEnum.FinishTaskByMonth
  /* 表格key 随机数 */
  public tableKey: number | string = Math.random() * 1000 >> 2
  /* 团队用户page */
  public teamUserPage: Page =  new Page()
  /* 用户page */
  public userPage: Page =  new Page({ pageNum: 0 })
  /* 用户标记列表 */
  public userMarkers: any[] = []
  /* 可见的团队列表 */
  public visibleTeams: Tag[] = []
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
  /* 工单指派人员列表 */
  public taskAllotUserList: TaskAllotUserInfo[] = []

}

export default TaskAllotUserTableData