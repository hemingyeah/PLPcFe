/* components */
import TaskAllotType from '@src/modules/task/components/TaskAllotModal/TaskAllotType/TaskAllotType.tsx'
import TaskAllotExcutor from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.tsx'
import TaskAllotPool from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPool.tsx'
import TaskAllotAuto from '@src/modules/task/components/TaskAllotModal/TaskAllotAuto/TaskAllotAuto.tsx'
import UserButton from '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* vue */
import { CreateElement } from 'vue'
/* vue */
import { Component } from 'vue-property-decorator'
/* render */
import TaskAllotModalRender from '@src/modules/task/components/TaskAllotModal/TaskAllotModalRender.tsx'
/* scss */
import './TaskAllotModal.scss'

@Component({
  name: ComponentNameEnum.TaskAllotModal,
  components: {
    [TaskAllotExcutor.name]: TaskAllotExcutor,
    [TaskAllotPool.name]: TaskAllotPool,
    [TaskAllotAuto.name]: TaskAllotAuto,
    [TaskAllotType.name]: TaskAllotType,
    [UserButton.name]: UserButton,
  }
})

export default class TaskAllotModal extends TaskAllotModalRender {
  
  async mounted() {
    await this.fetchStateColor()
    this.fetchCustomer()
    this.fetchSynergyUserWithCustomerManager()
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
            <task-allot-type 
              type={this.allotType}
              taskConfig={this.taskConfig}
              onChange={(value: TaskAllotTypeEnum) => this.handlerAllotTypeChange(value)} 
            />
          </div>
          {this.renderExcutor()}
          {this.renderSynergy()}
        </div>
        
        <div class='task-allot-content'>
          <keep-alive>
            <div class='task-allot-content-active'>
              <task-allot-excutor
                style={this.allotContentStyle[TaskAllotTypeEnum.Person]}
                onSetExecutor={(user: LoginUser) => this.setExecutorUser(user)} 
                onSetSynergy={(user: LoginUser) => this.setSynergyUser(user)} 
                ref='TaskAllotExcutorComponent'
              />
              <task-allot-pool show={this.allotType === TaskAllotTypeEnum.Pool} style={this.allotContentStyle[TaskAllotTypeEnum.Pool]} />
              <task-allot-auto show={this.allotType === TaskAllotTypeEnum.Auto} style={this.allotContentStyle[TaskAllotTypeEnum.Auto]}></task-allot-auto>
            </div>
          </keep-alive>
        </div>
        
        <div slot='footer' class='dialog-footer'>
            <el-button >取 消</el-button>
            <el-button type='primary' disabled={this.pending}>确 定</el-button>
        </div>
        
      </base-modal>
    )
  }

}

