<template>
  <base-modal
    title="导出列选择"
    :show.sync="visible"
    width="600px"
    class="base-export-modal base-export-modal-group"
  >
    <!-- start 分组 -->
    <div>
      <el-checkbox v-model="isCheckedAll" @change="toggle">全选</el-checkbox>
      <el-checkbox-group
        v-model="checkedGroupArr"
        @change="handleChangeGroup"
        style="width:100%;"
        class="base-export-field-wrap"
      >
        <template>
          <el-checkbox
            v-for="(col, index) in filterColumns"
            :key="`${col.label}_${index}`"
            :label="col.value"
          >
            {{ col.label }}
          </el-checkbox>
        </template>
      </el-checkbox-group>
    </div>

    <div class="base-export-modal-content" v-if="needchooseBreak">
      <div class="base-export-modal-title">
        导出选项
      </div>
      <el-checkbox v-model="tooltip" class="base-export-field-wrap" title="勾选后，支持将除备件、服务项目、附加组件（多次类型）以外的多行数据导出在一个单元格内，适用于数据透视表等场景。">多选类型的字段在导出时，不同值在同一个单元格中显示（例如：字段名称：1/2/3/4）</el-checkbox>
    </div>
    <div
      class="base-export-modal-content"
      v-for="(item, index) in filterColumns"
      :key="`${item.label}_${index}`"
    >
      <div class="base-export-modal-title">
        {{ item.label }}
      </div>

      <el-checkbox-group
        v-model="checkedMap[item.value]"
        @change="handleChange"
        style="width:100%;"
        class="base-export-field-wrap"
      >
        <template>
          <el-checkbox
            v-for="(col, index) in item.columns"
            :key="`${col.field}_${index}`"
            v-if="!col.bool"
            :label="col.exportAlias ? col.exportAlias : col.field"
          >
            {{ col.label }} 
            <div class="tooltip" v-if="item.value === 'taskChecked' && col.formType === 'select' && col.setting.isMulti">多行数据</div>
            <div class="tooltip" v-if="item.value === 'receiptChecked' && col.formType === 'select' && col.setting.isMulti">多行数据</div>
            <div class="tooltip" v-if="item.value === 'receiptChecked' && (col.label === '备件' || col.label === '服务项目')">多行数据</div>
            <div class="tooltip" v-if="item.value === 'systemChecked' && (col.label === '负责人所属团队' || col.label === '负责人所属部门' || col.label === '协同人')">多行数据</div>
            <div class="tooltip" v-if="item.value === `annexChecked${index}` && col.inputType =='multiple'">多行数据</div>
            <div class="tooltip" v-if="item.value === `annexChecked${index}` && col.inputType =='single' && col.formType =='selectMulti'">多行数据</div>
          </el-checkbox>
        </template>
      </el-checkbox-group>
    </div>
    <!-- end 分组 -->

    <div slot="footer" class="export-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :disabled="pending" @click="exportData(true)">
        {{ pending ? "正在导出" : "导出" }}
      </el-button>
    </div>

    <div class="base-export-bridge" ref="bridge"></div>
  </base-modal>
</template>

<script>
import baseExportMixin from '@src/mixins/baseExportMixin';
import { string } from 'mathjs';

let filterColumnsExpandLength = 0;
let filterColumnsExpand = [];
let filterColumnsMap = {};

