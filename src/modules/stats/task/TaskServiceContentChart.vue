<template>
  <div class="stats-task-chart-wrap">
    <div class="stats-task-chart">
      <div id="service-content-chart" ref="chart"></div>
      <stats-chart-empty v-if="isEmpty">暂无数据</stats-chart-empty> 
    </div>
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


          <el-table-column label="客户" prop="customer.name"></el-table-column>
          <el-table-column label="工单类型" prop="templateName" width="180px"></el-table-column>
          <el-table-column label="服务内容" prop="serviceContent"></el-table-column>
          <el-table-column label="负责人" prop="executor.displayName" width="120px"></el-table-column>
          <el-table-column label="创建人" prop="createUser.displayName" width="120px"></el-table-column>
          <el-table-column label="创建时间" width="180px">
            <template slot-scope="scope">
              {{scope.row.createTime | fmt}}
            </template>
          </el-table-column>
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
</template>


<script>
import echarts from 'packages/Echarts';
import _ from 'lodash';
import qs from 'src/util/QueryString';

import SampleTooltip from 'packages/SampleTooltip';

let chart = null;

export default {
  name: 'task-serviceContent-chart',
  props: {
    chartData: Object,
    teamId: String,
    timeStart: String,
    timeEnd: String
  },
  data(){
    return {
      isEmpty: false,
      showTable: false,
      
      model: {
        pageNum: 1,
        templateId: ''
      },
      page: {}
    }
  },
  methods: {
    exportAllData(){
      let model = {
        selectType: "serviceContent",
        tagId: this.teamId
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      window.location.href = '/stats/typeTask/exportAll?' + qs.stringify(model);
    },
    exportData(){
       let model = {
        pageNum: this.model.pageNum,
        serviceContent: this.model.serviceContent,
        tagId: this.teamId
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      window.location.href = '/stats/typeTask/export?' + qs.stringify(model);
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
    init(){
      chart = echarts.init(this.$refs.chart);

      chart.on('click', event => {
        let origin = event.data._origin;
        
        this.model.pageNum = 1;
        this.model.serviceContent = origin.name;

        this.renderTable()
      })

      let ctx = this;
      window.addEventListener('resize', _.debounce(function () {
        ctx.render();
      }, 400));
    },
    render(){
      this.showTable = false;
      chart.clear();
      
      let serviceContent = this.chartData.serviceContent || [];

      let arr = [];

      for(let name in serviceContent){
        if(serviceContent[name] && serviceContent[name] > 0) arr.push({
          count: serviceContent[name],
          name: name
        });
      }


      if(arr.length == 0){
        this.isEmpty = true;
        return 
      }

      this.isEmpty = false;

      let sum = 0;
      let legend = [];
      let series = [];
      let data = [];

      arr.forEach(item => {
        sum += item.count;
        legend.push(item.name);

        data.push({
          name: item.name,
          value: item.count,
          _origin: {
            name: item.name,
            value: item.count
          }
        })
      })

      series.push({
        name: '服务内容',
        type: 'pie',
        radius : '55%',
        center: ['50%', '55%'],
        label: {
          normal: {
            formatter: "{b}： {c} ({d}%)"
          }
        },
        data: data,
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      })
      
      let taskTypeOption = this.getOptions(legend, series, '合计：' + sum)
            
      chart.resize();
      chart.setOption(taskTypeOption);
    },
    getOptions(legend, series, title){
      return {
        color: ["#2ec7c9","#ffb980","#5ab1ef","#d87a80","#5f5f6e","#07a2a4","#9a7fd1","#588dd5","#c05050","#f5994e","#59678c","#7eb00a","#749f83"],
        tooltip : {
          trigger: 'item',
          formatter: "{b} <br/> 数量: {c} ({d}%)"
        },
        title: {
          show: true,
          subtext: title,
          right: 100,
          top: 5,
          subtextStyle: {
            color: '#666',
            fontSize: 14
          }
        },
        toolbox: {
          right: 40,
          top: 10,
          feature: {
            saveAsImage: {
              name: "服务内容统计"
            }
          }
        },
        grid: {
          left: 120,
          containLabel: true
        },
        legend: {
          top: 10,
          bottom: 10,
          left: 5,
          orient: 'vertical',
          data: legend,
          type: 'scroll'
        },
        series: series
      }
    },
    fetchTableData(){
      let model = {
        pageNum: this.model.pageNum,
        serviceContent: this.model.serviceContent,
        tagId: this.teamId,
        pageSize: 10
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      return this.$http.get('/stats/task/list', model);
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
    this.init();
  },
  activated(){
    this.render();
  },
  watch: {
    chartData: {
      deep: true,
      handler: function(value) {
        this.render();
      }
    }
  },
  components: {
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>