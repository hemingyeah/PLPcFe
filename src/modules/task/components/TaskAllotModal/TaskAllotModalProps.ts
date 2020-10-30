/* vue */
import { Prop } from 'vue-property-decorator'
/* components */
import TaskAllotModalComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComponents'

class TaskAllotModalProps extends TaskAllotModalComponents {
  /* 客户id */
  @Prop() readonly customerId: string | undefined
  /* 用户工作状态 */
  @Prop() readonly userStateMap: any | undefined
}

export default TaskAllotModalProps