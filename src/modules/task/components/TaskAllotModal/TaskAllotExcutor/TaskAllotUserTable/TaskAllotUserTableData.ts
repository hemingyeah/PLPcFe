/* component */
import TaskAllotUserTableComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableComponents'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
/* interface */
import { ElSelectOption } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* model */
import Page from '@model/Page'
import { TaskAllotUserTableEnterpriseEditionColumns, TaskAllotUserTableStandEditionColumns } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
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
  /* 表格排序数据 */
  public orderDetail: any = {}
  /* 当前选择的负责人 */
  public selectExecutorUser: LoginUser | null = null
  /* 当前选择的团队 */
  public selectTeams: Tag[] = []
  /* 当前选择的团队人员列表 */
  public selectTeamUsers: LoginUser[] = []
  /* 当前选择的部门人员列表 */
  public selectDeptUsers: LoginUser[] = []
  /* 当前选择的距离 */
  public selectLocation: any = '5'
  /* 当前选择的工作状态 */
  public selectUserState: string[] = []
  /* 当前选择的排序方式 */
  public selectSortord: string = ''
  /* 表格key 随机数 */
  public tableKey: number = Math.random() * 1000 >> 2
  /* 团队用户page */
  public teamUserPage: Page =  new Page()
  /* 用户page */
  public userPage: Page =  new Page()
  /* 用户选择状态 */
  public userPageCheckedMap: {[x: number]: boolean} = {}
  /* 距离选项列表 */
  public locationOptions: ElSelectOption[] = [
    { label: '5公里以内', value: '5'},
    { label: '10公里以内', value: '10'},
    { label: '20公里以内', value: '20'},
    { label: '50公里以内', value: '50'},
    { label: '其他', value: ''},
  ]
  /* 距离 其他数据 */
  public locationOtherData: {
    minValue: number | null,
    maxValue: number | null,
    isChecked?: boolean
  } = { 
    minValue: null,
    maxValue: null,
    isChecked: false
  }
  /* 排序方式列表 */
  public sortordOptions: ElSelectOption[] = [
    { label: '距离最近', value: '5'},
    { label: '30天内好评率最高', value: '10'},
    { label: '30天工作用时最短', value: '20'},
    { label: '30天内接单最多', value: '50'},
    { label: '30天内完成最多', value: '30'},
  ]
  /* 表格列 */
  public columns: Column[] = (
    // 企业版 和 标准版 有所区分 (企业版支持 车程, 驾车距离)
    isEnterpriseEdition() ? TaskAllotUserTableEnterpriseEditionColumns : TaskAllotUserTableStandEditionColumns
  )
}

export default TaskAllotUserTableData