const TableMixin = {
  props: {
    /** 表格的列 */
    columns: {
      type: Array,
      default: () => []
    },
    /** 表格的行 */
    rows: {
      type: Array,
      default: () => []
    },
    /** 是否多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 是否选中全部 */
    isSelectAll: {
      type: Boolean,
      default: false
    },
    //TODO: 验证命名
    /** 是否选中全部 */
    isNotSelectAll: {
      type: Boolean,
      default: false
    },
    //滚动条宽度
    gutter: {
      type: Number,
      default: 0
    }
  },
  data(){
    return {
      key: Math.random() * 10000 >> 0,
      rootEl: this.getRootEl(this)
    }
  },
  methods: {
    /** 获取根实例 */
    getRootEl(ctx){
      return ctx.$parent.isRootIns ? ctx.$parent.$el : this.getRootEl(ctx.$parent)
    },
    /** 切换选中全部 */
    toggleSelectAll(value) {
      this.$emit("toggleSelectAll", value);
    },
    /** 切换当前行选中 */
    toggleRowSelect(value, row){
      row.selected = value;
      this.$emit('toggleRowSelect')
    },
    /**
     * 获取单元格的值
     * @param col - 列 
     * @param row - 行
     */
    getValue(col, row){
      return typeof col.formatter == 'function' ? col.formatter(col, row) : row[col.field]
    },
    /** 渲染表头th */
    renderHeadCell(h, column){
      if(column.type == 'selection') return this.renderHeadSelection(h);
      if(column.type == 'padding') return this.renderPadding(h, true);

      let attrs = {
        'class': {
          'base-table-hover-col': column.hover
        },
        on: {
          mouseenter: e => column.hover = true,
          mouseleave: e => column.hover = false
        }
      }

      return (
        <th {...attrs}>
          <div class="base-table-cell">
            {
              typeof column.headRender == "function"
                ? column.headRender(h, column)
                : column.label
            }
          </div>
        </th>
      )
    },
    /** 渲染表头复选框 */
    renderHeadSelection(h){
      return (
        <th class="base-table-checkbox">
          <el-checkbox
            indeterminate={this.isNotSelectAll} 
            value={this.isSelectAll} onInput={value => this.toggleSelectAll(value)}/>
        </th>
      );
    },
    /** 渲染表格行 */
    renderRow(h, rows, columns, position){
      let tableRows = [];
    
      for(let i = 0; i < rows.length; i++){
        let row = rows[i];
        let attrs = this.genRowAttrs(row, i);
        
        tableRows.push(
          <tr {...attrs}>
            { columns.map(col => this.renderTd(h, row, col)) }
          </tr>
        );

        //渲染子行
        if(row.hasChildren){
          tableRows = tableRows.concat(this.renderRow(h, row.children, columns, position))
        }
      }
      
      return tableRows;
    },
    /** 子行attrs */
    genRowAttrs(row, index){
      let clazz = {
        'base-table-hover-row': row.hover || row.selected
      }

      //如果是子行
      if(row.parent){
        let parent = row.parent;
        let isHidden = !parent.expand;
        let isEnd = parent.children.length - 1 == index;
        let isStart = index == 0;

        clazz['base-table-subRow-start'] = !isHidden && isStart
        clazz['base-table-subRow-end'] = !isHidden && isEnd
        clazz['base-table-hidden'] = isHidden
      }

      let on = {
        mouseenter: e => row.hover = true,
        mouseleave: e => row.hover = false
      }

      return {'class': clazz, on}
    },
    /** 渲染多选框 */
    renderSelection(h, row){
      return (
        <td class="base-table-checkbox">
          <el-checkbox 
            value={row.selected} 
            onInput={value => this.toggleRowSelect(value, row)}/>
        </td>
      ) 
    },
    /** 渲染占位单元格 */
    renderPadding(h, isTh = false){
      return h(isTh ? 'th' : 'td', {'class': 'base-table-padding'}, '-')
    },
    /** 渲染单元格 */
    renderTd(h, row, col){
      if(col.type == 'selection') return this.renderSelection(h, row);
      if(col.type == 'padding') return this.renderPadding(h);

      let {hasParent, rawData} = row;
      let clazz = {'base-table-hover-col': col.hover};

      //没有展开只渲染td
      if(!col.expandProp) return <td class={clazz}>{this.renderCell(h, rawData, col)}</td>;
      
      let render = hasParent ? this.renderLineCell : this.renderExpandCell;
      
      return <td class={clazz}>{ render(h, row, col) }</td>  
    },
    /** 渲染带展开按钮的单元格 */
    renderExpandCell(h, row, col) {
      if(!row.hasChildren) return this.renderCell(h, row.rawData, col)
      
      return (
        <div class="base-table-collapse">
          <span onClick={e => row.expand = !row.expand} class="base-table-expand">
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
        <div class="base-table-dotted"> 
          <div class="base-table-line"></div>
          { this.renderCell(h, row.rawData, col) }
        </div>
      )
    },
    renderCell(h, row, col){
      let attrs = {};

      if(col.overflow == 'tooltip'){
        attrs.directives = [{
          name: 'tooltip',
          value: {
            placement: 'top',
            content: this.getValue(col, row),
            silence: true
          }
        }];
      }

      return (
        <div class="base-table-cell" {...attrs}>
          {
            typeof col.render == 'function' 
              ? col.render(h, col, row) 
              : <span>{this.getValue(col, row)}</span>
          }           
        </div>
      );
    },
  }
}


export default TableMixin;