<template>
  <div class="stats-panel">
    <div class="stats-panel-head stats-form">
      <h3>人员统计
        <el-popover trigger="hover">
          <ul>
            <li>新增工单：创建时间为该时间段的工单</li>
            <li>完成工单：完成时间为该时间段的工单</li>
            <li>营收：完成时间为该时间段的工单营收统计</li>
            <li>满意度：回访时间为该时间段的客户回访统计</li>
            <li>
              <div>效率：该时间段内已完成的工单(接单用时、工单用时、工作用时)</div>
              <div>接单用时：从派单到接单</div>
              <div>工单用时：从接单到完成</div>
              <div>工作用时：从开始到完成</div>
            </li>
          </ul>
          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
      </h3>
      <div class="stats-form-group stats-checkbox">
        <base-checkbox :value="categoryIgnoreNull" @input="chooseCategoryIgnore">隐藏无数据人员</base-checkbox>
      </div>

      <biz-team-select class="stats-team-select" :value="tag" @input="chooseCategoryTeam" :fetchFunc="fetchTeam"/>
      <!-- <div class="stats-form-group">
        <select @change="chooseCategoryTeam">
          <option value="">全部</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
        </select>
      </div> -->

      <div class="stats-form-group">
        <div id="date-range" class="stats-form-daterange">
          <span>{{categoryStartTime}} - {{categoryEndTime}}</span> 
          <b class="caret"></b>
        </div>
      </div>
    </div>
    <div class="stats-panel-body">
      <div style="text-align: center;">
        <div class="stats-btn-group">
          <button type="button" :class="{'stats-checked': categoryType == '工单'}" @click="chooseCategoryType('工单')">工单</button>
          <button type="button" :class="{'stats-checked': categoryType == '营收'}" @click="chooseCategoryType('营收')">营收</button>
          <button type="button" :class="{'stats-checked': categoryType == '满意度'}" @click="chooseCategoryType('满意度')">满意度</button>
          <button type="button" :class="{'stats-checked': categoryType == '效率'}" @click="chooseCategoryType('效率')">效率</button>
        </div>
      </div>
      <div class="category-chart-wrap">
        <div id="category"></div>
        <stats-chart-empty v-if="categoryEmpty">暂无数据</stats-chart-empty>
      </div>
      <div class="stats-staff-category-wrap" v-if="showTable">
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
            <el-table-column label="工单收入(元)" prop="profit" width="200px" v-if="categoryType == '营收'">
              <template slot-scope="scope">
                <span>{{ scope.row.profit.toFixed(2) }}</span>
              </template>
            </el-table-column> 

            <template v-if="categoryType == '满意度'">
              <el-table-column label="满意度" prop="degree" width="100px"></el-table-column>   
              <template v-if="hasStar">
                <el-table-column v-for="(field, index) in evaluateConfig.starEvaluates" :label="field" :prop="`evaluateObj.${evaluateConfig.starEvaluateFeilds[index]}`" :key="field"/>
              </template>
              <el-table-column label="评价标签" width="200px" prop="evaluateObj.tagEvaluates" show-overflow-tooltip v-if="hasTag">
                <template slot-scope="scope">{{scope.row.evaluateObj && scope.row.evaluateObj.tagEvaluates | prettyArray}}</template>
              </el-table-column>
              <el-table-column label="客户评价" width="240px" prop="evaluateContent" show-overflow-tooltip></el-table-column>
              <el-table-column label="回访备注" width="240px" prop="suggestion" show-overflow-tooltip></el-table-column>
            </template>    
              
            <template v-if="categoryType == '效率'">
              <el-table-column label="接单用时" width="180px">
                <template slot-scope="scope">
                  {{formatterTime(scope.row.acceptUsedTime)}}
                </template>
              </el-table-column>
              <el-table-column label="工单用时" width="180px">
                <template slot-scope="scope">
                  {{formatterTime(scope.row.taskUsedTime)}}
                </template>
              </el-table-column>      
              <el-table-column label="工作用时" width="180px">
                <template slot-scope="scope">
                  {{formatterTime(scope.row.workUsedTime)}}
                </template>
              </el-table-column>      
            </template>
            <el-table-column label="状态" prop="state" width="100px">
              <template slot-scope="scope">
                {{scope.row.state | taskStateName}}
              </template>
            </el-table-column>   
            <el-table-column label="负责人" prop="executor.displayName" width="120px"></el-table-column>
            <el-table-column label="创建人" prop="createUser.displayName" width="120px"></el-table-column>
            <el-table-column label="创建时间" width="180px">
              <template slot-scope="scope">
                {{scope.row.createTime | fmt}}
              </template>
            </el-table-column>
            <el-table-column label="完成时间" width="180px">
              <template slot-scope="scope">
                {{scope.row.completeTime | fmt}}
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
  </div>
