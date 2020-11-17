/* components */
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.scss'
/* types */
import StateColorMap from '@model/types/StateColor'
/* util */
import { findComponentUpward } from '@src/util/assist'
/* vue */
import { Vue, Component, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'

@Component({ 
  name: ComponentNameEnum.TaskAllotExcutor,
  components: {
    [TaskAllotUserTable.name]: TaskAllotUserTable,
    [UserCard.name]: UserCard
  }
})
export default class TaskAllotExcutor extends Vue {
  /* 工作状态颜色数组 */
  @Prop() readonly stateColorMap: StateColorMap | undefined
  
  /* 是否显示人员卡片信息 */
  private isShowUserCard: boolean = false
  /* 等待状态 */
  private pending: boolean = false
  /* 选择的负责人信息 */
  private selectedExcutorUser: LoginUser | null = null
  
  /* 工单派单组件 */
  get TaskAllotModalComponent() {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
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
    let excutorUser = isSelected ? user : null
    this.isShowUserCard = isSelected
    this.selectedExcutorUser = excutorUser
  }
  
  /**
   * @description 向上 设置选择的负责人
   * -- 支持外部调用的
  */
  public outsideUpwardSetSelectedExcutorUser(isSelected: boolean, user: LoginUser) {
    this.outsideSetSelectedExcutorUser(isSelected, user)
    this.TaskAllotModalComponent.outsideSetExcutorUser(isSelected ? user : null)
  }
  
  /**
   * @description 设置等待状态
   * -- 支持外部调用的
  */
  public outsideSetPending(pending: boolean): void {
    this.pending = pending
  }
  
  render(h: CreateElement) {
    const attrs = {
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
    
    return (
      <div class={ComponentNameEnum.TaskAllotExcutor} {...attrs}>
        <task-allot-user-table 
          ref='TaskAllotUserTableComponent'
          changePending={this.outsideSetPending}
        />
        <div class='task-allot-map'>
          
          <div id='MapContainer'></div>
          
          <div class='task-allot-user-content'>
            { this.isShowUserCard 
              && (
                <user-card
                  stateColorMap={this.stateColorMap}
                  userId={this.selectedExcutorUser?.userId}
                  emitEventComponentName={ComponentNameEnum.TaskAllotExcutor} 
                /> 
              )
            }
          </div>
          
        </div>
      </div>
    )
  }
  
}

