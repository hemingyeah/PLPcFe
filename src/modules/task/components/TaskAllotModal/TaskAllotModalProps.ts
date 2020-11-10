/* vue */
import { Prop } from 'vue-property-decorator'
/* components */
import TaskAllotModalComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComponents'

class TaskAllotModalProps extends TaskAllotModalComponents {
  /* 客户id */
  @Prop() readonly customerId: string | undefined
  /* 当前登录用户 */
  @Prop() readonly loginUser: any | undefined
  /* 工单信息 */
  @Prop() readonly task: any | undefined
}

export default TaskAllotModalProps