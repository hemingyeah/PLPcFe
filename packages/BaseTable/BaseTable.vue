<template>
  <div class="base-table">
    <base-table-head ref="head"
      :disable-select="disableSelect"
      :rows="internalRows" 
      :columns="internalColumns" 
      :checked="isSelectedAll"
      :gutter="gutter"
      @select-all="toggleSelectAll"></base-table-head>
    
    <base-table-body ref="body"
      :columns="internalColumns" 
      :disable-select="disableSelect"
      :style="tableBodyStyle">

      <base-table-row v-for="(row,index) in filterRows" 
        :disable-select="disableSelect"
        :row="row" 
        :columns="internalColumns" 
        :checked="row.selected" 
        :key="index"
        @check-row="check">
      </base-table-row>
    </base-table-body>
    
    <slot name="tip" v-if="filterRows.length == 0"></slot>

    <div class="base-table-expand-panel" :class="{'base-table-expand': isShowAll}" v-if="showExpandPanel">
      <button type="button" @click="expandTable"><i class="iconfont icon-zhankaisanjiao"></i> {{isShowAll ? '收起' : '展开'}}数据</button>
    </div>
  </div>
</template>

<script>
//TODO: 分页
//TODO: 排序
import _ from 'lodash';
import DEFAULT_OPTION from './DefaultOption';
import util from './util';

import BaseTableHead from './BaseTableHead.vue';
import BaseTableBody from './BaseTableBody.vue';
import BaseTableRow from './BaseTableRow.vue';

export default {
  name: 'base-table',
  props: {
    rows: {
      type: Array,
      default: []
    },
    columns: {
      type: Array,
      default: []
    },
    disableSelect: Boolean,
    limit: {
      type: Number,
      default: 0
    },
    height: Number
  },
  data(){
    return {
      internalColumns: [],
      internalRows: [],
      selectedItems: [],
      isShowAll: false,
      bodyHeight: -1,
      gutter: -1
    }
  },
  computed: {
    isSelectedAll(){
      return this.internalRows.every(row => row.selected);
    },
    showExpandPanel(){
      return this.limit > 0 && this.internalRows.length > this.limit;
    },
    filterRows(){
      let len = this.showExpandPanel && !this.isShowAll ? this.limit : this.internalRows.length;
      return this.internalRows.slice(0, len);
    },
    
    tableBodyStyle(){
      let style = {};

      if(this.bodyHeight >= 0){
        style.height = this.bodyHeight + 'px';
      }

      return style;
    }
  },
  methods: {
    expandTable(){
      this.isShowAll = !this.isShowAll;
    },
    toggleSelectAll(checked){
      this.internalRows.forEach(row => row.selected = checked);
      this.$emit('selected', this.getSelected());
    },
    check({row, selected}){
      row.selected = selected;
      this.$emit('selected', this.getSelected());
    },
    getSelected(){
      return this.internalRows.filter(row => row.selected).map(row => row._origin);
    },
    updateColnums(columns){
      let internalColumns = columns.map((column, i) => _.assign({}, DEFAULT_OPTION.DEFAULT_COLUMN, column));
      this.updateColnumWidth(internalColumns, columns);
      return internalColumns;
    },
    deepCopy(newRows, oldRows){
      return newRows.map(row => {
        let copy = {_origin: row};
        let sameRow = util.findSameRow(row, oldRows);
        if(sameRow) _.assign(copy, sameRow);
        return _.assign({}, DEFAULT_OPTION.DEFAULT_ROW, copy, row)
      });
    },
    updateLayout(){
      if(typeof this.height == 'number' && !isNaN(this.height) && isFinite(this.height)){
        let headHeight = this.$refs.head.$el.offsetHeight;
        let bodyHeight = this.$refs.body.$el.scrollHeight;
        let totalHeight = headHeight + bodyHeight;
        let height = this.height;
        if(totalHeight > height){
          let bodyHeight = height - headHeight;
          this.bodyHeight = bodyHeight >= 0 ? bodyHeight : 0;
          this.gutter = util.getScrollBarWidth();
        }else{
          this.bodyHeight = -1;
          this.gutter = -1;
        }
      }

      this.updateColnumWidth(this.internalColumns, this.columns);
    },
    updateColnumWidth(internalColumns, columns){
      let tableWidth = this.$el.offsetWidth;
      let colWidths = util.computeColumnWidth(columns, tableWidth, this)
      internalColumns.forEach((column, i) => _.assign(column,{width: colWidths[i]}))
    }
  },
  mounted(){
    this.internalColumns = this.updateColnums(this.columns); 
    this.internalRows = this.deepCopy(this.rows,[]);
    this.$nextTick(() => this.updateLayout());

    window.addEventListener('resize', _.debounce(this.updateLayout, 200))
  },
  watch: {
    rows: {
      deep: true,
      handler: function(newValue, oldValue){
        this.internalRows = this.deepCopy(newValue, this.internalRows);
        this.$nextTick(() => this.updateLayout());
      }
    },
    columns: {
      deep: true,
      handler: function(newValue, oldValue){
        this.internalColumns = this.updateColnums(newValue);
        this.$nextTick(() => this.updateLayout());
      }
    }
  },
  components: {
    [BaseTableHead.name]: BaseTableHead,
    [BaseTableBody.name]: BaseTableBody,
    [BaseTableRow.name]: BaseTableRow
  }
}
</script>