<template>
  <div class="stats-panel stats-station-panel">
    <div class="stats-panel-head stats-form">
      <h3>事件类型统计</h3>
      <div class="stats-form-group">
        <div id="date-range" class="stats-form-daterange">
          <span>{{timeStart}} - {{timeEnd}}</span> 
          <b class="caret"></b>
        </div>
      </div>
    </div>
    <div class="stats-panel-body">
      <div class="stats-station-chart-wrap" style="width:100%;">
        <div id="event-type-pie"></div>
        <div class="stats-empty" v-if="eventTypeEmpty">暂无数据</div>
      </div>
      <div class="stats-table-wrap" v-if="showTable">
        <div class="stats-table-header">
          <h3>事件列表</h3>

          <button type="button" class="btn btn-primary btn-sm" @click="exportData">导出</button>
          <button type="button" class="btn btn-primary btn-sm" @click="exportAllData">导出全部</button>
          <button type="button" class="btn btn-primary btn-sm" @click="showTable = false">收起</button>
        </div>
        <div>
          <el-table :data="page.list" class="stats-table">
            <el-table-column label="编号" prop="eventNo" width="150px" :show-overflow-tooltip="false">
              <template slot-scope="scope">
                <sample-tooltip :row="scope.row">
                  <template slot="content" slot-scope="{isContentTooltip}">
                    <el-tooltip :content="scope.row.eventNo" placement="top" :disabled="!isContentTooltip">
                      <a :href="`/event/view/${scope.row.id}`" :data-id="scope.row.id" @click="openDetail">{{scope.row.eventNo}}</a>
                    </el-tooltip>
                  </template>
                </sample-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="客户" prop="cusName"></el-table-column>
            <el-table-column label="事件类型" prop="templateName" width="180px"></el-table-column>
            <el-table-column label="负责人" prop="executorName" width="120px"></el-table-column>
            <el-table-column label="创建人" prop="createUserName" width="120px"></el-table-column>
          </el-table>

          <el-pagination class="stats-pagination"
            background @current-change="jump"
            :current-page="page.pageNum"
            layout="total, prev, pager, next"
            :total="page.total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/*global AMap, moment, _init_data*/
import $ from "jQuery";
import _ from "lodash";

import http from 'src/util/HttpUtil';
import Loading from 'packages/BaseLoading';
import qs from 'src/util/QueryString'
import echarts from "packages/Echarts";
import SampleTooltip from 'packages/SampleTooltip';

let EventTypePie = null;

export default {
  name: 'station-chart',
  data(){
    return {
      timeStart: '',
      timeEnd: '',

      model: {
        pageNum: 1,
        templateName: ''
      },
      eventTypeEmpty: false,
      showTable: false,
      page: {
        list: []
      }
    }
  },
  methods: {
    exportAllData(){
      let model = {}

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;
      
      window.location.href = '/stats/station/eventCount/exportAll?' + qs.stringify(model);
    },
    exportData(){
      let model = {
        templateName: this.model.templateName
      }

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;
      
      window.location.href = '/stats/station/eventCount/export?' + qs.stringify(model);
    },
    openDetail(event){
      event.preventDefault();
    
      let el = event.target;
      var fromId = window.frameElement.getAttribute('id');

      parent.window.addTabs({
        id: "taskView_" + el.dataset.id, 
        title: "正在加载", 
        close: true, 
        url: el.getAttribute('href'),
        fromId:fromId
      });
      parent.window.resizeFrame();
    },
    jump(currentPage){
      this.model.pageNum = currentPage;
      this.renderTable();
    },

    fetchTableData(){
      let model = {
        pageNum: this.model.pageNum,
        pageSize: 10,
        templateName: this.model.templateName
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      return http.get('/stats/station/eventCount/detail', model);
    },
    async renderTable(){
      let instance = this.$loading.show(this.$el);

      try {
        this.page = await this.fetchTableData();
        this.showTable = true;
      } catch (error) {
        console.log(error)
      }

      instance.hide();
    },
    chooseDate(start, end) {
      this.$emit('trackEvent', 'chooseDate');

      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");
      this.render();
    },
    initChart(start, end){
      EventTypePie = echarts.init(document.getElementById("event-type-pie"));
      
      EventTypePie.on('click', event => {
        this.model.templateName = event.name;
        this.renderTable();
      })
      //初始化时间控件
      this.initDateRangePicker(start, end);
      
      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");
      this.render();
    },
    async render(){
      try {
        let instance = Loading.show(this.$el);
        let data = await this.fetchEvenCount();
        instance.hide();
        
        this.renderEventTypePie(data.eventType || [])
      } catch (error) {
        console.log(error)
      }
    },
    renderEventTypePie(data){
      this.eventTypeEmpty = false;
      EventTypePie.clear();

      let option = this.getEventTypePieOption(data);
      if(option == null){
        this.eventTypeEmpty = true;
        return
      }

      EventTypePie.setOption(option);
    },
    getEventTypePieOption(data){
      if(data.length == 0) return null;

      let legendData = []
      let seriesData = [];
      data.forEach(item => {
        legendData.push(item.eventType);

        seriesData.push({
          name: item.eventType,
          value: item.eventConut
        })
      })

      return {
        color: ["#2ec7c9","#ffb980","#5ab1ef","#d87a80","#5f5f6e","#07a2a4","#9a7fd1","#588dd5","#c05050","#f5994e","#59678c","#7eb00a","#749f83"],
        tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          top: '10px',
          left: 'left',
          orient: 'vertical',
          data: legendData,
          type: 'scroll'
        },
        grid: {
          top: '50px'
        },
        toolbox: {
          feature: {
            saveAsImage: {
              name: '事件类型统计'
            }
          },
          right: 40
        },
        series : [
          {
            name: '事件类型',
            type: 'pie',
            radius : '55%',
            center: ['50%', '50%'],
            data: seriesData,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              normal: {
                formatter: "{b}： {c} ({d}%)"
              }
            }
          }
        ]
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
    fetchEvenCount(){
      let params = {
        timeStart: `${this.timeStart} 00:00:00`,
        timeEnd: `${this.timeEnd} 23:59:59`
      };
      return http.get('/stats/station/eventCount', params);
    }
    
  },
  mounted(){
    this.initChart(moment().subtract(6, "days"), moment());
    window.addEventListener('resize',_.debounce(function(){
      EventTypePie.resize();
    },400))
  },
  components: {
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>


<style lang="scss">
.stats-station-chart-wrap{
  width: 50%;

  h3{
    margin: 0;
    padding: 15px 0  5px 0;
    text-align: center;
    font-size: 18px;
  }
}

.stats-empty{
  position: absolute;
  width: 100px;
  text-align: center;
  top: 120px;
  left: 50%;
  margin-left: -50px;
  font-size: 18px;
  font-weight: 500;
  color: #9a9a9a;
}

#event-type-pie{
  height: 420px;
}
</style>
