/* types */
import Column from '@model/types/Column'
/* interface */
import { ElSelectOption, UserState } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* methods */
import TaskAllotUserTableMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableMethods'
/* model */
import { TaslAllotTableColumnFieldEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
class TaskAllotUserTableRender extends TaskAllotUserTableMethods {
  /** 
   * @description 渲染 按团队选人
  */
  public renderChooseUserByTeam() {
    const scopedSlots = {
      option: (props: any) => {
        return (
          <div>
            {props.option.name}
          </div>
        );
    },
    }
    return (
      <biz-form-remote-select
        placeholder='请选择人员'
        remoteMethod={this.fetchTeamUsers}
        value={this.selectTeamUsers}
        onInput={() => this.handlerTeamUsersChange()}
        scopedSlots={scopedSlots}
      >
      </biz-form-remote-select>
    )
  }
  
  /** 
   * @description 渲染 按部门选人
  */
  public renderChooseUserByDepartment() {
    
  }
  
  /**
   * @description 渲染选择团队
  */
  public renderTeamSelect() {
    return (
      <biz-team-select value={this.selectTeams} onInput={() => this.handlerTeamChange()} multiple />
    )
  }
  
  /** 
   * @description 渲染选择位置
  */
  public renderLocationSelect() {
    return (
      <el-select
        value={this.selectLocation}
        placeholder="请选择距离"
        onInput={(value: string) => this.handlerLocationChange(value)}
      >
        {
          this.locationOptions.map((locationOption: ElSelectOption) => {
            return (
              <el-option key={locationOption.value} value={locationOption.value} label={locationOption.label} />
            )
          })
        }
      </el-select>
    )
  }
  
  /** 
   * @description 渲染工作状态
  */
  public renderWorkStateSelect() {
    return (
      <el-select
        multiple
        placeholder="请选择工作状态"
        value={this.selectUserState}
        onInput={(value: string[]) => this.handlerUserStateChange(value)}
      > 
        {
          this.userStateList.map((userState: UserState) => {
            return (
              <el-option key={userState.key} value={userState.value} label={userState.label} />
            )
          })
        }
      </el-select>
    )
  }
  
  /** 
   * @description 渲染智能排序方式
  */
  public renderSortordSelect() {
    return (
      <el-select
        placeholder="请选择排序方式"
        value={this.selectSortord}
        onInput={(value: string) => this.handlerSortordChange(value)}
      > 
        {
          this.sortordOptions.map((sortordOption: ElSelectOption) => {
            return (
              <el-option key={sortordOption.value} value={sortordOption.value} label={sortordOption.label} />
            )
          })
        }
      </el-select>
    )
  }
  
  /** 
   * @description 渲染选择列
  */
  public renderSelectColumn() {
    return (
      <div class='task-allot-user-table-column' onClick={() => this.showAdvancedSetting()}>
        <span>选择列</span>
        <i class="iconfont icon-triangle-down task-icon"></i>
      </div>
    )
  }
  
  /** 
   * @description 渲染表格列
  */
  renderTableColumnField(scope: any, column: Column) {
    if(column.field === TaslAllotTableColumnFieldEnum.Excutor) return this.renderColumnWithExcutor(scope)
    
    return this.renderColumnWithCommon(scope, column)
  }
  
  /** 
   * @description 选择通用表格列
  */
  renderColumnWithCommon(scope: any, column: Column) {
    return column.field ? scope.row[column.field] : ''
  }
  
  /** 
   * @description 渲染负责人表格列
  */
  renderColumnWithExcutor(scope: any) {
    let { userId = '' } = scope.row
    
    return (
      <el-checkbox value={this.userPageCheckedMap[userId]} onInput={(value: boolean) => this.handlerExcutorCheckedChange(value, scope.row)}></el-checkbox>
    )
  }
}

export default TaskAllotUserTableRender
