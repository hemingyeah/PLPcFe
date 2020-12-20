/* components */
import ContactUserItem from '@src/component/common/BaseContact/ContactUserItem.vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTable.scss'
/* types */
import Column from '@model/types/Column'
/* util */
import { uuid } from '@src/util/string'
/* vue */
import { Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import TaskAllotUserTableRender from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableRender.tsx'
/* const */
// 表格列默认宽度
const TableColumnDefaultWidth = '120px'

@Component({ 
  name: ComponentNameEnum.TaskAllotUserTable,
  components: {
    ContactUserItem
  }
})
export default class TaskAllotUserTable extends TaskAllotUserTableRender {
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotUserTable}>
        <div class='task-allot-user-table-block'>
          <el-table
            border
            data={this.taskAllotUserList}
            header-row-class-name='base-table-header-v3'
            row-class-name='base-table-row-v3'
            ref='TaskAllotUserElTableComponent'
            key={this.tableKey}
            rowKey={uuid()}
            onHeader-dragend={(newWidth: number, oldWidth: number, column: any) => this.handlerHeaderDragend(newWidth, oldWidth, column)}
            onSort-change={(option: any) => this.handlerTableSortChanged(option)}
            stripe
            scopedSlots={{ append: () => this.renderTableAppendSlot() }}
          >
            {
              this.columns && this.columns.filter((column: Column) => column.show).map((column: Column) => {
                return (
                  <el-table-column
                    fixed={column.fixed}
                    label={column.label}
                    key={column.field}
                    minWidth={column.width ? `${column.width}px` : TableColumnDefaultWidth}
                    prop={column.field}
                    resizable={true}
                    sortable={column.sortable}
                  >
                    { (scope: any) => this.renderTableColumnField(scope, column) }
                  </el-table-column>
                )
              })
              
            }
            <div slot='append'></div>
          </el-table>
        </div>
      </div>
    )
  }
}

