/* component */
import TaskAllotUserTableComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableComponents'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
/* interface */
import { ElSelectOption } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* model */
import Page from '@model/Page'
import { TaskAllotUserTableColumns } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* types */
import Column from '@model/types/Column'

class TaskAllotUserTableData extends TaskAllotUserTableComponents {
  /* 地图对象 */
  public AMap: any = null
  /* 地图弹窗对象 */
  public AMapInfoWindow: any = null
  /* 当前选择的团队 */
  public selectTeams: Tag[] = []
  /* 当前选择的团队人员列表 */
  public selectTeamUsers: LoginUser[] = []
  /* 当前选择的距离 */
  public selectLocation: any = '5'
  /* 当前选择的工作状态 */
  public selectUserState: string[] = []
  /* 当前选择的排序方式 */
  public selectSortord: string = ''
  /* 表格key 随机数 */
  public tableKey: number = Math.random() * 1000 >> 2
  /* 用户page */
  public userPage: Page =  new Page()
  /* 距离选项列表 */
  public locationOptions: ElSelectOption[] = [
    { label: '5公里以内', value: '5'},
    { label: '10公里以内', value: '10'},
    { label: '20公里以内', value: '20'},
    { label: '50公里以内', value: '50'},
    { label: '其他', value: ''},
  ]
  /* 排序方式列表 */
  public sortordOptions: ElSelectOption[] = [
    { label: '距离最近', value: '5'},
    { label: '30天内好评率最高', value: '10'},
    { label: '30天工作用时最短', value: '20'},
    { label: '30天内接单最多', value: '50'},
    { label: '30天内完成最多', value: '30'},
  ]
  /* 表格列 */
  public columns: Column[] = TaskAllotUserTableColumns
}

export default TaskAllotUserTableData