<template>
  <div class="stats-container"> 
     <div class="stats-form stats-task-head">
        <biz-team-select class="stats-team-select" :value="tag" @input="chooseTeam" :fetchFunc="fetchTeam"/>
        <!-- <div class="stats-form-group">
          <select @change="chooseTeam">
            <option value="">全部</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
          </select>
        </div> -->
    </div>

    <div class="stats-task-head">
      <div class="stats-task-card">
        <p>工单池</p>
        <h3><a href="/task/taskPool" @click.prevent="openTaskList($event, '工单池')">{{headData.taskPoolCount | convertZero}}</a></h3>
      </div>
      <div class="stats-task-card">
        <p>待指派</p>
        <h3><a href="/task?viewId=133d2ef7-19a8-11e7-8d4e-00163e304a25" @click.prevent="openTaskList($event, '待指派')">{{headData.createdCount | convertZero}}</a></h3>
      </div>
      <div class="stats-task-card">
        <p>已指派</p>
        <h3><a href="/task?viewId=12fcb144-1ea3-11e7-8d4e-00163e304a25" @click.prevent="openTaskList($event, '已指派')">{{headData.allocatedCount | convertZero}}</a></h3>
      </div>
      <div class="stats-task-card">
        <p>已接受</p>
        <h3><a href="/task?viewId=475e3328-1e63-11e7-8d4e-00163e304a25" @click.prevent="openTaskList($event, '已接受')">{{headData.acceptedCount | convertZero}}</a></h3>
      </div>
      <div class="stats-task-card">
        <p>进行中</p>
        <h3><a href="/task?viewId=06db63fe-5017-11e7-a318-00163e304a25" @click.prevent="openTaskList($event, '进行中')">{{headData.processingCount | convertZero}}</a></h3>
      </div>
      <div class="stats-task-card">
        <p>今日完成</p>
        <h3><a href="/task?viewId=5ac722d9-1e63-11e7-8d4e-00163e304a25" @click.prevent="openTaskList($event, '今日完成')">{{headData.todayFinish | convertZero}}</a></h3>
      </div>
      <div class="stats-task-card">
        <p>异常工单</p>
        <h3><a href="/task?viewId=a78cbfec-d7d2-420f-9a56-32a503702f2d" @click.prevent="openTaskList($event, '异常工单')">{{headData.unusualCount | convertZero}}</a></h3>
      </div>
    </div>

    <div class="stats-row" v-if="hasTeamChart">
      <task-team-chart :teamId="teamId" @trackEvent="trackEventHandler"></task-team-chart>
    </div>

    <div class="stats-row" ref="taskCountChart">
      <div class="stats-panel">
        <div class="stats-panel-head stats-form">
          <h3>工单分类统计
            <el-popover trigger="hover">
              <div class="stats-popover-row">
                <div class="stats-popover-label">工单类型统计：</div>
                <div class="stats-popover-text">按照工单中的工单类型统计创建时间为该时间段的工单。</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-label">产品类型统计：</div>
                <div class="stats-popover-text">按照工单中的产品类型统计创建时间为该时间段的工单。如果工单中选择的产品没有产品类型，那么这个工单在统计时会归入无。</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-label">服务类型统计：</div>
                <div class="stats-popover-text">按照工单中的服务类型统计创建时间为该时间段的工单。如果工单中没有选择服务类型，那么这个工单在统计时会归入无。</div>
              </div>
              <div class="stats-popover-row">
                <div class="stats-popover-label">服务内容统计：</div>
                <div class="stats-popover-text">按照工单中的服务内容统计创建时间为该时间段的工单。如果工单中没有选中服务内容，那么这个工单在统计时会归入无。</div>
              </div>
              <stats-popover-icon slot="reference"></stats-popover-icon>
            </el-popover>
          </h3>
          <div class="stats-form-group">
            <div id="date-range" class="stats-form-daterange">
              <span>{{timeStart}} - {{timeEnd}}</span> 
              <b class="caret"></b>
            </div>
          </div>
        </div>
        <div class="stats-panel-body">
          <div style="text-align:center;">
            <div class="stats-btn-group">
              <button type="button" :class="{'stats-checked': chart == 'task-type-chart'}" 
                @click="chooseChart('task-type-chart')">工单类型</button>
              <button type="button" :class="{'stats-checked': chart == 'task-product-chart'}" 
                @click="chooseChart('task-product-chart')">产品类型</button>
              <button type="button" :class="{'stats-checked': chart == 'task-serviceType-chart'}" 
                @click="chooseChart('task-serviceType-chart')">服务类型</button>
              <button type="button" :class="{'stats-checked': chart == 'task-serviceContent-chart'}" 
                @click="chooseChart('task-serviceContent-chart')">服务内容</button>
            </div>
          </div>
          <keep-alive>
            <component :is="chart" :chart-data="pieData" :timeStart="timeStart" :timeEnd="timeEnd" :teamId="teamId"></component>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*global AMap, moment*/

import _ from 'lodash';
import $ from 'jQuery';

import TaskTeamChart from './TaskTeamChart.vue';
import TaskTypeChart from './TaskTypeChart.vue';
import TaskProductChart from './TaskProductChart.vue';
import TaskServiceContentChart from './TaskServiceContentChart.vue';
import TaskServiceTypeChart from './TaskServiceTypeChart.vue'

