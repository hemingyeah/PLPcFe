/* entity */
import Customer from '@model/entity/Customer'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskConfig from '@model/types/TaskConfig'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* props */
import TaskAllotModalProps from '@src/modules/task/components/TaskAllotModal/TaskAllotModalProps'

class TaskAllotModalData extends TaskAllotModalProps {
  /* 派单方式 */
  public allotType: TaskAllotTypeEnum = TaskAllotTypeEnum.Person
  /* 客户信息 */
  public customer: Customer = {}
  /* 负责人 */
  public executorUser: LoginUser = new LoginUser()
  /* 是否是按团队派单 */
  public isAllotByTag: boolean = true
  /* 等待状态 */
  public pending: boolean = false
  /* 是否显示派单弹窗 */
  public showTaskAllotModal: boolean = false
  /* 协同人列表 */
  public synergyUserList: LoginUser[] = []
  /* 工单设置 */
  public taskConfig: TaskConfig = new TaskConfig()
}

export default TaskAllotModalData
