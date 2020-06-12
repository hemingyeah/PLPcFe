<template>
  <div class="service-statistics-container">
    <div class="stats-panel-head stats-form">
      <h3>
        服务项目报表
        <el-popover trigger="hover" class="">
          <div style="display: flex;justify-content: flex-start">
            <div >
              <div class="stats-popover-row">
                <div class="stats-popover-label service-repoart-label">服务项目-用量：</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-label service-repoart-label">服务项目-费用：</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-label service-repoart-label">服务项目-使用人：</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-label service-repoart-label">服务项目-类别：</div>
              </div>
            </div>
            <div >
              <div class="stats-popover-row">
                <div class="stats-popover-text">周期内使用服务项目使用数量排名</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-text">周期内使用服务项目费用排名</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-text">周期内使用服务项目的负责人排名</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-text">周期内服务项目按类别统计</div>
              </div>
            </div>
          </div>
          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
      </h3>
      <biz-team-select class="stats-team-select" :value="tag" @input="fetchData" :fetchFunc="fetchTeam"/>
      <!-- <div class="stats-form-group">
        <select @change="fetchData">
          <option value="">全部</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
        </select> 
      </div> -->
      <div class="stats-form-group">
        <div id="date-range" class="stats-form-daterange">
          <span>{{requestParams.timeStart}} - {{requestParams.timeEnd}}</span>
          <b class="caret"></b>
        </div>
      </div>
    </div>

    <div class="service-statistics-page-panel">
      <div class="report-head">
        <div class="stats-btn-group">
          <button type="button" :class="{'stats-checked': activeTab == 'service-usage-amount-report'}"  @click="activeTab = 'service-usage-amount-report';trackEventHandler('service-usage-amount')">服务项目-用量</button>
          <button type="button" :class="{'stats-checked': activeTab == 'service-cost-report'}" @click="activeTab = 'service-cost-report';trackEventHandler('service-cost')">服务项目-费用</button>
          <button type="button" :class="{'stats-checked': activeTab == 'service-usage-crowd-report'}" @click="activeTab = 'service-usage-crowd-report';trackEventHandler('service-usage-crowd')">服务项目-使用人</button>
          <button type="button" :class="{'stats-checked': activeTab == 'service-category-report'}"  @click="activeTab = 'service-category-report';trackEventHandler('service-category')" >服务项目-类别</button>
        </div>
      </div>

      <keep-alive>
        <component
          :is="activeTab"
          ref="statistics"
          :requestParams="computedParams"
        ></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
/* global AMap, moment, _init_data $ */

import ServiceUsageAmountReport from './ServiceUsageAmountReport.vue';
import ServiceUsageCrowdReport from './ServiceUsageCrowdReport.vue';
import ServiceCostReport from './ServiceCostReport.vue';
import ServiceCategoryReport from './ServiceCategoryReport.vue';

export default {
  name: 'service-view',
  data(){
    return {
      activeTab: 'service-usage-amount-report',
      // teams: [],
      tag: [],
      requestParams: {
        timeStart: '',
        timeEnd: '',
        tagId: '',
      },
    };
  },
  computed: {
    computedParams() {
      return {
        tagId: this.requestParams.tagId,
        timeStart: `${this.requestParams.timeStart} 00:00:00`,
        timeEnd: `${this.requestParams.timeEnd} 23:59:59`,
      }
    }
  },
  methods: {
    fetchTeam(params){
      return this.$http.post('/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    switchTab(tab){
      this.activeTab = tab;
    },
    initDateRangePicker(start, end) {
      $("#date-range").daterangepicker(
        {
          dateLimit: {years: 1},
          startDate: start,
          endDate: end,
          applyClass: "btn-primary",
          opens: "left",
          format: "YYYY-MM-DD",
          ranges: {
            今天: [moment(), moment()],
            昨天: [moment().subtract(1, "days"), moment().subtract(1, "days")],
            最近7天: [moment().subtract(6, "days"), moment()],
            最近30天: [moment().subtract(29, "days"), moment()],
            这个月: [moment().startOf("month"), moment()],
            上个月: [
              moment().subtract(1, "month").startOf("month"),
              moment().subtract(1, "month").endOf("month")
            ]
          },
          locale: {
            applyLabel: "确定",
            cancelLabel: "取消",
            fromLabel: "开始",
            toLabel: "结束",
            customRangeLabel: "自定义",
            daysOfWeek: "日_一_二_三_四_五_六".split("_"),
            monthNames: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_")
          }
        },
        this.chooseDate,
      );
    },
    chooseDate(start, end){
      this.$tdOnEvent('pc：服务项目报表-日期选择事件');

      this.requestParams.timeStart = start.format("YYYY-MM-DD");
      this.requestParams.timeEnd = end.format("YYYY-MM-DD");

      this.$nextTick(() => {
        this.$refs.statistics.loadChartData({
          pageNum: 1,
        });
      });
    },
    fetchData(value) {
      this.$tdOnEvent('pc：服务项目报表-选择团队下拉框事件');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.requestParams.tagId = tag.id;
    
      this.$nextTick(() => {
        this.$refs.statistics.loadChartData({
          pageNum: 1,
        });
      });
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      switch (type) {
        case 'service-usage-amount':
          this.$tdOnEvent('pc：服务项目报表-服务项目-用量事件');
          break;
        case 'service-cost':
          this.$tdOnEvent('pc：服务项目报表-服务项目-费用事件');
          break;
        case 'service-usage-crowd':
          this.$tdOnEvent('pc：服务项目报表-服务项目-使用人事件');
          break;
        case 'service-category':
          this.$tdOnEvent('pc：服务项目报表-服务项目-类别事件');
          break;
        default:
          break;
      }
    }
  },
  mounted(){
    // init datePicker
    const start = moment().subtract(6, "days");
    const end = moment();
    this.requestParams.timeStart = start.format("YYYY-MM-DD");
    this.requestParams.timeEnd = end.format("YYYY-MM-DD");
    this.initDateRangePicker(start, end);

    // init data
    // let initData = JSON.parse(JSON.stringify(window._init_data)) || {};
    // this.teams = initData.teams || [];
  },
  components: {
    [ServiceUsageAmountReport.name]: ServiceUsageAmountReport,
    [ServiceCostReport.name]: ServiceCostReport,
    [ServiceUsageCrowdReport.name]: ServiceUsageCrowdReport,
    [ServiceCategoryReport.name]: ServiceCategoryReport,
  }
}
</script>
<style lang="scss">
  .service-repoart-label {
    width: fit-content!important;
  }

  .service-statistics-container {
    padding: 10px 15px;

    .tab-list {
      display: flex;

      padding: 0;
      li {
        width: 130px;
        text-align: center;
        font-size: 16px;
        height: 40px;
        line-height: 40px;
        list-style: none;
        position: relative;
        &:hover {
          color: $color-primary;
          cursor: pointer;
        }

      }
      li.actived {
        color: $color-primary;
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          background: $color-primary;
          bottom: 0;
          left: 0;
        }
      }
    }

    .load-more-data-btn {
      color: #6da9e8;
    }

    .disabled-load-more-data-btn {
      color: #9a9a9a;
    }

    .stats-task-table-header{
      display: flex;
      flex-flow: row nowrap;
      padding: 5px;

      h3{
        font-size: 14px;
        flex: 1;
        margin: 0;
        line-height: 30px;
      }

      button{
        margin-left: 5px;
      }
    }

    .service-statistics-page-panel {
      background: #fff;

      .report-head {
        text-align: center;
        /*padding: 0 10px;*/
      }
    }
  }
</style>
