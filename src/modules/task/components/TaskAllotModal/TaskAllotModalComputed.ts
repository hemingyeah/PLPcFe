/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* data */
import TaskAllotModalData from '@src/modules/task/components/TaskAllotModal/TaskAllotModalData'

class TaskAllotModalComputed extends TaskAllotModalData {
  get allotContentStyle() {
    return {
      [TaskAllotTypeEnum.Person]: { display: this.allotType === TaskAllotTypeEnum.Person ? 'block' : 'none' },
      [TaskAllotTypeEnum.Pool]: { display: this.allotType === TaskAllotTypeEnum.Pool ? 'block' : 'none' },
      [TaskAllotTypeEnum.Auto]: { display: this.allotType === TaskAllotTypeEnum.Auto ? 'block' : 'none' },
    }
  }
}

export default TaskAllotModalComputed
