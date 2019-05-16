<template>
  <div class="performance-view-container">

    <dl class="main-info">

      <dt class="main-info-section-title">
        {{reportDetail.reportName}}

        <div class="btn-group">
          <el-button type="danger" size="mini">拒绝</el-button>
          <el-button type="primary" size="mini">发布</el-button>

        </div>

      </dt>
      <dd>
        <el-popover
          placement="right"
          width="418"
          popper-class="process-popover"
          trigger="hover">
          <div class="process-popover-content">
            <h3 class="title">
              <span>最近更新</span>
            </h3>

            <div class="records">
              <base-timeline :data="records" :record-render="renderRecord"/>
            </div>
          </div>
          <div slot="reference">
            <approve-process stage="create"></approve-process>
          </div>
        </el-popover>
      </dd>
      <dd class="main-info-section-title">报告信息</dd>
      <dd>
        <label>规则名称</label>
        {{reportDetail.ruleName}}
        <span class="rule-delete" v-if="reportDetail.isDelete" title="该绩效规则已被删除。" v-tooltip>已删除</span>
      </dd>
      <dd><label>创建时间</label>{{reportDetail.createTime | formatDatetime}}</dd>
      <dd><label>绩效方式</label>{{reportDetail.ruleType | ruleType}}</dd>
      <dd class="group-line"><label>统计状态</label>{{reportDetail.taskType ? '已完成并结算' : '已完成'}}</dd>

      <dd><label>起止时间</label>{{reportDetail.startTime | formatDate}} ~ {{reportDetail.endTime | formatDate}}({{reportDetail.timeType ? '结算时间' : '完成时间'}})</dd>
      <dd><label>创建备注</label>{{reportDetail.remark}}</dd>
      <dd><label>创建人</label></dd>
      <dd><label>审核人</label></dd>
      <dd class="group-line"><label>抄送人</label></dd>

      <dd><label>审核操作人</label></dd>
      <dd><label>审核备注</label></dd>
      <dd><label>审核时间</label></dd>
      <dd><label>发布时间</label></dd>

    </dl>

    <div class="detail-list">
      <div style="text-align: right;" class="export-btn">


        <el-checkbox v-model="filterResult">仅显示有绩效结果的数据</el-checkbox>
        <el-button type="primary" :disabled="pending" @click="exportDetail">导出</el-button>
      </div>

      <div class="statisticsPanel">
        <div class="taskStatistics item">
          <div class="title">
            <h3>{{reportDetail.allSize}}</h3>
            <p>统计工单数量</p>
          </div>
          <i class="iconfont icon-fenzu1"></i>
        </div>

        <div class="hitStatistics item">
          <div class="title">
            <h3>{{reportDetail.hitSize}}</h3>
            <p>命中规则的工单</p>
          </div>
          <i class="iconfont icon-fenzu1"></i>
        </div>

        <div class="targetStatistics item">
          <div class="title">
            <h3>1111</h3>
            <p>统计对象</p>
          </div>
          <i class="iconfont icon-fenzu1"></i>
        </div>

        <div class="totalStatistics item">
          <div class="title">
            <h3>{{total}}</h3>
            <p>合计得分/合计奖金</p>
          </div>
          <i class="iconfont icon-fenzu1"></i>
        </div>
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
            <template v-else-if="column.field === 'total'">
              {{scope.row.total + scope.row.unit}}
            </template>

            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>

        </el-table-column>
      </el-table>

      <hit-rule-detail ref="hitRuleDetailDialog"></hit-rule-detail>
      <publish-report></publish-report>
      <div ref="bridge" class="base-export-bridge"></div>
    </div>
  </div>
</template>

