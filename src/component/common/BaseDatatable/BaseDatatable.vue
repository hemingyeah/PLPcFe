<template>
  <div :class="{'base-table-stripe': stripe}" class="base-datatable">
    <!-- v-if 默认不会渲染 确保子组件在父组件之后渲染 -->
    <div v-if="isTableShow" class="base-datatable-scroll" :style="{'height': tableHeight}">
      <base-datatable-head
        v-if="!tableResize"
        :columns="columns"
        :rows="tableRows"
        :multiple="multiple"
        :is-select-all="isSelectAll"
        :is-not-select-all="isNotSelectAll"
        @toggleSelectAll="toggleSelectAll"/>
      <base-datatable-body
        v-if="!tableResize"
        :rows="tableRows" 
        :columns="columns"
        :multiple="multiple"
        @toggleRowSelect="toggleSelect"/>
    </div>
  </div>
</template>


<script>
/**
 * 1. 可显示子团队
 * 2. 可折叠
 * 3. 可选择子团队
 * 4. 字段需要配置
 * 5. 可自定义单元格渲染内容
 * 6. 可配置列宽
 */
import _ from "lodash";

import * as TableLayout from './TableLayout';
import TableRow from './TableRow';

import BaseTableHead from './BaseDatatableHead';
import BaseTableBody from './BaseDatatableBody';

export default {
  name: 'base-datatable',
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
     * 指定子表格对应的数据
     * 
     * 如果类型是String, 组件会自动根据属性取值，
     * 如果类型是Function, 需要返回数组
     */
    subProp: {
      type: [String, Function]
    },
    /**
     * 行数据的 Key，用来优化 Table 的渲染，必须指定
     */
    rowKey: String,
    /**
     * 传入组件内的 高
     */
    height: {
      type: [Number, String],
      default: '100%'
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
    }
  },
  computed: {

  },
  data(){
    return {
      tableRows: this.buildTableRows(),
      tableKey: Math.random() * 10,
      tableHeight: this.height,
      tableResize: false,
      isSelectAll: false,
      isNotSelectAll: false,
      isTableShow: false, // 当前表格是否显示
    }
  },
  methods: {
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
    getSubRows(row, prop){ 
      let subRows = [];
    
      if(typeof prop == 'string') subRows = row[prop];
      if(typeof prop == 'function') subRows = prop(row);
    
      return Array.isArray(subRows) ? subRows : [];
    },
    buildTableRows(data){
      let rows = Array.isArray(data) ? data : this.rows;
      let options = {
        subProp: this.subProp,
        rowKey: this.rowKey,
      }
      return rows.map(item => new TableRow(item, options))
    },
    //TODO:合并数据，用于保持行当前状态
    mergeTableRows(data){
      return this.buildTableRows(data)
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
    /** 切换某一行的选中状态，
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
    }
  },
  watch: {
    rows(newValue, oldValue){
      this.tableRows = this.mergeTableRows(newValue);
      this.isNotSelectAll = false;
      this.isSelectAll = false;
    },
    changRows(rows) {
      for(let i = 0; i < rows.length; i++) {
        let row = rows[i];
        for(let j = 0; j < this.tableRows.length; j++) {

          let tableRow = this.tableRows[j];
          if(tableRow.key == row.id) {
            tableRow['selected'] = false;
            break;
          } else {
            for(let k = 0; k < tableRow.children.length; k++) {
              let childrenRow = tableRow.children[k];
              if(childrenRow.rawData.id == row.id) {
                childrenRow['selected'] = false;
                break;
              }
            } 
          }

        }
      }
      this.isSelectAll = this.checkIsSelectAll(this.tableRows);
      this.isNotSelectAll = false;
    }
  },
  components: {
    [BaseTableHead.name]: BaseTableHead,
    [BaseTableBody.name]: BaseTableBody
  },
  created() {
    let type = typeof this.tableHeight;
    if(type == 'number') this.tableHeight += 'px'
  },
  mounted() {
    this.isTableShow = true;
    const _this = this;
    window.onresize = function (e) {
      _this.tableResize = true;
      _this.$nextTick(() => {
        _this.tableResize = false;
      })
    }
  }
}
</script>