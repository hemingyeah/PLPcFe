<template>
  <div class="stats-part-use stats-panel-body">
    <div class="stats-panel-head stats-form">
      <h3>备件使用统计
        <el-popover trigger="hover">
          <ul>
            <li>备件使用-类别：周期内使用的备件类别分项总数量</li>
            <li>备件使用-数量：周期内在工单上关联使用的备件总数量</li>
            <!-- <li>备件使用-费用：周期内工单上关联使用的备件费用排名</li> -->
            <li>个人备件库-数量：显示当前团队的个人备件库持有备件数量排名</li>
            <li>个人备件库-金额： 显示当前团队的个人备件库持有备件金额排名</li>
          </ul>
          <stats-popover-icon slot="reference"></stats-popover-icon>
        </el-popover>
      </h3>
      <biz-team-select class="stats-team-select" :value="tag" @input="chooseCategoryTeam" :fetchFunc="fetchTeam"/>

      <!-- <div class="stats-form-group">
        <select @change="chooseCategoryTeam">
          <option value="">全部团队</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">{{team.name}}</option>
        </select>
      </div> -->
    </div>
    <div style="text-align: center;">
      <div class="stats-btn-group">
        <button type="button" :class="{'stats-checked': categoryType == 'applyType'}" @click="chooseCategoryType('applyType')">备件使用-类别</button>
        <button type="button" :class="{'stats-checked': categoryType == 'applySingle'}" @click="chooseCategoryType('applySingle')">备件使用-数量</button>
        <!-- <button type="button" :class="{'stats-checked': categoryType == 'applyPrice'}" @click="chooseCategoryType('applyPrice')">备件使用-费用</button> -->
        <button type="button" :class="{'stats-checked': categoryType == 'personalNum'}" @click="chooseCategoryType('personalNum')">个人备件库-数量</button>
        <button type="button" :class="{'stats-checked': categoryType == 'personalPrice'}" @click="chooseCategoryType('personalPrice')">个人备件库-金额</button>
      </div>
    </div>
    <div class="category-chart-wrap">
      <div id="categoryPartUse"></div>
      <div class="stats-table-expand no-border" v-if="categoryType != 'applyType'">
        <button type="button" @click="categoryMore" :disabled="!moreBtn">
          <span v-if="moreBtn" class="load-more-data-btn">加载更多</span>
          <span v-if="!moreBtn && !categoryEmpty" class="disabled-load-more-data-btn">数据加载完毕</span>
        </button>
      </div>
      <stats-chart-empty v-if="categoryEmpty">暂无数据</stats-chart-empty>
    </div>
    <div class="stats-staff-category-wrap" v-if="showTable">
      <div class="stats-table-header">
        <h3>备件列表</h3>

        <button type="button" class="btn btn-primary btn-sm" @click="exportData">导出</button>          
        <button type="button" class="btn btn-primary btn-sm" @click="exportAllData">导出全部</button>
        <button type="button" class="btn btn-primary btn-sm" @click="showTable = false">收起</button>
      </div>
      <div>
        <el-table :data="page.list" class="stats-table">

          <el-table-column label="类别" v-if="this.categoryType == 'applyType'" prop="sparepart.type"></el-table-column>
          <el-table-column label="备件编号" prop="sparepart.serialNumber" :show-overflow-tooltip="false">
            <template slot-scope="scope">
              <sample-tooltip :row="scope.row.sparepart">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip :content="scope.row.sparepart.serialNumber" placement="top" :disabled="!isContentTooltip">
                    <span>{{ scope.row.sparepart.serialNumber }}</span>
                  </el-tooltip>
                </template>
              </sample-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="备件名称" prop="sparepart.name"></el-table-column>
          <el-table-column width="150" label="备件规格" prop="sparepart.standard"></el-table-column>   
          <el-table-column label="工单编号" v-if="this.categoryType == 'applySingle'" prop="taskNo" width="150px"></el-table-column>
          <el-table-column label="客户名称" v-if="this.categoryType == 'applySingle'" prop="customerName" min-width="240px"></el-table-column> 
          <el-table-column v-if="this.categoryType == 'applySingle'" label="操作人" prop="executorName" min-width="120px"></el-table-column>
          <el-table-column label="操作时间" v-if="this.categoryType == 'applySingle'" width="180px">
            <template slot-scope="scope">
              {{scope.row.createTime | fmt}}
            </template>
          </el-table-column>
          <el-table-column v-if="this.categoryType == 'personalNum' || this.categoryType == 'personalPrice'" label="操作人" prop="userName" min-width="120px"></el-table-column>
          <el-table-column width="120" v-if="this.categoryType == 'applySingle' || this.categoryType == 'applyPrice'" label="用量" prop="num"></el-table-column>
          <el-table-column width="120" v-if="this.categoryType == 'personalNum' || this.categoryType == 'personalPrice'" label="数量" prop="num"></el-table-column>   
          <el-table-column width="120" v-if="this.categoryType == 'applyType'" label="数量" prop="number"></el-table-column>                   
          <el-table-column label="金额（元）" v-if="this.categoryType != 'applySingle' && this.categoryType != 'applyType'" prop="sparepart.salePrice">
            <template slot-scope="scope">
              {{ scope.row.sparepart.salePrice.toFixed(2) }}
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
/*global AMap, moment, _init_data*/
import _ from 'lodash';
import qs from 'src/util/QueryString';
import http from 'src/util/HttpUtil';
import echarts from "packages/Echarts";
import Loading from 'packages/BaseLoading';
import BaseCheckbox from 'packages/BaseCheckbox.vue';
import SampleTooltip from 'packages/SampleTooltip'

