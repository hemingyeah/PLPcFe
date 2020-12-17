/* components */
import TaskAllotExcutor from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.tsx'
/* vue */
import { Ref } from 'vue-property-decorator'
import VC from '@model/VC'

interface Props {
  // /* 客户id */
  customerId: string | undefined
}

class TaskAllotModalComponents extends VC<Props> {
  @Ref() readonly TaskAllotExcutorComponent!: TaskAllotExcutor
}

export default TaskAllotModalComponents