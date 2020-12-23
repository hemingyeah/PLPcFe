/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import TaskConfig from '@model/types/TaskConfig'
import Tag from '@model/entity/Tag/Tag'
import Customer from '@model/entity/Customer'
import TaskType from '@model/entity/TaskType'
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* interface */
import { ElSelectOption } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* model */
import Page from '@model/Page'
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
import { 
  AllotSortedEnum, 
  AllotLocationEnum, 
  TaskAllotUserTableEnterpriseEditionColumns, 
  TaskAllotUserTableStandEditionColumns,
  AllotLabelEnum
} from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* props */
import TaskAllotExecutorProps from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorProps'
/* vue */
import { Prop } from 'vue-property-decorator'
/* types */
import StateColorMap from '@model/types/StateColor'
import Column from '@model/types/Column'
/* util */
import { isEnterpriseEdition } from '@src/util/version'
import {TaskAllotUserSearchModel} from "@model/param/in/Task";

class TaskAllotExecutorData extends TaskAllotExecutorProps {
  /* 客户信息 */
  @Prop() readonly customer: Customer | undefined
  /* 负责人信息信息 */
  @Prop() readonly executor: LoginUser | undefined
  /* 是否为转派 */
  @Prop() readonly isReAllot: boolean | undefined
  /* 是否显示协同人 */
  @Prop() readonly isShowSynergy: boolean | undefined
  /* 派单方式 模式(列表，地图) */
  @Prop() readonly mode: TaskAllotTypeModeEnum | undefined
  /* 转派原因 */
  @Prop() readonly reason: string | undefined
  /* 工作状态颜色数组 */
  @Prop() readonly stateColorMap: StateColorMap | undefined
  /* 协同人列表 */
  @Prop() readonly synergyUserList: LoginUser[] | undefined
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  /* 工单设置 */
  @Prop() readonly taskConfig: TaskConfig | undefined
  /* 工单类型列表 */
  @Prop() readonly taskTypesMap: { [x: string]: TaskType} | undefined
  
  /* 备份的获取人员数据参数 */
  public backupFetchUserParams: {
    map: TaskAllotUserSearchModel | null,
    list: TaskAllotUserSearchModel | null
  } = {
    map: null,
    list: null
  }
  /* 客户团队信息 */
  public customerTags: Tag[] = []
  /* 表格列 */
  public columns: Column[] = (
    // 企业版 和 标准版 有所区分 (企业版支持 车程, 驾车距离)
    isEnterpriseEdition() ? TaskAllotUserTableEnterpriseEditionColumns : TaskAllotUserTableStandEditionColumns
  )
  /* 是否显示人员卡片信息 */
  public isShowUserCard: boolean = false
  /* 是否禁用加载更多 */
  public isDisableLoadmore: boolean = false
  /* 已经加载的组件列表 TODO: 实现 keep-alive component 功能 */
  public loadedComponents: string[] = [ComponentNameEnum.TaskAllotUserTable]
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
  /* 标签配置列表 */
  public labelOptions: ElSelectOption[] = [
    { label: '员工标签', value: AllotLabelEnum.Null },
    { label: '主管', value: AllotLabelEnum.Leader },
    { label: '距离最近', value: AllotLabelEnum.DistanceSort },
    { label: '好评率前三', value: AllotLabelEnum.DegreeTopThree }
  ]
  /* 距离选项列表 */
  public locationOptions: ElSelectOption[] = [
    { label: '距离', value: AllotLocationEnum.All },
    { label: '5公里以内', value: AllotLocationEnum.Five },
    { label: '10公里以内', value: AllotLocationEnum.Ten },
    { label: '20公里以内', value: AllotLocationEnum.Twenty },
    { label: '50公里以内', value: AllotLocationEnum.Fifty },
    { label: '其他', value: AllotLocationEnum.Other },
  ]
  /* 地图用户page */
  public mapUserPage: Page =  new Page()
  /* 等待状态 */
  public pending: boolean = false
  /* 表格排序数据 */
  public orderDetail: { order: boolean, code: number } | {} = {}
  /* 当前选择的工作状态 */
  public selectUserState: string[] = []
  /* 当前选择的距离 */
  public selectLocation: number = AllotLocationEnum.All
  /* 当前选择的标签 */
  public selectLabel: AllotLabelEnum = AllotLabelEnum.Null
  /* 选择的负责人信息 */
  public selectedExcutorUser: TaskAllotUserInfo | null = null
  /* 当前选择的排序方式 */
  public selectSortord: number | null = null
  /* 当前选择的团队 */
  public selectTeams: Tag[] = []
  /* 当前选择的团队人员列表 */
  public selectTeamUsers: LoginUser[] = []
  /* 当前选择的部门人员列表 */
  public selectDeptUsers: LoginUser[] = []
  /* 团队用户page */
  public teamUserPage: Page =  new Page()
  /* 表格用户page */
  public tableUserPage: Page =  new Page()
  /* 表格排序筛选配置列表 */
  public tableSortLabelOptionss: ElSelectOption[] = [
    { label: '距离优先',  value: AllotSortedEnum.Distance },
    { label: '今日接单量低到高',  value: AllotSortedEnum.AcceptTaskByTodaySearch },
    { label: '好评优先',  value: AllotSortedEnum.TaskDegreePercentByMonth },
  ]
  /* 用户选择状态 */
  public userPageCheckedMap: {[x: string]: boolean} = {}
}

export default TaskAllotExecutorData