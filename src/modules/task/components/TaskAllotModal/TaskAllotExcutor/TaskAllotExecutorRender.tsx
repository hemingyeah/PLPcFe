/* components */
import UiInput from '@src/component/ui/UiInput/UiInput.tsx'
/* entity */
import Tag from '@model/entity/Tag/Tag'
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* interface */
import { ElSelectOption, UserState } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* methods */
import TaskAllotExecutorMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotExecutorMethods'
/* model */
import { TaskTagListSearchModel } from '@model/param/in/Task'
/* model */
import { 
  AllotSortedEnum, 
  AllotLabelEnum 
} from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* util */
import { uuid } from '@src/util/string'
/* vue */
import { VNode } from 'vue/types/vnode'

/* 工单指派 标签提示数据对象 */
const TaskAllotLabelTooltipMap: { [x: string]: string } = {
  [AllotSortedEnum.Distance]: '按员工到客户地址直线距离由近到远排序',
  [AllotSortedEnum.AcceptTaskByTodaySearch]: '按员工接单数量从少到多排序',
  [AllotSortedEnum.TaskDegreePercentByMonth]: '按30天内员工好评率从高到低排序'
}

class TaskAllotExecutorRender extends TaskAllotExecutorMethods {
  
  /** 
   * @description 渲染 按团队选人
  */
  public renderTeamUserSelect() {
    const scopedSlots = {
      label: (props: any = {}) => {
        const teamUsers: LoginUser[] = props?.value || []
        const teamUser: LoginUser = teamUsers[0] || {}
        return <div>{teamUser.displayName || ''}</div>
      },
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
        ref='TeamUserBizFormRemoteSelect'
        cleared
        value={this.selectTeamUsers}
        onInput={(value: any[]) => this.handlerTeamUsersChange(value)}
        collapsed
        placeholder='请输入查询'
        remoteMethod={(params: any) => this.fetchTeamUsers(params)}
        scopedSlots={scopedSlots}
        onFocus={(element: Element) => this.handlerExecutorSelectFocus(element)}
      >
      </biz-form-remote-select>
    )
  }
  
  /** 
   * @description 渲染 按部门选人
  */
  public renderDepartmentUserSelect() {
    let isUsersEmpty = this.selectDeptUsers.length <= 0
    
    return (
      <div class='task-allot-table-user'>
        <ui-input placeholder='请输入查询' hideIcon onClick={() => this.chooseDepartmentUsers()}>
          {
            <div>
              {
                isUsersEmpty 
                ? <span class='placeholder-text'>请输入查询</span>
                : this.renderDeptUsers()
              }
            </div>
          }
        </ui-input>
      </div>
    )
  }
  
  /** 
   * @description 渲染 部门人员
  */
  public renderDeptUsers() {
    let collapse = true
    let user = this.selectDeptUsers[0] || {}
    
    const ClearDeptUsers = (event: Event) => {
      event.stopPropagation()
      
      this.executorChangedHandler(null)
      // 用户自己选择的 并且 人员列表只有当前用户时
      if (user?.selfSelected && this.tableUserPage.list?.[0].userId == user.userId) return
      if (user?.selfSelected) return
      // 更新
      this.$nextTick(() => {
        this.initialize()
      })
    }
    
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
        {
          <button type='button' class='biz-team-select-clear' onClick={(event: Event) => ClearDeptUsers(event)} key='task-allot-dept-clear'>
            <i class='iconfont icon-circle-delete'></i>
          </button>
        }
      </div>
    )
    
