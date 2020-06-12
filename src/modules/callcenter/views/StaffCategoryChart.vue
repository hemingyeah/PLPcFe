<template>
  <div class="stats-panel">
    <div class="stats-panel-head stats-form">
      <h3>人员统计</h3>
      <div class="stats-form-group stats-checkbox">
        <base-checkbox :value="categoryIgnoreNull" @input="chooseCategoryIgnore">隐藏无数据人员</base-checkbox>
      </div>

      <div class="stats-form-group">
        <div id="staff-date-range" class="stats-form-daterange">
          <span>{{categoryStartTime}} - {{categoryEndTime}}</span> 
          <b class="caret"></b>
        </div>
      </div>
    </div>
    <div class="stats-panel-body">
      <div style="text-align: center;">
        <div class="stats-btn-group">
          <button type="button" :class="{'stats-checked': categoryType == '通话'}" @click="chooseCategoryType('通话')">通话</button>
          <button type="button" :class="{'stats-checked': categoryType == '解决'}" @click="chooseCategoryType('解决')">解决</button>
          <button type="button" :class="{'stats-checked': categoryType == '通话时长'}" @click="chooseCategoryType('通话时长')">通话时长</button>
          <button type="button" :class="{'stats-checked': categoryType == '呼出类型'}" @click="chooseCategoryType('呼出类型')">呼出类型</button>
        </div>
      </div>
      <div class="category-chart-wrap">
        <div id="category"></div>
        <stats-chart-empty v-if="categoryEmpty">暂无数据</stats-chart-empty>
      </div>
      <div class="stats-staff-category-wrap" v-if="showTable">
        <div class="stats-table-header">
          <h3>通话列表</h3>

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
              
            <template v-if="categoryType == '满意度'">
              <el-table-column label="满意度" prop="degree" width="100px"></el-table-column>   
            </template>

            <template v-if="categoryType == '效率'">
              <el-table-column label="响应用时" width="180px">
                <template slot-scope="scope">
                  {{formatterTime(scope.row.acceptUsedTime)}}
                </template>
              </el-table-column>
              <el-table-column label="工作用时" width="180px">
                <template slot-scope="scope">
                  {{formatterTime(scope.row.workUsedTime)}}
                </template>
              </el-table-column>      
              <el-table-column label="事件用时" width="180px">
                <template slot-scope="scope">
                  {{formatterTime(scope.row.finishUsedTime)}}
                </template>
              </el-table-column>      
            </template>

            <el-table-column label="状态" width="120px">
              <template slot-scope="scope">
                {{formatState(scope.row.state)}}
              </template>
            </el-table-column>
            <el-table-column label="负责人" prop="executorName" width="120px"></el-table-column>
 
            <el-table-column label="创建人" prop="createUserName" width="120px"></el-table-column>
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
/* global AMap, moment, _init_data*/
import $ from 'jQuery';
import _ from 'lodash';
import http from 'src/util/HttpUtil';
import qs from 'src/util/QueryString';

import echarts from 'packages/Echarts';

import Loading from 'packages/BaseLoading';
import BaseCheckbox from 'packages/BaseCheckbox.vue';
import SampleTooltip from 'packages/SampleTooltip'

const USER_EVENT_LEGEND = ['新增', '完成'];
const USER_EVENT_COLOR = ['#6da9e7', '#48e8ab'];

const USER_DEGREE_LEGEND = ['满意', '一般', '不满意'];
const USER_DEGREE_COLOR = ['#48e8ab', '#6da9e7', '#ffdd92'];

const USER_EFFICIENCY_LEGEND = ['平均响应用时', '平均工作用时', '平均事件用时'];
const USER_EFFICIENCY_COLOR = ['#48e8ab', '#6da9e7', '#ffdd92'];

let category = null;

