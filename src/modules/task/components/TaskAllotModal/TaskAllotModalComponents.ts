/* components */
import TaskAllotExcutor from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.tsx'
import TaskAllotPool from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPool.tsx'
/* vue */
import { Ref } from 'vue-property-decorator'
import VC from '@model/VC'

interface Props {
  // /* 客户id */
  customerId: string | undefined
}

class TaskAllotModalComponents extends VC<Props> {
  @Ref() readonly TaskAllotExcutorComponent!: TaskAllotExcutor
  @Ref() readonly TaskAllotPoolComponent!: TaskAllotPool
}

export default TaskAllotModalComponents