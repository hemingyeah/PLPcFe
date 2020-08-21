<template>
  <div class="stats-panel">
    <div class="stats-panel-head">
      <h3>客户满意度
        <el-popover trigger="hover">
          <ul>
            <li>该时间段内的工单收到的客户评价</li>
          </ul>
          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
      </h3>
    </div>
    <div class="stats-panel-body">
      <div id="degree"></div>
      <div class="stats-table-wrap" v-if="showTable">
        <div class="stats-table-header">
          <h3>工单列表</h3>

          <button type="button" class="btn btn-primary btn-sm" @click="exportData">导出</button>
          <button type="button" class="btn btn-primary btn-sm" @click="exportAllData">导出全部</button>
          <button type="button" class="btn btn-primary btn-sm" @click="showTable = false">收起</button>
        </div>
        <div>
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
            <el-table-column label="客户" prop="customer.name" min-width="240px"></el-table-column>
            <el-table-column label="负责人" prop="executor.displayName" width="120px"></el-table-column>
            <el-table-column label="评价时间" prop="templateName" width="180px">
              <template slot-scope="scope">
                {{scope.row.reviewTime | fmt}}
              </template>
            </el-table-column>
            <el-table-column label="满意度" prop="degree" width="100px"></el-table-column>
            <template v-if="hasStar">
              <el-table-column v-for="(field, index) in evaluateConfig.starEvaluates" :label="field" :prop="`evaluateObj.${evaluateConfig.starEvaluateFeilds[index]}`" :key="field"/>
            </template>
            <el-table-column label="评价标签" width="200px" prop="evaluateObj.tagEvaluates" show-overflow-tooltip v-if="hasTag">
              <template slot-scope="scope">{{scope.row.evaluateObj && scope.row.evaluateObj.tagEvaluates | prettyArray}}</template>
            </el-table-column>
            <el-table-column label="客户评价" width="240px" prop="evaluateContent" show-overflow-tooltip></el-table-column>
            <el-table-column label="回访备注" width="240px" prop="suggestion" show-overflow-tooltip></el-table-column>
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
import echarts from 'packages/Echarts';
import _ from 'lodash';
import http from 'src/util/HttpUtil'
import qs from 'src/util/QueryString'

import SampleTooltip from 'packages/SampleTooltip'

let degreeChart = null;

export default {
  name: 'customer-degree-chart',
  props: {
    degreeData: Object,
    teamId: String,
    timeStart: String,
    timeEnd: String,
    evaluateConfig: Object
  },
  data(){
    return {
      showTable: false,
      
      model: {
        pageNum: 1,
        selectType: ''
      },
      page: {
        list: []
      }
    };
  },
  computed: {
    hasStar(){
      return this.evaluateConfig.useStarEvaluate;
    },
    hasTag(){
      return this.evaluateConfig.useTagEvaluate;
    }
  },
  methods: {
    exportAllData(){
      let model = {
        tagId: this.teamId
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;
      
      window.location.href = '/stats/customerTask/degree/exportAll?' + qs.stringify(model);
    },
    exportData(){
      let model = {
        selectType: this.model.selectType,
        tagId: this.teamId
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;
      
      window.location.href = '/stats/customerTask/degree/export?' + qs.stringify(model);
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
        selectType: this.model.selectType,
        tagId: this.teamId,
        pageSize: 10
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      return http.get('/stats/customer/degreeList', model);
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
    },
    render(){
      degreeChart.clear();
      this.showTable = false;
      
      let option = this.getDegreeOption();
      degreeChart.setOption(option)
    },
    initChart(){
      degreeChart = echarts.init(document.getElementById("degree"));
      window.addEventListener('resize',_.debounce(function(){
        degreeChart.resize();
      },400))
      
      degreeChart.on('click', event => {
        let name = event.name;
        let selectType = 'satifaction';

        if(name == '一般') selectType = 'general';
        if(name == '不满意') selectType = 'unSatifaction';

        this.model.selectType = selectType;
        this.model.pageNum = 1;
        this.renderTable();
      })

      this.render();
    },
    getDegreeOption(){
      let legendData = ["满意","一般", "不满意"]
      let data = this.degreeData || {};
      let pieData = [
        {name: "满意", value: data.satifaction || 0},
        {name: "一般", value: data.general || 0},
        {name: "不满意", value: data.unSatifaction || 0}
      ]

      return {
        color: ['#6da9e8', '#48e8ab', '#ffdd92'],
        tooltip : {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: 'vertical',
          top: 10,
          left: 10,
          data: legendData
        },
        toolbox: {
          right: 40,
          top: 10,
          feature: {
            saveAsImage: {
              name: "客户满意度"
            }
          }
        },
        series : [
          {
            name: '满意度',
            type: 'pie',
            center: ['50%', '50%'],
            data: pieData,
            label: {
              normal: {
                formatter: "{b}： {c} ({d}%)"
              }
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  },
  mounted(){
    this.initChart()
  },
  watch: {
    degreeData: {
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


<style lang="scss">
#degree{
  height: 480px;
  width: 100%;
 
  margin: 0 auto;
}
</style>
