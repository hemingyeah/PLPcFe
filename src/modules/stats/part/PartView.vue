<template>
  <div class="stats-container">
    <div v-if="chooseStock || chooseUse" class="stock-shade"></div>
    <div v-if="chooseStock" class="stock-shade stock-shade1"></div>
    <div class="store-time stats-form">
      <div class="stats-form-group" v-if="stockStats">
        <select @change="chooseCategoryStock" v-model="categoryStockId" :disabled="chooseStock">
          <option value="">全部仓库</option>
          <option v-for="stock in partStock" :key="stock.id" :value="stock.id">{{stock.name}}</option>
        </select>
      </div>
      <div class="stats-form-group">
        <div class="stats-form-daterange" id="stock-date-range">
          <span>{{categoryStartTime}} - {{categoryEndTime}}</span> 
          <b class="caret"></b>
        </div>
      </div>
    </div>
    <stats-part-stock @disable="isChoose" ref="stats1"
      v-if="stockStats && init" 
      :source="isStock ? 1 : 0" 
      :categoryStockId="categoryStockId" 
      :categoryStartTime="categoryStartTime" 
      :categoryEndTime="categoryEndTime"
      @trackEvent="spsTrackEventHandler"></stats-part-stock>
    <stats-part-use @disable="isChoose1" ref="stats2"
      v-if="useStats && init" 
      :categoryStartTime="categoryStartTime" 
      :categoryEndTime="categoryEndTime"
      @trackEvent="spuTrackEventHandler"></stats-part-use>
  </div>
</template>

<script>
/*global AMap, moment, _init_data*/
import $ from "jQuery";
import qs from 'src/util/QueryString';
import AuthUtil from 'src/util/auth';
import StatsPartStock from './StatsPartStock.vue'
import StatsPartUse from './StatsPartUse.vue'

export default {
  name: 'part-view',
  data(){
    return {
      init:false,
      auths: {},
      partStock:[],
      // teams: [],
      categoryStartTime: '', //开始时间
      categoryEndTime: '', //结束时间
      categoryStockId: '', //选中的仓库ID   
      isStock:false, //是否从备件仓库打开
      chooseStock:false, //仓库统计是否正在进行柱状图加载
      chooseUse:false //备件使用统计是否正在进行中
    }
  },
  computed: {
    report(){
      return AuthUtil.hasAuth(this.auths, 'VIP_REPORT_VIEW');
    },
    //运营分析是否有全部权限
    isAll(){     
      return this.auths['VIP_REPORT_VIEW'] == 3; 
    },
    stockStats() { //仓库统计---（运营分析权限 && 运营分析全部权限）|| 从备件仓库打开时
      return (this.report && this.isAll) || this.isStock
    },
    useStats() { //备件使用统计--- 运营分析权限 && 只能从运营分析板块打开
      return this.report && !this.isStock
    }
  },
  methods: {
    isChoose(flag){
      this.chooseStock = flag;
    },
    isChoose1(flag){
      this.chooseUse = flag;
    },
    chooseCategoryStock(){ //选择备件库
      this.$tdOnEvent('pc：备件报表-仓库筛选下拉框事件');

      this.categoryStockId = event.target.value;
      if(this.stockStats) this.$nextTick(() => this.$refs.stats1.initModel());
    },
    chooseCategoryDate(start, end){ //选择时间
      this.$tdOnEvent('pc：备件报表-日期选择事件');

      this.categoryStartTime = start.format("YYYY-MM-DD");
      this.categoryEndTime = end.format("YYYY-MM-DD");
      if(this.stockStats && this.init) this.$nextTick(() => this.$refs.stats1.initModel());
      if(this.useStats && this.init) this.$nextTick(() => this.$refs.stats2.initModel());
    },
    initDateRangePicker(start, end) { //时间控件
      $("#stock-date-range").daterangepicker(
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
        this.chooseCategoryDate
      );
    },
    // stats-part-stock TalkingData事件埋点
    spsTrackEventHandler (type) {
      switch (type) {
        case '在库品类':
          this.$tdOnEvent('pc：备件报表-在库品类事件');
          break;
        case '备件总数':
          this.$tdOnEvent('pc：备件报表-备件总数事件');
          break;
        case '出库数量':
          this.$tdOnEvent('pc：备件报表-出库数量事件');
          break;
        case '缺件品类':
          this.$tdOnEvent('pc：备件报表-缺件品类事件');
          break;
        case 'outStoreSingle':
          this.$tdOnEvent('pc：备件报表-备件出库-单品事件');
          break;
        case 'inStoreSingle':
          this.$tdOnEvent('pc：备件报表-备件入库-单品事件');
          break;
        case 'inRepertorySingle':
          this.$tdOnEvent('pc：备件报表-备件在库-单品事件');
          break;
        case 'inRepertoryPrice':
          this.$tdOnEvent('pc：备件报表-备件在库-金额事件');
          break;
        default:
          break;
      }
    },
    // stats-part-use TalkingData事件埋点
    spuTrackEventHandler (type) {
      switch (type) {
        case 'chooseTeam':
          this.$tdOnEvent('pc：备件报表-选择团队事件');
          break;
        case 'applyType':
          this.$tdOnEvent('pc：备件报表-备件使用-类别事件');
          break;
        case 'applySingle':
          this.$tdOnEvent('pc：备件报表-备件使用-数量事件');
          break;
        case 'personalNum':
          this.$tdOnEvent('pc：备件报表-个人备件库-数量事件');
          break;
        case 'personalPrice':
          this.$tdOnEvent('pc：备件报表-个人备件库-金额事件');
          break;
        default:
          break;                              
      }
    }
  },
  mounted(){
    let initData = JSON.parse(JSON.stringify(window._init_data)) || {}; 
    
    //是否从备件仓库打开
    let urlParams = qs.parse(window.location.search);
    if(urlParams.source == 1){ 
      document.title = '仓库报表';
      this.categoryStockId = urlParams.id;
      this.isStock = true;
    } else {
      this.isStock = false;
      this.auths = initData.auths || {};
      if(!this.report) return window.location.href = '/403';
    }
     
    // this.teams = initData.teams || [];
    this.partStock = initData.part || [];
    
    //初始化时间控件
    let start = moment().subtract(6, "days");
    let end = moment();
    this.initDateRangePicker(start, end);      
    this.categoryStartTime = start.format("YYYY-MM-DD");
    this.categoryEndTime = end.format("YYYY-MM-DD");    
    this.init = true;
  },
  components: {
    StatsPartStock,
    StatsPartUse
  }
}
</script>

<style lang="scss">
.store-time{
  display: flex;
  flex-flow: row nowrap;
  margin:7.5px 7.5px 15px 0;
  justify-content: flex-end;
}
.stock-shade{
  position: absolute;
  width:200px;
  height:26px;
  top:15px;
  right:15px;
  background:rgba(255,255,255,.5);
}
.stock-shade1{
  right:224px;
}
</style>
