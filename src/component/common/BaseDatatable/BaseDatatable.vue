<template>
  <div :class="{'base-table-stripe': false}" class="base-datatable">
    <base-datatable-head
      v-if="isRenderHead"
      :columns="columns"
      :rows="tableRows"
      :multiple="multiple"
      :is-select-all="isSelectAll"
      :is-not-select-all="isNotSelectAll"
      @toggleSelectAll="toggleSelectAll"
      @mounted="renderBody"/>

    <div v-if="isRenderBody" class="base-datatable__body" :style="scrollY" @scroll="syncScroll">
      <base-datatable-body
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
    /** 是否启用流式布局 */
    fluid: {
      type: Boolean,
      default: false
    }
  },
  computed: {
 
  },
  data(){
    return {
      //当前表格头是否渲染完成
      isRenderHead: false, 
      //当前表格内容是否渲染完成
      isRenderBody: false,
      //滚动区域样式
      scrollY: {},







      tableRows: this.buildTableRows(),
      tableKey: Math.random() * 10,
      tableHeight: this.height,
      tableResize: false,
      isSelectAll: false,
      isNotSelectAll: false,



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
    /** 获取可展开的属性 */
    getExpandPorp(columns){
      for(let i = 0; i < columns.length; i++){
        if(columns[i].expandProp) return columns[i].expandProp;
      }
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
    },


    renderHead(){
      this.isRenderHead = true;
    },
    renderBody(){
      this.isRenderBody = true;
      this.updateScrollY();
    },
    updateScrollY(){
      let scrollY = {};

      //启用流式布局需要计算滚动区域最大高度
      if(this.maxHeight){
        let max = this.maxHeight;
        let headOffsetHeight = this.$el.querySelector('.base-datatable__head').offsetHeight;

        if(typeof max == 'number'){
          scrollY.maxHeight = max - headOffsetHeight + 'px';
        }

        if(typeof max == 'string'){
          scrollY.maxHeight = `calc(${max} - ${headOffsetHeight}px)`;
        }
      }

      this.scrollY = scrollY;
    },
    syncScroll(event){
      let headEl = this.$el.querySelector('.base-datatable__head');
      let bodyEl = event.target;

      //同步横向滚动
      if(headEl.scrollLeft != bodyEl.scrollLeft) {
        headEl.scrollLeft = bodyEl.scrollLeft;
      }
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
    //这里异步渲染表格，
    //目标是确保根元素先渲染，用于获取表格的宽度
    this.$nextTick(this.renderHead);


    // this.isTableShow = true;
    // const _this = this;
    // window.onresize = function (e) {
    //   _this.tableResize = true;
    //   _this.$nextTick(() => {
    //     _this.tableResize = false;
    //   })
    // }
  }
}
</script>