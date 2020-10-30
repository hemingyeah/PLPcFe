/* vue */
import { CreateElement } from 'vue'
/* render */
import TaskAllotModalRender from '@src/modules/task/components/TaskAllotModal/TaskAllotModalRender.tsx'
/* scss */
import './TaskAllotModal.scss'

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
            <task-allot-type type={this.allotType} onChange={this.handlerAllotTypeChange} />
          </div>
          <div class='task-allot-executor'>
            <span class='task-allot-nav-title'>负责人</span>
            <user-button />
          </div>
          {this.renderSynergy()}
        </div>
        <div class='task-allot-content'>
          <task-allot-user-table ref='TaskAllotUserTableComponent' />
          <div class='task-allot-map'>
            <div class='task-allot-user-content'>
              <div id='MapContainer'></div>
            </div>
          </div>
        </div>
      </base-modal>
    )
  }

}

