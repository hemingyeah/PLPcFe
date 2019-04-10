<template>
  <div class="performance-view-container">

    <dl class="main-info">

      <dt>{{reportDetail.reportName}}</dt>
      <dd>
        <label>规则名称：</label>
        {{reportDetail.ruleName}}
        <span class="rule-delete" v-if="reportDetail.isDelete" title="该绩效规则已被删除。" v-tooltip>已删除</span>
      </dd>
      <dd><label>创建时间：</label>{{reportDetail.createTime | formatDatetime}}</dd>
      <dd><label>统计范围：</label>{{reportDetail.allSize}} 条</dd>
      <dd><label>规则命中：</label>{{reportDetail.hitSize}} 条</dd>
      <dd><label>统计方式：</label>{{reportDetail.ruleType | ruleType}}</dd>
      <dd><label>统计状态：</label>{{reportDetail.timeType ? '已完成并结算' : '已完成'}}</dd>
      <dd><label>起止时间：</label>{{reportDetail.startTime | formatDate}} ~ {{reportDetail.endTime | formatDate}}({{reportDetail.timeType ? '结算时间' : '完成时间'}})</dd>
      <dd><label>备注：</label>{{reportDetail.remark}}</dd>
    </dl>

    <div class="detail-list">
      <div style="text-align: right;" class="export-btn">
        <el-button type="primary" :disabled="pending" @click="exportDetail">导出</el-button>
      </div>

      <el-table
        stripe
        class="detail-table"
        :data="reports">
        <el-table-column
          v-for="column in columns"
          :key="column.field"
          :label="column.label"
          :prop="column.field"
        >

          <template slot-scope="scope">
            <template v-if="column.field === 'ruleType'">
              {{scope.row[column.field] | ruleType}}
            </template>
            <template v-else-if="column.field === 'action'">
              <el-button plain @click="viewDetail(scope.row)" size="small" :disabled="!scope.row.hitNumber">查看</el-button>
            </template>

            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>

        </el-table-column>
      </el-table>

      <hit-rule-detail ref="hitRuleDetailDialog"></hit-rule-detail>
      <div ref="bridge" class="base-export-bridge"></div>
    </div>
  </div>
</template>

<script>
import { formatDate, } from '@src/util/lang';
import qs from '@src/util/querystring';
import HitRuleDetailDialog from './components/HitRuleDetailDialog.vue';

export default {
  name: 'performance-report-view',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      pending: false,

      columns: [
        {
          label: '对象',
          field: 'users',
        },
        {
          label: '命中规则',
          field: 'hitNumber',
        },
        {
          label: '绩效方式',
          field: 'ruleType',
        },
        {
          label: '绩效结果',
          field: 'total',
        },
        {
          label: '明细',
          field: 'action',
        },
      ]
    }
  },
  computed: {
    reportId() {
      const pathname = window.location.pathname;
      const res = pathname.match(/.*\/desc\/(\d*)/) || [];

      return Number(res[1] || 0);
    },
    reports() {

      if (!this.initData || !this.initData.reportDescList) return [];
      const backup = JSON.parse(JSON.stringify(this.initData.reportDescList));
      return (backup.reportList || backup.reportMap)
        .map(report => {

          if (report.desc && report.desc.length) {
            report.total = report.desc
              .map(r => {
                r.ruleType = report.ruleType ? '奖金制' : '计分制';
                r.userRole = r.userRole === 'person' ? '负责人' : '协同人';
                r.income = (r.score || r.money || 0.00) + (report.ruleType ? '元' : '分');
                return Number(r.score) || Number(r.money) || 0.00;
              })
              .filter(score => score >= 0)
              .reduce((a, b) => a + b) || 0;
          } else {
            report.total = 0;
          }
          report.total = `${report.total.toFixed(2)}${report.ruleType ? '元' : '分'}`;

          return report;
        })
    },
    reportDetail() {
      if (!this.initData || !this.initData.reportDescList || !this.initData.reportDescList.ruleMap) return {}
      const {reportName, ruleName, allSize, hitSize, ruleType, createTime, startTime, endTime, remark, timeType, isDelete } = this.initData.reportDescList.ruleMap;

      return {
        reportName,
        ruleName,
        createTime,
        allSize,
        hitSize,
        ruleType,
        remark,
        startTime,
        endTime,
        timeType,
        isDelete
      }
    }
  },
  filters: {
    ruleType(val) {
      return val ? '奖金制' : '计分制';
    },
    formatDatetime(val) {
      if (!val) return val;
      return formatDate(val, 'YYYY-MM-DD HH:mm:ss')
    },
    formatDate(val) {
      if (!val) return val;
      return formatDate(val, 'YYYY-MM-DD')
    },
  },
  methods: {
    exportDetail() {
      this.pending = true;
      const model = {
        ids: this.reportId,
      };
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}绩效报告明细.xlsx`;
      let ua = navigator.userAgent;
      if (ua.indexOf('Trident') >= 0){
        window.location.href = `/performance/v2/export/report/desc?${qs.stringify(model)}`;
        this.visible = false;
      }

      this.$http.get(`/performance/v2/export/report/desc?${qs.stringify(model)}`, {}, {responseType: 'blob'}).then(blob => {
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
    viewDetail(row) {
      this.$refs.hitRuleDetailDialog.toggleDialog(row);
    }
  },
  components: {
    [HitRuleDetailDialog.name]: HitRuleDetailDialog,
  }
}
</script>

<style lang="scss">

.performance-view-container {
  display: flex;
  padding: 10px;
  min-width: 1020px;

  .main-info {
    margin: 0;
    background: #fff;
    max-width: 420px;
    width: 30%;

    dt {
      line-height: 32px;
      font-size: 16px;
      padding: 10px;
      border-bottom: 1px solid #f4f4f4;
    }

    dd {
      line-height: 30px;
      padding-left: 10px;
      margin: 0;
      label {
        font-size: 14px;
        font-weight: 700;
      }
    }


    .rule-delete {
      color: #fff;
      display: inline-block;
      border-radius: 4px;
      font-size: 12px;
      line-height: 18px;
      height: 18px;
      padding: 0 5px;
      font-weight: 400;
      vertical-align: middle;
      cursor: default;
    }

    .rule-delete{
      background-color: $color-danger;
    }
  }

  .detail-list {
    margin-left: 10px;
    flex-grow: 1;
    width: 70%;

    .detail-table {
      padding: 10px;
      th {
        background: #F5F5F5;
        color: $text-color-primary;
        font-weight: normal;
        font-size: 14px;
        line-height: 34px;
        color: #333;
      }
      td {
        font-size: 13px;
      }
    }

    .export-btn {
      text-align: right;
      padding: 10px;
      background: #fff;
      margin-bottom: 10px;
    }
  }
}

</style>
