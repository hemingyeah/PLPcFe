<template>
  <base-modal title="绩效明细" :show.sync="visible" width="600px" class="base-import-modal" @closed="reset">

    <el-table
      stripe
      :data="detail">
      <el-table-column prop="taskNo" label="工单编号" />
      <el-table-column prop="customer" label="客户" >
        <template slot-scope="scope">{{scope.row.customer.name}}</template>
      </el-table-column>
      <el-table-column prop="userName" label="对象" ></el-table-column>
      <el-table-column prop="userRole" label="角色" ></el-table-column>
      <el-table-column prop="ruleType" label="绩效方式" ></el-table-column>
      <el-table-column prop="income" label="绩效结果" ></el-table-column>
    </el-table>

    <div class="dialog-footer" style="margin-top: 15px;text-align: right;">
      <el-button type="primary" :disabled="pending" @click="exportDetail">导出</el-button>
    </div>

    <div ref="bridge" class="base-export-bridge"></div>
  </base-modal>
    
</template>

<script>
import { formatDate } from '@src/util/lang';
import qs from '@src/util/querystring';
export default {
  name: 'hit-rule-detail',
  data() {
    return {
      visible: false,
      pending: false,
      detail: [],
    }
  },
  methods: {
    exportDetail() {
      this.pending = true;

      let model = {
        checked: `${this.detail.map(d => d.id).join(',') },`,
      };

      this.exportExcel(model);
    },
    exportExcel(model) {
      this.pending = true;
      let fileName = `${formatDate(new Date(), 'YYYY-MM-dd')}绩效报告明细.xlsx`;
      let ua = navigator.userAgent;
      if (ua.indexOf('Trident') >= 0){
        window.location.href = `/performance/v2/export/report/desc/detail?${qs.stringify(model)}`;
        this.visible = false;
      }

      this.$http.get(`/performance/v2/export/report/desc/detail?${qs.stringify(model)}`, {}, {responseType: 'blob'}).then(blob => {
        let link = document.createElement('a');
        let url = URL.createObjectURL(blob);
        link.download = fileName;
        link.href = url;
        this.$refs.bridge.appendChild(link);
        link.click();
        this.visible = false;
        this.pending = false;
        setTimeout(() => {
          URL.revokeObjectURL(url);
          this.$refs.bridge.removeChild(link)
        }, 150);
      }).catch(err => {
        console.error(err);
        this.pending = false;
      })
    },
    toggleDialog(detail) {
      this.visible = !this.visible;
      if (detail) this.detail = detail.desc;
    },
    reset() {
      this.detail = [];
    }
  },
}
</script>

<style lang="scss">

.el-table {
  max-height: 300px;
  overflow-y: auto;
}
</style>