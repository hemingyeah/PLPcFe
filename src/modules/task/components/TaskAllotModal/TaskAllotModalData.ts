/* entity */
import Customer from '@model/entity/Customer'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskConfig from '@model/types/TaskConfig'
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* props */
import TaskAllotModalProps from '@src/modules/task/components/TaskAllotModal/TaskAllotModalProps'
/* types */
import StateColorMap from '@model/types/StateColor'
import AutoDispatchListItem from '@model/types/AutoDispatchListItem'
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'

class TaskAllotModalData extends TaskAllotModalProps {
  /* 派单方式 */
  public allotType: TaskAllotTypeEnum = TaskAllotTypeEnum.Person
  /* 客户信息 */
  public customer: Customer = {}
  /* 负责人 */
  public executorUser: LoginUser | TaskAllotUserInfo | null = null
  /* 是否是按团队派单 */
  public isAllotByTag: boolean = true
  /* 匹配的规则结果 */
  public matchRule: AutoDispatchListItem | null = null
  /* 最大协同人数量 */
  public readonly maxSynergyUserCount: number = 14
  /* 等待状态 */
  public pending: boolean = false
  /* 是否显示派单弹窗 */
  public showTaskAllotModal: boolean = false
  /* 协同人列表 */
  public synergyUserList: LoginUser[] = []
  /* 工作状态 */
  public stateColorMap: StateColorMap = {}
  /* 工单设置 */
  public taskConfig: TaskConfig = new TaskConfig()
  /* 工单通知复选框 */
  public taskPoolNotificationCheckd: TaskPoolNotificationTypeEnum[] = []
  /* 工单池通知自定义人员 */
  public taskPoolNotificationUsers: LoginUser[] = []
}

export default TaskAllotModalData
