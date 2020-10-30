/* components */
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
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
  
  /**
   * @description 获取团队用户
   * -- 支持外部调用的
  */
  public outsideFetchTeamUsers() {
    // @ts-ignore
    this.$refs.TaskAllotUserTableComponent.outsideFetchTeamUsers()
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotExcutor}>
        <task-allot-user-table ref='TaskAllotUserTableComponent' />
        <div class='task-allot-map'>
          
          <div id='MapContainer'></div>
          
          <div class='task-allot-user-content'>
            <user-card />
          </div>
          
        </div>
      </div>
    )
  }
  
}