    return collapse ? CollapseSelectDeptUsers : AllSelectDeptUsers
  }
  
  /**
   * @description 渲染协同人
  */
  public renderSynergySelect(): VNode | null {
    if (!this.synergyUserList) return null
    // 是否存在协同人
    let isHaveSynergyUser = this.synergyUserList.length > 0
    // 需要显示的第一个协同人
    let user: any = this.synergyUserList?.[0] || {}
    // 是否有更多的协同人 (大于1个)
    let isMoreOne = Boolean(this.synergyUserList && this.synergyUserList.length > 1)
    // 样式类名
    let classNames: string[] = ['task-allot-sysnergy-select']
    
    return (
      <div class={classNames} onClick={() => this.chooseSynergyUser()}>
        <ui-input hideIcon placeholder='请选择协同人'>
          {
            isHaveSynergyUser && (
              <el-tag key={user?.userId} size='mini' disable-transitions closable type='info' onClose={() => this.removeSynergyUser(user)}>
                {user?.displayName || ''}
              </el-tag>
            )
          }
          {
            isMoreOne &&  (
              <div class='biz-team-select-tags'>
                <div class='biz-team-select-tag'>+{this.synergyUserList.length - 1}</div>
              </div>
            )
          }
        </ui-input>
      </div>
    )
  }
  
  /**
   * @description 渲染选择团队
  */
  public renderTeamSelect() {    
    return (
      <biz-team-select
        placeholder='请输入查询'
        value={this.selectTeams} 
        fetchFunc={(params: TaskTagListSearchModel) => this.fetchTagList(params)} 
        onInput={(value: Tag[]) => this.handlerTeamChange(value)} 
        multiple 
        collapse 
      />
    )
  }
  
  /**
   * @description 渲染工单派单转派原因
   */
  public renderTaskAllotReason(): VNode | null {
    return (
      <el-input
        autocomplete="off"
        class='task-allot-reason-input'
        placeholder={`${this.reallotRemarkNotNull ? '[必填]' : '[选填]'} 转派说明`}
        type='text'
        value={this.reason}
        onInput={(value: string) => this.reasonChangedHandler(value)}
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
        { this.isAllotByTag && this.renderTaskAllotExecutorHeaderRow('服务部门：', this.renderTeamSelect()) }
        { this.isAllotByTag && this.renderTaskAllotExecutorHeaderRow('负责人：', this.renderTeamUserSelect()) }
        { !this.isAllotByTag && this.renderTaskAllotExecutorHeaderRow('负责人：', this.renderDepartmentUserSelect()) }
        { this.isShowSynergy && this.renderTaskAllotExecutorHeaderRow('协同人：', this.renderSynergySelect()) }
      </div>
    )
  }
  
  /**
   * @description 渲染工单派单转派原因行
  */
  public renderTaskAllotReasonRow(): VNode | null {
    if (!this.isReAllot) return null
    
    return (
      <div class='task-allot-reason-row task-allot-executor-header'>
        { this.renderTaskAllotExecutorHeaderRow('转派原因：', this.renderTaskAllotReason()) }
      </div>
    )
  }
  
  /** 
   * @description 渲染工单派单头部派单选择
  */
  public renderTaskAllotExecutorBackgroundChunk() {
    return (
      <div class='task-allot-executor-chunk'></div>
    )
  }
  
  /** 
   * @description 渲染工单指派人员表格头部
  */
  public renderTaskAllotUserTableHeader(): VNode {
    return (
      <div class='task-allot-user-table-header'>
        { this.renderTaskAllotUserTableHeaderLabels() }
        { this.renderTaskAllotUserTableHeaderSelectBlock() }
      </div>
    )
  }
  
  /**
   * @description 渲染工单指派人员表格头部 标签列表
  */
  public renderTaskAllotUserTableHeaderLabels(): VNode {
    if (this.isMapMode) {
      // 是否存在工单地址
      const isHaveTaskAddress: boolean = Boolean(this.taskAddress?.latitude && this.taskAddress?.longitude)
      return (
        <div class='task-allot-user-table-header-label'>
          { !isHaveTaskAddress && (
            <div class='task-allot-no-address'>
              <i class='iconfont icon-fdn-info'></i>
              该工单暂无客户地址
            </div>
          ) }
        </div>
      )
    }
    
    return (
      <div class='task-allot-user-table-header-label'>
        {
          this.tableSortLabelOptionss.map((sortLabel: ElSelectOption) => {
            const classNames = [
              'task-allot-user-table-sort-label',
              this.selectSortord === sortLabel.value ? 'task-allot-user-table-sort-label-active' : ''
            ]
            return (
              <el-tooltip content={ TaskAllotLabelTooltipMap[sortLabel.value] } placement='top'>
                <div class={classNames} onClick={() => this.handlerSortLabelChange(sortLabel.value as AllotSortedEnum)}>
                  { sortLabel.label }
                </div>
              </el-tooltip>
            )
          })
        }
      </div>
    )
  }
  
  /** 
   * @description 渲染工单指派人员表格头部 select选择
  */
  public renderTaskAllotUserTableHeaderSelectBlock() {
    return (
      <div class='task-allot-user-table-header-select-block'>
        { this.renderTaskAllotUserTableHeaderLabelSelect() }
        { this.renderTaskAllotUserTableHeaderLocationSelect() }
        { this.renderTaskAllotUserTableHeaderStateSelect() }
        { this.renderSelectColumn() }
      </div>
    )
  }
  
  /** 
   * @description 渲染工单指派人员表格头部 标签select选择
  */
  public renderTaskAllotUserTableHeaderLabelSelect() {
    return (
      <el-select
        placeholder="员工标签"
        value={this.selectLabel}
        onInput={(value: AllotLabelEnum) => this.handlerLabelChange(value)}
      >
        {
          this.labelOptions.map((labelOption: ElSelectOption) => {
            return (
              <el-option key={labelOption.value} value={labelOption.value} label={labelOption.label} />
            )
          })
        }
      </el-select>
    )
  }
  
  /**
   * @description 渲染工单指派人员表格头部 位置select选择
   */
  public renderTaskAllotUserTableHeaderLocationSelect() {
    return (
      <el-select
        className='task-allot-user-table-location-select'
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
  public renderLocationOtherOption() {
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
   * @description 渲染工单指派人员表格头部 工作状态select选择
   */
  public renderTaskAllotUserTableHeaderStateSelect() {
    return (
      <el-select
        class='task-allot-user-table-state-select'
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
                  <span class='user-state-round' style={{ backgroundColor: this.stateColorMap && this.stateColorMap[userState.label || ''] }}>
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
   * @description 渲染选择列
  */
  public renderSelectColumn() {
    if (this.isMapMode) return null
    
    return (
      <UiInput>
        <div class='task-allot-user-table-column' onClick={() => this.showAdvancedSetting()}>
          <span>选择列</span>
        </div>
      </UiInput>
    )
  }
}

export default TaskAllotExecutorRender