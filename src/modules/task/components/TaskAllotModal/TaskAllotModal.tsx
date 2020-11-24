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
    TaskAllotExcutor,
    TaskAllotPool,
    TaskAllotAuto,
    TaskAllotType,
    UserButton,
    ProposeApproveDialog
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
            {this.renderTaskAllotType()}
          </div>
          {this.renderExcutor()}
          {this.renderSynergy()}
          {this.renderReAllotReason()}
        </div>
        
        <div class='task-allot-content'>
          <keep-alive>
            <div class='task-allot-content-active'>
              <div class='task-allot-excutor-container' style={this.allotContentStyle[TaskAllotTypeEnum.Person]}>
                <task-allot-excutor
                  ref='TaskAllotExcutorComponent'
                  task={this.task}
                  loginUser={this.loginUser}
                  stateColorMap={this.stateColorMap}
                  onSetExecutor={(user: LoginUser) => this.setExecutorUser(user)} 
                  onSetSynergy={(user: LoginUser) => this.setSynergyUser(user)} 
                />
              </div>
              {
                this.isShowTaskPoolComponent
                && (
                  <task-allot-pool 
                    ref='TaskAllotPoolComponent'
                    show={this.allotType === TaskAllotTypeEnum.Pool}
                    style={this.allotContentStyle[TaskAllotTypeEnum.Pool]}
                    stateColorMap={this.stateColorMap}
                    task={this.task}
                    taskConfig={this.taskConfig}
                    loginUser={this.loginUser}
                  />
                )
              }
              {
                this.isShowTaskAutoDispatchComponent
                && (
                  <task-allot-auto
                    show={this.allotType === TaskAllotTypeEnum.Auto} 
                    task={this.task}
                    loginUser={this.loginUser}
                    style={this.allotContentStyle[TaskAllotTypeEnum.Auto]}
                    changeMatchRule={(rule: AutoDispatchListItem | null) => this.outsideSetMatchRule(rule)}
                  />
                )
              }
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