let categoryPartUse = null;


export default {
  name: 'stats-part-use',
  props: {
    categoryStartTime:{
      type:String,
      default:moment().subtract(6, "days").format("YYYY-MM-DD")
    },
    categoryEndTime:{
      type:String,
      default:moment().format("YYYY-MM-DD")
    },
    // teams:{
    //   type:Array,
    //   default:[]
    // }
  },
  data(){
    return {
      tag: [],
      categoryTeamId: '', //选中的团队ID

      categoryType: "applyType", //tab
      aboutTab:{ //每个tab下对应的数据
        applyType:{
          title:'备件使用-类别统计',
          echatr_url:'/stats/sparepart/usageCategoryPie',
          table_url:'/stats/sparepart/usageCategoryTable',
          export_url:'/stats/sparepart/exportUsageCategory',
          export_all_url:'/stats/sparepart/exportUsageCategory',
          data:[],
          total:0,
          flag:false //是否已经请求过该tab下的数据
        },
        applySingle:{
          legend: ['备件数量'],
          title:'备件使用-数量统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/usageAmountHistogram',
          table_url:'/stats/sparepart/usageAmountTable',
          export_url:'/stats/sparepart/exportUsageAmount',
          export_all_url:'/stats/sparepart/exportUsageAmountAll',
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false //是否已经请求过该tab下的数据
        },
        applyPrice:{
          legend: ['备件金额'],
          title:'备件使用-金额统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/usagePriceHistogram',
          table_url:'/stats/sparepart/usagePriceTable',
          export_url:'/stats/sparepart/exportUsagePrice',
          export_all_url:'/stats/sparepart/exportUsagePriceAll',
          totalNum:0,
          totalPrice:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        personalNum:{
          legend: ['备件数量'],
          title:'个人备件库-数量统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/personalByUserHistogram',
          table_url:'/stats/sparepart/personalByUserTable',
          export_url:'/stats/sparepart/exportPersonalByUser',
          export_all_url:'/stats/sparepart/exportPersonalByUserAll',
          totalNum:0,
          totalPrice:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        personalPrice:{
          legend: ['备件金额'],
          title:'个人备件库-金额统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/personalBySparepartHistogram',
          table_url:'/stats/sparepart/personalBySparepartTable',
          export_url:'/stats/sparepart/exportPersonalBySparepart',
          export_all_url:'/stats/sparepart/exportPersonalBySparepartAll',
          totalNum:0,
          totalPrice:0,
          data:[],
          page:1,
          total:0,
          flag:false
        }
      },
      moreBtn:true, //是否显示加载更多
      categoryEmpty:false, //是否显示暂无数据
      
      showTable: false, //是否展示表单
      model: { //点击柱状图参数
        pageNum: 1,
        partId:''
      },
      page: {}, //表格数据

      loading: true
    }
  },
  methods: {
    fetchTeam(params){
      return http.post('/security/tag/list', {...params, ...{authKey: 'VIP_REPORT_VIEW'}})
    },
    exportData(){ //导出
      let model = {};
      if(this.categoryType == 'applySingle' || this.categoryType == 'applyPrice') {
        model.tagId = this.categoryTeamId;
        model.partId = this.model.partId;
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }
      if(this.categoryType == 'personalNum') model.userId = this.model.userId;
      if(this.categoryType == 'personalPrice') {
        model.partId = this.model.partId;
        model.tagId = this.categoryTeamId;
      }    
      if(this.categoryType == 'applyType') {
        model.type = this.model.type;
        model.tagId = this.categoryTeamId;
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }
      window.location.href = this.aboutTab[this.categoryType].export_url + '?' + qs.stringify(model);
    },
    exportAllData(){ //导出全部
      let model = {
        tagId:this.categoryTeamId
      };
      if(this.categoryType == 'applySingle' || this.categoryType == 'applyPrice') {
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }
      if(this.categoryType == 'applyType') {
        model.tagId = this.categoryTeamId;
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }
      window.location.href = this.aboutTab[this.categoryType].export_all_url + '?' + qs.stringify(model);
    },
    async initCategory(){ //页面初始化
      categoryPartUse = echarts.init(document.getElementById("categoryPartUse"));
      categoryPartUse.on('click', event => {
        let origin = event.data._origin;               

        this.model.pageNum = 1;
        if(this.categoryType == 'applyType') {
          this.model.type = origin.name;
        } else if(this.categoryType == 'personalNum') {
          this.model.userId = origin.userSparepart.userId;
        } else {
          this.model.partId = origin.sparepart.id;
        }       
        
        this.renderTable()
      })

      this.renderCategory();
    },
    chooseCategoryTeam(value){ //选择团队
      this.$emit('trackEvent', 'chooseTeam');

      let tag = (Array.isArray(value) ? value[0] : value) || {};
      this.tag = value;
      this.categoryTeamId = tag.id;
      this.clear();
      this.renderCategory();
    },
    chooseCategoryType(type){ //tab切换
      this.$emit('trackEvent', type);

      this.categoryType = type;
      this.moreBtn = true;
      if(!this.aboutTab[type].flag) {
        this.renderCategory();
      } else {
        this.setCategoryOption();
      }      
    },
    async renderCategory(){ //获取柱状图数据并且显示
      try {
        let instance = Loading.show(this.$el);
        this.$emit('disable', true);
        let data = await this.fetchCategoryData();
        this.aboutTab[this.categoryType].data = this.aboutTab[this.categoryType].data.concat(data.list);
        this.aboutTab[this.categoryType].flag = true;
        this.aboutTab[this.categoryType].total = data.total;
        this.aboutTab[this.categoryType].totalNum = data.totalNum;
        if(this.categoryType == 'personalPrice' || this.categoryType == 'applyPrice' || this.categoryType == 'personalNum'){
          this.aboutTab[this.categoryType].totalPrice = data.totalPrice;
        }

        instance.hide();
        this.$emit('disable', false);
      
        this.setCategoryOption();
      } catch (error) {
        console.log(error)
      }
    },
    fetchCategoryData(){ //获取柱状图数据
      let params = {
        tagId:this.categoryTeamId,
      };
      if(this.categoryType == 'applySingle' || this.categoryType == 'applyPrice') {
        params.timeStart = `${this.categoryStartTime} 00:00:00`;
        params.timeEnd = `${this.categoryEndTime} 23:59:59`;
        params.pageSize = 10;
        params.pageNum = this.aboutTab[this.categoryType].page;
      }
      if(this.categoryType == 'personalPrice' || this.categoryType == 'personalNum') {
        params.pageSize = 10;
        params.pageNum = this.aboutTab[this.categoryType].page;
      }
      if(this.categoryType == 'applyType') {
        params.timeStart = `${this.categoryStartTime} 00:00:00`;
        params.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }
      return http.get(this.aboutTab[this.categoryType].echatr_url, params)
    },
    categoryMore(){ //加载更多柱状图数据  
      this.aboutTab[this.categoryType].page ++;   
      this.renderCategory();
    },
    setCategoryOption(){ //使用指定的配置项和数据显示图表。
      this.categoryEmpty = false;
      categoryPartUse.clear();

      let option = null;
      let outOption;
      
      if(this.categoryType == 'applyType') {
        outOption = this.getTypeCategoryOutOption();
        if(outOption) option = this.getTypeCategoryOption(outOption);
      } else {
        outOption = this.getCategoryOutOption();
        if(outOption) option = this.getCategoryOption(outOption);
      }
      
      
      if(null == option){
        this.categoryEmpty = true;
        this.moreBtn = false;
        return
      }
      if(this.aboutTab[this.categoryType].data.length >= this.aboutTab[this.categoryType].total) {
        this.moreBtn = false;
      }

      categoryPartUse.setOption(option);
    },
    getTypeCategoryOutOption(){
      let obj = this.aboutTab[this.categoryType];
      let arr = [];
      arr = obj.data || [];
      if(arr.length == 0) return null;

      let sum = 0;
      let legend = [];
      let series = [];
      let data = [];

      arr.forEach(item => {
        sum = this.$math.format(this.$math.add(this.$math.bignumber(item.number), this.$math.bignumber(sum)));
        // sum += item.number;
        legend.push(item.type);

        data.push({
          name: item.type,
          value: item.number,
          _origin: {
            name: item.type,
            value: item.number
          }
        })
      })

      series.push({
        name: '备件类别',
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
      });
      return {
        title: '合计：' + sum,
        legend: legend,
        series
      }
    },
    getTypeCategoryOption(option){
      let _option = {
        color: ["#2ec7c9","#ffb980","#5ab1ef","#d87a80","#5f5f6e","#07a2a4","#9a7fd1","#588dd5","#c05050","#f5994e","#59678c","#7eb00a","#749f83"],
        tooltip : {
          trigger: 'item',
          formatter: "{b} <br/> 数量: {c} ({d}%)"
        },
        title: {
          show: true,
          subtext: option.title,
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
              name: "备件使用-类别统计"
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
          data: option.legend,
          type: 'scroll'
        },
        series: option.series
      };

      return _option;
    },
    getCategoryOutOption() { //将获取到的数据组装成柱状图需要的格式
      let obj = this.aboutTab[this.categoryType];
      let data = [];
      data = obj.data || [];
      let info = '';
      if(data.length == 0) return null;

      let yAxisData = [];
      let partNum = [];
      let series = [];
     
      if(this.categoryType == 'applySingle'){
        data.forEach(item => {
          yAxisData.unshift(item.sparepart.name);
          partNum.unshift({
            value: item.num,
            _origin: item
          });
        });
        info = '合计：' + obj.totalNum;
      }
      if(this.categoryType == 'applyPrice') {
        data.forEach(item => {
          yAxisData.unshift(item.sparepart.name);
          partNum.unshift({
            value: item.sparepart.salePrice,
            _origin: item
          });
        });    
        info = '合计数量：' + obj.totalNum + '             合计金额：' + obj.totalPrice + '元';
      }
      if(this.categoryType == 'personalNum'){
        data.forEach(item => {
          yAxisData.unshift(item.userSparepart.userName);
          partNum.unshift({
            value: item.userSparepart.repertoryCount,
            _origin: item
          });
        });
        info = '合计数量：' + obj.totalNum + '             合计金额：' + obj.totalPrice + '元';
      }      
      if(this.categoryType == 'personalPrice') { 
        data.forEach(item => {
          yAxisData.unshift(item.sparepart.name);
          partNum.unshift({
            value: item.sparepart.salePrice,
            _origin: item
          });
        });
        info = '合计数量：' + obj.totalNum + '             合计金额：' + obj.totalPrice + '元';
      }

      series.push({
        name: obj.legend[0],
        type: "bar",
        barMaxWidth: "30px",
        data: partNum,
        label: {
          normal: {
            show: true,
            position: 'insideLeft',
            color:'#333',
            formatter:function(v){
              return `{style|${v.data.value}}`;
            },
            rich:{
              style:{
                color: '#fff',
                fontSize: '13px',
                textBorderColor: '#6da9e7',
                textBorderWidth: 2
              }
            }
          }
        }
      })

      return {
        info: info,
        title: obj.title,
        legend: obj.legend,
        color: obj.color,
        yAxisData,
        series
      }
    },
    getCategoryOption(option) { //指定图表的配置项和数据
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
        title: {
          show: true,
          subtext: option.info,
          right: 150,
          top: 0,
          subtextStyle: {
            color: '#666',
            fontSize: 14
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
          right: 40,
          top:5
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
          data: option.yAxisData,
          axisLabel: {
            formatter: function(value) {
              if (value.length > 10) {
                return value.substring(0, 10) + "...";
              } else {
                return value;
              }
            }
          }
        },
        xAxis: {
          type: 'value'
        },
        series: option.series
      };

      return _option;
    },
    async renderTable(){ //点击柱状图获取表格数据
      let instance = this.$loading.show(this.$el);
    
      try {
        this.page = await this.fetchTableData();
        this.showTable = true;
      } catch (error) {
        console.log(error);
      }

      instance.hide();
    },
    fetchTableData() { //获取表格数据
      let model = {
        pageNum:this.model.pageNum
      };
      if(this.categoryType == 'applyType') {
        model.tagId = this.categoryTeamId;
        model.type = this.model.type;
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      } else if(this.categoryType == 'applySingle' || this.categoryType == 'applyPrice') {
        model.tagId = this.categoryTeamId;
        model.partId = this.model.partId;
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      } else if(this.categoryType == 'personalNum') {
        model.userId = this.model.userId;
      } else {
        model.partId = this.model.partId;
        model.tagId = this.categoryTeamId;
      }

      return http.get(this.aboutTab[this.categoryType].table_url, model);
    },
    jump(currentPage){ //点击表格页数
      this.model.pageNum = currentPage;
      this.renderTable();
    },
    clear() {      
      let aboutTab = { 
        applyType:{
          data:[],
          total:0,
          flag:false //是否已经请求过该tab下的数据
        },
        applySingle:{        
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false //是否已经请求过该tab下的数据
        },
        applyPrice:{          
          totalPrice:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        personalNum:{          
          totalPrice:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        personalPrice:{          
          totalPrice:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false
        }
      };
      for(let item in this.aboutTab) {
        _.assign(this.aboutTab[item], aboutTab[item]);
      }
      this.moreBtn = true;
      this.categoryEmpty = false;
      this.showTable = false;
    },
    initModel(){
      this.clear();
      this.renderCategory();
    }
  },
  mounted(){
    this.initCategory();
    window.addEventListener('resize',_.debounce(function(){
      categoryPartUse.resize();
    }, 400))
  },
  watch: {
    categoryType(){
      this.showTable = false;
    }
  },
  components: {
    BaseCheckbox,
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>

<style lang="scss">
#categoryPartUse{
  height: 520px;
}
.category-chart-wrap{
  width: 100%;
  position: relative;
}
.category-more{
  text-align:center;
  color:rgb(15, 5, 168);
  height:40px;
  font-size:14px;
  text-decoration:underline;
  span{
    cursor: pointer;
  } 
}
.stats-part-head{
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 15px 0;
}

.stats-part-card{
  flex: 1;
  margin-left: 15px;
  border-radius: 2px;
  background-color: #fff;
  text-align: center;

  p{
    padding: 15px;
    margin: 0;
    font-size: 14px;
  }

  h3{
    font-weight: 400;
    font-size: 24px;
    color: #2d9cf5;
    margin: 0;
    padding: 5px 0 20px 0;

    a{
      color: #2d9cf5;
    }
  }

  &:first-child{
    margin-left: 0;
  }
}
.stats-panel-body{
  background:#fff;
}
.stats-part-card-bottom{
  border-top: 1px solid #eee;
  background: #fafafa;
  border-radius: 0 0 2px 2px;
  padding: 18px 0;
  font-size: 13px;
}

.stats-part-panel{
  .stats-form{
    justify-content: flex-end;
  }
}

.stats-part-use{ 
  margin:15px 7.5px;
  .category-chart-wrap{
    height:auto;
  }
}

.load-more-data-btn {
  color: #6da9e8;
}

.disabled-load-more-data-btn {
  color: #9a9a9a;
}
</style>
