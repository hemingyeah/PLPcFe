/* components */
import TaskAllotUserMap from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.tsx'
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
/* vue */
import VC from '@model/VC'
import { Ref } from 'vue-property-decorator'

class TaskAllotExecutorComponents extends VC<{}> {
  /* 工单指派负责人 -> 人员表格组件 */
  @Ref() readonly TaskAllotUserTableComponent!: TaskAllotUserTable
  /* 工单指派负责人 -> 人员地图组件 */
  @Ref() readonly TaskAllotUserMapComponent!: TaskAllotUserMap
}

export default TaskAllotExecutorComponents