export default {
  name: 'base-export-group',
  mixins: [baseExportMixin],
  props: {
    action: String,
    alert: Function,
    buildParams: Function,
    columns: Array,
    downloadUrl: String,
    group: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '导出列选择',
    },
    method: {
      type: String,
      default: 'get',
    },
    /**
     * 函数必须返回Promise对象
     * 如果验证失败，promise需要返回错误信息，否则返回null
     */
    validate: Function,
    needchooseBreak:{
      type: Boolean | String,
      default: true,
    },
  },
  data() {
    let checkedMap = {};
    let columns = this.columns;

    columns.forEach((column) => {
      checkedMap[column.value] = [];
    });
    return {
      checkedMap,
      checkedGroupArr: [],
      ids: [],
      fileName: '',
      visible: false,
      pending: false,
      checkedArr: [],
      isCheckedAll: true,
      tooltip: true,
      isDownloadNow: false, // 导出是否是立刻下载模式

      checked: '',
    };
  },
  watch: {
    columns(columns) {
      let checkedMap = {};
      columns.forEach((column) => {
        checkedMap[column.value] = [];
      });
      this.checkedMap = checkedMap;
    },
    tooltip(v) {
      localStorage.setItem('tooltip', v)
    },
  },
  computed: {
    checkedLength() {
      let checkedMap = this.checkedMap;
      let length = 0;

      for (let key in checkedMap) {
        let columns = checkedMap[key];
        length += columns.length;
      }

      return length;
    },
    filterColumns() {
      filterColumnsExpandLength = 0;
      return this.columns.map((item) => {
        let columns = item.columns || [];

        if (Array.isArray(columns) || columns.length < 1) {
          console.warn('Caused: base-export-group filter columns item has no columns');
        }

        item.columns = columns.filter((column) => column.export && column.formType != 'attachment');

        filterColumnsExpandLength += item.columns.length;
        filterColumnsExpand.push(...item.columns);
        filterColumnsMap[item.value] = item.columns;
        return item;
      });
    },
  },
  methods: {
    buildParamsFunc() {
      return typeof this.buildParams == 'function'
        ? this.buildParams(this.checkedMap, this.ids, this.tooltip)
        : { checked: this.checkedArr.join(','), ids: this.ids.join(',') };
    },
    checkedAll(checkedAll = true) {
      let checkedMap = this.checkedMap;

      this.checkedGroupArr = [];

      for (let key in checkedMap) {
        let item = checkedMap[key];
        let columns = filterColumnsMap[key];

        let checkedArr = [];

        if (checkedAll) {
          checkedArr = columns.map((item) =>
            item.exportAlias ? item.exportAlias : item.field
          );

          this.checkedGroupArr.push(key);
        }

        this.$set(this.checkedMap, key, checkedArr);
      }
    },
    handleChange() {
      this.isCheckedAll = this.checkedLength == filterColumnsExpandLength;
      localStorage.setItem('checkedMap', JSON.stringify(this.checkedMap))
      localStorage.setItem('checkedGroupArr', JSON.stringify(this.checkedGroupArr))
      localStorage.setItem('isCheckedAll', this.isCheckedAll)
    },
    handleChangeGroup(value) {
      let checkedMap = this.checkedMap;

      this.checkedGroupArr = [];

      for (let key in checkedMap) {
        let checkedArr = [];

        if (value.indexOf(key) > -1) {
          let columns = filterColumnsMap[key] || [];

          checkedArr = columns.map((item) =>
            item.exportAlias ? item.exportAlias : item.field
          );

          this.checkedGroupArr.push(key);
        }

        this.$set(this.checkedMap, key, checkedArr);
      }

      this.handleChange();
    },
    isCheckedEmpty() {
      return filterColumnsExpandLength == 0;
    },
    open(ids = [], fileName = '导出数据.xlsx', isDownloadNow = false) {
      this.pending = false;
      this.ids = ids;
      this.fileName = fileName;

      this.isCheckedAll = true;
      this.checkedAll();

      if (localStorage.getItem('checkedMap')) {
        this.checkedMap = JSON.parse(localStorage.getItem('checkedMap'))
      }
      if (localStorage.getItem('checkedGroupArr')) {
        this.checkedGroupArr = JSON.parse(localStorage.getItem('checkedGroupArr'))
      }
      if (localStorage.getItem('isCheckedAll')) {
        this.isCheckedAll = localStorage.getItem('isCheckedAll') === 'true'
      }
      if (localStorage.getItem('tooltip')) {
        this.tooltip = localStorage.getItem('tooltip') === 'true'
      }

      this.isDownloadNow = isDownloadNow;

      this.visible = true;
    },
    toggle(value) {
      this.checkedAll(value);
      localStorage.setItem('checkedMap', JSON.stringify(this.checkedMap))
      localStorage.setItem('checkedGroupArr', JSON.stringify(this.checkedGroupArr))
      localStorage.setItem('isCheckedAll', this.isCheckedAll)
    },
  },
};
</script>

<style lang="scss">
@import "./../BaseExport/BaseExport.scss";

.base-export-modal-group {
  .base-export-modal-content {
    margin-top: 10px;
  }

  .base-export-modal-title {
    font-weight: 500;
    font-size: 15px;
    line-height: 30px;
    height: 30px;
  }
  .tooltip {
    background-color: #4472C4;
    margin-left: 3px;
    margin-bottom: 0px;
    padding: 2px 6px;
    color: white;
    display: inline-block;
  }
}
</style>
