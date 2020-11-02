/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* methods */
import TaskAllotModalMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotModalMethods'

class TaskAllotModalRender extends TaskAllotModalMethods {
  /** 
   * @description 渲染协同人
  */
  public renderSynergy() {
    // 协同人列表是否是空的
    let isSynergyListEmpty = this.synergyUserList.length <= 0
    
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
