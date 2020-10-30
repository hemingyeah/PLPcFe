/* components */
import TaskAllotModalComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComponents'
/* entity */
import Customer from '@model/entity/Customer'
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'

class TaskAllotModalData extends TaskAllotModalComponents {
  /* 派单方式 */
  public allotType: TaskAllotTypeEnum = TaskAllotTypeEnum.Person
  /* 客户信息 */
  public customer: Customer = {}
  /* 是否是按团队派单 */
  public isAllotByTag: boolean = true
  /* 是否显示派单弹窗 */
  public showTaskAllotModal: boolean = false
  /* 协同人列表 */
  public synergyUserList: LoginUser[] = []
}

export default TaskAllotModalData
