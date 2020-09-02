<template>
  <div class="stats-panel stats-panel-trend" ref="trend">
    <div class="stats-panel-head stats-form">
      <h3>工单趋势图
        <el-popover trigger="hover">
          <ul>
            <li>新增工单：创建时间为当日的工单</li>
            <li>完成工单：完成时间为当日的工单</li>
          </ul>
          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
      </h3>
      <!-- <div class="stats-form-group">
        <select id="team" @change="chooseTeam">
          <option value="">全部</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
        </select>
      </div> -->
      <biz-team-select class="stats-team-select" :value="tag" @input="chooseTeam" :fetchFunc="fetchTeam"/>
      <div class="stats-form-group">
        <div id="date-range" class="stats-form-daterange">
          <span>{{trendStartTime}} - {{trendEndTime}}</span> 
          <b class="caret"></b>
        </div>
      </div>
    </div>
    <div class="stats-panel-body">
      <div id="trend"></div>
    </div>

    <div class="stats-trend-table-wrap" v-show="showTable">
      <div class="stats-trend-table-bar">
        <h5>工单列表</h5>

        <button class="btn btn-primary btn-sm" @click="exportData" style="margin-right: 5px;">导出</button>
        <button class="btn btn-primary btn-sm" @click="exportAllData" style="margin-right: 5px;">导出全部</button>
        <button class="btn btn-primary btn-sm" @click="showTable = false">隐藏</button>
      </div>
      <base-table class="stats-table"
        :rows="tableData.list || []" 
        :columns="columns"
        :disable-select="true"
        :limit="10"
        ></base-table>
    </div>
  </div>
</template>

<script>
/*global moment, _init_data*/

import $ from "jQuery";
import _ from 'lodash';
import qs from 'src/util/QueryString';
import http from 'src/util/HttpUtil';

import echarts from "packages/Echarts"

import TaskStateEnum from 'src/model/enum/TaskStateEnum';
import {isEnterprise} from '@src/util/Platform';
let trend = null;