<script>
import { formatDate, } from '@src/util/lang';
import qs from '@src/util/querystring';
import HitRuleDetailDialog from './components/HitRuleDetailDialog.vue';
import ApproveProcess from './components/ApproveProcess.vue';
import PublishReportDialog from './components/PublishReportDialog.vue';


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
      filterResult: false,
      records: [
        {
          createTime: '2019-4-30 18:00'
        },
        {
          createTime: '2019-4-30 18:00'
        },
        {
          createTime: '2019-4-30 18:00'
        },
        {
          createTime: '2019-4-30 18:00'
        },
      ],

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
          report.total = report.total.toFixed(2);

          report.unit = report.ruleType ? '元' : '分';
          return report;
        })
        .filter(report => {
          if (!this.filterResult) return true;
          if (Number(report.total)) return true;
          return false
        })
    },
    total() {
      if (!this.reports || !this.reports.length) return 0;
      return this.reports
        .map(a => Number(a.total))
        .reduce((a, b) => a + b);
    },
    reportDetail() {
      if (!this.initData || !this.initData.reportDescList || !this.initData.reportDescList.ruleMap) return {}
      const {reportName, ruleName, allSize, hitSize, ruleType, createTime, startTime, endTime, remark, timeType, isDelete, taskType } = this.initData.reportDescList.ruleMap;

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
        taskType,
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
    renderRecord(h, item) {
      return (
        <h5>
          <strong>张三创建了服务报告。</strong>
          <p className="secondary-info">备注：asdasdaasdasdasdassd。</p>
        </h5>
      )
    },
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
    [ApproveProcess.name]: ApproveProcess,
    [PublishReportDialog.name]: PublishReportDialog,
  }
}
</script>

<style lang="scss">

@font-face {
  font-family: 'DINAlternate-Bold'; /*a name to be used later*/
  src: url('/src/assets/icon/DINAlternate-Bold.ttf'); /*URL to font*/
}


.process-popover {
  padding: 0;
}

.process-popover-content {
  .title {
    height: 40px;
    background: #fafafa;
    padding: 0 15px;
    display: flex;
    align-items: center;
    margin: 0;
    span {
      background: #DD4B39;
      border-radius: 2px;
      width: 68px;
      height: 27px;
      line-height: 27px;
      text-align: center;
      font-weight: normal;
      color: #fff;
      font-size: 14px;
    }
  }

  .records {
    min-height: 200px;
    max-height: 500px;
    overflow: auto;
    padding-top: 10px;
  }
}


  .performance-view-container {
  display: flex;
  padding: 10px;
  min-width: 1020px;
  background: #fff;
  min-height: calc(100vh - 10px);
  box-sizing: border-box;

  .main-info {
    margin: 0;
    background: #fff;
    width: 500px;
    flex-shrink: 0;
    box-shadow: 2px 2px 11px 0 rgba(198,192,192,0.50);

    .main-info-section-title {
      line-height: 40px;
      font-size: 16px;
      padding: 0px 12px 0px 18px;
      background: #FAFAFA;
      font-weight: 500;
      display: flex;
      justify-content: space-between;
      .btn-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .approve-process-container {
      padding: 27px 30px 30px;
      background: #fff;

      h5 {
        font-size: 15px;
      }
    }

    dd {
      line-height: 32px;
      margin: 0;
      color: #525252;
      label {
        color: #525252;
        font-size: 14px;
        font-weight: 500;
        width: 88px;
        padding-left: 18px;

      }
    }

    .group-line {
      border-bottom: 6px solid #fafafa;
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
    margin-left: 30px;
    flex-grow: 1;
    width: 70%;
    min-width: 535px;
    border: 1px solid #E7E7E7;
    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.50);
    padding: 0 20px;


    .statisticsPanel {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;


      .item {
        padding: 19px 20px 16px;
        width: 240px;
        height: 90px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
        margin: 15px 0;

        .title {
          h3 {
            color: #fff;
            font-size: 31px;
            margin: 0;
            font-weight: normal;
            font-family: 'DINAlternate-Bold';
          }
          p {
            margin: 0;
            font-size: 15px;
          }
        }
        .iconfont {
          font-size: 34px;
        }
      }

      .taskStatistics {
        background: #55B7B4;
        .title p {
          color: #156E6B;
        }
        .iconfont {
          color: #2A9F9C;
        }
      }

      .hitStatistics {
        background: #FFC56B ;
        .title p {
          color: #B67209;
        }
        .iconfont {
          color: #EDA23D;
        }
      }

      .targetStatistics {
        background: #3EAFFF ;
        .title p {
          color: #34566F;
        }
        .iconfont {
          color: #248DD7;
        }
      }

      .totalStatistics {
        background: #E8A683;
        .title p {
          color: #C06737;
        }
        .iconfont {
          color: #CB7852;

        }
      }

    }

    .detail-table {
      padding-bottom: 10px;
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
      background: #fff;
      padding-top: 10px;
      padding-left: 10px;
    }
  }
}

</style>
