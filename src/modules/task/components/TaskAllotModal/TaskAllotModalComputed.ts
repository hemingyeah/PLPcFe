/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* data */
import TaskAllotModalData from '@src/modules/task/components/TaskAllotModal/TaskAllotModalData'

const AllotContentComponentMap = {
  [TaskAllotTypeEnum.Person]: ComponentNameEnum.TaskAllotExcutor,
  [TaskAllotTypeEnum.Pool]: ComponentNameEnum.TaskAllotPool,
  [TaskAllotTypeEnum.Auto]: ComponentNameEnum.TaskAllotAuto
}

class TaskAllotModalComputed extends TaskAllotModalData {
  get allotContentComponent() {
    return AllotContentComponentMap[this.allotType]
  }
}

export default TaskAllotModalComputed
