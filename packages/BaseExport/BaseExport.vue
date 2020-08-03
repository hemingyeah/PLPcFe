<template>
  <el-dialog :visible.sync="visible" width="600px">
    <template slot="title">
      <div>
        <span class="base-export-title">{{title}}</span>
        <el-checkbox v-model="isCheckedAll" @change="toggle">全选</el-checkbox>
      </div>
    </template>
    <el-checkbox-group
      v-model="checkedArr"
      @change="handleChange"
      style="width:100%;"
      class="base-export-field-wrap"
    >
      <el-checkbox
        v-for="col in filterColumns"
        :key="col.field"
        :label="col.exportAlias ? col.exportAlias : col.field"
      >{{col.label}}</el-checkbox>
    </el-checkbox-group>

    <div slot="footer">
      <el-button type="text" @click="visible = false" style="color: #606266;" size="small">关闭</el-button>
      <el-button
        type="primary"
        :disabled="pending"
        :loading="pending"
        @click="exportData"
        size="small"
      >{{pending ? '正在导出' : '导出'}}</el-button>
    </div>

    <div class="base-export-bridge" ref="bridge"></div>
  </el-dialog>
</template>

<script>
import _ from 'lodash';
import Platform from '@src/util/Platform';
import qs from '@src/util/querystring2';
import http from '@src/util/HttpUtil';

const MAX_COUNT = 5000;

export default {
  name: 'base-export',
  props: {
    columns: Array,
    action: String,
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
    validate: Function
  },
  data() {
    return {
      ids: [],
      fileName: '',
      params: {},
      visible: false,
      pending: false,
      checkedArr: [],
      isCheckedAll: true,

      checked: ''
    };
  },
  computed: {
    filterColumns() {
      return this.columns.filter(item => item.export !== false);
    }
  },
  methods: {
    open(ids = [], fileName = '导出数据.xlsx', params) {
      this.pending = false;
      this.ids = ids;
      this.fileName = fileName;
      this.params = params;

      this.checkedArr = this.filterColumns.map(item =>
        item.exportAlias ? item.exportAlias : item.field
      );
      this.isCheckedAll = true;

      this.visible = true;
    },
    toggle(value) {
      this.checkedArr = value
        ? this.filterColumns.map(item =>
          item.exportAlias ? item.exportAlias : item.field
        )
        : [];
    },
    handleChange() {
      this.isCheckedAll = this.checkedArr.length == this.filterColumns.length;
    },
    async exportData() {
      if (this.checkedArr.length == 0)
        return Platform.alert('请至少选择一列导出');

      this.pending = true;

      // 如果提供验证函数，则进行验证
      if (typeof this.validate == 'function') {
        let validateRes = await this.validate(this.ids, MAX_COUNT);
        if (validateRes) {
          this.pending = false;
          this.visible = false;
          return Platform.alert(validateRes);
        }
      }

      let model = {
        checked: this.checkedArr.join(','),
        ids: this.ids.join(',')
      };
      _.assign(model, this.params);

      let ua = navigator.userAgent;
      if (ua.indexOf('Trident') >= 0) {
        window.location.href = `${this.action}?${qs.stringify(model)}`;
        this.visible = false;
        return;
      }

      let responseType = { responseType: 'blob' };
      if (this.method === 'post') {
        return http
          .post(this.action, model, true, responseType)
          .then(this.exportResponseHandler)
          .catch(err => console.error(err));
      }

      return http
        .get(`${this.action}?${qs.stringify(model)}`, {}, responseType)
        .then(this.exportResponseHandler)
        .catch(err => console.error(err));
    },

    exportResponseHandler(blob) {
      let link = document.createElement('a');
      let url = URL.createObjectURL(blob);
      link.download = this.fileName;
      link.href = url;
      this.$refs.bridge.appendChild(link);
      link.click();

      this.visible = false;
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.$refs.bridge.removeChild(link);
      }, 150);
    }
  }
};
</script>

<style lang="scss">
.base-export-title {
  display: inline-block;
  min-width: 80px;
  margin-right: 10px;
  line-height: 20px;
  font-size: 16px;
  color: #303133;
}

.base-export-field-wrap {
  display: flex;
  flex-flow: row wrap;

  .el-checkbox {
    margin-left: 0;
    margin-top: 10px;
    width: 25%;
  }
}

.base-export-bridge {
  position: absolute;
  top: -1000px;
  left: -1000px;

  a {
    display: block;
    border: none;
    outline: none;
    width: 0;
    height: 0;
  }
}
</style>
