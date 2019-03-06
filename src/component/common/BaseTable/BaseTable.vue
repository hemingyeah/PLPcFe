<template>
  <div :class="['base-table', `base-table-scrolling-${scrollPosition}`]">
    <div class="base-table__scroll">
      <base-table-head
        v-if="isRenderHead"
        :columns="displayColumns" :origin-columns="tableColumns"
        :rows="tableRows"
        :multiple="multiple" :advanced="advanced" :gutter="gutter"
        :is-select-all="isSelectAll"
        :is-not-select-all="isNotSelectAll"
        @toggleSelectAll="toggleSelectAll"
        @update="relay"
        @mounted="renderBody"/>

      <base-table-body
        v-if="isRenderBody"
        :max-height="maxHeight"
        :rows="tableRows" 
        :columns="displayColumns"
        :multiple="multiple"
        :gutter="gutter"
        @toggleRowSelect="toggleSelect"
        @layout="doLayout"
        @scroll="updateFixedStyle"/>
    </div>

    <base-fixed-table 
      v-if="isRenderBody && leftFixedColumns.length > 0"
      ref="left" fixed
      class="base-table__fixed-left"
      :columns="leftFixedColumns"
      :rows="tableRows"
      :is-select-all="isSelectAll"
      :is-not-select-all="isNotSelectAll"
      @toggleSelectAll="toggleSelectAll"
      @toggleRowSelect="toggleSelect"/>

    <base-fixed-table 
      v-if="isRenderBody && rightFixedColumns.length > 0"
      ref="right" fixed
      class="base-table__fixed-right"
      :columns="rightFixedColumns"
      :rows="tableRows"/>
  </div>
</template>

<script>
import BaseTableHead from './BaseTableHead';
import BaseTableBody from './BaseTableBody';
import BaseFixedTable from './BaseFixedTable'

import TableRow from './TableRow';
import TableColumn, { SelectionColumn } from './TableColumn';

import _ from 'lodash';
import * as util from './util';
import { getScrollBarWidth } from '@src/util/dom';

