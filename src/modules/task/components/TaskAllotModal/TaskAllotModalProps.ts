/* vue */
import { Prop } from 'vue-property-decorator'
/* components */
import TaskAllotModalComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComponents'
/* entity */
import InitDataLoginUser from '@model/entity/InitDataLoginUser'

class TaskAllotModalProps extends TaskAllotModalComponents {
  /* 当前登录用户 */
  @Prop() readonly loginUser: InitDataLoginUser | undefined
  /* 工单信息 */
  @Prop() readonly task: any | undefined
}

export default TaskAllotModalProps