export default {
  name: 'task-view',
  data(){
    return {
      auths: {},
      teams: [],
      tag: [],

      headData: {
        acceptedCount: '--',
        allocatedCount: '--',
        completeCount: '--',
        createdCount: '--',
        processingCount: '--',
        taskPoolCount: '--',
        unusualCount: '--',
        todayFinish: '--'
      },

      pieData: {},
      timeStart: '',
      timeEnd: '',
      teamId: '',

      //
      chart: 'task-type-chart'
    };
  },
  computed: {
    /** 是否显示团队报表 */
    hasTeamChart(){
      let teams = this.teams || [];
      return teams.length > 0;
    }
  },
  methods: {
    fetchTeam(params){
      return this.$http.post('/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    chooseChart(chart){
      this.trackEventHandler(chart);

      this.chart = chart;
    },
    chooseTeam(value){
      this.$tdOnEvent('pc：工单报表-选择团队事件');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.teamId = tag.id;

      this.initHead();
      this.renderPie();
    },
    async initHead(){
      try {
        let data = await this.fetchTaskStateCount();
        _.assign(this.headData, data);
      } catch (error) {
        console.log(error)
      }
    },
    fetchTaskStateCount(){
      return this.$http.get('/stats/task/stateCount', {
        tagId: this.teamId
      });
    },
    fetchTaskCount(){
      let params = {
        timeStart: `${this.timeStart} 00:00:00`,
        timeEnd: `${this.timeEnd} 23:59:59`,
        tagId: this.teamId
      };
      return this.$http.get('/stats/task/count', params);
    },
    initPie(start, end){
      this.initDateRangePicker(start, end);

      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");

      this.renderPie();
    },
    chooseDate(start, end){
      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");
      this.renderPie();
    },
    async renderPie(){
      try {
        let instance = this.$loading.show(this.$refs.taskCountChart);
        let pieData = await this.fetchTaskCount();
        instance.hide();
        this.pieData = _.assign({}, this.pieData, pieData);
      } catch (error) {
        console.log(error)
      }
    },
    initDateRangePicker(start, end) {
      $("#date-range").daterangepicker(
        {
          startDate: start,
          endDate: end,
          applyClass: "btn-primary",
          opens: "left",
          format: "YYYY-MM-DD",
          dateLimit: {years: 1},
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
        this.chooseDate
      );
    },
    openTaskList(event, trackEventName) {
      this.trackEventHandler(trackEventName);

      var url = event.target.getAttribute('href');
      var fromId = window.frameElement.getAttribute('id');

      parent.window.addTabs({
        id: "M_TASK_ALL", 
        title: "正在加载", 
        close: true, 
        url: url,
        fromId: fromId
      });
      
      parent.window.resizeFrame();
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      let msg = '';
      switch (type) {
        case '工单池':
          msg = 'pc：工单报表-工单池事件';
          break;
        case '待指派':
          msg = 'pc：工单报表-待指派事件';
          break;
        case '已指派':
          msg = 'pc：工单报表-已指派事件';
          break;
        case '已接受':
          msg = 'pc：工单报表-已接受事件';
          break;
        case '进行中':
          msg = 'pc：工单报表-进行中事件';
          break;
        case '今日完成':
          msg = 'pc：工单报表-今日完成事件';
          break;
        case '异常工单':
          msg = 'pc：工单报表-异常工单事件';
          break;
        case 'task-type-chart':
          msg = 'pc：工单报表-工单类型事件';
          break;
        case 'task-product-chart':
          msg = 'pc：工单报表-产品类型事件';
          break;
        case 'task-serviceType-chart':
          msg = 'pc：工单报表-服务类型事件';
          break;
        case 'task-serviceContent-chart':
          msg = 'pc：工单报表-服务内容事件';
          break;         
        case 'chooseDate':
          msg = 'pc：工单报表-日期选择事件';                                                   
        default:
          break;
      }
      this.$tdOnEvent(msg);
    }
  },
  mounted(){
    let initData = JSON.parse(JSON.stringify(window._init_data)) || {};

    this.auths = initData.auths || {};
    this.teams = initData.teams || [];

    this.initHead();
    this.initPie(moment().subtract(6, "days"), moment());
  },
  components: {
    [TaskTeamChart.name]: TaskTeamChart,
    [TaskTypeChart.name]: TaskTypeChart,
    [TaskProductChart.name]: TaskProductChart,
    [TaskServiceTypeChart.name]: TaskServiceTypeChart,
    [TaskServiceContentChart.name]: TaskServiceContentChart
  }
}
</script>

<style lang="scss">
.stats-task-head{
  display: flex;
  flex-flow: row nowrap;
  padding: 5px 7.5px;
  justify-content: flex-end;
}

.stats-task-card{
  flex: 1;
  margin-left: 15px;

  border-radius: 2px;
  background-color: #fff;
  text-align: center;

  p{
    padding: 15px 0 8px;
    margin: 0;
    font-size: 14px;
  }

  h3{
    font-weight: 400;
    font-size: 24px;
    line-height: 34px;
    margin: 0;
    padding: 5px 0;

    a{
      color: #2d9cf5;
    }
  }

  &:first-child{
    margin-left: 0;
  }
}

.stats-task-form{
  padding: 5px;
  justify-content: flex-end;
}

.stats-task-chart-wrap{
  
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


#product-type-chart,
#task-type-chart,
#service-type-chart,
#service-content-chart{
  height: 520px;
}
</style>
