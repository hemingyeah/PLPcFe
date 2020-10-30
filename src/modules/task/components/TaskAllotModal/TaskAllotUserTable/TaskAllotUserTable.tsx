/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTable.scss'
/* types */
import Column from '@model/types/Column'
/* util */
import { uuid } from '@src/util/string'
/* vue */
import { Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import TaskAllotUserTableRender from '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTableRender.tsx'
/* const */
// 表格列默认宽度
const TableColumnDefaultWidth = '120px'

@Component({ 
  name: ComponentNameEnum.TaskAllotUserTable
})
export default class TaskAllotUserTable extends TaskAllotUserTableRender {
  render(h: CreateElement) {
    return (
      <div class='task-allot-user-table'>
        <div class='task-allot-user-filter'>
          {this.isAllotByTag && this.renderTeamSelect()}
          {this.isAllotByTag && this.renderChooseUserByTeam()}
          {!this.isAllotByTag && this.renderChooseUserByDepartment()}
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
                    fixed={column.fixed}
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