export default {
  name: 'base-table',
  props: {
    rows: { //表格的数据源
      type: Array,
      default: () => []
    },
    columns: { //表格的列
      type: Array,
      default: () => []
    },
    /**
     * 行数据的 Key，用来优化 Table 的渲染，必须指定
     */
    rowKey: String,
    /**
     * 组件的最大高度, 设置此值后会启用流式布局
     * 如果值String时，请确保传入正确的值，该值会用于calc()计算
     * 示例： 100vh - 44px => max-height: calc(100vh - 44px)
     */
    maxHeight: {
      type: [Number, String]
    },
    /** 是否开启斑马纹 */
    stripe: {
      type: Boolean,
      default: false
    },
    /** 是否开启多选 */
    multiple: {
      type: Boolean,
      default: false
    },
    /** 是否为高级表格 */
    advanced: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** 真正显示的列 */
    displayColumns(){
      return this.tableColumns.filter(item => item.show !== false);
    },
    //左侧固定列
    leftFixedColumns(){
      return this.displayColumns.filter(item => item.fixed == 'left');
    },
    /** 右侧固定列 */
    rightFixedColumns(){
      return this.displayColumns.filter(item => item.fixed == 'right')
    },
    /** 滚动列 */
    scrollColumns(){
      return this.displayColumns.filter(item => item.fixed != 'left' && item.fixed != 'right')
    },
    /** 标记为根实例 */
    isRootIns(){
      return true;
    }
  },
  data(){
    return {
      //滚动条宽度
      gutter: getScrollBarWidth(),
      //当前表格头是否渲染完成
      isRenderHead: false, 
      //当前表格内容是否渲染完成
      isRenderBody: false,
      //滚动区域样式
      scrollY: {},

      tableColumns: this.buildTableColumns(),
      tableRows: this.buildTableRows(),

      scrollPosition: 'left',

      tableKey: Math.random() * 10,
      tableResize: false,
      isSelectAll: false,
      isNotSelectAll: false,
    }
  },
  methods: {
    relay(event){
      this.$emit('update', event)
    },
    /** 检测是否有选中 */
    checkIsSelect(rows) {
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        if (row.selected) return true;
        if (Array.isArray(row.children) && row.children.length > 0) {
          if (this.checkIsSelect(row.children)) return true;
        }
      }

      return false;
    },
    /** 检测是否全部选中 */
    checkIsSelectAll(rows){
      for(let i = 0; i < rows.length; i++){
        let row = rows[i];
        if(!row.selected) return false;
        if(Array.isArray(row.children) && row.children.length > 0){
          if(!this.checkIsSelectAll(row.children)) return false;
        }
      }

      return true;
    },
    /** 切换数据选中状态 */
    toggleSelectAll(selected){
      this.toggleSelection(this.tableRows, selected);
      this.isSelectAll = selected;
      this.isNotSelectAll = false;
      
      let selection = this.isSelectAll ? this.getSelection(this.tableRows) : [];
      this.$emit('select-all', selection);
      this.$emit('select', selection)
    },
    /** 切换数据是否选中 */
    toggleSelection(rows, selected){
      for(let i = 0; i < rows.length; i++){
        let row = rows[i];

        row.selected = selected;
        if(Array.isArray(row.children) && row.children.length > 0){
          this.toggleSelection(row.children, selected)
        }
      }
    },
    /**
     * 获取选中的数据
     * @param {array} rows - 数据源
     * @returns {array} 选中的数据
     */
    getSelection(rows){
      let selection = [];

      for(let i = 0; i < rows.length; i++){
        let row = rows[i];

        if(row.selected) selection.push(row.rawData);

        if(Array.isArray(row.children) && row.children.length > 0){
          selection = selection.concat(this.getSelection(row.children))
        }
      }

      return selection;
    },
    toggleSelect(){
      let selection = this.getSelection(this.tableRows);

      this.isSelectAll = this.checkIsSelectAll(this.tableRows);
      this.$emit('select', selection);

      let select = this.checkIsSelect(this.tableRows);
      if (this.checkIsSelectAll(this.tableRows)) {
        select = false;
      }
      this.isNotSelectAll = select;
    },
    getValue(col, row){
      return row[col.fieldName];
    },
    /** 获取可展开的属性 */
    getExpandPorp(columns){
      for(let i = 0; i < columns.length; i++){
        if(columns[i].expandProp) return columns[i].expandProp;
      }
    },
    
    /** 清空select */
    clearSelection() {
      if(!this.multiple) return
      this.tableRows.forEach(row => {
        this.$set(row, 'selected', false);
        row.children.forEach(child => {
          this.$set(child, 'selected', false);
        })
      });
      this.isSelectAll = false;
      this.isNotSelectAll = false;
    },
    /** 
     * 切换某一行的选中状态，
     * 如果使用了第二个参数，
     * 则是设置这一行选中与否（selected 为 true 则选中） */
    toggleRowSelection(row, selected) {
      if(!this.multiple) return
      for(let i = 0; i < this.tableRows.length; i++) {
        let tableRow = this.tableRows[i];
        if(tableRow.key == row.id) {
          this.$set(tableRow, 'selected', typeof selected == 'undefined' ? !tableRow['selected'] : new Boolean(selected));
        }
        for(let j = 0; j < tableRow.children.length; j++) {
          let child = tableRow.children[j];
          if(child.key == row.id) {
            this.$set(child, 'selected', typeof selected == 'undefined' ? !child['selected'] : new Boolean(selected));
            break
          }
        }
      }
      this.isSelectAll = this.checkIsSelectAll(this.tableRows);
      let select = this.checkIsSelect(this.tableRows);
      if (this.checkIsSelectAll(this.tableRows)) {
        select = false;
      }
      this.isNotSelectAll = select;
    },

    renderHead(){
      this.isRenderHead = true;
    },
    renderBody(){
      this.isRenderBody = true;
    },

    buildTableRows(data){
      let rows = Array.isArray(data) ? data : this.rows;
      let options = {
        subProp: this.getExpandPorp(this.columns),
        rowKey: this.rowKey,
        parent: null
      }
      return rows.map(item => new TableRow(item, options))
    },
    buildTableColumns(data){
      let cols = Array.isArray(data) ? data : this.columns;
      let columns = cols.map(item => new TableColumn(item));

      if(this.multiple) columns.unshift(new SelectionColumn());

      return columns;
    },
    /** 更新两侧固定表格高度 */
    doLayout(){
      let scrollBody = this.$el.querySelector('.base-table__scroll .base-table-tbody');
      if(!scrollBody) return;
      let height = scrollBody.clientHeight;

      if(this.$refs.left && this.$refs.left.$el){
        let body = this.$refs.left.$el.querySelector('.base-table__body');
        if(body) body.style.height = `${height}px`;
      }

      if(this.$refs.right && this.$refs.right.$el){
        let body = this.$refs.right.$el.querySelector('.base-table__body');
        if(body) body.style.height = `${height}px`;

        //判断是否有纵向滚动条
        let tabelEl = scrollBody.querySelector('.base-table__table');
        let hasGutter = scrollBody.offsetHeight < tabelEl.offsetHeight;
        let right = hasGutter ? this.gutter : 0;
        this.$refs.right.$el.style.right = `${right}px`;
      }    
    },
    updateFixedStyle(){
      let scrollBody = this.$el.querySelector('.base-table__scroll .base-table-tbody');
      let scrollTable = scrollBody.querySelector('.base-table__table');
      let position = 'hidden';
      let {scrollLeft, offsetWidth, scrollWidth} = scrollBody;

      if(scrollBody.clientWidth < scrollTable.offsetWidth) {
        position = 'middle';

        if(scrollLeft + offsetWidth >= scrollWidth) position = 'right';
        if(scrollLeft == 0) position = 'left';
      }

      this.scrollPosition = position;
    },
    /** 更新列宽 */
    updateColumnWidth(){
      //计算列宽
      let tableWidth = this.$el.clientWidth - this.gutter;
      util.computeColumnWidth(this.displayColumns, tableWidth, this);
    },
    onResize: _.debounce(function(event){
      this.updateColumnWidth();
      this.doLayout();
      this.updateFixedStyle();
    }, 80)
  },
  watch: {
    rows(newValue, oldValue){
      this.tableRows = this.buildTableRows(newValue);
      this.isNotSelectAll = false;
      this.isSelectAll = false;

      this.$nextTick(this.doLayout);
    },
    columns(newVal, oldVal){
      this.tableColumns = this.buildTableColumns(newVal)
      this.updateColumnWidth();
    }
  },
  mounted() {
    //这里异步渲染表格，
    //目标是确保根元素先渲染，用于获取表格的宽度
    this.$nextTick(() => {
      //计算列宽
      this.updateColumnWidth();
      this.renderHead()
    });

    window.addEventListener('resize', this.onResize)
  },
  destroyed(){
    window.removeEventListener('resize', this.onResize)
  },
  components: {
    [BaseTableHead.name]: BaseTableHead,
    [BaseTableBody.name]: BaseTableBody,
    [BaseFixedTable.name]: BaseFixedTable
  },
}
</script>