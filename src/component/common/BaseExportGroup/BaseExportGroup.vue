<template>
  <base-modal title="导出列选择" :show.sync="visible" width="600px" class="base-export-modal base-export-modal-group">

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

    <div class="base-export-modal-content" v-for="(item, index) in filterColumns" :key="`${item.label}_${index}`">
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
            :label="col.exportAlias ? col.exportAlias : col.field"
          >
            {{ col.label }}
          </el-checkbox>
        </template>
      </el-checkbox-group>

    </div>
    <!-- end 分组 -->

    <div slot="footer" class="export-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button
        type="primary"
        :disabled="pending"
        @click="exportData(true)"
      >
        {{pending ? '正在导出' : '导出'}}
      </el-button>
    </div>

    <div class="base-export-bridge" ref="bridge"></div>
  </base-modal>
</template>

<script>
import baseExportMixin from '@src/mixins/baseExportMixin'

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
      default: false
    },
    title: {
      type: String,
      default: '导出列选择'
    },
    method: {
      type: String,
      default: 'get'
    },
    /**
     * 函数必须返回Promise对象
     * 如果验证失败，promise需要返回错误信息，否则返回null
     */
    validate: Function,
  },
  data() {
    let checkedMap = {};
    let columns = this.columns;
    
    columns.forEach(column => {
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
      isDownloadNow: false, // 导出是否是立刻下载模式

      checked: ''
    };
  },
  computed: {
    checkedLength() {
      let checkedMap = this.checkedMap;
      let length = 0;

      for(let key in checkedMap) {
        let columns = checkedMap[key];
        length += columns.length;
      }
      
      return length;
    },
    filterColumns() {
      filterColumnsExpandLength = 0;

      return this.columns.map(item => {
        let columns = item.columns || [];

        if(Array.isArray(columns) || columns.length < 1) {
          console.warn('Caused: base-export-group filter columns item has no columns')
        }

        item.columns = columns.filter(column => column.export);

        filterColumnsExpandLength += item.columns.length;
        filterColumnsExpand.push(...item.columns);
        filterColumnsMap[item.value] = item.columns;

        return item;
      });
    }
  },
  methods: {
    buildParamsFunc() {
      return (
        typeof this.buildParams == 'function'
          ? this.buildParams(this.checkedMap, this.ids)
          : { checked: this.checkedArr.join(','), ids: this.ids.join(',') }
      )
    },
    checkedAll(checkedAll = true) {
      let checkedMap = this.checkedMap;

      this.checkedGroupArr = [];

      for(let key in checkedMap) {
        let item = checkedMap[key];
        let columns = filterColumnsMap[key];

        let checkedArr = [];

        if(checkedAll) {
          checkedArr = columns.map(item =>
            item.exportAlias ? item.exportAlias : item.field
          );

          this.checkedGroupArr.push(key);
        }

        this.$set(this.checkedMap, key, checkedArr);
      }
    },
    handleChange() {
      this.isCheckedAll = this.checkedLength == filterColumnsExpandLength;
    },
    handleChangeGroup(value) {
      let checkedMap = this.checkedMap;

      this.checkedGroupArr = [];

      for(let key in checkedMap) {
        let checkedArr = [];

        if(value.indexOf(key) > -1) {
          let item = checkedMap[key];
          let columns = filterColumnsMap[key];

          checkedArr = columns.map(item =>
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

      this.isDownloadNow = isDownloadNow;

      this.visible = true;
    },
    toggle(value) {
      this.checkedAll(value);
    },
  }
};
</script>

<style lang="scss">
  @import './../BaseExport/BaseExport.scss';

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
  }
</style>
