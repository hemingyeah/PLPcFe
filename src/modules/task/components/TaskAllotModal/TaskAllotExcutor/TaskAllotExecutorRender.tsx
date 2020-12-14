/* entity */
import TaskAllotUserInfo from '@model/entity/TaskAllotUserInfo'
import Customer from '@model/entity/Customer'
import Tag from '@model/entity/Tag/Tag'
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* methods */
import TaskAllotExecutorMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorMethods'
/* model */
import { TaskTagListSearchModel } from '@model/param/in/Task'
/* util */
import { uuid } from '@src/util/string'
/* vue */
import { VNode } from 'vue/types/vnode'

class TaskAllotExecutorRender extends TaskAllotExecutorMethods {
  
  /** 
   * @description 渲染 按团队选人
  */
  public renderChooseUserByTeam() {
    const scopedSlots = {
      option: (props: any) => {
        return (
          <contact-user-item
            key={uuid()}
            user={props.option}
            showUserState={true}
            stateColor={this.stateColorMap}
            showTag={true}
          />
        )
      },
    }
    return (
      <biz-form-remote-select
        value={this.selectTeamUsers}
        onInput={(value: any[]) => this.handlerTeamUsersChange(value)}
        collapsed
        multiple
        placeholder='员工'
        remoteMethod={(params: any) => this.fetchTeamUsers(params)}
        scopedSlots={scopedSlots}
      >
      </biz-form-remote-select>
    )
  }
  
  /** 
   * @description 渲染 按部门选人
  */
  public renderChooseUserByDept() {
    let isUsersEmpty = this.selectDeptUsers.length <= 0
    
    return (
      <div class='task-allot-table-user'>
        <div class='task-allot-table-user-input' onClick={() => this.chooseDepartmentUsers()}>
        {
          isUsersEmpty 
          ? <span class='task-allot-table-user-input-placeholder'>员工</span>
          : this.renderDeptUsers()
        }
      </div>
      </div>
    )
  }
  
  /** 
   * @description 渲染 部门人员
  */
  public renderDeptUsers() {
    let collapse = true
    let user = this.selectDeptUsers[0] || {}
    
    const AllSelectDeptUsers = (
      this.selectDeptUsers.map((user: LoginUser) => {
        return (
          <el-tag key={user.userId} size='mini' disable-transitions closable type='info' onClose={() => this.debouncedRemoveDepartmentUser(user)}>
            {user.displayName}
          </el-tag>
        )
      })
    )
    
    const CollapseSelectDeptUsers = (
      <div class='task-allot-table-user-dept'>
        <el-tag key={user.userId} size='mini' disable-transitions closable type='info' onClose={() => this.debouncedRemoveDepartmentUser(user)}>
          {user.displayName}
        </el-tag>
        {
          this.selectDeptUsers.length > 1
          && (
            <div class='biz-team-select-tags'>
              <div class='biz-team-select-tag'>+{this.selectDeptUsers.length - 1}</div>
            </div>
          )
        }
      </div>
    )
    
    return collapse ? CollapseSelectDeptUsers : AllSelectDeptUsers
  }
  
  /**
   * @description 渲染选择团队
  */
  public renderTeamSelect() {    
    return (
      <biz-team-select
        placeholder='服务团队'
        value={this.selectTeams} 
        fetchFunc={(params: TaskTagListSearchModel) => this.fetchTagList(params)} 
        onInput={(value: Tag[]) => this.handlerTeamChange(value)} 
        multiple 
        collapse 
      />
    )
  }
  
  public renderTaskAllotExecutorHeaderRow(label: string, node: VNode | null): VNode {
    return (
      <div class='task-allot-executor-header-row'>
        <span class='task-allot-executor-header-row-label'>
          {label}
        </span>
        {node}
      </div>
    )
  }
  
  /** 
   * @description 渲染工单派单头部派单选择
  */
  public renderTaskAllotExecutorHeader(): VNode {
    return (
      <div class='task-allot-executor-header'>
        { this.isAllotByTag && this.renderTaskAllotExecutorHeaderRow('服务团队：', this.renderTeamSelect()) }
        { this.isAllotByTag && this.renderTaskAllotExecutorHeaderRow('负责人：', this.renderTeamSelect()) }
        { !this.isAllotByTag && this.renderTaskAllotExecutorHeaderRow('负责人：', this.renderTeamSelect()) }
        { this.isShowSynergy && this.renderTaskAllotExecutorHeaderRow('协同人：', this.renderTeamSelect()) }
      </div>
    )
  }
  
}

export default TaskAllotExecutorRender