export default {
  name: 'plan-trend-chart',
  data(){
    return {
      tag: [],
      // teams: [],
      trendStartTime: "",
      trendEndTime: "",
      teamId: '',
      tableData: {},
      columns: this.buildColumns(),
      showTable: false,
      state: '',
      day: ''
    };
  },
  methods: {
    fetchTeam(params){
      return http.post(isEnterprise ? '/security/tag/tree' : '/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    exportAllData(){
     let model = {
        exportAll: "1",
        tagId: this.teamId
      }

      if(this.trendStartTime) model.timeStart = `${this.trendStartTime} 00:00:00`;
      if(this.trendEndTime) model.timeEnd = `${this.trendEndTime} 23:59:59`;
      
      window.location.href = '/stats/plan/trendDetail/export?' + qs.stringify(model);
    },
    exportData(){
      let model = {
        state: this.state,
        tagId: this.teamId
      }

      if(this.day){
        model.timeStart = `${this.day} 00:00:00`;
        model.timeEnd = `${this.day} 23:59:59`;
      } 
      
      window.location.href = '/stats/plan/trendDetail/export?' + qs.stringify(model);
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
    chooseDate(start, end) {
      this.$emit('trackEvent', 'chooseDate');
      
      this.trendStartTime = start.format("YYYY-MM-DD");
      this.trendEndTime = end.format("YYYY-MM-DD");
      this.renderTrend();
    },
    chooseTeam(value){
      this.$emit('trackEvent', 'chooseTeam');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.teamId = tag.id;
      this.renderTrend();
    },
    initTrend(start, end) {
      trend = echarts.init(document.getElementById("trend"));
      trend.on('click', event => {
        console.log(event)
        if(event.data.value == 0) return;

        let origin = event.data._origin;
        let state = 'created';
        let day = origin.days;

        if(event.seriesName == '完成工单') state = 'finished';

        this.state = state;
        this.day = day;

        this.renderTable(day, state);
      });

      //初始化时间控件
      this.initDateRangePicker(start, end);
      
      this.trendStartTime = start.format("YYYY-MM-DD");
      this.trendEndTime = end.format("YYYY-MM-DD");
      this.renderTrend();
    },
    async renderTrend() {
      try{
        this.showTable = false;
        let instance = this.$loading.show(this.$el)

        let data = await this.fetchTrendData();
        instance.hide();

        trend.clear();
        trend.setOption(this.getTrendOption(data.created, data.completed))
      }catch(err){
        console.log(err)
      }
    },
    getTrendOption(created, completed){
      var colors = ['#5793f3', '#00ac97', '#675bba'];

      let created_xAxis = [];
      let created_data = [];
      created.forEach(item =>{
        created_xAxis.push(item.days)
        created_data.push({
          name: '新增工单',
          value: item.count,
          _origin: item
        })
      });

      let completed_xAxis = [];
      let completed_data = [];
      completed.forEach(item =>{
        completed_xAxis.push(item.days);
        completed_data.push({
          name: '完成工单',
          value: item.count,
          _origin: item
        });
      });

      return {
        color: colors,
        grid: {
          top: 70,
          bottom: 40,
          left: 80,
          right: 50
        },
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross'
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {
              name: '工单趋势图'
            }
          },
          right: 40
        },
        legend: {
          data:['新增工单', '完成工单'],
          top: 5,
          align: "left"
        },
        xAxis: [
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[1]
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return '完成工单  ' + params.value + '：' + params.seriesData[0].data.value + "个";
                }
              }
            },
            data: created_xAxis
          },
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[0]
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return '新增工单  ' + params.value + '：' + params.seriesData[0].data.value + "个";
                }
              }
            },
            data: completed_xAxis
          }
        ],
        yAxis: [{
          type: 'value'
        }],
        series: [
          {
            name:'新增工单',
            type:'line',
            smooth: true,
            data: created_data,
            xAxisIndex: [1]
          },
          {
            name:'完成工单',
            type:'line',
            smooth: true,
            data: completed_data,
            xAxisIndex: [0]
          }
        ]
      }
    },
    fetchTrendData(){
      let params = {
        timeStart: this.trendStartTime + " 00:00:00",
        timeEnd: this.trendEndTime + " 23:59:59",
        tagId: this.teamId
      }
      return http.get('/stats/plan/trend', params)
    },
    async renderTable(day, state){
      try {
        let instance = this.$loading.show(this.$el)
        let data = await this.fetchTableData(day, state);
        instance.hide();

        this.$nextTick(() => {
          this.tableData = data;
          this.showTable = true;
        })
      } catch (error) {
        console.log(error)
      }
    },
    fetchTableData(day, state){
      let params = {
        timeStart: `${day} 00:00:00`,
        timeEnd: `${day} 23:59:59`,
        tagId: this.teamId,
        state: state
      }

      return http.get('/stats/plan/trendDetail', params)
    },
    buildColumns(){
      return [
        {
          label: '编号',
          field: 'taskNo',
          width: 140,
          render: (h, row, field) =>{
            let data = {
              attrs: {
                href: `/task/view/${row.taskId}`
              },
              on: {
                click: event => {
                  event.preventDefault();
                  var fromId = window.frameElement.getAttribute('id');
                  parent.window.addTabs({
                    id: "taskView_" + row.taskId, 
                    title: "正在加载", 
                    close: true, 
                    url: "/task/view/" + row.taskId,
                    fromId:fromId
                  });
                  parent.window.resizeFrame();
                }
              }
            };
            return h('a', data, [row.taskNo])
          }
        },
        {
          label: '工单类型',
          field: 'templateName',
          width:120
        },
        {
          label: '客户',
          field: 'customerName'
        },
        {
          label: '状态',
          field: 'state',
          width: 100,
          template: (row, field) => {
            let state = row.state;
            let stateValue = TaskStateEnum.getValue(state);

            return `<span class="stats-badge" style="background-color:${TaskStateEnum.getColor(stateValue)};">${state}</span>`;
          }
        },
        {
          label: '负责人',
          field: 'executorName',
          width: 150
        },
        {
          label: '创建人',
          field: 'createUserName',
          width: 150
        }
      ]
    }
  },
  mounted(){
    // let initData = _init_data || {};
    // this.teams = initData.teams || [];

    //初始化趋势图
    this.initTrend(moment().subtract(6, "days"), moment());

    window.onresize = _.debounce(function(){
      trend.resize();
    }, 200)
  }
}
</script>

<style lang="scss">
.stats-trend-table-wrap{
  padding: 10px 50px 10px 80px;
}

.stats-trend-table-bar{
  display: flex;
  flex-flow: row nowrap;
  margin-bottom: 5px;

  h5{
    margin: 0;
    font-size: 14px;
    line-height: 24px;
    flex: 1;
  }

  .btn-sm{
    padding: 2px 20px;
  }

}
</style>
