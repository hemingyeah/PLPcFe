<template>
  <div class="stats-container">
    <div class="stats-form stats-customer-form">
      <biz-team-select 
        v-if="divideByTag" class="stats-team-select" 
        :value="tag" @input="chooseTeam" :fetchFunc="fetchTeam"/>

      <!-- <div class="stats-form-group" v-if="divideByTag">
        <select @change="chooseTeam">
          <option value="">全部</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
        </select>
      </div> -->
      <div class="stats-form-group">
        <div id="date-range" class="stats-form-daterange">
          <span>{{timeStart}} - {{timeEnd}}</span> 
          <b class="caret"></b>
        </div>
      </div>
    </div>

    <div class="stats-customer-head">
      <div class="stats-customer-card">
        <div class="stats-customer-card-info">
          <h3>{{countData.allCustomerCount | convertZero}}</h3>
          <p>客户数量
            <el-popover trigger="hover">
              <ul>
                <li>系统中的客户数量</li>
              </ul>
              <stats-popover-icon slot="reference"></stats-popover-icon>
            </el-popover>
          </p>
        </div>
        <img src="../../../assets/img/customer_count.png"/>
      </div>
      <div class="stats-customer-card">
        <div class="stats-customer-card-info">
          <h3>{{countData.newCustomerCount | convertZero}}</h3>
          <p>新增客户
            <el-popover trigger="hover">
              <ul>
                <li>该时间段内新增的客户数量</li>
              </ul>
              <stats-popover-icon slot="reference"></stats-popover-icon>
            </el-popover>
          </p>
        </div>
        <img src="../../../assets/img/customer_add.png"/>
      </div>
      <div class="stats-customer-card">
        <div class="stats-customer-card-info">
          <h3>{{countData.finishedCustomerCount | convertZero}}</h3>
          <p>服务客户
            <el-popover trigger="hover">
              <ul>
                <li>工单完成时间为该时间段内的客户</li>
              </ul>
              <stats-popover-icon slot="reference"></stats-popover-icon>
            </el-popover>
          </p>
        </div>
        <img src="../../../assets/img/customer_ser.png"/>
      </div>
    </div>

    <customer-degree-chart :degreeData="degreeData" :teamId="teamId" :timeStart="timeStart" :timeEnd="timeEnd" :evaluateConfig="evaluateConfig"></customer-degree-chart>

    <div class="stats-row">
      <div class="stats-panel">
        <div class="stats-panel-head">
          <h3>客户工单、营收、毛利、成本、事件统计 
            <el-popover trigger="hover">
              <ul>
                <li>工单数量：完成时间为该时间段内的工单数量 全部的客户</li>
                <li>工单营收：该时间段内工单营收 全部的客户</li>
                <li>工单毛利：该时间段内工单毛利 全部的客户</li>
                <li>工单成本：该时间段内工单成本 全部的客户</li>
                <li>服务台事件：完成时间为该时间段内服务台事件数量 全部的客户</li>
              </ul>
              <stats-popover-icon slot="reference"></stats-popover-icon>
            </el-popover>
          </h3>
        </div>
        <div class="stats-panel-body">
          <div style="text-align: center;"> 
            <div class="category-btn-group">
              <button type="button" :class="{'stats-checked': category == '工单'}" @click="chooseCategory('工单')">工单数量</button>
              <button type="button" :class="{'stats-checked': category == '营收'}" @click="chooseCategory('营收')">工单营收</button>
              <button type="button" :class="{'stats-checked': category == '毛利'}" @click="chooseCategory('毛利')">工单毛利</button>
              <button type="button" :class="{'stats-checked': category == '成本'}" @click="chooseCategory('成本')">工单成本</button>
              <button type="button" :class="{'stats-checked': category == '事件'}" @click="chooseCategory('事件')">服务台事件</button>
            </div>
          </div>
          
          <div class="category-chart-wrap">

            <!-- start 客户工单统计图表 -->
            <div id="chart" :style="{height: (allowExpand && expand) ? '720px' : '480px'}"></div>
            <!-- end 客户工单统计图表 -->

            <!-- start 分页 -->
            <div class="category-cart-pagination">
              <el-pagination 
                background 
                class="stats-pagination"
                layout="total, prev, pager, next"
                @current-change="categoryJump"
                :current-page="currentTabPageNum"
                :page-size="10"
                :page-count="currentTabPageData.totalPage || 1"
                :total="currentTabPageData.totalCount">
              </el-pagination>
            </div>
            <!-- end 分页 -->

            <div class="stats-table-expand no-border" :class="{'stats-table-isExpand': expand}" v-if="allowExpand">
              <button type="button" @click="expand = !expand;expand && trackEventHandler('more')">
                <i class="iconfont icon-zhankaisanjiao"></i> {{expand ? '收起数据' : '显示更多'}}
              </button>
            </div>
            <stats-chart-empty v-if="categoryEmpty">暂无数据</stats-chart-empty>
            <div class="stats-table-wrap" v-if="showTable">
              <div class="stats-table-header">
                <h3>工单列表</h3>

                <button type="button" class="btn btn-primary btn-sm" @click="exportData">导出</button>
                <button type="button" class="btn btn-primary btn-sm" @click="exportAllData">导出全部</button>
                <button type="button" class="btn btn-primary btn-sm" @click="showTable = false">收起</button>
              </div>
              <div>
                <el-table :data="page.list" class="stats-table">
                  <template v-if="category == '事件'">
                    
                    <el-table-column label="编号" prop="eventNo" width="150px" :show-overflow-tooltip="false">
                      <template slot-scope="scope">
                        <sample-tooltip :row="scope.row">
                          <template slot="content" slot-scope="{isContentTooltip}">
                            <el-tooltip :content="scope.row.eventNo" placement="top" :disabled="!isContentTooltip">
                              <a :href="`/event/view/${scope.row.id}`" :data-id="scope.row.id" data-form="event" @click="openDetail">{{scope.row.eventNo}}</a>
                            </el-tooltip>
                          </template>
                        </sample-tooltip>
                      </template>
                    </el-table-column>

                    <el-table-column label="事件类型" prop="templateName" width="120px"></el-table-column>
                    <el-table-column label="客户" prop="customerName"></el-table-column>
                    <el-table-column label="负责人" prop="eUserName" width="120px"></el-table-column>
                    <el-table-column label="完成时间" width="180px">
                      <template slot-scope="scope">
                        {{scope.row.completeTime | fmt}}
                      </template>
                    </el-table-column>
                  </template>
                  <template v-else>
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
                    <el-table-column label="负责人" prop="executor.displayName" width="120px"></el-table-column>

                    <el-table-column label="工单营收（元）" v-if="category == '营收'" prop="profit" width="180px">
                      <template slot-scope="scope">
                        {{ scope.row.profit.toFixed(2) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="工单毛利（元）" v-if="category == '毛利'" prop="sale" width="180px">
                      <template slot-scope="scope">
                        {{ scope.row.sale.toFixed(2) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="工单成本（元）" v-if="category == '成本'" prop="cost" width="180px">
                      <template slot-scope="scope">
                        {{ scope.row.cost.toFixed(2) }}
                      </template>
                    </el-table-column>

                    <el-table-column label="完成时间" prop="templateName" width="180px">
                      <template slot-scope="scope">
                        {{scope.row.completeTime | fmt}}
                      </template>
                    </el-table-column>
                  </template>
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
      </div>
    </div>

  <customer-map></customer-map>
  </div>
</template>

<script>
/*global AMap, moment, _init_data*/
import $ from "jQuery";
import _ from 'lodash';
import http from 'src/util/HttpUtil';
import qs from 'src/util/QueryString';

import echarts from 'packages/Echarts';
import Loading from 'packages/BaseLoading';
import SampleTooltip from 'packages/SampleTooltip'

import CustomerMap from './CustomerMap.vue';
import CustomerDegreeChart from './CustomerDegreeChart.vue';
import {isEnterprise} from '@src/util/Platform';
let chart = null;

export default {
  name: 'customer-view',
  data(){
    return {
      tag: [],  
      // teams: [],
      teamId: "",
      divideByTag: false,
      
      timeStart: '',
      timeEnd: '',
      category: "工单",
      categoryEmpty: false,

      originCategoryData: {},
      degreeData: {},
      countData: {
        allCustomerCount: '--',
        finishedCustomerCount: '--',
        newCustomerCount: '--'
      },
      expand: false,

      showTable: false,
      model: {
        pageNum: 1,
        selectType: '',
        customerId: ''
      },
      page: {},

      evaluateConfig: {},
      tabStatus: {
        task: {
          init: true,
          pageNum: 1,
        },
        profit: {
          init: true,
          pageNum: 1,
        },
        sale: {
          init: true,
          pageNum: 1,
        },
        cost: {
          init: true,
          pageNum: 1,
        },
        event: {
          init: true,
          pageNum: 1,
        }
      },
      tabParams: {
        '工单': 'task',
        '营收': 'profit',
        '毛利': 'sale',
        '成本': 'cost',
        '事件': 'event'
      }
    };
  },
  computed: {
    allowExpand(){
      return Object.keys(this.originCategoryData).some(key => this.originCategoryData[key].length > 10);
    },
    categoryData(){
      if(!this.allowExpand) return this.originCategoryData;
      if(this.expand) return this.originCategoryData;

      let origin = this.originCategoryData;
      let { costData, eventData, profitData, saleData, taskData } = origin;

      return {
        costData: this.buildCategoryItemData(costData, 'cost'),
        eventData: this.buildCategoryItemData(eventData, 'event'),
        profitData: this.buildCategoryItemData(profitData, 'profit'),
        saleData: this.buildCategoryItemData(saleData, 'sale'),
        taskData: this.buildCategoryItemData(taskData, 'task'),
      };
    },
    currentTabParam() {
      return this.tabParams[this.category];
    },
    currentTabParamDataStr() {
      return `${this.currentTabParam}Data`;
    },
    currentTabPageData() {
      if(Object.keys(this.categoryData).length <= 0) return {};

      let dataStr = this.currentTabParamDataStr;
      let data = this.categoryData;

      return data[dataStr] || {};
    },
    currentTabPageNum() {
      return this.tabStatus[this.currentTabParam].pageNum;
    }
  },
  methods: {
    buildCategoryItemData(data = {}, categoryStr) {
      return {
        [categoryStr]: data[categoryStr].slice(0,10),
        totalPage: data.totalPage,
        totalCount: data.totalCount,
      }
    },
    exportAllData(){
      let model = {
        tagId: this.teamId
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      if(this.category == '事件'){
        window.location.href = '/stats/customerTask/event/exportAll?' + qs.stringify(model);
        return
      } 

      let selectType = 'task';
      if(this.category == '营收') selectType = 'profit';
      if(this.category == '毛利') selectType = 'sale';
      if(this.category == '成本') selectType = 'cost';

      model.selectType = selectType;
      window.location.href = '/stats/customerTask/exportAll?' + qs.stringify(model);
    },
    exportData(){
      let model = {
        selectType: this.model.selectType,
        userId: this.model.customerId,
        tagId: this.teamId
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      let action = '/stats/customerTask/export';
      if(this.category == '事件') action = '/stats/customerTask/event/export'

      window.location.href = action + '?' + qs.stringify(model);
    },
    openDetail(event){
      event.preventDefault();
    
      let el = event.target;
      var fromId = window.frameElement.getAttribute('id');

      parent.window.addTabs({
        id: el.dataset.from + "View_" + el.dataset.id, 
        title: "正在加载", 
        close: true, 
        url: el.getAttribute('href'),
        fromId:fromId
      });
      parent.window.resizeFrame();
    },
    categoryJump(currentPage) {
      this.tabStatus[this.currentTabParam].pageNum = currentPage;

      let instance = this.$loading.show(this.$el);
        
      this.fetchCategoryPagingData(currentPage).then(result => {
        let dataStr = this.currentTabParamDataStr;

        this.$set(this.originCategoryData[dataStr], this.currentTabParam, result[this.currentTabParam]);
        this.setCategoryOption();
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        instance.hide();
      });

    },
    jump(currentPage){
      this.model.pageNum = currentPage;
      this.renderTable();
    },
    fetchTableData(){
      let model = {
        pageNum: this.model.pageNum,
        selectType: this.model.selectType,
        userId: this.model.customerId,
        tagId: this.teamId,
        pageSize: 10
      };

      if(this.timeStart) model.timeStart = `${this.timeStart} 00:00:00`;
      if(this.timeEnd) model.timeEnd = `${this.timeEnd} 23:59:59`;

      return http.get('/stats/customer/taskList', model);
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
    fetchTeam(params){
      return http.post(isEnterprise ? '/security/tag/tree' : '/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    chooseTeam(value){
      this.$tdOnEvent('pc：客户报表-选择团队事件');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.teamId = tag.id;

      this.render();
    },
    initChart(start, end){
      chart = echarts.init(document.getElementById("chart"));  
      
      chart.on('click', event => {
        let seriesName = event.seriesName;
        let origin = event.data._origin;
        let selectType = 'task';

        if(seriesName == '营收') selectType = 'profit';
        if(seriesName == '毛利') selectType = 'sale';
        if(seriesName == '成本') selectType = 'cost';
        if(seriesName == '事件') selectType = 'event';

        this.model.selectType = selectType;
        this.model.customerId = origin.customerId;
        this.model.pageNum = 1;
        this.renderTable();
      })

      //初始化时间控件
      this.initDateRangePicker(start, end);
      
      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");
      this.render();
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
    chooseDate(start, end){
      this.$tdOnEvent('pc：客户报表-日期选择事件');

      this.timeStart = start.format("YYYY-MM-DD");
      this.timeEnd = end.format("YYYY-MM-DD");
      this.render();
    },
    async render(){
      try {
        this.category = '工单';

        let instance = Loading.show(this.$el);
        let microTask = [];

        microTask.push(this.fetchCustomerCount());
        microTask.push(this.fetchCategoryData());
        microTask.push(this.fetchCustomerDegree());

        let result = await Promise.all(microTask);

        this.reset();

        _.assign(this.countData, result[0]);

        this.$set(this.originCategoryData, `${this.currentTabParam}Data`, result[1]);
        this.$set(this.tabStatus[this.currentTabParam], 'init', false);
        this.degreeData = result[2] || {};

        instance.hide();

        this.showTable = false;
        this.expand = false;
    
        this.setCategoryOption();
      } catch (error) {
        console.log(error)
      }
    },
    /* 选择分类 */
    async chooseCategory(type){
      this.trackEventHandler(type);

      this.category = type;

      let isInit = this.tabStatus[this.currentTabParam].init;

      if (isInit) {
        try {
          let instance = this.$loading.show(this.$el);
          let result = await this.fetchCategoryData() || {};
          let dataStr = this.currentTabParamDataStr;

          this.tabStatus[this.currentTabParam].init = false;
          this.$set(this.originCategoryData, dataStr, result);

          instance.hide();
        } catch (error) {
          console.log('fetchCategoryData', this.currentTabParam,  error)
        }
      } 
      
      this.setCategoryOption();
    },
    setCategoryOption(){
      this.categoryEmpty = false;

      let option = null;

      if(this.category == '工单'){
        let taskOption = this.getTaskOption();
        if(taskOption) option = this.getCategoryOption(taskOption);
      }

      if(this.category == '毛利'){
        let saleOption = this.getSaleOption()
        if(saleOption) option = this.getCategoryOption(saleOption);
      }

      if(this.category == '营收'){
        let profitOption = this.getProfitOption();
        if(profitOption) option = this.getCategoryOption(profitOption);
      }

      //cost
      if(this.category == '成本'){
        let costOption = this.getCostOption();
        if(costOption) option = this.getCategoryOption(costOption);
      }

      if(this.category == '事件'){
        let eventOption = this.getEventOption();
        if(eventOption) option = this.getCategoryOption(eventOption);
      }
      
      this.$nextTick(() => {
        chart.clear();
        chart.resize();
        if(null == option){
          this.categoryEmpty = true;
          return
        }
        this.categoryEmpty = false;
        chart.setOption(option);
      })
    }, 
    getTaskOption(){
      let data = this.categoryData.taskData.task || [];
      // data = data.filter(item => item.taskCount > 0);

      if(data.length == 0) return null;

      let yAxisData = [];
      let seriesData = [];
      let series = [];

      data.sort((prev,next) => prev.taskCount - next.taskCount).forEach(item => {
        yAxisData.push(item.customerName);

        seriesData.push({
          value: item.taskCount,
          _origin: item
        });
      });

      series.push({
        name: "工单",
        type: "bar",
        barMaxWidth: "20px",
        data: seriesData
      })

      return {
        legend: ["工单"],
        color: ["#6da9e8"],
        yAxisData,
        series
      }
    },  
    getSaleOption(){
      let data = this.categoryData.saleData.sale || [];
      // data = data.filter(item => item.saleSum > 0);

      if(data.length == 0) return null;

      let yAxisData = [];
      let seriesData = [];
      let series = [];

      data.sort((prev,next) => prev.saleSum - next.saleSum).forEach(item => {
        yAxisData.push(item.customerName);

        seriesData.push({
          value: item.saleSum,
          _origin: item
        });
      });

      series.push({
        name: "毛利",
        type: "bar",
        barMaxWidth: "20px",
        data: seriesData
      })

      return {
        legend: ["毛利"],
        color: ["#6da9e8"],
        yAxisData,
        series
      }
    },
    getProfitOption(){
      let data = this.categoryData.profitData.profit || [];
      // data = data.filter(item => item.profitSum > 0)
      if(data.length == 0) return null;

      let yAxisData = [];
      let profitData = [];
      let series = [];

      data.sort((prev, next) => prev.profitSum - next.profitSum).forEach(item => {
        yAxisData.push(item.customerName);

        profitData.push({
          value: item.profitSum,
          _origin: item
        });
      });

      series.push({
        name: "营收",
        type: "bar",
        barMaxWidth: "20px",
        data: profitData
      })

      return {
        legend: ["营收"],
        color: ["#6da9e8"],   
        yAxisData,
        series
      }
    },
    getCostOption(){   
      let series = []; 
      let data = this.categoryData.costData.cost || [];
      // data = data.filter(item => item.costSum > 0);
      if(data.length == 0) return null;

      let yAxisData = [];
      let seriesData = [];//满意       

      data.sort((prev, next) => prev.costSum - next.costSum).forEach(item => {
        yAxisData.push(item.customerName);
        seriesData.push({
          value: item.costSum,
          _origin: item
        });
      });

      series.push({
        name: "成本",
        type: "bar",
        barMaxWidth: "20px",
        data: seriesData
      })

      return {
        legend: ["成本"],
        color: ["#6da9e8"],
        yAxisData,
        series
      };
    },
    getEventOption(){
      let series = []; 
      let data = this.categoryData.eventData.event || [];
      // data = data.filter(item => item.eventCount > 0);
      if(data.length == 0) return null;

      let yAxisData = [];
      let seriesData = [];//满意       

      data.sort((prev, next) => prev.eventCount - next.eventCount).forEach(item => {
        yAxisData.push(item.customerName);
        seriesData.push({
          value: item.eventCount,
          _origin: item
        });
      });

      series.push({
        name: "事件",
        type: "bar",
        barMaxWidth: "20px",
        data: seriesData
      })

      return {
        legend: ["事件"],
        color: ["#6da9e8"],
        yAxisData,
        series
      };
    },
    getCategoryOption(option){
      return {
        color: option.color,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: option.legend,
          top: "10px",
          left: "70px"
        },
        toolbox: {
          feature: {
            saveAsImage: {
              name: `客户${option.legend}统计`
            }
          },
          right: 40
        },
        grid: {
          left: '20px',
          right: '60px',
          bottom: '20px',
          top: '40px',
          containLabel: true
        },
        yAxis: {
          type: 'category',
          data: option.yAxisData
        },
        xAxis: {
          type: 'value'
        },
        series: option.series
      };
    },
    buildCategoryParams() {
      return {
        timeStart: `${this.timeStart} 00:00:00`,
        timeEnd: `${this.timeEnd} 23:59:59`,
        tabType: this.currentTabParam
      };
    },
    fetchCustomerCount(){
      let params = {
        timeStart: `${this.timeStart} 00:00:00`,
        timeEnd: `${this.timeEnd} 23:59:59`,
      }

      if(this.divideByTag) params.tagId = this.teamId;

      return http.get('/stats/customer/count', params);
    },
    fetchCategoryData(){
      let params = this.buildCategoryParams();
      params.page = 1;

      if(this.divideByTag) params.tagId = this.teamId;

      return http.get('/stats/customer/analysis', params)
    },
    fetchCategoryPagingData(pageNum) {
      let params = this.buildCategoryParams();
      params.page = pageNum || this.tabStatus[this.currentTabParam].pageNum;

      if(this.divideByTag) params.tagId = this.teamId;
      return http.get('/stats/customer/analysis/nextpage', params)
    },
    fetchCustomerDegree(){
      let params = {
        timeStart: `${this.timeStart} 00:00:00`,
        timeEnd: `${this.timeEnd} 23:59:59`
      };

      if(this.divideByTag) params.tagId = this.teamId;

      return http.get('/stats/customer/degree', params);
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      switch (type) {
        case '工单':
          this.$tdOnEvent('pc：客户报表-工单数据事件');
          break;
        case '营收':
          this.$tdOnEvent('pc：客户报表-工单营收事件');
          break;
        case '毛利':
          this.$tdOnEvent('pc：客户报表-工单毛利事件');
          break;
        case '成本':
          this.$tdOnEvent('pc：客户报表-工单成本事件');
          break;
        case '事件':
          this.$tdOnEvent('pc：客户报表-服务台事件事件');
          break;
        case 'more':
          this.$tdOnEvent('pc：客户报表-显示更多事件');
          break;
        default:
          break;
      }
    },
    reset() {
      let item = null;
      for(let key in this.tabStatus) {
        item = this.tabStatus[key];

        this.$set(item, 'init', true);
        this.$set(item, 'pageNum', 1);
      }
    }
  },
  mounted(){
    let initData = JSON.parse(JSON.stringify(window._init_data)) || {};
    // this.teams = initData.teams || [];
    this.divideByTag = initData.divideByTag || false;
    this.evaluateConfig = initData.evaluateConfig || {};

    this.initChart(moment().subtract(6, "days"), moment());

    window.addEventListener('resize',_.debounce(function(){
      chart.resize();
    },400))
  },
  watch: {
    category(){
      this.showTable = false;
    },
    expand(){
      this.showTable = false;
      this.setCategoryOption()
    }
  },
  components: {
    [CustomerMap.name]: CustomerMap,
    [CustomerDegreeChart.name]: CustomerDegreeChart,
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>

<style lang="scss">
.stats-customer-form{
  padding: 5px 7.5px;
  justify-content: flex-end;
}

.stats-customer-head{
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 7.5px;
}

.stats-customer-card{
  flex: 1;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin-left: 15px;

  border-radius: 2px;
  background-color: #fff;

  &:first-child{
    margin-left: 0;
  }

  img{
    display: block;
    height: 60px;
    width: 60px;
    border: none;
    margin-right: 10px;
  }
}

.stats-customer-card-info{
  padding: 0 10px;
  flex: 1;
  h3{
    margin: 0;
    padding: 12.5px 0 10px 0;
    font-size: 38px;
    font-weight: 400;
  }

  p{
    color: #666;
    font-size: 18px;
    margin: 0;
    padding: 5px 0 15px 0;
  }
}

.category-chart-wrap{
  width: 100%;
  position: relative;
}

.category-chart-empty{
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

.category-btn-group{
  display: inline-flex;
  flex-flow: row nowrap;
  padding: 10px 0;
  margin: 0 auto;

  button{
    flex: 1;
    outline: none;
    border: 1px solid #ddd;
    border-left: none;
    background-color: #f4f4f4;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-align: center;
    white-space: nowrap;
    transition: all ease .15s;
    border-radius: 0;
  }

  button:hover{
    background-color: #e5e5e5;
  }

  button:first-child{
    border-radius:  2px 0 0 2px ;
    border-left: 1px solid #ddd;
  }

  button:last-child{
    border-radius: 0 2px 2px 0;
  }

  button.stats-checked{
    background-color: #55b7b4;
    border-color: #00acd6;
    color: #fff;
  }
}
</style>

