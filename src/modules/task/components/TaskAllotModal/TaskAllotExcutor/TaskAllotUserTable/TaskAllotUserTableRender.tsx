/* entity */
import Tag from '@model/entity/Tag/Tag'
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
import { fmt_display_text } from '@src/filter/fmt'
import { isArray } from 'lodash'
import { convertSecondsToHourMinuteText } from '@src/util/time'
import DateUtil from '@src/util/date'
/* vue */
import { VNode } from 'vue'

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
    const HandlerMinValueChanged = (value: string) => { this.locationOtherData.minValue = this.handlerNumberFormat(value) }
    const HandlerMaxValueChanged = (value: string) => { this.locationOtherData.maxValue = this.handlerNumberFormat(value) }
    
    return (
      <div>
        <span>其他</span>
        <div>
          <el-input
            autocomplete="off"
            class='location-min-input' 
            placeholder='最小值'
            min={0}
            max={99999}
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
            min={0}
            max={99999}
            value={this.locationOtherData.maxValue}
            onInput={HandlerMaxValueChanged} 
          />
          km
          <el-button type='primary' class='location-confirm-button' onClick={() => this.handlerLocationOtherChange()}>确定</el-button>
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
        placeholder="工作状态"
        value={this.selectUserState}
        onInput={(value: string[]) => this.handlerUserStateChange(value)}
      > 
        {
          this.userStateList.map((userState: UserState) => {
            return (
              <el-option key={userState.key} value={userState.value} label={userState.label}>
                <div class='task-allot-state-select-item'>
                  <span class='user-state-round' style={{ backgroundColor: this.userStateMap && this.userStateMap[userState.label || ''] }}>
                  </span>
                  <span>{userState.label}</span>
                </div>
              </el-option>
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
        placeholder="智能排序"
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
  public renderTableColumnField(scope: any, column: Column) {
    let value = column.field ? scope.row[column.field] : ''
    
    // 负责人
    if (column.field === TaslAllotTableColumnFieldEnum.Excutor) return this.renderColumnWithExcutor(scope)
    // 人员名称
    if (column.field === TaslAllotTableColumnFieldEnum.DisplayName) return this.renderColumnWithDisplayName(scope)
    // 工作状态
    if (column.field === TaslAllotTableColumnFieldEnum.State) return this.renderColumnWithState(value)
    // 距离
    if (column.field === TaslAllotTableColumnFieldEnum.LineDistance) return this.renderColumnWithLineDistance(value, scope.row)
    // 驾车距离
    if (column.field === TaslAllotTableColumnFieldEnum.Distance) return this.renderColumnWithDistance(value, scope.row)
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
  public renderColumnWithCommon(value: string) {
    return fmt_display_text(value)
  }
  
  /** 
   * @description 渲染距离表格列
  */
  public renderColumnWithLineDistance(value: string, row: any = {}) {
    let distance = Number(value) 
    if (isNaN(distance)) return value
    
    // 最后登录时间
    let lastLoginTime = DateUtil.getTimeDiffStr(row?.lastLoginTime || row?.attribute?.lastLocateTime)
    return distance ? `${(distance / 1000).toFixed(2)} ${lastLoginTime && `(${lastLoginTime}前)` }` : fmt_display_text(distance)
  }
  
  /** 
   * @description 渲染距客户距离表格列
  */
  public renderColumnWithDistance(value: string, row: any = {}) {
    let distance = Number(value) 
    if (isNaN(distance)) return value
    
    return distance ? `${(distance / 1000).toFixed(2)}` : fmt_display_text(distance)
  }
  
  /** 
   * @description 渲染驾车时间表格列
  */
  public renderColumnWithLineDuration(value: string) {
    let duration = Number(value) 
    if (isNaN(duration)) return value
    
    return duration ? convertSecondsToHourMinuteText(duration) : fmt_display_text(duration)
  }
  
  /** 
   * @description 渲染数组表格列
  */
  public renderColumnWithStringArray(value: string[]): string {
    return isArray(value) ? value.join(', ') : fmt_display_text(value)
  }
  
  /** 
   * @description 渲染工作状态表格列
  */
  public renderColumnWithState(value: string) {
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
  public renderColumnWithDisplayName(scope: any) {
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
  public renderColumnWithExcutor(scope: any) {
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
  
  /** 
   * @description 渲染表格插入 用于无限加载显示
  */
  public renderTableAppendSlot() {
    if (this.userPage.list.length <= 0) return null
    
    return (
      <div class='task-allot-user-table-append-block'>{ this.isDisableLoadmore ? '已加载全部结果' : '载入更多结果...' }</div>
    )
  }
  
  /** 
   * @description 渲染工单指派人员表格头部
  */
  public renderTaskAllotUserTableHeader(): VNode {
    return (
      <div class='task-allot-user-table-header'>
        {this.renderTaskAllotUserTableHeaderLabels()}
      </div>
    )
  }
  
  /** 
   * @description 渲染工单指派人员表格头部 标签列表
  */
  public renderTaskAllotUserTableHeaderLabels() {
    return (
      <div>
        
      </div>
    )
  }
}

export default TaskAllotUserTableRender
