/* components */
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.tsx'
import TaskAllotUserMap from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.tsx'
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
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
    UserCard
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
              style={this.modeComponents[TaskAllotTypeModeEnum.List]}
            >
            </task-allot-user-table>
          )
        }
        { 
          this.isMapMode && this.isShowTaskAllotUserMapComponent && (
            <task-allot-user-map
              ref='TaskAllotUserMapComponent'
              style={this.modeComponents[TaskAllotTypeModeEnum.Map]} 
            >
            </task-allot-user-map>
          )
        }
      </div>
    )
  
  }
}

