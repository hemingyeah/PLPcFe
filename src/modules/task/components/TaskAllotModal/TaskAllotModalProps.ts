/* vue */
import { Prop } from 'vue-property-decorator'
/* components */
import TaskAllotModalComponents from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComponents'
/* entity */
import InitDataLoginUser from '@model/entity/InitDataLoginUser'
import Field from '@model/entity/Field'

class TaskAllotModalProps extends TaskAllotModalComponents {
  /* 是否是转派状态 */
  @Prop() readonly isReAllot: boolean | undefined
  /* 当前登录用户 */
  @Prop() readonly loginUser: InitDataLoginUser | undefined
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  /*异常列表 */ 
  /*异常列表 */
  @Prop()
  readonly backList: Array<string>
    /*异常列表 */
    = []
  /*异常列表 */ 
  @Prop() readonly systemAdmin: any | undefined
  /* 工单字段列表 */
  @Prop() readonly fields: Field[] | undefined
}

export default TaskAllotModalProps