export default {
  name: 'staff-category-chart',
  props: ['evaluateConfig'],
  data(){
    return {
      tag: [],
      sort: '',
      categoryType: '事件',
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
      let categoryStartTime = this.categoryStartTime.replace(/\-/g, '/'),
        categoryEndTime = this.categoryEndTime.replace(/\-/g, '/');

      let model = {
        createTime:`${categoryStartTime}-${categoryEndTime}`, 
        // executor: this.model.userId,
        tagId: this.categoryTeamId,
        timeType: 3,
        pageSize: 0
      };

      if (this.categoryType == '满意度') model.degree = 'all';

      if(this.categoryType == '效率') model.isEfficial = true;
    
      window.location.href = `/event/sum/personal/listExport?${qs.stringify(model)}`;
    },
    exportData(){
      let categoryStartTime = this.categoryStartTime.replace(/\-/g, '/'),
        categoryEndTime = this.categoryEndTime.replace(/\-/g, '/');

      let model = {
        createTime:`${categoryStartTime}-${categoryEndTime}`, 
        executor: this.model.userId,
        tagId: this.categoryTeamId,
        timeType: this.model.timeType,
        pageSize: 0
      };

      if (this.categoryType == '满意度') model.degree = this.model.degree;

      if(this.categoryType == '效率') model.isEfficial = true;

      window.location.href = `/event/sum/personal/listExport?${ qs.stringify(model)}`;
    },
    openDetail(event){
      event.preventDefault();
    
      let el = event.target;
      let fromId = window.frameElement.getAttribute('id');

      parent.window.addTabs({
        id: `eventView_${ el.dataset.id}`, 
        title: '正在加载', 
        close: true, 
        url: el.getAttribute('href'),
        fromId
      });
      parent.window.resizeFrame();
    },
    fetchTableData(){
      let categoryStartTime = this.categoryStartTime.replace(/\-/g, '/'),
        categoryEndTime = this.categoryEndTime.replace(/\-/g, '/')
      let model = {
        createTime:`${categoryStartTime}-${categoryEndTime}`, 
        tagId: this.categoryTeamId,
        executor: this.model.userId,
        timeType: this.model.timeType,
        pageNum: this.model.pageNum
      };
      if (this.categoryType == '满意度') model.degree = this.model.degree;
      return http.get('/event/sum/personal/list', model);
    },
    async renderTable(){
      let instance = this.$loading.show(this.$el);

      try {
        const res = await this.fetchTableData();
        this.page = res.data;
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
      category = echarts.init(document.getElementById('category'));
      category.on('click', event => {
        
        let seriesName = event.seriesName;
        let origin = event.data._origin;
                
        let selectType = 1;
        if(seriesName == '完成') selectType = 2;
        if(seriesName == '满意' || seriesName == '一般' || seriesName == '不满意') this.model.degree = seriesName;
        
        this.model.pageNum = 1;
        this.model.userId = origin.executor;
        this.model.timeType = selectType;

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

        if(this.categoryType == '事件') {
          let sort = this.sortEventTable();
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
      // 初始化时间控件
      this.initDateRangePicker(start, end);
      
      this.categoryStartTime = start.format('YYYY-MM-DD');
      this.categoryEndTime = end.format('YYYY-MM-DD');
      this.renderCategory();
    },
    initDateRangePicker(start, end) {
      $('#staff-date-range').daterangepicker(
        {
          startDate: start,
          endDate: end,
          applyClass: 'btn-primary',
          opens: 'left',
          format: 'YYYY-MM-DD',
          dateLimit: {years: 1},
          ranges: {
            今天: [moment(), moment()],
            昨天: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            最近7天: [moment().subtract(6, 'days'), moment()],
            最近30天: [moment().subtract(29, 'days'), moment()],
            这个月: [moment().startOf('month'), moment()],
            上个月: [
              moment().subtract(1, 'month').startOf('month'),
              moment().subtract(1, 'month').endOf('month')
            ]
          },
          locale: {
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '开始',
            toLabel: '结束',
            customRangeLabel: '自定义',
            daysOfWeek: '日_一_二_三_四_五_六'.split('_'),
            monthNames: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_')
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

      this.categoryStartTime = start.format('YYYY-MM-DD');
      this.categoryEndTime = end.format('YYYY-MM-DD');
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
        const res = await this.fetchCategoryData();
        
        this.categoryData = res.data;

        instance.hide();
        this.showTable = false;
      
        this.categoryType = '事件';
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
      if(this.categoryType == '事件'){
        let taskOption = this.getCategoryEventOption();
        if(taskOption) option = this.getCategoryOption(taskOption);
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
      let categoryStartTime = this.categoryStartTime.replace(/\-/g, '/'),
        categoryEndTime = this.categoryEndTime.replace(/\-/g, '/')
      let params = {
        createTime:`${categoryStartTime}-${categoryEndTime}`, 
        tagId: this.categoryTeamId,
        hide: !this.categoryIgnoreNull
      };
      return http.get('/event/sum/finish', params)
    },
    getCategoryEfficiencyOption(){
      let ctx = this;
      let time = this.categoryData.time || {};
      let data = [];
      for(let name in time){
        data.push(time[name]);
      }
      if(data.length == 0){
        this.categoryEmpty = true;
        return 
      }
      this.categoryEmpty = false;      

      if(data.length == 0) return null;
      let yAxisData = [];
      let series = [];
      let aauTime = []; // 平均响应用时
      let atuTime = []; // 平均工作用时
      let awuTime = []; // 平均事件用时

      let maxData = 0;
      // data.sort((prev, next) => prev.AverageAcceptUsedTime - next.AverageAcceptUsedTime);
      data.forEach(item => {
        yAxisData.push(item.executorName);

        aauTime.push({
          value: item.acceptAvg, 
          _origin: item
        });

        atuTime.push({
          value: item.workAvg,
          _origin: item
        });

        awuTime.push({
          value: item.finishAvg,
          _origin: item
        });

        // if(item.acceptAvg >= maxData) maxData = parseFloat(item.acceptAvg);
        // if(item.workAvg >= maxData) maxData = parseFloat(item.workAvg);
        // if(item.finishAvg >= maxData) maxData = parseFloat(item.finishAvg);
        
        let maxAvg = Math.max(item.acceptAvg, item.workAvg, item.finishAvg, maxData); 
        if(isNaN(maxAvg)){
          return false;
        }
        maxData = maxAvg;

      });

      series.push({
        name: USER_EFFICIENCY_LEGEND[0],
        type: 'bar',
        barMaxWidth: '30px',
        data: aauTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[1],
        type: 'bar',
        barMaxWidth: '30px',
        data: atuTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[2],
        type: 'bar',
        barMaxWidth: '30px',
        data: awuTime
      })

      let interval = this.computeInterval(maxData);

      let option = {
        title: '人员效率统计',
        legend: USER_EFFICIENCY_LEGEND,
        color: USER_EFFICIENCY_COLOR,
        tooltip: {
          formatter(data){
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
            formatter (value, index) {
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
      let time = this.categoryData.time || {};
      let data = [];
      for(let name in time){
        data.push(time[name]);
      }

      if(data.length == 0) return null;
      let yAxisData = [];
      let series = [];
      let aauTime = []; // 平均接单用时
      let atuTime = []; // 平均工单用时
      let awuTime = []; // 平均工作用时

      let maxData = 0;

      if(this.sort == '平均响应用时') {
        data.sort((prev, next) => prev.acceptAvg - next.acceptAvg);
      } else if(this.sort == '平均工作用时') {
        data.sort((prev, next) => prev.workAvg - next.workAvg);
      } else {
        data.sort((prev, next) => prev.finishAvg - next.finishAvg);
      }
      data.forEach(item => {
        yAxisData.push(item.executorName);

        aauTime.push({
          value: item.acceptAvg, 
          _origin: item
        });

        atuTime.push({
          value: item.workAvg,
          _origin: item
        });

        awuTime.push({
          value: item.finishAvg,
          _origin: item
        });

        if(item.acceptAvg >= maxData) maxData = item.acceptAvg;
        if(item.workAvg >= maxData) maxData = item.workAvg;
        if(item.finishAvg >= maxData) maxData = item.finishAvg;
      });

      series.push({
        name: USER_EFFICIENCY_LEGEND[0],
        type: 'bar',
        barMaxWidth: '30px',
        data: aauTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[1],
        type: 'bar',
        barMaxWidth: '30px',
        data: atuTime
      })

      series.push({
        name: USER_EFFICIENCY_LEGEND[2],
        type: 'bar',
        barMaxWidth: '30px',
        data: awuTime
      })

      return {
        series,
        yAxisData
      }
    },
    getCategoryEventOption(){      
      let event = this.categoryData.event || {};
      let data = [];
      for(let name in event){
        data.push(event[name]);
      }
      if(data.length == 0){
        this.categoryEmpty = true;
        return 
      }
      this.categoryEmpty = false;
     
      let yAxisData = [];
      let createdData = [];
      let finishedData = [];
      let series = [];
      
      data.forEach(item => {
        yAxisData.push(item.executorName);
        createdData.push({
          value: item.count,
          _origin: item
        });
        finishedData.push({
          value: item.eCount,
          _origin: item
        });
      });
      
      series.push({
        name: USER_EVENT_LEGEND[0],
        type: 'bar',
        barMaxWidth: '30px',
        data: createdData
      })

      series.push({
        name: USER_EVENT_LEGEND[1],
        type: 'bar',
        barMaxWidth: '30px',
        data: finishedData
      })

      return {
        title: '人员事件统计',
        legend: USER_EVENT_LEGEND,
        color: USER_EVENT_COLOR,
        yAxisData,
        series
      }
    },
    sortEventTable () {
      let event = this.categoryData.event || {};
      let data = [];
      for(let name in event){
        data.push(event[name]);
      }

      if(data.length == 0) return null;

      let yAxisData = [];
      let createdData = [];
      let finishedDate = [];
      let series = [];
      
      if(this.sort == '完成') {
        data.sort((prev, next) => prev.eCount - next.eCount);
      } else {
        data.sort((prev, next) => prev.count - next.count);
      }
      data.forEach(item => {
        yAxisData.push(item.executorName);
        createdData.push({
          value: item.count,
          _origin: item
        });
        finishedDate.push({
          value: item.eCount,
          _origin: item
        });
      });

      series.push({
        name: USER_EVENT_LEGEND[0],
        type: 'bar',
        barMaxWidth: '30px',
        data: createdData
      })

      series.push({
        name: USER_EVENT_LEGEND[1],
        type: 'bar',
        barMaxWidth: '30px',
        data: finishedDate
      })

      return {
        series,
        yAxisData
      }
    },
    getCategoryDegreeOption(){
      let series = [];
      let data = [];
      let degree = this.categoryData.degree || {};
      // let degree = {"1676d835-7f76-11e8-8546-00163e304a25": {"executorName": "殷海峰","满意": "3","一般": "4","executor": "1676d835-7f76-11e8-8546-00163e304a25","不满意": "5"}} 
      for(let name in degree){
        data.push(degree[name]);
      }
      if(data.length == 0) return null;

      let yAxisData = [];
      let satisData = [];// 满意
      let generaldData = [];// 一般
      let unsatisData = []; // 不满意

      data.forEach(item => {
        yAxisData.push(item.executorName);
        satisData.push({
          value: item['满意'],
          _origin: item
        });
        generaldData.push({
          value: item['一般'],
          _origin: item
        });
        unsatisData.push({
          value: item['不满意'],
          _origin: item
        });
      });

      series.push({
        name: USER_DEGREE_LEGEND[0],
        type: 'bar',
        barMaxWidth: '30px',
        stack: '满意度',
        data: satisData
      })

      series.push({
        name: USER_DEGREE_LEGEND[1],
        type: 'bar',
        barMaxWidth: '30px',
        stack: '满意度',
        data: generaldData
      })

      series.push({
        name: USER_DEGREE_LEGEND[2],
        type: 'bar',
        barMaxWidth: '30px',
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
      let degree = this.categoryData.degree || {};
      let data = [];
      for(let name in degree){
        data.push(degree[name]);
      }

      if(data.length == 0) return null;

      let yAxisData = [];
      let satisData = [];// 满意
      let generaldData = [];// 一般
      let unsatisData = []; // 不满意

      data.sort((prev, next) => prev[this.sort] - next[this.sort]);

      data.forEach(item => {
        yAxisData.push(item.executorName);
        satisData.push({
          value: item['满意'],
          _origin: item
        });
        generaldData.push({
          value: item['一般'],
          _origin: item
        });
        unsatisData.push({
          value: item['不满意'],
          _origin: item
        });
      });

      series.push({
        name: USER_DEGREE_LEGEND[0],
        type: 'bar',
        barMaxWidth: '30px',
        stack: '满意度',
        data: satisData
      })

      series.push({
        name: USER_DEGREE_LEGEND[1],
        type: 'bar',
        barMaxWidth: '30px',
        stack: '满意度',
        data: generaldData
      })

      series.push({
        name: USER_DEGREE_LEGEND[2],
        type: 'bar',
        barMaxWidth: '30px',
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
          top: '10px',
          left: '70px'
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
      // const DAY_SEC = 60 * 60 * 24;
      const HOUR_SEC = 60 * 60;
      const MIN_SEC = 60;

      // let day = sec / DAY_SEC >> 0;
      // sec = sec % DAY_SEC;

      let hour = sec / HOUR_SEC >> 0;
      sec = sec % HOUR_SEC;

      let min = sec / MIN_SEC >> 0;
      sec = sec % MIN_SEC;

      let temp = '';
      // if(day > 0) temp += day + '天';
      if(hour > 0) temp += `${hour }时`;
      if(min > 0) temp += `${min }分`;
      if(sec > 0) temp += `${sec }秒`;

      return temp ? temp : '--';
    },
    // 计算最大时间间隔
    computeInterval(sec){
      let interval = {
        min: 0,
        max: null
      }
      
      // 如果时间跨度不大于1小时
      if(sec <= 3600){
        // 以分钟为最小刻度
        interval.min = 60 ;
        // 以10分钟为最大刻度
        interval.max = 60 * 10;
        return interval;
      }

      // 如果时间跨度小于1天
      if(sec <= 3600 * 24){
        // 以小时为最小刻度
        interval.min = 3600;
        return interval;
      }

      // 如果时间跨度大于1天，则按6份划分
      let hour = sec / 3600 >> 0;
      interval.max = (hour / 6 >> 0) * 3600;
      interval.min = 3600;
      return interval
    },
    formatState (state) {
      // {"created":"待指派","allocated":"已指派","accepted":"已接受","refused":"已拒绝","processing":"进行中"}   
      let stateName = '';
      switch (state) {
      case 'created':
        stateName = '待指派';
        break;
      case 'allocated':
        stateName = '已指派';
        break;
      case 'accepted':
        stateName = '已接受';
        break;
      case 'refused':
        stateName = '已拒绝';
        break;
      case 'processing':
        stateName = '进行中';
        break;
      case 'finished':
        stateName = '已完成';
        break;
      case 'convert2Task':
        stateName = '转为工单';
        break;
      default:
        break;
      }
      return stateName;
    }
  },
  mounted(){
    this.initCategory(moment().subtract(6, 'days'), moment());
    window.addEventListener('resize', _.debounce(function(){
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

