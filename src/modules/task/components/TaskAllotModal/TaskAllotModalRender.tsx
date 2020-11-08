/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* methods */
import TaskAllotModalMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotModalMethods'

class TaskAllotModalRender extends TaskAllotModalMethods {
  /** 
   * @description 渲染负责人
  */
  public renderExcutor() {
    return (
    <div class='task-allot-executor'>
      <span class='task-allot-nav-title'>负责人</span>
      {
        this.executorUser
        ? <user-button user={this.executorUser} userDeleteFunc={(user: LoginUser) => this.deleteExcutorUser(user)} />
        : <div class='task-allot-executor-placeholder'>请在右侧选择</div>
      }
    </div>
    )
  }
  
  /** 
   * @description 渲染协同人
  */
  public renderSynergy() {
    // 是否可以修改协同人
    if (!this.allowModifySynergyUser) {
      return null
    }
    
    return (
      <div class='task-allot-synergy'>
        <span class='task-allot-nav-title'>选择工单协同人</span>
        <div class='task-allot-synergy-list'>
          {
            this.synergyUserList.map((synergyUser: LoginUser) => {
              return <user-button user={synergyUser} userDeleteFunc={(user: LoginUser) => this.deleteSynergyUser(user)} /> 
            })
          }
          <user-button onClick={() => this.chooseSynergyUser()} /> 
        </div>
      </div>
    )
  }
}

export default TaskAllotModalRender
