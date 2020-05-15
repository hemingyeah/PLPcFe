import TableMixin from './TableMixin';
import normalizeWheel from '@src/util/normalizeWheel'

import { PaddingColumn } from './TableColumn';

const BaseTableHead = {
  name: 'base-table-head',
  mixins: [TableMixin],
  props: {
    /** 所有列 */
    originColumns: {
      type: Array,
      default: () => []
    },
    /** 是否为高级表格 */
    advanced: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    /** 
     * TODO: 确定该方式是否被调用，如无调用出，删除即可
     * 检测是否全部选中 
     */
    checkIsSelectAll(rows) {
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        if (!row.selected) return false;
        if (Array.isArray(row.children) && row.children.length > 0) {
          if (!this.checkIsSelectAll(row.children)) return false;
        }
      }

      return true;
    },
    /** 支持鼠标滚轮滚动table */
    sync(event){
      event.preventDefault();

      let scrollEl = this.$refs.scroll;
      let tableEl = this.$refs.table;
      
      let paddingLeft = 0;
      let paddingRight = 0;
      if(scrollEl.style.paddingLeft) paddingLeft = parseInt(scrollEl.style.paddingLeft.replace(/[px|%]/g, ''));
      if(scrollEl.style.paddingRight) paddingRight = parseInt(scrollEl.style.paddingRight.replace(/[px|%]/g, ''));
      
      let scrollOffsetWidth = scrollEl.offsetWidth - paddingLeft - paddingRight; // 外层容器的宽度
      let headOffsetWidth = tableEl.offsetWidth; 
      let maxOffset = headOffsetWidth - scrollOffsetWidth;
      // 无法滚动
      if(headOffsetWidth <= scrollOffsetWidth) return;

      let delta = normalizeWheel(event);
      let direction = delta.pixelX ? delta.pixelX : delta.pixelY

      let offset = scrollEl.scrollLeft + direction;
      if(offset < 0) offset = 0;
      if(offset > maxOffset) offset = maxOffset;

      scrollEl.scrollLeft = offset;
      
      // 同步滚动body
      let bodyEl = this.rootEl.querySelector('.base-table__scroll > .base-table__body');
      if(bodyEl.scrollLeft != offset) bodyEl.scrollLeft = offset;
    },
    /** 显示设置窗 */
    showSetting(){
      let advanced = this.$refs.advanced;
      advanced.open(this.originColumns)
    },
    /** 渲染设置窗 */
    renderSetting(h){
      if(!this.advanced) return null;

      return [
        (<button type="button" class="base-table__setting-btn" onClick={this.showSetting}>
          <i class="iconfont icon-xitongguanli"></i>
        </button>),
        <base-table-advanced-setting ref="advanced" onSave={this.saveSetting}/>
      ];
    },
    /** 保存设置 */
    saveSetting(data){
      this.$emit('update', data)
    }
  },
  render(h) {    
    let leftFixedColumns = []
    let scrollColumns = []
    let rightFixedColumns = [];

    this.columns.forEach(col => {
      if(col.fixed == 'left') return leftFixedColumns.push(col);
      if(col.fixed == 'right') return rightFixedColumns.push(col);

      return scrollColumns.push(col);
    })

    let leftTotal = leftFixedColumns.reduce((sum, col) => sum += col.width, 0);
    let rightTotal = rightFixedColumns.reduce((sum, col) => sum += col.width, 0);
    let scrollTotal = scrollColumns.reduce((sum, col) => sum += col.width, 0);

    let style = {maxHeight: this.scrollYMaxHeight};
    if(leftTotal > 0) {
      let index = scrollColumns.findIndex(item => item.type == 'selection');
      index = index <= 0 ? 0 : index + 1;
      scrollColumns.splice(index, 0, new PaddingColumn(leftTotal)) 
    } 

    if(rightTotal > 0) scrollColumns.push(new PaddingColumn(rightTotal))  

    return (
      <div class="base-table__head" style={style}>
        <div class="base-table__head-scroll" ref="scroll">
          <table class="base-table__table" 
            ref="table" key={this.key} 
            width={leftTotal + scrollTotal + rightTotal}
            onWheel={e => this.sync(e)}>
            <colgroup>
              { scrollColumns.map(item => <col width={item.width}/>) }
              { <col width={this.gutter}/> }
            </colgroup>
            <thead>
              <tr>
                { scrollColumns.map(column => this.renderHeadCell(h, column)) }
                { <th></th> }
              </tr>
            </thead>
          </table>
        </div>
        
        {this.renderSetting(h)}
      </div>
    );
  },
  mounted(){
    this.$emit('mounted')
  }
};

export default BaseTableHead