</template>

<script>
/*global AMap, moment, _init_data*/
import $ from "jQuery";
import _ from 'lodash';
import http from 'src/util/HttpUtil';
import qs from 'src/util/QueryString';

import echarts from "packages/Echarts";

import Loading from 'packages/BaseLoading';
import BaseCheckbox from 'packages/BaseCheckbox.vue';
import SampleTooltip from 'packages/SampleTooltip'

const USER_TASK_LEGEND = ['新增', '完成'];
const USER_TASK_COLOR = ['#6da9e7', '#48e8ab'];

const USER_EXPENSE_LEGEND = ['收入'];
const USER_EXPENSE_COLOR = ['#48e8ab'];

const USER_DEGREE_LEGEND = ['满意', '一般','不满意'];
const USER_DEGREE_COLOR = ['#48e8ab', '#6da9e7', '#ffdd92'];

const USER_EFFICIENCY_LEGEND = ['平均接单用时', '平均工单用时','平均工作用时'];
const USER_EFFICIENCY_COLOR = ['#48e8ab', '#6da9e7', '#ffdd92'];

let category = null;

export default {
  name: 'staff-category-chart',
  props: ['evaluateConfig'],
  data(){
    return {
      tag: [],
      sort: '',
      categoryType: "工单",
      categoryData: {},
      categoryIgnoreNull: true,
      categoryStartTime: '',
      categoryEndTime: '',
      categoryTeamId: '',
      categoryEmpty: false,

      showTable: false,
      model: {
        pageNum: 1,
        userId: '',
        selectType: ''
      },
      page: {}
    }
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
    fetchTeam(params){
      return http.post('/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    exportAllData(){
      let model = {
        tagId: this.categoryTeamId,
        timeStart: this.categoryStartTime + ' 00:00:00',
        timeEnd: this.categoryEndTime + ' 23:59:59'
      };

      let selectType = 'task';
      if(this.categoryType == '营收') selectType = 'expense';
      if(this.categoryType == '满意度') selectType = 'degree';
      if(this.categoryType == '效率') selectType = 'time';

      model.selectType = selectType;
      window.location.href = '/stats/executorTask/exportAll?' + qs.stringify(model);
    },
    exportData(){
      let model = {
        tagId: this.categoryTeamId,
        timeStart: this.categoryStartTime + ' 00:00:00',
        timeEnd: this.categoryEndTime + ' 23:59:59',
        userId: this.model.userId,
        selectType: this.model.selectType,
      };

      window.location.href = '/stats/executorTask/export?' + qs.stringify(model);
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
    fetchTableData(){
      let model = {
        tagId: this.categoryTeamId,
        timeStart: this.categoryStartTime + ' 00:00:00',
        timeEnd: this.categoryEndTime + ' 23:59:59',
        userId: this.model.userId,
        selectType: this.model.selectType,
        pageNum: this.model.pageNum
      };

      return http.get('/stats/staff/taskList', model);
    },
    async renderTable(){
      let instance = this.$loading.show(this.$el);

      try {
        this.page = await this.fetchTableData();
        this.showTable = true;
      } catch (error) {
        console.log(error);
      }

      instance.hide();
    },
    jump(currentPage){
      this.model.pageNum = currentPage;
      this.renderTable();
    },
    initCategory(start, end){
      category = echarts.init(document.getElementById("category"));
      category.on('click', event => {
        let seriesName = event.seriesName;
        let origin = event.data._origin;
                
        let selectType = 'taskAdd';
        if(seriesName == '完成') selectType = 'taskFinish'
        if(seriesName == '收入') selectType = 'expense'
        if(seriesName == '满意') selectType = 'degreeSatifaction'
        if(seriesName == '一般') selectType = 'degreeGeneral'
        if(seriesName == '不满意') selectType = 'degreeUnsatifaction';
        if(seriesName == '平均接单用时') selectType = 'acceptTime';
        if(seriesName == '平均工单用时') selectType = 'taskTime';
        if(seriesName == '平均工作用时') selectType = 'workTime';

        this.model.pageNum = 1;
        this.model.userId = origin.userId;
        this.model.selectType = selectType;

        this.renderTable()
      })
      category.on('legendselectchanged', event => {
        let arr = [];
        let opt = category.getOption();
        for(let [key, value] of Object.entries(event.selected)) {
          arr.push({key, value});
        }
        arr.some(item => {
          if(item.value) {
            this.sort = item.key;
            return true;
          }
        })

        if(this.categoryType == '工单') {
          let sort = this.sortTaskTable();
          opt.series = sort.series;
          opt.yAxis[0].data = sort.yAxisData;
        } else if (this.categoryType == '满意度') {
          let sort = this.sortDegreeTable();
          opt.series = sort.series;
          opt.yAxis[0].data = sort.yAxisData;
        } else if (this.categoryType == '效率') {
          let sort = this.sortEfficiencyTable();
          opt.series = sort.series;
          opt.yAxis[0].data = sort.yAxisData;
        }

        category.setOption(opt);
      })
      //初始化时间控件
      this.initDateRangePicker(start, end);
      
      this.categoryStartTime = start.format("YYYY-MM-DD");
      this.categoryEndTime = end.format("YYYY-MM-DD");
      this.renderCategory();
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
        this.chooseCategoryDate
      );
    },
    chooseCategoryIgnore(value){
      this.categoryIgnoreNull = value;
      this.renderCategory();
    },
    chooseCategoryDate(start, end){
      this.$emit('trackEvent', 'chooseDate');

      this.categoryStartTime = start.format("YYYY-MM-DD");
      this.categoryEndTime = end.format("YYYY-MM-DD");
      this.renderCategory();
    },
    chooseCategoryTeam(value){
      this.$emit('trackEvent', 'chooseTeam');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.categoryTeamId = tag.id;
      this.renderCategory();
    },
    async renderCategory(event){
      try {
        let instance = Loading.show(this.$el);
        this.categoryData = await this.fetchCategoryData();

        instance.hide();
        this.showTable = false;
      
        this.categoryType = '工单';
        this.setCategoryOption(event);
      } catch (error) {
        console.log(error)
      }
    },
    chooseCategoryType(type){
      this.$emit('trackEvent', type);

      this.categoryType = type;
      this.setCategoryOption();
    },
    setCategoryOption(event){
      this.categoryEmpty = false;
      category.clear();

      let option = null;
      if(this.categoryType == '工单'){
        let taskOption = this.getCategoryTaskOption();
        if(taskOption) option = this.getCategoryOption(taskOption);
      }

      if(this.categoryType == '营收'){
        let expenceOption = this.getCategoryExpenceOption()
        if(expenceOption) option = this.getCategoryOption(expenceOption);
      }

      if(this.categoryType == '满意度'){
        let degreeOption = this.getCategoryDegreeOption();
        if(degreeOption) option = this.getCategoryOption(degreeOption);
      }

      if(this.categoryType == '效率'){
        let efficiencyOption = this.getCategoryEfficiencyOption()
        if(efficiencyOption) option = this.getCategoryOption(efficiencyOption);
      }
      
      if(null == option){
        this.categoryEmpty = true;
        return
      }

      category.setOption(option);
    },
    fetchCategoryData(){
      let params = {
        timeStart: `${this.categoryStartTime} 00:00:00`,
        timeEnd: `${this.categoryEndTime} 23:59:59`,
        tagId: this.categoryTeamId,
        ignoreNull: this.categoryIgnoreNull
      };
      return http.get('/stats/staff/userCount', params)
    },
    getCategoryEfficiencyOption(){
      let ctx = this;
      let data = this.categoryData.efficiency || [];

      if(data.length == 0) return null;
      let yAxisData = [];
      let series = [];
      let aauTime = []; //平均接单用时
      let atuTime = []; //平均工单用时
      let awuTime = []; //平均工作用时

      let maxData = 0;
      data.sort((prev, next) => prev.AverageAcceptUsedTime - next.AverageAcceptUsedTime);
      data.forEach(item => {
        yAxisData.push(item.displayName);

        aauTime.push({
          value: item.AverageAcceptUsedTime, 
          _origin: item
        });

        atuTime.push({
          value: item.AverageTaskUsedTime,
          _origin: item
        });

        awuTime.push({
          value: item.AverageWorkUsedTime,
          _origin: item
        });

        if(item.AverageAcceptUsedTime >= maxData) maxData = item.AverageAcceptUsedTime;
        if(item.AverageTaskUsedTime >= maxData) maxData = item.AverageTaskUsedTime;
        if(item.AverageWorkUsedTime >= maxData) maxData = item.AverageWorkUsedTime;
      });

      series.push({
        name: USER_EFFICIENCY_LEGEND[0],
        type: "bar",
        barMaxWidth: "30px",
        data: aauTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[1],
        type: "bar",
        barMaxWidth: "30px",
        data: atuTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[2],
        type: "bar",
        barMaxWidth: "30px",
        data: awuTime
      })

      let interval = this.computeInterval(maxData);

      let option = {
        title: '人员效率统计',
        legend: USER_EFFICIENCY_LEGEND,
        color: USER_EFFICIENCY_COLOR,
        tooltip: {
          formatter: function(data){
            let html = '';

            let name = data[0].name;

            html += `<div>${name}</div>`;

            data.forEach(item => {
              html += `<div>${item.marker} ${item.seriesName}: ${ctx.formatterTime(item.value >> 0)}</div>`;
            })

            return html;
          }
        },
        xAxis: {
          axisLabel: {
            show: true,
            formatter: function (value, index) {
              let temp = ctx.formatterTime(value >> 0);
              return temp == '--' ? 0 : temp;
            }
          }
        },
        yAxisData,
        series
      }

      if(interval.min != null) option.xAxis.minInterval = interval.min;
      if(interval.max != null) option.xAxis.maxInterval = interval.max;

      return option;
    },
    sortEfficiencyTable () {
      let data = this.categoryData.efficiency || [];

      if(data.length == 0) return null;
      let yAxisData = [];
      let series = [];
      let aauTime = []; //平均接单用时
      let atuTime = []; //平均工单用时
      let awuTime = []; //平均工作用时

      let maxData = 0;

      if(this.sort == '平均接单用时') {
        data.sort((prev, next) => prev.AverageAcceptUsedTime - next.AverageAcceptUsedTime);
      } else if(this.sort == '平均工单用时') {
        data.sort((prev, next) => prev.AverageTaskUsedTime - next.AverageTaskUsedTime);
      } else {
        data.sort((prev, next) => prev.AverageWorkUsedTime - next.AverageWorkUsedTime);
      }
      data.forEach(item => {
        yAxisData.push(item.displayName);

        aauTime.push({
          value: item.AverageAcceptUsedTime, 
          _origin: item
        });

        atuTime.push({
          value: item.AverageTaskUsedTime,
          _origin: item
        });

        awuTime.push({
          value: item.AverageWorkUsedTime,
          _origin: item
        });

        if(item.AverageAcceptUsedTime >= maxData) maxData = item.AverageAcceptUsedTime;
        if(item.AverageTaskUsedTime >= maxData) maxData = item.AverageTaskUsedTime;
        if(item.AverageWorkUsedTime >= maxData) maxData = item.AverageWorkUsedTime;
      });

      series.push({
        name: USER_EFFICIENCY_LEGEND[0],
        type: "bar",
        barMaxWidth: "30px",
        data: aauTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[1],
        type: "bar",
        barMaxWidth: "30px",
        data: atuTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[2],
        type: "bar",
        barMaxWidth: "30px",
        data: awuTime
      })

      return {
        series,
        yAxisData
      }
    },
    getCategoryTaskOption(){
      let data = this.categoryData.taskCount || [];
      if(data.length == 0) return null;

      let yAxisData = [];
      let createdData = [];
      let finishedDate = [];
      let series = [];
      
      data.sort((prev, next) => prev.taskCount - next.taskCount).forEach(item => {
        yAxisData.push(item.displayName);
        createdData.push({
          value: item.taskCount,
          _origin: item
        });
        finishedDate.push({
          value: item.finishedTask,
          _origin: item
        });
      });
      
      series.push({
        name: USER_TASK_LEGEND[0],
        type: "bar",
        barMaxWidth: "30px",
        data: createdData
      })

      series.push({
        name: USER_TASK_LEGEND[1],
        type: "bar",
        barMaxWidth: "30px",
        data: finishedDate
      })

      return {
        title: '人员工单统计',
        legend: USER_TASK_LEGEND,
        color: USER_TASK_COLOR,
        yAxisData,
        series
      }
    },
    sortTaskTable () {
      let data = this.categoryData.taskCount || [];
      if(data.length == 0) return null;

      let yAxisData = [];
      let createdData = [];
      let finishedDate = [];
      let series = [];
      
      if(this.sort == '完成') {
        data.sort((prev, next) => prev.finishedTask - next.finishedTask);
      } else {
        data.sort((prev, next) => prev.taskCount - next.taskCount);
      }
      data.forEach(item => {
        yAxisData.push(item.displayName);
        createdData.push({
          value: item.taskCount,
          _origin: item
        });
        finishedDate.push({
          value: item.finishedTask,
          _origin: item
        });
      });

      series.push({
        name: USER_TASK_LEGEND[0],
        type: "bar",
        barMaxWidth: "30px",
        data: createdData
      })

      series.push({
        name: USER_TASK_LEGEND[1],
        type: "bar",
        barMaxWidth: "30px",
        data: finishedDate
      })

      return {
        series,
        yAxisData
      }
    },
    getCategoryExpenceOption(){
      let data = this.categoryData.expense || [];
      if(data.length == 0) return null;

      let yAxisData = [];
      let expenseData = [];
      let series = [];

      data.sort((prev, next) => prev.receivables - next.receivables).forEach(item => {
        yAxisData.push({
          value: item.displayName,
          _origin: item
        });
        expenseData.push({
          value: item.receivables,
          _origin: item
        });
      });

      series.push({
        name: USER_EXPENSE_LEGEND[0],
        type: "bar",
        barMaxWidth: "30px",
        data: expenseData
      })

      return {
        title: '人员营收统计',
        legend: USER_EXPENSE_LEGEND,
        color: USER_EXPENSE_COLOR,
        yAxisData,
        series
      }
    },
    getCategoryDegreeOption(){
      let series = [];
      let data = this.categoryData.degree || [];
      if(data.length == 0) return null;

      let yAxisData = [];
      let satisData = [];//满意
      let generaldData = [];//一般
      let unsatisData = []; //不满意

      data.sort((prev, next) => prev.satisfication - next.satisfication).forEach(item => {
        yAxisData.push(item.displayName);
        satisData.push({
          value: item.satisfication,
          _origin: item
        });
        generaldData.push({
          value: item.general,
          _origin: item
        });
        unsatisData.push({
          value: item.unSatisfication,
          _origin: item
        });
      });

      series.push({
        name: USER_DEGREE_LEGEND[0],
        type: "bar",
        barMaxWidth: "30px",
        stack: '满意度',
        data: satisData
      })

      series.push({
        name: USER_DEGREE_LEGEND[1],
        type: "bar",
        barMaxWidth: "30px",
        stack: '满意度',
        data: generaldData
      })

      series.push({
        name: USER_DEGREE_LEGEND[2],
        type: "bar",
        barMaxWidth: "30px",
        stack: '满意度',
        data: unsatisData
      })

      return {
        title: '人员满意度统计',
        legend: USER_DEGREE_LEGEND,
        color: USER_DEGREE_COLOR,
        yAxisData,
        series
      };
    },
    sortDegreeTable () {
      let series = [];
      let data = this.categoryData.degree || [];
      if(data.length == 0) return null;

      let yAxisData = [];
      let satisData = [];//满意
      let generaldData = [];//一般
      let unsatisData = []; //不满意

      if(this.sort == '满意') {
        data.sort((prev, next) => prev.satisfication - next.satisfication);
      } if(this.sort == '一般') {
        data.sort((prev, next) => prev.general - next.general);
      } else {
        data.sort((prev, next) => prev.unSatisfication - next.unSatisfication);
      }

      data.forEach(item => {
        yAxisData.push(item.displayName);
        satisData.push({
          value: item.satisfication,
          _origin: item
        });
        generaldData.push({
          value: item.general,
          _origin: item
        });
        unsatisData.push({
          value: item.unSatisfication,
          _origin: item
        });
      });

      series.push({
        name: USER_DEGREE_LEGEND[0],
        type: "bar",
        barMaxWidth: "30px",
        stack: '满意度',
        data: satisData
      })

      series.push({
        name: USER_DEGREE_LEGEND[1],
        type: "bar",
        barMaxWidth: "30px",
        stack: '满意度',
        data: generaldData
      })

      series.push({
        name: USER_DEGREE_LEGEND[2],
        type: "bar",
        barMaxWidth: "30px",
        stack: '满意度',
        data: unsatisData
      })

      return {
        yAxisData,
        series
      };
    },
    getCategoryOption(option){
      let yAxisData = option.yAxisData;

      let start = 0;
      let end = yAxisData.length - 1;
      if(yAxisData.length > 10) start = end - 9;

      let _option = {
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
        grid: {
          left: '20px',
          right: '60px',
          bottom: '20px',
          top: '50px',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {
              name: option.title
            }
          },
          right: 40
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            yAxisIndex: [0],
            right: '20px',
            startValue: start,
            endValue: end,
            minValueSpan: 10,
            maxValueSpan: 30
          }
        ],
        yAxis: {
          type: 'category',
          data: option.yAxisData
        },
        xAxis: {
          type: 'value'
        },
        series: option.series
      };

      if(this.categoryType == '效率' && option.tooltip) {
        _.assign(_option.tooltip, option.tooltip);
      }

      if(option.xAxis) _.assign(_option.xAxis, option.xAxis)

      return _option;
    },
    formatterTime(sec){
      //const DAY_SEC = 60 * 60 * 24;
      const HOUR_SEC = 60 * 60;
      const MIN_SEC = 60;

      //let day = sec / DAY_SEC >> 0;
      //sec = sec % DAY_SEC;

      let hour = sec / HOUR_SEC >> 0;
      sec = sec % HOUR_SEC;

      let min = sec / MIN_SEC >> 0;
      sec = sec % MIN_SEC;

      let temp = '';
      //if(day > 0) temp += day + '天';
      if(hour > 0) temp += hour + '时';
      if(min > 0) temp += min + '分';
      if(sec > 0) temp += sec + '秒';

      return temp ? temp : '--';
    },
    //计算最大时间间隔
    computeInterval(sec){
      let interval = {
        min: 0,
        max: null
      }
      
      //如果时间跨度不大于1小时
      if(sec <= 3600){
        //以分钟为最小刻度
        interval.min = 60 ;
        //以10分钟为最大刻度
        interval.max = 60 * 10;
        return interval;
      }

      //如果时间跨度小于1天
      if(sec <= 3600 * 24){
        //以小时为最小刻度
        interval.min = 3600;
        return interval;
      }

      //如果时间跨度大于1天，则按6份划分
      let hour = sec / 3600 >> 0;
      interval.max = (hour / 6 >> 0) * 3600;
      interval.min = 3600;
      return interval
    }
  },
  mounted(){
    this.initCategory(moment().subtract(6, "days"), moment());
    window.addEventListener('resize',_.debounce(function(){
      category.resize();
    }, 400))
  },
  watch: {
    categoryType(){
      this.showTable = false;
    }
  },
  components: {
    [BaseCheckbox.name]: BaseCheckbox,
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>

<style lang="scss">
#category{
  height: 100%;
}
.category-chart-wrap{
  width: 100%;
  height: 520px;
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
.stats-staff-category-wrap{
  //padding: 10px;
}
.el-tooltip__popper{
  max-width: 800px;
  word-break: break-all;
}
</style>

