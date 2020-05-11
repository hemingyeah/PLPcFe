<template>
  <div class="stats-container">
    <plan-trend-chart @trackEvent="trackEventHandler" ></plan-trend-chart>

    <div class="stats-row"> 
      <div class="stats-panel stats-panel-calendar" ref="calendar">
        <div class="stats-panel-head">
          <h3>工单日历
            <el-popover trigger="hover">
              <ul>
                <li>未完成：计划时间为当日且未完成的工单</li>
                <li>已完成：完成时间为当日且已完成的工单</li>
              </ul>
              <stats-popover-icon slot="reference"></stats-popover-icon>
            </el-popover>
          </h3>
          <div class="calendar-head">
            <button type="button" @click="adjustMonth(-1)">&lt;&lt;</button>
            <span>{{currentMonth}}</span>
            <button type="button" @click="adjustMonth(1)">&gt;&gt;</button>
          </div> 
          <biz-team-select class="stats-team-select" :value="tag" @input="chooseTeam" :fetchFunc="fetchTeam"/>
       
          <!-- <select @change="chooseTeam">
            <option value="">全部</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
          </select> -->
        </div>
        <div class="stats-panel-body" >
          <div id="calendar"></div>
        </div>
      </div>
      <div class="stats-panel" ref="dailyTable">
        <div class="stats-panel-head ">
          <h3>{{day}} {{stateName}}工单</h3>
        </div>
        <div class="stats-panel-body stats-daily-table-wrap">
          <base-table class="stats-plan-table"
              :rows="dailyTaskRows" 
              :columns="dailyTaskColumns"
              :disable-select="true"
              :height="495">

              <div class="stats-table-tip" slot="tip">暂无数据</div>
            </base-table>
        </div>
      </div>
    </div>

    <plan-map @trackEvent="mapTrackEventHandler"></plan-map>
  </div>
</template>

<script>
import DateUtil from "src/util/DateUtil";
import http from 'src/util/HttpUtil';       

import TaskStateEnum from 'src/model/enum/TaskStateEnum'

import calendar from "./calendar";
import PlanMap from "./PlanMap.vue"; 
import PlanTrendChart from './PlanTrendChart.vue';
import SampleTooltip from 'packages/SampleTooltip';

