/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
/* model */
import Page from '@model/Page'
import { TaskAllotUserTableColumns } from '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTableModel'
/* vue */
import { Vue, Component, Prop, Emit, Ref } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTable.scss'
/* types */
import Column from '@model/types/Column'
/* util */
import { uuid } from '@src/util/string'
import { findComponentUpward, findComponentDownward } from '@src/util/assist'
/* const */
// 表格列默认宽度
const TableColumnDefaultWidth = '120px'

/* 用户状态 */
interface UserState {
  key: string,
  value: string,
  label: string,
  color: string,
}

type ElSelectOption = {[x: string]: string}

@Component({ 
  name: 'task-allot-user-table'
})

export default class TaskAllotUserTable extends Vue {
  
  /* 当前选择的团队 */
  private selectTeams: Tag[] = []
  /* 当前选择的团队人员列表 */
  private selectTeamUsers: LoginUser[] = []
  /* 当前选择的距离 */
  private selectLocation: any = '5'
  /* 当前选择的工作状态 */
  private selectUserState: string[] = []
  /* 当前选择的排序方式 */
  private selectSortord: string = ''
  /* 表格key 随机数 */
  private tableKey: number = Math.random() * 1000 >> 2
  /* 用户page */
  private userPage: Page =  new Page()
  /* 距离选项列表 */
  private locationOptions: ElSelectOption[] = [
    { label: '5公里以内', value: '5'},
    { label: '10公里以内', value: '10'},
    { label: '20公里以内', value: '20'},
    { label: '50公里以内', value: '50'},
    { label: '其他', value: ''},
  ]
  /* 排序方式列表 */
  private sortordOptions: ElSelectOption[] = [
    { label: '距离最近', value: '5'},
    { label: '30天内好评率最高', value: '10'},
    { label: '30天工作用时最短', value: '20'},
    { label: '30天内接单最多', value: '50'},
    { label: '30天内完成最多', value: '30'},
  ]
  /* 表格列 */
  private columns: Column[] = TaskAllotUserTableColumns
  
  /* 工单派单组件 */
  get TaskAllotModalComponent() {
    return findComponentUpward(this, 'task-allot-modal') || {}
  }
  
  /* 选择列 组件 */
  get BaseTableAdvancedSettingComponent() { 
    return findComponentDownward(this, 'base-table-advanced-setting')
  }
  
  /* 是否是按团队派单 */
  get isAllotByTag() {
    return this.TaskAllotModalComponent.isAllotByTag === true
  }
  
  /* 用户状态 对象 */
  get userStateMap() {
    return this.TaskAllotModalComponent.userStateMap || {}
  }
  
  /* 用户状态 列表 */
  get userStateList(): UserState[] {
    let list: UserState[] = []
    console.log(this.userStateMap)
    
    for (let userStateKey in this.userStateMap) {
      let userState: UserState = {
        key: userStateKey,
        value: userStateKey,
        label: userStateKey,
        color: this.userStateMap[userStateKey]
      }
      list.push(userState)
    }
    
    return list
  }
  
  private fetchTeamUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve({})
    })
  }
  
  /**
   * @description 选择团队变化事件
  */
  private handlerTeamChange(): void {
  
  }
  
  /**
   * @description 选择团队成员变化事件
  */
  private handlerTeamUsersChange(): void {
    
  }
  
  /**
   * @description 选择距离变化事件
  */
  private handlerLocationChange(value: string): void {
    this.selectLocation = value
  }
  
  /**
   * @description 选择用户工作状态事件
  */
  private handlerUserStateChange(value: string[]): void {
    this.selectUserState = value
  }
  
  /**
   * @description 选择排序方式事件
  */
  private handlerSortordChange(value: string): void {
    this.selectSortord = value
  }
  
  /** 
   * @description 显示高级设置 选择里
  */
  private showAdvancedSetting(): void {
    this.BaseTableAdvancedSettingComponent.open()
  }
  
  /** 
   * @description 渲染 按团队选人
  */
  private renderChooseUserByTeam() {
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
        placeholder='请选择工单负责人'
        remoteMethod={this.fetchTeamUser}
        value={this.selectTeamUsers}
        onInput={this.handlerTeamUsersChange}
        scopedSlots={scopedSlots}
      >
      </biz-form-remote-select>
    )
  }
  
  /** 
   * @description 渲染 按部门选人
  */
  private renderChooseUserByDepartment() {
    
  }
  
  /**
   * @description 渲染选择团队
  */
  private renderTeamSelect() {
    return (
      <biz-team-select value={this.selectTeams} onInput={this.handlerTeamChange} multiple />
    )
  }
  
  /** 
   * @description 渲染选择位置
  */
  private renderLocationSelect() {
    return (
      <el-select
        value={this.selectLocation}
        placeholder="请选择距离"
        onInput={this.handlerLocationChange}
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
  private renderWorkStateSelect() {
    return (
      <el-select
        multiple
        placeholder="请选择工作状态"
        value={this.selectUserState}
        onInput={this.handlerUserStateChange}
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
  private renderSortordSelect() {
    return (
      <el-select
        placeholder="请选择排序方式"
        value={this.selectSortord}
        onInput={this.handlerSortordChange}
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
  private renderSelectColumn() {
    return (
      <div onClick={this.showAdvancedSetting}>
        <span>选择列</span>
        <i class="iconfont icon-triangle-down task-icon"></i>
      </div>
    )
  }
  
  /** 
   * @description 渲染表格列
  */
  renderTableColumnField(scope: any, column: Column) {
    return this.renderColumnWithCommon(scope, column)
  }
  
  /** 
   * @description 选择通用表格列
  */
  renderColumnWithCommon(scope: any, column: Column) {
    return column.field ? scope.row[column.field] : ''
  }
  
  render(h: CreateElement) {
    return (
      <div class='task-allot-user-table'>
        <div class='task-allot-user-filter'>
          {this.isAllotByTag &&  this.renderTeamSelect()}
          {this.isAllotByTag &&  this.renderChooseUserByTeam()}
          {!this.isAllotByTag &&  this.renderChooseUserByDepartment()}
          {this.renderLocationSelect()}
          {this.renderWorkStateSelect()}
          {this.renderSortordSelect()}
          {this.renderSelectColumn()}
        </div>
        <div class='task-allot-user-table'>
          <el-table
            border
            header-row-class-name="base-table-header-v3"
            row-class-name="base-table-row-v3"
            key={this.tableKey}
            rowKey={uuid()}
            stripe
          >
            {
              this.columns.filter((column: Column) => column.show).map((column: Column) => {
                return (
                  <el-table-column
                    label={column.label}
                    key={column.field}
                    minWidth={column.minWidth || TableColumnDefaultWidth}
                    prop={column.field}
                    resizable={true}
                    sortable={column.sortable}
                  >
                    { (scope: any) => this.renderTableColumnField(scope, column) }
                  </el-table-column>
                )
              })
              
            }
          </el-table>
        </div>
        <base-table-advanced-setting />
      </div>
    )
  }
  
}

