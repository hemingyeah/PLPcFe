/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* interface */
import { ElSelectOption, UserState } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* methods */
import TaskAllotUserTableMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableMethods'
/* model */
import { TaslAllotTableColumnFieldEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
import { TaskTagListSearchModel } from '@model/param/in/Task'
/* types */
import Column from '@model/types/Column'
/* util */
import { uuid } from '@src/util/string'
import { isString } from '@src/util/type'

class TaskAllotUserTableRender extends TaskAllotUserTableMethods {
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
            stateColor={this.userStateMap}
            showTag={true}
          />
        )
      },
    }
    return (
      <biz-form-remote-select
        value={this.selectTeamUsers}
        onInput={(value: any[]) => this.handlerTeamUsersChange(value)}
        multiple
        placeholder='请选择人员'
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
          ? <span class='task-allot-table-user-input-placeholder'>请选择人员</span>
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
        value={this.selectTeams} 
        fetchFunc={(params: TaskTagListSearchModel) => this.fetchTagList(params)} 
        onInput={() => this.handlerTeamChange()} 
        multiple 
        collapse 
      />
    )
  }
  
  /** 
   * @description 渲染选择位置
  */
  public renderLocationSelect() {
    return (
      <el-select
        class='task-allot-user-table-location-select'
        placeholder='请选择距离'
        ref='TaskAllotTableLocaionSelect'
        value={this.selectLocation}
        onInput={(value: number) => this.handlerLocationChange(value)}
      >
        {
          this.locationOptions.map((locationOption: ElSelectOption) => {
            let isOtherOption = locationOption.label == '其他' 
            return (
              <el-option
                class={isOtherOption && 'task-allot-user-table-location-select-other'} 
                key={locationOption.value} 
                value={locationOption.value}
                label={locationOption.label}
                disabled={isOtherOption}
              >
                { 
                  isOtherOption
                  ? this.renderLocationOtherOption()
                  : null 
                }
              </el-option>
            )
          })
        }
      </el-select>
    )
  }
  
  /** 
   * @description 渲染选择位置 其他选项
  */
  renderLocationOtherOption() {
    const numberReg = /^\d+[.]?\d{1,3}$/
    const numberHandler = (value: string): number | null => {
      let number = Number(value)
      return (
        value === '' 
          ? null
          : numberReg.test(value)
            ? number
            : Number(number.toFixed(3))
      )
    }
    const HandlerMinValueChanged = (value: string) => { this.locationOtherData.minValue = numberHandler(value) }
    const HandlerMaxValueChanged = (value: string) => { this.locationOtherData.maxValue = numberHandler(value) }
    
    return (
      <div>
        <span>其他</span>
        <div>
          <el-input
            autocomplete="off"
            class='location-min-input' 
            placeholder='最小值' 
            type='number'
            value={this.locationOtherData.minValue}
            onInput={HandlerMinValueChanged}
          />
            —
          <el-input
            autocomplete="off"
            class='location-max-input' 
            placeholder='最大值' 
            type='number'
            value={this.locationOtherData.maxValue}
            onInput={HandlerMaxValueChanged} 
          />
          KM
          <el-button class='location-confirm-button' onClick={() => this.handlerLocationOtherChange()}>确定</el-button>
        </div>
      </div>
    )
  }
  
  /** 
   * @description 渲染工作状态
  */
  public renderWorkStateSelect() {
    return (
      <el-select
        collapse-tags
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
        onInput={(value: number) => this.handlerSortordChange(value)}
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
    let value = column.field ? scope.row[column.field] : ''
    
    // 负责人
    if (column.field === TaslAllotTableColumnFieldEnum.Excutor) return this.renderColumnWithExcutor(scope)
    // 人员名称
    if (column.field === TaslAllotTableColumnFieldEnum.DisplayName) return this.renderColumnWithDisplayName(scope)
    // 工作状态
    if (column.field === TaslAllotTableColumnFieldEnum.State) return this.renderColumnWithState(value)
    // 距离或驾车距离
    if (
      column.field === TaslAllotTableColumnFieldEnum.LineDistance
      || column.field === TaslAllotTableColumnFieldEnum.Distance
    ) return this.renderColumnWithLineDistance(value)
    // 驾车时间
    if (column.field === TaslAllotTableColumnFieldEnum.Duration) return this.renderColumnWithLineDuration(value)
    // 数组类型
    let isStringArray = Array.isArray(value) && value.every(item => isString(item))
    if (isStringArray) return this.renderColumnWithStringArray(value)
    
    return this.renderColumnWithCommon(value)
  }
  
  /** 
   * @description 渲染通用表格列
  */
  renderColumnWithCommon(value: string) {
    return value
  }
  
  /** 
   * @description 渲染距离表格列
  */
  renderColumnWithLineDistance(value: string) {
    let distance = Number(value) 
    if (isNaN(distance)) return value
    
    return `${(distance / 1000).toFixed(3)} KM`
  }

  /** 
   * @description 渲染驾车时间表格列
  */
  renderColumnWithLineDuration(value: string) {
    let duration = Number(value) 
    if (isNaN(duration)) return value
    
    return `${(duration * 3600)}小时`
  }
  
  /** 
   * @description 渲染数组表格列
  */
  renderColumnWithStringArray(value: string[]): string {
    return value.join(', ')
  }
  
  /** 
   * @description 渲染工作状态表格列
  */
  renderColumnWithState(value: string) {
    return (
      <div class='user-card-header-content-state'>
        <span class='user-state-round' style={{
          backgroundColor: this.userStateMap && this.userStateMap[value]
        }}>
        </span>
        <span>{value}</span>
      </div>
    )
  }
  
  /** 
   * @description 渲染人员名称表格列
  */
  renderColumnWithDisplayName(scope: any) {
    let { displayName = '', label = [] } = scope.row || {}
    return (
      <div class='task-allot-user-table-column-field'>
        <div class='task-allot-user-table-column-field-name'>{displayName}</div>
        <div class='task-allot-user-table-column-field-label'>
          { label.join(', ')}
        </div>
      </div>
    )
  }
  
  /** 
   * @description 渲染负责人表格列
  */
  renderColumnWithExcutor(scope: any) {
    let { userId = '' } = scope.row
    
    return (
      <div class='task-allot-user-table-excutor-column'>
        <el-checkbox 
          value={this.userPageCheckedMap[userId]}
          onInput={(value: boolean) => this.handlerExcutorCheckedChange(value, scope.row)}
        >
        </el-checkbox>
      </div>
    )
  }
}

export default TaskAllotUserTableRender