export default {
  name: "stats-plan-view",
  data() {
    return {
      tag: [],
      msec: new Date().getTime(),
      calendarStartTime: '',
      calendarEndTime: '',
      dailyTaskRows: [],
      dailyTaskColumns: this.buildDailyTaskColumns(),
      // teams: [],
      teamId: '',

      state: 'unfinished',
      day: ''
    };
  },
  computed: {
    currentMonth() {
      let date = new Date(this.msec)
      return DateUtil.format(date, "yyyy年MM月");
    },
    stateName(){
      return this.state == 'unfinished' ? '未完成' : '已完成';
    }
  },
  methods: {
    fetchTeam(params){
      return http.post('/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    chooseTeam(value){
      this.$tdOnEvent('pc：业务计划-工单日历团队选择事件');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.teamId = tag.id;

      let range = DateUtil.rangeOfMonth(new Date(this.msec));
      this.renderCalendar(range[0], range[1], this.teamId);
    },
    adjustMonth(num){
      let date = new Date(this.msec);
      date.setMonth(date.getMonth() + num);
      this.msec = date.getTime();

      let range = DateUtil.rangeOfMonth(new Date(this.msec));
      this.renderCalendar(range[0], range[1], this.teamId);
    },  
    initCanlendar() {
      let range = DateUtil.rangeOfMonth(new Date(this.msec));
      calendar.init(document.getElementById("calendar"), this);
      calendar.chart.on('click', event => {
        let origin = event.data._origin;
        let state = '';
        if(event.name == '未完成') state = 'unfinished';
        if(event.name == '已完成') state = 'finished';

        this.renderDailyTaskTable(origin.dateTime, state);
      })

      this.renderCalendar(range[0], range[1], this.teamId);
      this.renderDailyTaskTable(DateUtil.format(new Date(),'yyyy-MM-dd'), 'unfinished');
    },
    async renderCalendar(start, end, teamId){
      try {
        let instance = this.$loading.show(this.$refs.calendar);

        let data = await this.fetchCalendarData(start, end, teamId);

        instance.hide();
        calendar.render(start, end, data);
      } catch (error) {
        console.log(error)
      }
    },
    fetchCalendarData(start, end, teamId){
      let params = {
        timeStart: DateUtil.format(start, 'yyyy-MM-dd') + " 00:00:00",
        timeEnd: DateUtil.format(end, 'yyyy-MM-dd') + " 23:59:59",
        tagId: teamId
      };
      return http.get('/stats/plan/calendar',params)
    },
    async renderDailyTaskTable(day, state){
      try {
        this.state = state;
        this.day = day;

        let instance = this.$loading.show(this.$refs.dailyTable);
        let data = await this.fetchDailyTask(day, state);

        this.dailyTaskRows = data || [];
        instance.hide();
      } catch (error) {
        console.log(error)
      }
    },
    fetchDailyTask(day, state){
      let params = {
        day: day,
        state: state,
        teamId: this.teamId
      }

      return http.get('/stats/plan/dailyTask', params);
    },
    buildDailyTaskColumns(){
      return [
        {
          label: '工单编号',
          field: 'taskNo',
          width: 160,
          render: (h, row, field) =>{
            return (
              <div>
                {
                  row.isGuideData
                  ? <el-tooltip content="这是一条示例数据，您可以在系统管理-系统日志中清除该数据" placement="top">
                      <div class="superscript"></div>
                    </el-tooltip>
                  : ''
                }
                <a class={row.isGuideData ? 'sample-tooltip-content-padding' : ''} href={`/task/view/${row.id}`} data-id={row.id} onClick={(event) => this.openTask(event, row)}>
                  {row.taskNo}
                </a>
              </div>
            )
          }
        },
        {
          label: '工单类型',
          field: 'templateName',
          width:120
        },
        {
          label: '客户名称',
          field: 'customerName'
        },
        {
          label: '负责人',
          field: 'executorName',
          width: 120,
        },
        {
          label: '状态',
          field: 'state',
          width: 70,
          template: (row, field) => {
            let state = row.state;
            return `<span class="stats-badge" style="background-color:${TaskStateEnum.getColor(state)};">${TaskStateEnum.getName(state)}</span>`;
          }
        }
      ]
    },
    openTask(event,row){
      event.preventDefault();
      var fromId = window.frameElement.getAttribute('id');
      parent.window.addTabs({
        id: "taskView_" + row.id, 
        title: "正在加载", 
        close: true, 
        url: "/task/view/" + row.id,
        fromId:fromId
      });
      parent.window.resizeFrame();
    },
    // TalkingData埋点事件
    trackEventHandler(type) {
      switch (type) {
        case 'chooseTeam':
          this.$tdOnEvent('pc：业务计划-工单趋势图团队选择事件');
          break;
        case 'chooseDate':
          this.$tdOnEvent('pc：业务计划-日期选择事件');
          break;
        default:
          break;
      }
    },
    mapTrackEventHandler(type) {
      switch (type) {
        case 'chooseTeam':
          this.$tdOnEvent('pc：业务计划-未完成工单团队选择事件');
          break;
        default:
          break;
      }
    }
  },
  mounted() {
    let initData = window._init_data || {};
    //this.teams = initData.teams || [];
    //加载日历
    this.$nextTick(() => this.initCanlendar());
  },
  components: {
    [PlanMap.name]: PlanMap,
    [PlanTrendChart.name]: PlanTrendChart,
    [SampleTooltip.name]: SampleTooltip,
  }
};
</script>

<style lang="scss">
.stats-panel-calendar {
  flex-grow: 0.6 !important;
  min-width: 480px;
  
  .stats-panel-head{
    position: relative;
    padding-left: 110px;

    h3{
      position: absolute;
      top: 6px;
      left: 6px;
    }

    .biz-team-select{
      position: absolute;
      top: 6px;
      right: 6px;
      width: 200px;
    }
  }
}

.calendar-head{
  width: 140px;
  display: flex;
  flex-flow: row nowrap;

  span{
    display: block;
    width: 88px;
    font-size: 14px;
    text-align: center;
    color: #000;
    line-height: 26px;
  }

  button{
    background-color: transparent;
    border: none;
    width: 26px;
    line-height: 26px;
    text-align: center;
    padding: 0;
    border-radius: 2px;
    transition: all ease .15s;
    font-weight: 600;
    outline: none;

    &:hover{
      color: #337ab7;
      background-color: #f0f0f0;
    }
  }
}

.stats-plan-table{
  .base-table-head tr{
    background-color: #fafafa;

    th{
      line-height: 28px;
    }
  }
}

#calendar {
  margin: 0 auto;
  width: 480px;
  height: 460px;
}

#trend {
  height: 400px;
  margin: 0 auto;
}

.stats-daily-table-wrap {
  height: 495px;
}
</style>
