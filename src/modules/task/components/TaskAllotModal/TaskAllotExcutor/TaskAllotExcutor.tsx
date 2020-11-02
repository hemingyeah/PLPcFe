/* components */
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.scss'
/* vue */
import { Vue, Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'

@Component({ 
  name: ComponentNameEnum.TaskAllotExcutor,
  components: {
    [TaskAllotUserTable.name]: TaskAllotUserTable,
    [UserCard.name]: UserCard
  }
})
export default class TaskAllotExcutor extends Vue {
  
  /* 当前选择的负责人 */
  get selectExecutorUser() {
    // @ts-ignore
    return this.$refs.TaskAllotUserTableComponent?.selectExecutorUser
  }
  
  /**
   * @description 获取团队用户
   * -- 支持外部调用的
  */
  public outsideFetchUsers() {
    // @ts-ignore
    this.$refs.TaskAllotUserTableComponent.outsideFetchUsers()
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotExcutor}>
        <task-allot-user-table ref='TaskAllotUserTableComponent' />
        <div class='task-allot-map'>
          
          <div id='MapContainer'></div>
          
          <div class='task-allot-user-content'>
            { this.selectExecutorUser && <user-card emitEventComponentName={ComponentNameEnum.TaskAllotExcutor} /> }
          </div>
          
        </div>
      </div>
    )
  }
  
}

