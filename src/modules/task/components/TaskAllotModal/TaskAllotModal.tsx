/* components */
import TaskAllotType from '@src/modules/task/components/TaskAllotModal/TaskAllotType/TaskAllotType.tsx'
import TaskAllotExcutor from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExcutor.tsx'
import TaskAllotPool from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPool.tsx'
import TaskAllotAuto from '@src/modules/task/components/TaskAllotModal/TaskAllotAuto/TaskAllotAuto.tsx'
import UserButton from '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.tsx'
import ProposeApproveDialog from '@src/modules/task/view/components/ProposeApproveDialog.vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* model */
import { TaskPoolNotificationTypeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotPool/TaskAllotPoolModel'
/* vue */
import { CreateElement } from 'vue'
/* vue */
import { Component } from 'vue-property-decorator'
/* render */
import TaskAllotModalRender from '@src/modules/task/components/TaskAllotModal/TaskAllotModalRender.tsx'
/* scss */
import './TaskAllotModal.scss'
/* type */
import AutoDispatchListItem from '@model/types/AutoDispatchListItem'

@Component({
  name: ComponentNameEnum.TaskAllotModal,
  components: {
    [TaskAllotExcutor.name]: TaskAllotExcutor,
    [TaskAllotPool.name]: TaskAllotPool,
    [TaskAllotAuto.name]: TaskAllotAuto,
    [TaskAllotType.name]: TaskAllotType,
    [UserButton.name]: UserButton,
    [ProposeApproveDialog.name]: ProposeApproveDialog
  }
})

export default class TaskAllotModal extends TaskAllotModalRender {
    
  render(h: CreateElement) {    
    const attrs = this.getAttributes()
    
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
                ref='TaskAllotExcutorComponent'
                style={this.allotContentStyle[TaskAllotTypeEnum.Person]}
                stateColorMap={this.stateColorMap}
                onSetExecutor={(user: LoginUser) => this.setExecutorUser(user)} 
                onSetSynergy={(user: LoginUser) => this.setSynergyUser(user)} 
              />
              <task-allot-pool 
                ref='TaskAllotPoolComponent'
                show={this.allotType === TaskAllotTypeEnum.Pool}
                style={this.allotContentStyle[TaskAllotTypeEnum.Pool]}
                stateColorMap={this.stateColorMap}
                task={this.task}
                changeNotificationChecked={(value: TaskPoolNotificationTypeEnum[]) => this.onTaskNotificationCheckedChanged(value)}
                changeNotificationUsers={(value: LoginUser[]) => this.onTaskNotificationUsersChanged(value)}
              />
              <task-allot-auto
                show={this.allotType === TaskAllotTypeEnum.Auto} 
                style={this.allotContentStyle[TaskAllotTypeEnum.Auto]}
                changeMatchRule={(rule: AutoDispatchListItem | null) => this.outsideSetMatchRule(rule)}
              >
              </task-allot-auto>
            </div>
          </keep-alive>
        </div>
        
        <propose-approve-dialog ref='ApproveDialog' taskId={this?.task?.id} />
        
        <div slot='footer' class='dialog-footer'>
            <el-button onClick={() => this.close()}>取 消</el-button>
            <el-button type='primary' disabled={this.pending} onClick={() => this.submit()}>确 定</el-button>
        </div>
        
      </base-modal>
    )
  }

}

