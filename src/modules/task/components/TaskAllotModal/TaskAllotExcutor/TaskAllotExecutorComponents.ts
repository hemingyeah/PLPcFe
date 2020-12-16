import VC from '@model/VC'
import TaskAllotUserMap from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.tsx'
import { Ref } from 'vue-property-decorator'

class TaskAllotExecutorComponents extends VC<{}> {
  @Ref() readonly TaskAllotUserMapComponent!: TaskAllotUserMap
}

export default TaskAllotExecutorComponents