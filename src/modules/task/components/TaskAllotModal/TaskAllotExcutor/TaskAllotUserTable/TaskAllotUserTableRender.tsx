/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* interface */
import { ElSelectOption, UserState } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* methods */
import TaskAllotUserTableMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableMethods'
/* model */
import { MAX_GREATER_THAN__MIN_MESSAGE, REQUIRED_MIN_MESSAGE, REQUIRED_MAX_MESSAGE } from '@src/model/const/Alert'
import { TaslAllotTableColumnFieldEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* types */
import Column from '@model/types/Column'
/* util */
import { uuid } from '@src/util/string'
import Platform from '@src/util/platform'

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
          : 
          (
            this.selectDeptUsers.map((user: LoginUser) => {
              return (
                <el-tag key={user.userId} size='mini' disable-transitions closable type='info' onClose={() => this.debouncedRemoveDepartmentUser(user)}>
                  {user.displayName}
                </el-tag>
              )
            })
          )
        }
      </div>
      </div>
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
        class='task-allot-user-table-location-select'
        placeholder='请选择距离'
        ref='TaskAllotTableLocaionSelect'
        value={this.selectLocation}
        onInput={(value: string) => this.handlerLocationChange(value)}
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
    const HandlerMinValueChanged = (value: number) => { this.locationOtherData.minValue = Number(value) }
    const HandlerMaxValueChanged = (value: number) => { this.locationOtherData.maxValue = Number(value) }
    const HandlerConfirmed = () => {
      let { minValue = 0, maxValue = 0 } = this.locationOtherData
      let minValueIsNull = minValue == null
      let maxValueIsNull = maxValue == null
      // 效验
      let validated = minValueIsNull || maxValueIsNull || Boolean(maxValue && minValue && maxValue > minValue)
      this.locationOtherData.isChecked = validated
      
      // 最小值提示
      if (minValueIsNull) {
        return Platform.alert(REQUIRED_MIN_MESSAGE)
      }
      // 最大值提示
      if (maxValueIsNull) {
        return Platform.alert(REQUIRED_MAX_MESSAGE)
      }
      // 最大值大于最小值提示
      if (!validated) {
        return Platform.alert(MAX_GREATER_THAN__MIN_MESSAGE)
      }
      // 失焦 ，隐藏select下拉框
      // @ts-ignore
      this.$refs.TaskAllotTableLocaionSelect.blur()
      this.selectLocation = this.locationOptions[this.locationOptions.length - 1].value
    }
    
    return (
      <div>
        <span>其他</span>
        <div>
          <el-input 
            class='location-min-input' 
            placeholder='最小值' 
            type='number' 
            min={0} 
            step={1} 
            value={this.locationOtherData.minValue} 
            onInput={HandlerMinValueChanged} 
          />
            —
          <el-input 
            class='location-max-input' 
            placeholder='最大值' 
            type='number' 
            min={0} 
            step={1} 
            value={this.locationOtherData.maxValue} 
            onInput={HandlerMaxValueChanged} 
          />
          KM
          <el-button class='location-confirm-button' onClick={HandlerConfirmed}>确定</el-button>
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
