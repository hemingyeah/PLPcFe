/* components */
import TaskAllotType from '@src/modules/task/components/TaskAllotModal/TaskAllotType/TaskAllotType.tsx'
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTable.tsx'
import UserButton from '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* props */
import TaskAllotModalProps from '@src/modules/task/components/TaskAllotModal/TaskAllotModalProps.ts'
/* vue */
import { Component } from 'vue-property-decorator'
import VC from '@model/VC'

@Component({
  name: ComponentNameEnum.TaskAllotModal,
  components: {
    [TaskAllotType.name]: TaskAllotType,
    [TaskAllotUserTable.name]: TaskAllotUserTable,
    [UserButton.name]: UserButton
  }
})

class TaskAllotModalComponents extends VC<TaskAllotModalProps> {

}

export default TaskAllotModalComponents