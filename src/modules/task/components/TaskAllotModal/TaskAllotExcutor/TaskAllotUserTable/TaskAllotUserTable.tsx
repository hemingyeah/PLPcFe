/* components */
import ContactUserItem from '@src/component/common/BaseContact/ContactUserItem.vue';
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
  
  mounted() {
    // 构建列
    this.buildColumns()
    // 还原排序方式
    this.revertSort()
    // 绑定事件
    this.$nextTick(() => {
      this.bindTableScrollEvent()
    })
  }
  
  render(h: CreateElement) {
    return (
      <div class='task-allot-user-table'>
        <div class='task-allot-user-filter'>
          {this.isAllotByTag && this.renderTeamSelect()}
          {this.isAllotByTag && this.renderChooseUserByTeam()}
          {!this.isAllotByTag && this.renderChooseUserByDept()}
          {this.renderLocationSelect()}
          {this.renderWorkStateSelect()}
          {this.renderSortordSelect()}
          {this.renderSelectColumn()}
        </div>
        <div class='task-allot-user-table-block'>
          <el-table
            border
            data={this.userPage.list}
            header-row-class-name='base-table-header-v3'
            row-class-name='base-table-row-v3'
            ref='TaskAllotUserTable'
            key={this.tableKey}
            rowKey={uuid()}
            onHeader-dragend={(newWidth: number, oldWidth: number, column: any) => this.handlerHeaderDragend(newWidth, oldWidth, column)}
            onSort-change={(option: any) => this.handlerTableSortChanged(option)}
            stripe
            scopedSlots={{ append: () => this.renderTableAppendSlot() }}
          >
            {
              this.columns.filter((column: Column) => column.show).map((column: Column) => {
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
        <base-table-advanced-setting onSave={(value: any) => this.saveTaskAllotTableColumn(value)} ref='BaseTableAdvancedSettingComponent' />
      </div>
    )
  }
}
