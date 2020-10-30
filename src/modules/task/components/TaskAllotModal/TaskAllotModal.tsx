/* components */
import TaskAllotType from '@src/modules/task/components/TaskAllotModal/TaskAllotType/TaskAllotType.tsx'
import TaskAllotExcutor from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.tsx'
import UserButton from '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
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
  // /* 客户id */
  @Prop() readonly customerId: string | undefined
  /* 用户工作状态 */
  @Prop() readonly userStateMap: any | undefined
  
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
            <task-allot-type type={this.allotType} onChange={this.handlerAllotTypeChange} />
          </div>
          <div class='task-allot-executor'>
            <span class='task-allot-nav-title'>负责人</span>
            <user-button />
          </div>
          {this.renderSynergy()}
        </div>
        <div class='task-allot-content'>
          <task-allot-excutor ref="TaskAllotExcutorComponent" />
        </div>
      </base-modal>
    )
  }

}

