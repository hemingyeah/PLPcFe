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
  
  created() {
    // 计算表格高度
    this.computedTableHeight()
  }
  
  mounted() {
    // 构建列
    this.buildColumns()
  }
  
  render(h: CreateElement) {
    // 属性列表
    const attrs = this.getAttributes()
    
    return (
      <div class={ComponentNameEnum.TaskAllotExcutor} {...attrs}>
        { this.renderTaskAllotExecutorHeader() }
        { this.renderTaskAllotReasonRow() }
        { this.renderTaskAllotExecutorBackgroundChunk() }
        { this.renderTaskAllotUserTableHeader() }
        {
          this.isShowTaskAllotUserTableComponent && (
            <task-allot-user-table
              ref='TaskAllotUserTableComponent'
              columns={this.columns}
              changePending={(pending: boolean) => this.outsideSetPending(pending)}
              dragendFunc={(newWidth: number, oldWidth: number, tableColumn: any = {}) => {
                this.outsideDragendHandler(newWidth, oldWidth, tableColumn)
              }}
              isDisableLoadmore={this.isDisableLoadmore}
              sortChangeFunc={(option: any) => this.outsideSortChangedHandler(option)}
              style={this.modeComponents[TaskAllotTypeModeEnum.List]}
              tableHeight={this.tableHeight}
              userPageCheckedMap={this.userPageCheckedMap}
            >
            </task-allot-user-table>
          )
        }
        { 
          (
            <task-allot-user-map
              ref='TaskAllotUserMapComponent'
              customer={this.customer}
              customerTags={this.customerTags}
              isShowSynergy={this.isShowSynergy}
              selectedExcutorUser={this.selectedExcutorUser}
              stateColorMap={this.stateColorMap}
              show={this.isMapMode}
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

