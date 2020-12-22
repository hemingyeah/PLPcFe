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
import Tag from '@model/entity/Tag/Tag'
/* vue */
import { CreateElement } from 'vue'
/* vue */
import { Component } from 'vue-property-decorator'
/* render */
import TaskAllotModalRender from '@src/modules/task/components/TaskAllotModal/TaskAllotModalRender.tsx'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotModal.scss'
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
        
        {this.renderTaskAllotHeader()}
        
        <div class='task-allot-content'>
          <keep-alive>
            <div class='task-allot-content-active'>
              <div class='task-allot-excutor-container' style={this.allotContentStyle[TaskAllotTypeEnum.Person]}>
                <task-allot-excutor
                  ref='TaskAllotExcutorComponent'
                  customer={this.customer}
                  executor={this.executorUser}
                  isShowSynergy={this.allowModifySynergyUser}
                  isReAllot={this.isReAllot}
                  loginUser={this.loginUser}
                  mode={this.allotTypeMode}
                  reason={this.reason}
                  task={this.task}
                  taskConfig={this.taskConfig}
                  taskTypesMap={this.taskTypesMap}
                  stateColorMap={this.stateColorMap}
                  synergyUserList={this.synergyUserList}
                  onDeleteSynergyUser={(user: LoginUser) => this.outsideDeleteSynergyUser(user)}
                  onSetExecutor={(user: LoginUser) => this.setExecutorUser(user)}
                  onSetSynergy={(user: LoginUser) => this.setSynergyUser(user)}
                  onSetSynergys={(users: LoginUser[]) => this.outsideSetSynergyUsers(users)}
                  onSetCustomerTags={(tags: Tag[]) => this.outsideSetCustomerTags(tags)}
                  onSetReason={(value: string) => this.outsideSetReason(value)}
                />
              </div>
              {
                this.isShowTaskPoolComponent
                && (
                  <task-allot-pool 
                    ref='TaskAllotPoolComponent'
                    customer={this.customer}
                    customerTags={this.customerTags}
                    isShowSynergy={this.allowModifySynergyUser}
                    isReAllot={this.isReAllot}
                    loginUser={this.loginUser}
                    reason={this.reason}
                    show={this.allotType === TaskAllotTypeEnum.Pool}
                    style={this.allotContentStyle[TaskAllotTypeEnum.Pool]}
                    stateColorMap={this.stateColorMap}
                    task={this.task}
                    taskConfig={this.taskConfig}
                    taskTypesMap={this.taskTypesMap}
                    onDeleteSynergyUser={(user: LoginUser) => this.outsideDeleteSynergyUser(user)}
                    onSetExecutor={(user: LoginUser) => this.setExecutorUser(user)}
                    onSetSynergy={(user: LoginUser) => this.setSynergyUser(user)}
                    onSetSynergys={(users: LoginUser[]) => this.outsideSetSynergyUsers(users)}
                    onSetCustomerTags={(tags: Tag[]) => this.outsideSetCustomerTags(tags)}
                    onSetReason={(value: string) => this.outsideSetReason(value)}
                  />
                )
              }
              {
                this.isShowTaskAutoDispatchComponent
                && (
                  <task-allot-auto
                    loginUser={this.loginUser}
                    task={this.task}
                    show={this.allotType === TaskAllotTypeEnum.Auto} 
                    style={this.allotContentStyle[TaskAllotTypeEnum.Auto]}
                    changeMatchRule={(rule: AutoDispatchListItem | null) => this.outsideSetMatchRule(rule)}
                    onUsedChange={(used: boolean) => this.onIsUsedResultChanged(used)}
                  />
                )
              }
            </div>
          </keep-alive>
        </div>
        
        <propose-approve-dialog ref='ApproveDialog' taskId={this?.task?.id} onSuccess={() => this.allotSuccess()} />
        
        <div slot='footer' class='dialog-footer'>
            <el-button onClick={() => this.close()}>取 消</el-button>
            <el-button type='primary' disabled={this.pending} onClick={() => this.submit()}>提 交</el-button>
        </div>
        
      </base-modal>
    )
  }

}

