/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import TaskConfig from '@model/types/TaskConfig'
import Tag from '@model/entity/Tag/Tag'
import Customer from '@model/entity/Customer'
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* model */
import Page from '@model/Page'
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
/* props */
import TaskAllotExecutorProps from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorProps'
/* vue */
import { Prop } from 'vue-property-decorator'
/* types */
import StateColorMap from '@model/types/StateColor'

class TaskAllotExecutorData extends TaskAllotExecutorProps {
  /* 客户信息 */
  @Prop() readonly customer: Customer | undefined
  /* 是否为转派 */
  @Prop() readonly isReAllot: boolean | undefined
  /* 是否显示协同人 */
  @Prop() readonly isShowSynergy: boolean | undefined
  /* 派单方式 模式(列表，地图) */
  @Prop() readonly mode: TaskAllotTypeModeEnum | undefined
  /* 工作状态颜色数组 */
  @Prop() readonly stateColorMap: StateColorMap | undefined
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  /* 工单设置 */
  @Prop() readonly taskConfig: TaskConfig | undefined
  
  /* 客户团队信息 */
  public customerTags: Tag[] = []
  /* 是否显示人员卡片信息 */
  public isShowUserCard: boolean = false
  /* 已经加载的组件列表 TODO: 实现 keep-alive component 功能 */
  public loadedComponents: string[] = [ComponentNameEnum.TaskAllotUserTable]
  /* 等待状态 */
  public pending: boolean = false
  /* 选择的负责人信息 */
  public selectedExcutorUser: TaskAllotUserInfo | null = null
  /* 当前选择的团队 */
  public selectTeams: Tag[] = []
  /* 当前选择的团队人员列表 */
  public selectTeamUsers: LoginUser[] = []
  /* 当前选择的部门人员列表 */
  public selectDeptUsers: LoginUser[] = []
  /* 协同人列表 */
  public synergyUserList: LoginUser[] = []
  /* 团队用户page */
  public teamUserPage: Page =  new Page()
}

export default TaskAllotExecutorData