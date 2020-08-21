<template>
  <div class="stats-container">
    <div class="stats-form stats-revenue-form">
      <div class="stats-form-group">
        <label class="stats-form-title">团队</label>
        <select @change="chooseTeam">
          <option value="">全部</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
        </select>
      </div>
      <div class="stats-form-group">
        <label class="stats-form-title">时间</label>
        <div id="date-range" class="stats-form-daterange">
          <span>{{timeStart}} - {{timeEnd}}</span> 
          <b class="caret"></b>
        </div>
      </div>
    </div>

    <div class="stats-row" >
      <div class="stats-panel">
        <div class="stats-panel-body">
          <h3></h3>
          <div id="line"></div>
        </div>
        <div class="stats-panel-body">
          <div id="pie"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*global AMap, moment*/
import $ from 'jQuery';
import http from 'src/util/HttpUtil';

import echarts from "echarts/lib/echarts";
import "echarts/lib/component/legend";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/chart/line";
import "echarts/lib/chart/pie";

let line = null;
let pie = null; //eslint-disable-line

export default {
  name: 'revenue-view',
  data(){
    return {
      teams: [],
      teamId: '',
      timeStart: '',
      timeEnd: '',
      lineData: [],
      pieData: {}
    };
  },
  methods: {
    chooseTeam(event){
      this.teamId = event.target.value;
      this.renderChart();
    },
    chooseDate(start, end){
      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");
      this.renderChart();
    },
    async renderChart(){
      try {
        let data = await this.fetchData();
        this.lineData = data.line || [];
        this.pieData = data.pie || {};

        let lineOption = this.getLineOption();
        line.clear();
        line.setOption(lineOption);

      } catch (error) {
        console.log(error)
      }
    },
    getLineOption(){
      let colors = ['#d14a61', '#5793f3'];
      let legend = ['收入', '毛利'];

      let total_xAxis = []; //收入
      let total_data = [];
      let profit_xAxis = []; //毛利
      let profit_data = [];

      this.lineData.forEach(item => {
        total_xAxis.push(item.days)
        total_data.push(item.total)

        profit_xAxis.push(item.days)
        profit_data.push(item.profit)
      });

      return {
        color: colors,
        grid: {
          top: 70,
          bottom: 40
        },
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data:legend,
          top: 10,
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
                color: colors[0]
              }
            },
            axisPointer: {
              label: {
                formatter: function (params) {
                  return '毛利  ' + params.value + '：' + params.seriesData[0].data + "元";
                }
              }
            },
            data: profit_xAxis
          },
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
                  return '收入 ' + params.value + '：' + params.seriesData[0].data + "元";
                }
              }
            },
            data: total_xAxis
          }
        ],
        yAxis: [{
          type: 'value'
        }],
        series: [
          {
            name:'毛利',
            type:'line',
            smooth: true,
            data: profit_data
          },
          {
            name:'收入',
            type:'line',
            smooth: true,
            xAxisIndex: [1],
            data: total_data
          }
        ]
      }
    },
    initChart(start, end){
      this.initDateRangePicker(start, end);
      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");

      line = echarts.init(document.getElementById("line"));
      pie = echarts.init(document.getElementById("pie"));

      this.renderChart();
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
        this.chooseDate
      );
    },
    fetchData(){
      let params = {
        timeStart: `${this.timeStart} 00:00:00`,
        timeEnd: `${this.timeEnd} 23:59:59`,
        tagId: this.teamId
      };

      return http.get('/stats/revenue/data', params);
    }
  },
  mounted(){
    let initData = window._init_data || {};
    this.teams = initData.teams || [];

    this.initChart(moment().subtract(6, "days"), moment());
  }
}
</script>

<style lang="scss">
.stats-revenue-form{
  padding: 5px;
  justify-content: flex-end;
}

#line, #pie{
  width: 100%;
  height: 480px;
}
</style>
