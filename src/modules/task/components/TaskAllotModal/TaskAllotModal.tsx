/* components */
import TaskAllotType from '@src/modules/task/components/TaskAllotModal/TaskAllotType/TaskAllotType.tsx'
import TaskAllotExcutor from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.tsx'
import UserButton from '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* vue */
import { CreateElement } from 'vue'
/* vue */
import { Component, Prop } from 'vue-property-decorator'
/* render */
import TaskAllotModalRender from '@src/modules/task/components/TaskAllotModal/TaskAllotModalRender.tsx'
/* scss */
import './TaskAllotModal.scss'

@Component({
  name: ComponentNameEnum.TaskAllotModal,
  components: {
    [TaskAllotExcutor.name]: TaskAllotExcutor,
    [TaskAllotType.name]: TaskAllotType,
    [UserButton.name]: UserButton,
  }
})

export default class TaskAllotModal extends TaskAllotModalRender {
  
  mounted() {
    this.fetchCustomer()
  }
  
  render(h: CreateElement) {
    const attrs = {
      class: 'task-allot-modal',
      props: {
        title: '派单'
      },
      on: {
        'update:show': (val: any) => {
          this.showTaskAllotModal = val
        }
      }
    }

    return (
      <base-modal show={this.showTaskAllotModal} {...attrs}>
        <div class='task-allot-nav'>
          <div class='task-allot-type'>
            <span class='task-allot-nav-title'>派单方式</span>
            <task-allot-type type={this.allotType} onChange={(value: TaskAllotTypeEnum) => this.handlerAllotTypeChange(value)} />
          </div>
          <div class='task-allot-executor'>
            <span class='task-allot-nav-title'>负责人</span>
            <user-button />
          </div>
          {this.renderSynergy()}
        </div>
        <div class='task-allot-content'>
          <keep-alive>
            <task-allot-excutor
              onSetExecutor={(user: any) => this.setExecutorUser(user)} 
              onSetSynergy={(user: any) => this.setSynergyUser(user)} 
              ref="TaskAllotExcutorComponent" 
            />
          </keep-alive>
        </div>
      </base-modal>
    )
  }

}

