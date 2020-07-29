<template>
  <div class="stats-part-stock">
    <div class="stats-part-head">
      <div class="stats-part-card">
        <p>
          <el-popover trigger="hover">
            <ul>
              <li>当前仓库中有库存的备件品类数</li>
            </ul>
            <span slot="reference">在库品类</span>
          </el-popover>
        </p>
        <h3>
          <a :href="`/partV2/repertory/stock?id=${categoryStockId}`" @click.prevent="openDetail('备件库存', $event);emitTrackEvent('在库品类')">
            {{inRepertoryNum | convertZero}}
          </a>
        </h3>
        <div class="stats-part-card-bottom">
          <el-popover trigger="hover">
            <ul>
              <li>备件品类中的总备件数</li>
            </ul>
            <span slot="reference">品类总数：</span>
          </el-popover>
          <a href="/partV2/category/list" @click.prevent="openDetail('备件品类', $event)">
            {{sparepartNum | convertZero}}
          </a>
        </div>
      </div>

      <div class="stats-part-card">
        <p>
          <el-popover trigger="hover">
              <ul>
                <li>当前仓库中的所有备件数量总和</li>
              </ul>
              <span slot="reference">备件总数</span>
            </el-popover>
        </p>
        <h3>
          <a :href="`/partV2/repertory/stock?id=${categoryStockId}`" @click.prevent="openDetail('备件库存', $event);emitTrackEvent('备件总数')">
            {{inRepertoryNumWithOOS | convertZero}}
          </a>
        </h3>
        <div class="stats-part-card-bottom">
          <el-popover trigger="hover">
            <ul>
              <li>当前仓库中所有在库的备件总金额</li>
            </ul>
            <span slot="reference">备件总金额：</span>
          </el-popover>
          <a :href="`/partV2/repertory/stock?id=${categoryStockId}`" @click.prevent="openDetail('备件库存', $event)">
            {{inRepertoryTotalPrice | convertZero | fixed_2}}元
          </a>
        </div>
      </div>

      <div class="stats-part-card">
        <p>
          <el-popover trigger="hover">
            <ul>
              <li>周期内该仓库的出库备件总数</li>
            </ul>
            <span slot="reference">出库数量</span>
          </el-popover>
        </p>
        <h3>
          <a :href="`/partV2/repertory/record?id=${categoryStockId}&startTime=${categoryStartTime}&endTime=${categoryEndTime}&type=出库`" @click.prevent="openDetail('出入库记录', $event, '出库');emitTrackEvent('出库数量')">
            {{outStore | convertZero}}
          </a>
        </h3>
        <div class="stats-part-card-bottom">
          <el-popover trigger="hover">
            <ul>
              <li>周期内该仓库的入库备件总数</li>
            </ul>
            <span slot="reference">入库数量：</span>
          </el-popover>
          <a :href="`/partV2/repertory/record?id=${categoryStockId}&startTime=${categoryStartTime}&endTime=${categoryEndTime}&type=入库`" @click.prevent="openDetail('出入库记录', $event, '入库')">
            {{inStore | convertZero}}
          </a>
        </div>
      </div>

      <div class="stats-part-card">
        <p>
          <el-popover trigger="hover">
            <ul>
              <li>低于安全库存值的备件信息</li>
            </ul>
            <span slot="reference">缺件品类</span>
          </el-popover>
        </p>
        <h3>
          <a :href="`/partV2/repertory/stock?id=${categoryStockId}&miss=1`" @click.prevent="openDetail('备件库存', $event);emitTrackEvent('缺件品类')">
            {{missingPartNum | convertZero}}
          </a>
        </h3>
        <div class="stats-part-card-bottom">--</div>
      </div>     
    </div>

    <div class="stats-panel-body">
      <div class="stats-panel-head stats-form">
        <h3>备件仓库统计
          <el-popover trigger="hover">
            <ul>
              <li>备件出库-单品：周期内单个品类备件使用出库数量排名</li>
              <li>备件入库-单品：周期内单个品类备件入库数量排名</li>
              <li>备件在库-单品：当前备件在库数量排名</li>
              <li>备件在库-金额：当前备件在库金额排名</li>
            </ul>
            <stats-popover-icon slot="reference"></stats-popover-icon>
          </el-popover>
        </h3>
      </div>
      <div style="text-align: center;">
        <div class="stats-btn-group">
          <button type="button" :class="{'stats-checked': categoryType == 'outStoreSingle'}" @click="chooseCategoryType('outStoreSingle')">备件出库-单品</button>
          <button type="button" :class="{'stats-checked': categoryType == 'inStoreSingle'}" @click="chooseCategoryType('inStoreSingle')">备件入库-单品</button>
          <button type="button" :class="{'stats-checked': categoryType == 'inRepertorySingle'}" @click="chooseCategoryType('inRepertorySingle')">备件在库-单品</button>
          <button type="button" :class="{'stats-checked': categoryType == 'inRepertoryPrice'}" @click="chooseCategoryType('inRepertoryPrice')">备件在库-金额</button>
        </div>
      </div>
      <div class="category-chart-wrap">
        <div id="categoryPartStock"></div>
        <div class="stats-table-expand no-border">
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
            <el-table-column label="备件类别" prop="sparepart.type"></el-table-column>
            <el-table-column label="仓库" prop="repertory.name"></el-table-column>
            <template v-if="categoryType == 'outStoreSingle'">
              <el-table-column label="出库时间" width="180px">
                <template slot-scope="scope">
                  {{scope.row.outTime | fmt}}
                </template>
              </el-table-column>
              <el-table-column width="120" label="出库数量" prop="num"></el-table-column>
            </template>
            <template v-if="categoryType == 'inStoreSingle'">
              <el-table-column label="入库时间" width="180px">
                <template slot-scope="scope">
                  {{scope.row.inTime | fmt}}
                </template>
              </el-table-column>
              <el-table-column width="120" label="入库数量" prop="num"></el-table-column>
            </template>
            <template v-if="categoryType == 'inRepertorySingle' || categoryType == 'inRepertoryPrice'">
              <el-table-column width="120" label="数量" prop="num"></el-table-column>
              <el-table-column label="金额（元）" prop="sparepart.salePrice">
                <template slot-scope="scope">
                  {{ scope.row.sparepart.salePrice.toFixed(2) }}
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

