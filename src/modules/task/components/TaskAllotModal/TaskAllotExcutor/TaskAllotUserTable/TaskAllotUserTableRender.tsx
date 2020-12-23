
/* components */
import UserCard from '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.tsx'
/* interface */
import { ElSelectOption } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableInterface'
/* methods */
import TaskAllotUserTableMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableMethods'
/* model */
import { TaslAllotTableColumnFieldEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableModel'
/* types */
import Column from '@model/types/Column'
/* util */
import { isString } from '@src/util/type'
import { fmt_display_text } from '@src/filter/fmt'
import { isArray } from 'lodash'
import { convertSecondsToHourMinuteText } from '@src/util/time'
import DateUtil from '@src/util/date'
/* vue */
import { VNode } from 'vue'

const UserLabelMap: { [x: string]: { label: string, className: string } } = {
  '主管': { label: '主管', className: 'manager' },
  '满意度前三': { label: '好评', className: '' },
  '工作效率前三': { label: '工作效率前三', className: '' },
  '距离最近': { label: '近', className: '' }
}

class TaskAllotUserTableRender extends TaskAllotUserTableMethods {
  
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
    let userLabelData = null
    
    return (
      <div class='task-allot-user-table-column-field'>
        <div class='task-allot-user-table-column-field-name'>{displayName}</div>
        {
          label.map((labelItem: string) => {
            userLabelData = UserLabelMap[labelItem]
            return this.renderUserLabel(userLabelData?.label || labelItem, userLabelData?.className)
          })
        }
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
          value={this.userPageCheckedMap?.[userId]}
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
    if (this.taskAllotUserList.length <= 0) return null
    
    return (
      <div class='task-allot-user-table-append-block'>{ this.isDisableLoadmore ? '已加载全部结果' : '载入更多结果...' }</div>
    )
  }
  
  /**
   * @description 渲染用户标签
   */
  public renderUserLabel(label: string, className?: string) {
    // TODO: 此法不可取
    return new UserCard().outsideRenderUserLabel(label, className)
  }

}

export default TaskAllotUserTableRender
