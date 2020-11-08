/* components */
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
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
  
  /* 是否显示人员卡片信息 */
  public isShowUserCard: boolean = false
  public selectedExcutorUser: LoginUser | null = null
  
  /**
   * @description 获取团队用户
   * -- 支持外部调用的
  */
  public outsideFetchUsers() {
    // @ts-ignore
    this.$refs.TaskAllotUserTableComponent.outsideFetchUsers()
  }
  
  /**
   * @description 设置选择的负责人
   * -- 支持外部调用的
  */
  public outsideSetSelectedExcutorUser(isSelected: boolean, user: LoginUser) {
    this.isShowUserCard = isSelected
    this.selectedExcutorUser = isSelected ? user : null
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotExcutor}>
        <task-allot-user-table ref='TaskAllotUserTableComponent' />
        <div class='task-allot-map'>
          
          <div id='MapContainer'></div>
          
          <div class='task-allot-user-content'>
            { this.isShowUserCard && <user-card userId={this.selectedExcutorUser?.userId} emitEventComponentName={ComponentNameEnum.TaskAllotExcutor} /> }
          </div>
          
        </div>
      </div>
    )
  }
  
}

