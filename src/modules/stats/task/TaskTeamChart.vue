<template>
  <div class="stats-panel">
    <div class="stats-panel-head stats-form">
      <h3>团队工单统计
        <el-popover trigger="hover">
          <div class="stats-popover-row">
            <div class="stats-popover-label">当前未完成：</div>
            <div class="stats-popover-text">服务团队当前的未完成工单统计。</div>
          </div>
          <div class="stats-popover-row">
            <div class="stats-popover-label">已完成：</div>
            <div class="stats-popover-text">服务团队内周期内完成的工单统计。</div>
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
      <div id="team-chart"></div>
      <stats-chart-empty v-if="empty">暂无数据</stats-chart-empty>

      <div class="stats-task-table-wrap" v-if="showTable">
        <div class="stats-task-table-header">
          <h3>工单列表</h3>

          <button type="button" class="btn btn-primary btn-sm" @click="exportData">导出</button>
          <button type="button" class="btn btn-primary btn-sm" @click="exportAllData">导出全部</button>
          <button type="button" class="btn btn-primary btn-sm" @click="showTable = false">收起</button>
        </div>
        <div class="stats-task-table">
          <el-table :data="page.list" class="stats-table">
            
            <el-table-column label="编号" prop="taskNo" width="150px" :show-overflow-tooltip="false">
              <template slot-scope="scope">
                <sample-tooltip :row="scope.row">
                  <template slot="content" slot-scope="{isContentTooltip}">
                    <el-tooltip :content="scope.row.taskNo" placement="top" :disabled="!isContentTooltip">
                      <a :href="`/task/view/${scope.row.id}`" :data-id="scope.row.id" @click="openDetail">{{scope.row.taskNo}}</a>
                    </el-tooltip>
                  </template>
                </sample-tooltip>
              </template>
            </el-table-column>

            <el-table-column label="工单类型" prop="templateName" width="120px"></el-table-column>
            <el-table-column label="客户" prop="customer.name"></el-table-column>
            <el-table-column label="状态" prop="state" width="100px">
              <template slot-scope="scope">
                {{scope.row.state | taskStateName}}
              </template>
            </el-table-column>
            <!--
            <el-table-column label="团队" prop="templateName"></el-table-column>
            -->
            <el-table-column label="负责人" prop="executor.displayName" width="120px"></el-table-column>
            <el-table-column label="创建人" prop="createUser.displayName" width="120px"></el-table-column>
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
import _ from "lodash";
import $ from 'jQuery';
import qs from 'src/util/QueryString';

import http from 'src/util/HttpUtil';

import echarts from 'packages/Echarts';
import SampleTooltip from 'packages/SampleTooltip';

let chart = null;

