/* components */
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
import TaskAllotUserMap from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
import ContactUserItem from '@src/component/common/BaseContact/ContactUserItem.vue'
/* entity */
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* model */
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.scss'
/* vue */
import { Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import TaskAllotExecutorRender from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorRender.tsx'

@Component({ 
  name: ComponentNameEnum.TaskAllotExcutor,
  components: {
    TaskAllotUserTable,
    TaskAllotUserMap,
    UserCard,
    ContactUserItem
  }
})
export default class TaskAllotExcutor extends TaskAllotExecutorRender {
  
  render(h: CreateElement) {
    // 属性列表
    const attrs = this.getAttributes()
    
    return (
      <div class={ComponentNameEnum.TaskAllotExcutor} {...attrs}>
        { this.renderTaskAllotExecutorHeader() }
        { 
          this.isShowTaskAllotUserTableComponent && (
            <task-allot-user-table
              ref='TaskAllotUserTableComponent' 
              changePending={(pending: boolean) => this.outsideSetPending(pending)}
              sortChangeFunc={(option: any) => this.outsideSortChangedHandler(option)}
              style={this.modeComponents[TaskAllotTypeModeEnum.List]}
            >
            </task-allot-user-table>
          )
        }
        { 
          this.isMapMode && this.isShowTaskAllotUserMapComponent && (
            <task-allot-user-map
              ref='TaskAllotUserMapComponent'
              isShowSynergy={this.isShowSynergy}
              isCustomerManager={this.isCustomerManager}
              customerTags={this.customerTags}
              selectedExcutorUser={this.selectedExcutorUser}
              stateColorMap={this.stateColorMap}
              style={this.modeComponents[TaskAllotTypeModeEnum.Map]}
              onExecutorChange={(user: TaskAllotUserInfo) => this.selectedExcutorUser = user}
            >
            </task-allot-user-map>
          )
        }
      </div>
    )
  
  }
}

