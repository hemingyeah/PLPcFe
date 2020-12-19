/* components */
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
import TaskAllotUserMap from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
import ContactUserItem from '@src/component/common/BaseContact/ContactUserItem.vue'
import UiInput from '@src/component/ui/UiInput/UiInput.tsx'
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
    ContactUserItem,
    UiInput
  }
})
export default class TaskAllotExcutor extends TaskAllotExecutorRender {
  
  render(h: CreateElement) {
    // 属性列表
    const attrs = this.getAttributes()
    
    return (
      <div class={ComponentNameEnum.TaskAllotExcutor} {...attrs}>
        { this.renderTaskAllotExecutorHeader() }
        { this.renderTaskAllotExecutorBackgroundChunk() }
        { this.renderTaskAllotUserTableHeader() }
        { 
          this.isShowTaskAllotUserTableComponent && (
            <task-allot-user-table
              ref='TaskAllotUserTableComponent' 
              changePending={(pending: boolean) => this.outsideSetPending(pending)}
              sortChangeFunc={(option: any) => this.outsideSortChangedHandler(option)}
              style={this.modeComponents[TaskAllotTypeModeEnum.List]}
              userPageCheckedMap={this.userPageCheckedMap}
            >
            </task-allot-user-table>
          )
        }
        { 
          (
            <task-allot-user-map
              ref='TaskAllotUserMapComponent'
              customerTags={this.customerTags}
              isShowSynergy={this.isShowSynergy}
              isCustomerManager={this.isCustomerManager}
              selectedExcutorUser={this.selectedExcutorUser}
              stateColorMap={this.stateColorMap}
              style={this.modeComponents[TaskAllotTypeModeEnum.Map]}
              task={this.task}
              taskTypesMap={this.taskTypesMap}
              onExecutorChange={(user: TaskAllotUserInfo) => this.selectedExcutorUser = user}
            >
            </task-allot-user-map>
          )
        }
        <base-table-advanced-setting onSave={(value: any) => this.saveTaskAllotTableColumn(value)} ref='BaseTableAdvancedSettingComponent' />
      </div>
    )
  
  }
}

