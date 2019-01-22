import * as util from './util';

const BaseDatatableBody = {
  name: 'base-datatable-body',
  props: {
    rows: { //表格的数据源
      type: Array,
      default: () => []
    },
    columns: { //表格的列
      type: Array,
      default: () => []
    },
    multiple: { // 多选
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      html: '',
      maxTotal: 0,
      num: 0,
      bodyKey: Math.random() * 100 >> 0,
      colWidth: []
    }
  },
  watch: {
    isParentShow(newVal, oldVal) {
      // 
    }
  },
  methods: {
    toggleRowSelect(value, row){
      row.selected = value;
      this.$emit('toggleRowSelect')
    },
    /** 获取单元格的值 */
    getValue(col, row){
      return row[col.field];
    },
    /** 渲染表格行 */
    renderRow(h, rows, columns, attrs = {}){
      let tableRows = [];
    
      for(let i = 0; i < rows.length; i++){
        let row = rows[i];
        let {hasChildren, rawData, children} = row;
        let tr = (
          <tr {...attrs}>
            {
              this.multiple 
                ? (
                  <td class="base-datatable-checkbox">
                    <el-checkbox 
                      value={row.selected} 
                      onInput={value => this.toggleRowSelect(value, row)}/>
                  </td>
                ) 
                : ''
            }
            {
              columns.map((col, index) => {
                return col.toggle ? // 判断是否展开 
                  <td>
                    { hasChildren || rawData.children ? // 判断是否含有子级
                      this.renderRowChildren(h, row, col, rawData) : // row 子级渲染
                      this.renderRowChildrenToggle(h, col, rawData) // row 子级默认展开渲染
                    }
                  </td> :
                  this.renderTd(h, rawData, col);
              })
            }
          </tr>
        )
        
        tableRows.push(tr);
        
        //指定子表格
        if(hasChildren){
    
          let attrs = {
            class: {
              'base-datatable-subRow': true,
              'base-datatable-hidden': !row.expand
            }
          }
          tableRows = tableRows.concat(this.renderRow(h, children, columns, attrs))
        }
      }
      
      return tableRows;
    },
    /** row 子级渲染 */
    renderRowChildren(h, row, col, rawData) {
      return (
        <div>
          <span onClick={e => {
            row.expand = !row.expand 
          }} class="base-table-icon-element">
            {
              rawData.children.length > 0 ? // 判断是否是 父级并不含子级
                row.expand ? <i class="iconfont icon-shouqi"></i> : <i class="iconfont icon-zhankai"></i> :
                ''
            }
          </span>
          { this.renderCell(h, rawData, col) }
        </div>
      )
    },
    /** row 子级默认展开渲染 */
    renderRowChildrenToggle(h, col, rawData) {
      return (
        col['toggle'] && typeof col.toggleRender == 'function' ? // 判断是否 有 展开渲染函数
          col.toggleRender(h, col, rawData) : // 下面是默认渲染样式
          <div class="base-table-dotted-td"> 
            <div class="base-table-row-children-line"></div>
            { this.renderCell(h, rawData, col) }
          </div>
      )
    },
    /** 渲染表格内容 */
    renderTd(h, row, col){
      return <td>{this.renderCell(h, row, col)}</td>
    },
    renderCell(h, row, col){
      return (
        typeof col.render == 'function' 
          ? col.render(h, col, row) 
          : (
            <div class="base-datatable-cell">
              <span>{this.getValue(col, row)}</span>
            </div>
          )
      );
    }
  },
  render(h){
    //无数据返回空提示
    if(this.rows.length <= 0){
      return <div class="base-table-empty-block"><span class="base-table-empty-text">暂无数据</span></div>
    }

    let columns = this.columns;
    let tableWidth = this.multiple ? this.$parent.$el.clientWidth - 50 : this.$parent.$el.clientWidth;
    let colWidths = util.computeColumnWidth(columns, tableWidth, this);
    let total = colWidths.reduce((sum, w) => sum += w) + (this.multiple ? 50 : 0);

    // this.$nextTick(() => {
    //   this.num++
    //   if(1 == this.num) this.bodyKey = Math.random() * 100 >> 0
    // })

    return (
      <table class="base-datatable__table" width={total} ref="baseTableBody" key={this.bodyKey}>
        <colgroup>
          { this.multiple ? <col width="50"></col> : '' }
          { colWidths.map(item => <col width={item}></col>) }
        </colgroup>
        <tbody class="base-datatable-body">
          {this.renderRow(h, this.rows, this.columns)}
        </tbody>
      </table> 
    )
  },
}

export default BaseDatatableBody