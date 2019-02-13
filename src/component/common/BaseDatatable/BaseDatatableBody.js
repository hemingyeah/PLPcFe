import * as util from './util';
import {
  COL_SELECTION_WIDTH
} from './Config'

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
    /** 获取当前行的子行 */
    getChildren(col, row){
      if(!col.expandProp) return [];
      let children = row.rawData[col.expandProp];
      return Array.isArray(children) ? children : [];
    },
    showOverflowTooltip(e){
      //TODO:根据内容长度是否超过cell判断是否显示tooltip
      console.log('show tooltip')
    },
    /** 渲染表格行 */
    renderRow(h, rows, columns){
      let tableRows = [];
    
      for(let i = 0; i < rows.length; i++){
        let row = rows[i];
        let attrs = row.hasParent ? this.genSubRowAttrs(row, i) : {};
        
        tableRows.push(
          <tr {...attrs}>
            { this.renderSelection(h, this.multiple, row) }
            { columns.map(col => this.renderTd(h, row, col)) }
          </tr>
        );

        //渲染子行
        if(row.hasChildren){
          tableRows = tableRows.concat(this.renderRow(h, row.children, columns))
        }
      }
      
      return tableRows;
    },
    /** 子行attrs */
    genSubRowAttrs(row, index){
      let parent = row.parent;
      let isHidden = !parent.expand;
      let isEnd = parent.children.length - 1 == index;

      return {
        'class': {
          'base-datatable-hidden': isHidden,
          'base-datatable-subRow-end': !isHidden && isEnd
        }
      }
    },
    /** 渲染多选框 */
    renderSelection(h, multiple, row){
      if(!multiple) return;
      return (
        <td class="base-datatable-checkbox">
          <el-checkbox 
            value={row.selected} 
            onInput={value => this.toggleRowSelect(value, row)}/>
        </td>
      ) 
    },
    /** 渲染单元格 */
    renderTd(h, row, col){
      let {hasParent, rawData} = row;
      //没有展开只渲染td
      if(!col.expandProp) return <td>{this.renderCell(h, rawData, col)}</td>;
      
      let render = hasParent ? this.renderLineCell : this.renderExpandCell;
      return <td>{ render(h, row, col) }</td>  
    },
    /** 渲染带展开按钮的单元格 */
    renderExpandCell(h, row, col) {
      if(!row.hasChildren) return this.renderCell(h, row.rawData, col)
      
      return (
        <div class="base-datatable-collapse">
          <span onClick={e => row.expand = !row.expand} class="base-datatable-expand">
            {
              row.expand 
                ? <i class="iconfont icon-shouqi"></i> 
                : <i class="iconfont icon-zhankai"></i> 
            }
          </span>
          {this.renderCell(h, row.rawData, col)}
        </div>
      )
    },
    /** 渲染带线的单元格 */
    renderLineCell(h, row, col) {
      return (
        <div class="base-datatable-dotted"> 
          <div class="base-datatable-line"></div>
          { this.renderCell(h, row.rawData, col) }
        </div>
      )
    },
    renderCell(h, row, col){
      let attrs = {};

      if(col.overflow == 'tooltip'){
        let on = {
          mouseenter: e => this.showOverflowTooltip(e)
        }
        attrs.on = on
      }

      return (
        <div class="base-datatable-cell" {...attrs}>
          {
            typeof col.render == 'function' 
              ? col.render(h, col, row) 
              : <span>{this.getValue(col, row)}</span>
          }           
        </div>
      );
    }
  },
  render(h){
    //无数据返回空提示
    if(this.rows.length <= 0){
      let tips = this.$parent.$slots.empty || <span class="base-table-empty-text">暂无数据</span>
      return <div class="base-table-empty">{tips}</div>
    }

    // this.$nextTick(() => {
    //   this.num++
    //   if(1 == this.num) this.bodyKey = Math.random() * 100 >> 0
    // })

    let columns = this.columns;
    let tableWidth = this.multiple ? this.$parent.$el.clientWidth - COL_SELECTION_WIDTH : this.$parent.$el.clientWidth;
    let colWidths = util.computeColumnWidth(columns, tableWidth, this);
    let total = colWidths.reduce((sum, w) => sum += w) + (this.multiple ? COL_SELECTION_WIDTH : 0);

    return (
      <table class="base-datatable__table" width={total} ref="baseTableBody" key={this.bodyKey}>
        <colgroup>
          { this.multiple ? <col width={COL_SELECTION_WIDTH}></col> : '' }
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