export default {
  name: 'task-team-chart',
  props: ['teamId'],
  data(){
    return {
      sort: '',
      timeStart: '',
      timeEnd: '',
      empty: false,

      showTable: false,
      model: {
        pageNum: 1,
        selectType: '',
        tagId: ''
      },
      page: {}
    }
  },
  methods: {
    exportAllData(){
      let model = {
        tagId: this.teamId
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      window.location.href = '/stats/tagTask/exportAll?' + qs.stringify(model);
    },
    exportData(){
      let model = {
        tagId: this.model.tagId,
        selectType: this.model.selectType
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      window.location.href = '/stats/tagTask/export?' + qs.stringify(model);
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
    chooseDate(start, end){
      this.$emit('trackEvent', 'chooseDate');

      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");
      this.render();
    },
    async render(){
      try {

        let instance = this.$loading.show(this.$el);
        let data = await this.fetchData();
        instance.hide();
        //隐藏表格
        this.showTable = false;
      
        let option = this.getOption(data);
        if(null == option) {
          this.empty = true;
          return
        }
        chart.setOption(option);
      } catch (error) {
        console.log(error)
      }
    },
    fetchData(){
      let model = {
        timeStart: `${this.timeStart} 00:00:00`,
        timeEnd: `${this.timeEnd} 23:59:59`,
      }

      if(this.teamId){
        model.tagIds = [this.teamId];
      }

      return http.get('/stats/task/teamCount', model);
    },
    getOption(data = []){
      data = data.filter(item => {
        return item.unCompleteCount > 0 || item.CompleteCount > 0;
      })

      chart.clear();
      if(data.length == 0) return null;

      this.empty = false;

      let legend = ['当前未完成', '已完成'];
      
      let xAxisData = [];
      let unFinishedData = [];
      let finishedData = [];

      let series = [];

      data.sort((prev, next) => {
        return next.unCompleteCount - prev.unCompleteCount
      }).forEach(item => {
        xAxisData.push(item.tagName);

        unFinishedData.push({
          name: '当前未完成',
          value: item.unCompleteCount || 0,
          _origin: item
        });

        finishedData.push({
          name: '已完成',
          value: item.CompleteCount || 0,
          _origin: item
        })
      })

      let dataZoomShow = false;
      let start = 0;
      let end = xAxisData.length - 1;
      if(xAxisData.length > 10){
        end = 9;
        dataZoomShow = true;
      }
      
      series.push({
        name: '当前未完成',
        type: 'bar',
        barMaxWidth: 30,
        data: unFinishedData,
        barCategoryGap: '30px'
      })

      series.push({
        name: '已完成',
        type: 'bar',
        barMaxWidth: 30,
        data: finishedData,
        barCategoryGap: '30px'
      })

      return {
        color: ["#2ec7c9","#ffb980"],
        tooltip : {
          trigger: 'axis',
          axisPointer : {           
            type : 'shadow'       
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {
              name: '团队工单统计'
            }
          },
          top: 10,
          right: 40
        },
        legend: {
          top: 10,
          left: 50,
          data: legend
        },
        dataZoom: [{
          type: 'slider',
          show: dataZoomShow,
          xAxisIndex: 0,
          startValue: start,
          endValue: end,
          bottom: '10px'
        }],
        grid: {
          top: 60,
          left: '50px',
          right: '40px',
          bottom: '60px',
          containLabel: true
        },
        xAxis : [
          {
            type: 'category',
            data: xAxisData
          }
        ],
        yAxis : [
          {
            type : 'value'
          }
        ],
        series: series
      };
    },
    sortTAble (data = []) {
      data = data.filter(item => {
        return item.unCompleteCount > 0 || item.CompleteCount > 0;
      })
      if(data.length == 0) return null;

      let xAxisData = [];
      let unFinishedData = [];
      let finishedData = [];
      let series = [];
      
      if(this.sort == '已完成') {
        data.sort((prev, next) => next.CompleteCount - prev.CompleteCount)
      } else {
        data.sort((prev, next) => next.unCompleteCount - prev.unCompleteCount);
      }
      data.forEach(item => {
        xAxisData.push(item.tagName);
        unFinishedData.push({
          name: '当前未完成',
          value: item.unCompleteCount || 0,
          _origin: item
        });

        finishedData.push({
          name: '已完成',
          value: item.CompleteCount || 0,
          _origin: item
        })
      });

      series.push({
        name: '当前未完成',
        type: 'bar',
        barMaxWidth: 30,
        data: unFinishedData,
        barCategoryGap: '30px'
      })

      series.push({
        name: '已完成',
        type: 'bar',
        barMaxWidth: 30,
        data: finishedData,
        barCategoryGap: '30px'
      })

      return {series,
              xAxisData
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
    init(start, end){
      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");

      this.initDateRangePicker(start, end);
      this.initChart()
    },
    initChart(){
      chart = echarts.init(document.getElementById("team-chart"));
      window.addEventListener('resize', _.debounce(function(){
        chart.resize();
      }))

      chart.on('click', event => {
        let origin = event.data._origin;
        let selectType = 'finish';

        if(event.seriesName == '当前未完成') selectType = 'unFinish'
      
        this.model.pageNum = 1;
        this.model.tagId = origin.tagId;
        this.model.selectType = selectType;

        this.renderTable();
      })
      chart.on('legendselectchanged', async event => {
        let arr = [];
        for(let [key, value] of Object.entries(event.selected)) {
          arr.push({key, value});
        }
        arr.some(item => {
          if(item.value) {
            this.sort = item.key;
            return true;
          }
        })

        let data = await this.fetchData();
        let opt = chart.getOption(); 
        let sort = this.sortTAble(data);
        opt.series = sort.series;
        opt.xAxis[0].data = sort.xAxisData;
        chart.setOption(opt);
      })

      this.render();
    },
    fetchTableData(){
      let model = {
        pageNum: this.model.pageNum,
        tagId: this.model.tagId,
        selectType: this.model.selectType,
        pageSize: 10
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      return this.$http.get('/stats/task/teamList', model);
    },
    async renderTable(){
      let instance = this.$loading.show(this.$el);
        
      this.fetchTableData().then(result => {
        this.page = result;
        this.showTable = true;
      })
      .catch(err => console.log(err))
      .finally(() => {
        instance.hide();
      })
    }
  },
  mounted(){
    this.init(moment().subtract(6, "days"), moment())
  },
  watch: {
    teamId(){
      this.render();
    }
  },
  components: {
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>


<style lang="scss">
#team-chart{
  height: 520px;
}
</style>