let categoryPartStock = null;


export default {
  name: 'stats-part-stock',
  props: {
    categoryStartTime:{
      type:String,
      default:moment().subtract(6, "days").format("YYYY-MM-DD")
    },
    categoryEndTime:{
      type:String,
      default:moment().format("YYYY-MM-DD")
    },
    categoryStockId:{
      type:String,
      default:''
    },
    source:{
      type:Number,
      default:0
    }
  },
  data(){
    return {
      ajax_url:'/stats/sparepart/repertoryStatistics', //仓库统计地址
      inRepertoryNum:'--', //在库品类
      sparepartNum:'--', //品类总数
      inRepertoryNumWithOOS:'--', //备件总数
      inRepertoryTotalPrice:'--', //备件总金额
      outStore:'--', //出库数量
      inStore:'', //入库数量
      missingPartNum:'--', //缺件品类

      categoryType: "outStoreSingle", //tab
      aboutTab:{ //每个tab下对应的数据
        outStoreSingle:{
          legend: ['备件数量'],
          title:'备件出库-单品数量统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/deliveryHistogram',
          table_url:'/stats/sparepart/deliveryTable',
          export_url:'/stats/sparepart/exportDelivery',
          export_all_url:'/stats/sparepart/exportDeliveryAll',
          totalCount:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false //是否已经请求过该tab下的数据
        },
        inStoreSingle:{
          legend: ['备件数量'],
          title:'备件入库-单品数量统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/storageHistogram',
          table_url:'/stats/sparepart/storageTable',
          export_url:'/stats/sparepart/exportStorage',
          export_all_url:'/stats/sparepart/exportStorageAll',
          totalCount:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        inRepertorySingle:{
          legend: ['备件数量'],
          title:'备件在库-单品数量统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/stockAmountHistogram',
          table_url:'/stats/sparepart/stockAmountTable',
          export_url:'/stats/sparepart/exportStockAmount',
          export_all_url:'/stats/sparepart/exportStockAmountAll',
          totalCount:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        inRepertoryPrice:{
          legend: ['备件金额'],
          title:'备件在库-金额统计',
          color: ['#6da9e7'],
          echatr_url:'/stats/sparepart/stockPriceHistogram',
          table_url:'/stats/sparepart/stockPriceTable',
          export_url:'/stats/sparepart/exportStockPrice',
          export_all_url:'/stats/sparepart/exportStockPriceAll',
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
    openDetail(title, $event, type){
      let id = '';
      if(title == '备件库存') {
        id = `partV2_repertory_stock_${this.categoryStockId}`;
      } else if(title == '出入库记录') {
        id = `partV2_repertory_record_${this.categoryStockId}`;
      }
      this.$platform.openTab({
        id: id,
        url:event.target.getAttribute('href'),
        title: title,
        close: true,
        reload:true
      })
    },
    exportData(){ //导出
      let model = {
        repertoryId:this.categoryStockId,
        partId:this.model.partId,
        source:this.source
      };
      if(this.categoryType == 'outStoreSingle' || this.categoryType == 'inStoreSingle') {
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }

      window.location.href = this.aboutTab[this.categoryType].export_url + '?' + qs.stringify(model);
    },
    exportAllData(){ //导出全部
      let model = {
        repertoryId:this.categoryStockId,
        source:this.source
      };
      if(this.categoryType == 'outStoreSingle' || this.categoryType == 'inStoreSingle') {
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }

      window.location.href = this.aboutTab[this.categoryType].export_all_url + '?' + qs.stringify(model);
    },
    async initCategory(){ //页面初始化
      categoryPartStock = echarts.init(document.getElementById("categoryPartStock"));
      categoryPartStock.on('click', event => {
        let origin = event.data._origin;               

        this.model.pageNum = 1;
        this.model.partId = origin.sparepart.id;

        this.renderTable()
      })

      this.fetchStationCountData();
      this.renderCategory();
    },
    fetchStationCountData() { //获取仓库统计数据
      let params = {
        source:this.source,
        repertoryId: this.categoryStockId,
        timeStart: `${this.categoryStartTime} 00:00:00`,
        timeEnd: `${this.categoryEndTime} 23:59:59` 
      };
      http.get(this.ajax_url, params)
      .then((data) => {
        this.inRepertoryNum = data.repertory.inRepertoryNum;
        this.sparepartNum = data.sparepartNum;
        this.inRepertoryNumWithOOS = data.repertory.inRepertoryNumWithOOS;
        this.inRepertoryTotalPrice = data.repertory.inRepertoryTotalPrice;
        this.outStore = data.inOutStore.outStore;
        this.inStore = data.inOutStore.inStore;
        this.missingPartNum = data.repertory.missingPartNum;
      })
      .catch((error) => {
        console.log(error)
      });
        
    },
    chooseCategoryType(type){ //tab切换
      this.emitTrackEvent(type);

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
        if(this.categoryType == 'outStoreSingle' || this.categoryType == 'inStoreSingle' || this.categoryType == 'inRepertorySingle'){
          this.aboutTab[this.categoryType].totalCount = data.total;
          this.aboutTab[this.categoryType].totalNum = data.totalNum;
        }
        if(this.categoryType == 'inRepertoryPrice'){
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
        source:this.source,
        repertoryId:this.categoryStockId,
        pageSize:10,
        pageNum:this.aboutTab[this.categoryType].page
      };
      if(this.categoryType == 'outStoreSingle' || this.categoryType == 'inStoreSingle') {
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
      categoryPartStock.clear();

      let option = null;

      let outOption = this.getCategoryOutOption();
      if(outOption) option = this.getCategoryOption(outOption);
      
      if(null == option){
        this.categoryEmpty = true;
        this.moreBtn = false;
        return
      }
      if(this.aboutTab[this.categoryType].data.length >= this.aboutTab[this.categoryType].total) {
        this.moreBtn = false;
      }

      categoryPartStock.setOption(option);
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

      if(this.categoryType == 'inRepertoryPrice') {
        data.forEach(item => {
          yAxisData.unshift(item.sparepart.name);
          partNum.unshift({
            value: item.sparepart.salePrice.toFixed(2),
            _origin: item
          });
        });
      } else {
        data.forEach(item => {
          yAxisData.unshift(item.sparepart.name);
          partNum.unshift({
            value: item.num,
            _origin: item
          });
        });
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
      
      if(this.categoryType == 'outStoreSingle' || this.categoryType == 'inStoreSingle'){
        info = '计数：' + obj.totalCount + '             求和：' + obj.totalNum;
      }
      if(this.categoryType == 'inRepertorySingle'){
        info = '品类合计：' + obj.totalCount + '             数量合计：' + obj.totalNum;
      }
      if(this.categoryType == 'inRepertoryPrice') {
        info = '总金额：' + obj.totalPrice + '元';
      }

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
        source:this.source,
        repertoryId:this.categoryStockId,
        partId:this.model.partId,
        timeStart: `${this.categoryStartTime} 00:00:00`,
        timeEnd: `${this.categoryEndTime} 23:59:59`,
        pageNum:this.model.pageNum
      };
      if(this.categoryType == 'outStoreSingle' || this.categoryType == 'inStoreSingle') {
        model.timeStart = `${this.categoryStartTime} 00:00:00`;
        model.timeEnd = `${this.categoryEndTime} 23:59:59`;
      }

      return http.get(this.aboutTab[this.categoryType].table_url, model);
    },
    jump(currentPage){ //点击表格页数
      this.model.pageNum = currentPage;
      this.renderTable();
    },
    clear() {    
      let aboutTab = { 
        outStoreSingle:{        
          totalCount:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false //是否已经请求过该tab下的数据
        },
        inStoreSingle:{          
          totalCount:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        inRepertorySingle:{          
          totalCount:0,
          totalNum:0,
          data:[],
          page:1,
          total:0,
          flag:false
        },
        inRepertoryPrice:{          
          totalPrice:0,
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
      this.fetchStationCountData();
      this.renderCategory();
    },
    // 冒泡，父组件监听trackEvent
    emitTrackEvent(content) {
      this.$emit('trackEvent', content);
    }
  },
  mounted(){
    this.initCategory();
    window.addEventListener('resize',_.debounce(function(){
      categoryPartStock.resize();
    }, 400))
  },
  watch: {
    categoryType(){
      this.showTable = false;
    }
  },
  components: {
    BaseCheckbox,
    [SampleTooltip.name]: SampleTooltip
  }
}
</script>

<style lang="scss">
.store-time{
  display: flex;
  flex-flow: row nowrap;
  margin-bottom:15px;
  justify-content: flex-end;
}
#categoryPartStock{
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
    padding: 15px 15px 0;
    margin: 0 0 15px;
    font-size: 14px;
    cursor:pointer;
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
  span{
    cursor:pointer;
  }
}

.stats-part-panel{
  .stats-form{
    justify-content: flex-end;
  }
}

.stats-part-stock{ 
  margin:7.5px;
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
