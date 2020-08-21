<template>
  <div class="page">
    <div class="page-panel" v-if="!part.isDelete">
      <div class="page-panel-body">
        <!--<el-button type="primary" icon="el-icon-edit" @click="edit" :disabled="pending" v-if="allowEdit"> 编辑</el-button>-->
        <!--<el-button icon="el-icon-delete" @click="remove" :disabled="pending" v-if="allowEdit"> 删除</el-button>-->

        <base-button type="primary" icon="el-icon-edit"  @event="edit" :disabled="pending" v-if="allowEdit">编辑</base-button>
        <base-button type="ghost" icon="el-icon-delete" @event="remove" :disabled="pending" v-if="allowEdit">删除</base-button>

        <div class="pull-right">
          <!--<el-button type="primary" @click="record.dialog = true" :disabled="pending">添加备注</el-button>-->
          <base-button type="primary" @event="record.dialog = true" :disabled="pending" v-if="allowEdit">添加备注</base-button>
        </div>
      </div>
    </div>

    <div class="page-main">
      <div class="page-panel page-main-detail" ref="detail">
        <sample-tooltip :row="part">
          <template slot="content" slot-scope="{isContentTooltip}">
            <div class="page-panel-head">
              <h5>备件信息<span v-if="part.isDelete" class="part-delete">[已删除]</span></h5>          
            </div>
          </template>
        </sample-tooltip>
        <div class="page-panel-body">
          <div class="page-row">
            <div class="page-row-left">编号：</div>
            <div class="page-row-right">{{part.serialNumber}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">名称：</div>
            <div class="page-row-right">{{part.name}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">类别：</div>
            <div class="page-row-right">{{part.type}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">规格：</div>
            <div class="page-row-right">{{part.standard}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">单位：</div>
            <div class="page-row-right">{{part.unit}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">销售价：</div>
            <div class="page-row-right" v-if="part.id">{{part.salePrice.toFixed(2)}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">出库价：</div>
            <div class="page-row-right" v-if="part.id">{{part.costPrice.toFixed(2)}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">说明：</div>
            <div class="page-row-right">{{part.description}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">图片：</div>
            <div class="page-row-right">
              <template v-if="part.image">
                <img class="part-image" :src="part.image" @click="preview" alt="备件图片">
              </template>
            </div>
          </div>
          <div class="page-row">
            <div class="page-row-left">状态：</div>
            <div class="page-row-right">{{part.enable == 1 ? '启用' : '禁用'}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">创建时间：</div>
            <div class="page-row-right">{{part.createTime}}</div>
          </div>
          <div class="page-row">
            <div class="page-row-left">系统编号：</div>
            <div class="page-row-right">{{part.id}}</div>
          </div>
        </div>
      </div>
      
      <div class="page-panel page-main-addition" ref="addition">
        <el-tabs :value="activeTab" @input="switchTab" type="card">
          <el-tab-pane label="关联数据" disabled>
             <span slot="label"><i class="el-icon-menu"></i> 关联数据</span>
          </el-tab-pane>
          
          <el-tab-pane label="动态信息" name="record">            
            <part-record :items="record.data.list"></part-record>

            <div class="part-record-loadmore" v-if="record.data.hasNextPage">
              <el-button type="text" :loading="record.loading" @click="loadMoreRecords">{{record.loading ? '正在加载' : '加载更多'}}</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="使用记录" name="usageRecord" v-if="report && isAll">
            <div class="part-use-form">
              <div class="about-num">
                <span>工单计数：{{usageRecord.data.taskTotalNum}}</span>
                <span>备件合计：{{usageRecord.data.partTotalNum}}</span>
              </div>               
              <div class="part-use-form-group">
                <div id="date-range" class="part-use-form-daterange">
                  <span>{{usageRecord.startTime}} - {{usageRecord.endTime}}</span> 
                  <b class="caret"></b>
                </div>
              </div>
            </div>
            
            <part-usage-record :page="usageRecord.data" @changePageNum="changePageNum"></part-usage-record>
          </el-tab-pane>

          <el-tab-pane label="库存信息" name="stock">
            <part-stock :stock="stock.data"></part-stock>
          </el-tab-pane>
        </el-tabs> 
      </div>

      <el-dialog title="添加备注" :visible.sync="record.dialog" width="600px">
        <part-remark-form ref="remarkForm" v-if="record.dialog"></part-remark-form>
        <div slot="footer" class="dialog-footer">
          <!--<el-button type="text" @click="record.dialog = false">关 闭</el-button>-->
          <!--<el-button type="primary" @click="createRemark" :disabled="pending">确 定</el-button>-->

          <base-button type="ghost" @event="record.dialog = false" >关 闭</base-button>
          <base-button type="primary" @event="createRemark" :disabled="pending">确 定</base-button>

        </div>
      </el-dialog> 
    </div>
  </div>
</template> 

<script>
/*global AMap, moment, _init_data*/
import $ from 'jQuery';
import _ from 'lodash';
import qs from '@src/util/querystring2';
import AuthUtil from '@src/util/auth';

import Page from '@src/model/Page';

import PartRecord from './components/PartRecord.vue';
import PartUsageRecord from './components/PartUsageRecord.vue';
import PartStock from './components/PartStock.vue';
import PartRemarkForm from './form/PartRemarkForm.vue';
import SampleTooltip from 'packages/SampleTooltip/SampleTooltip'

import BaseGallery from 'packages/BaseGallery/index'

export default {
  name: 'part-detail-view',
  inject: ['initData'],
  data() {
    return {
      activeTab: 'record',
      remarkDialog: false,
      pending: false,
      auths: [],

      id: '',
      part: {},

      record: {
        data: new Page(),
        dialog: false,
        loading: false
      },

      stock: {
        init: false,
        data: []
      },

      usageRecord: {
        init: false,
        pageNum: 1,
        startTime:'',
        endTime:'',
        data: {}
      }
    }
  },
  computed: {
    //是有允许编辑、删除备件
    allowEdit(){
      return AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_EDIT')
    },
    report(){
      return AuthUtil.hasAuth(this.auths, 'VIP_REPORT_VIEW')
    },
    //运营分析是否有全部权限
    isAll(){     
      return this.auths['VIP_REPORT_VIEW'] == 3 
    }
  },
  methods: {
    async initStock(){
      let loading = this.$loading({
        target: this.$refs.addition
      })

      try {
        let result = await this.$http.get(`/partV2/category/stock/${this.id}`, {});
        if(!Array.isArray(result) || result.length == 0) result = null;
        this.stock.data = result;
        this.stock.init = true;
      } catch (error) {
        console.log(error)
      }

      loading.close();
    },
    async initUsageRecord(){
      let loading = this.$loading({
        target: this.$refs.addition
      })

      let param = {
        primaryId: this.id,
        pageNum: this.usageRecord.pageNum,
        startTime: `${this.usageRecord.startTime} 00:00:00`,
        endTime: `${this.usageRecord.endTime} 23:59:59`
      };

      try {
        let result = await this.$http.get(`/partV2/category/logInTask`, param);
        this.usageRecord.data = result;
        this.usageRecord.init = true;
      } catch (error) {
        console.log(error)
      }

      loading.close();
    },
    changePageNum(pageNum) {
      this.usageRecord.pageNum = pageNum;
      this.initUsageRecord();
    },
    initDateRangePicker(start, end) { //时间控件
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
    chooseCategoryDate(start, end){ //选择时间
      this.usageRecord.startTime = start.format("YYYY-MM-DD");
      this.usageRecord.endTime = end.format("YYYY-MM-DD");
      this.usageRecord.pageNum = 1;
      this.initUsageRecord();
    },
    edit(){
      if(!this.allowEdit) return;
      window.location.href = `/partV2/category/edit?id=${this.id}`
    },
    //删除备件
    async remove(){
      try {
        if(!this.allowEdit) return;
        if(!await this.$platform.confirm('确定要删除该备件？')) return;

        this.pending = true;
        let result = await this.$http.post('/partV2/category/remove', {id: this.id}, false)
        if(result.status == 0){
          window.location.href = '/partV2/category/list';
        }else{
          this.$platform.alert(result.message);
        }
      } catch (error) {
        console.log(error)
      }
      this.pending = false;
    },
    //添加备注
    async createRemark(){
      let form = this.$refs.remarkForm;
      if(null == form) return;

      let remark = await form.pack();
      if(null == remark) return;

      this.pending = true;
      try {
        //补全参数
        remark.primaryId = this.id;
        remark.primaryName = this.part.name;

        let result = await this.$http.post('/partV2/category/sRecord/create', remark);
        if(result.status == 0){
          this.record.dialog = false;
          this.initRecords();
        }else{
          this.$platform.alert(result.message);
        }

      } catch (error) {
        console.log(error)
      }
      this.pending = false;
    },
    //备件图片预览
    preview(){
      let imgs = this.$el.querySelectorAll('.part-image');
      BaseGallery.preview(imgs[0])
    },
    switchTab(tab){
      if(this.activeTab == tab) return;
      this.activeTab = tab;
      
      if(this.activeTab == 'stock' && !this.stock.init){
        this.initStock();
      }

      if(this.activeTab == 'usageRecord' && !this.usageRecord.init){
        this.initUsageRecord();
      }
    },
    async loadMoreRecords(){
      this.record.loading = true;
      try {
        this.record.data.pageNum += 1;

        let result = await this.fetchRecords();
        result = _.assign(new Page(), result);

        for(let name in this.record.data){
          if(result[name] == undefined) continue;
          else if(name == 'list') this.record.data[name] = this.record.data[name].concat(result[name] || []);
          else this.record.data[name] = result[name];
        }

      } catch (error) {
        console.log(error)
      }
      this.record.loading = false;
    },
    async initRecords(){
      try {
        this.activeTab = 'record';
        let loading = this.$loading({
          target: this.$refs.addition
        })
        
        this.record.data.pageNum = 1;
        let records = await this.fetchRecords();
        this.record.data = Page.as(records);
        loading.close();
      } catch (error) {
        console.log(error)
      }
    },
    async initDetail(){
      try {
        let loading = this.$loading({
          target: this.$refs.detail
        })
        let part = await this.fetchData();
        this.part = part;
        loading.close();
      } catch (error) {
        console.log(error)
      }
    },
    async initialize(start, end){
      try {
        let loading = this.$loading();
        let microTask = [];

        this.record.data.pageNum = 1;
        microTask.push(this.fetchData());
        microTask.push(this.fetchRecords())
         
        let [part, recordData] = await Promise.all(microTask);
        this.part = part;
        this.record.data = recordData;
        loading.close();
      } catch (error) {
        console.warn(error)
      }

      this.initDateRangePicker(start, end);
      this.usageRecord.startTime = start.format("YYYY-MM-DD");
      this.usageRecord.endTime = end.format("YYYY-MM-DD");
    },
    fetchData(){
      return this.$http.get('/partV2/category/get', {id: this.id})
    },
    fetchRecords(){
      let page = this.record.data;

      let params = {
        primaryId: this.id,
        pageNum: page.pageNum,
        pageSize: page.pageSize
      }

      return this.$http.get('/partV2/category/sRecord', params);
    }
  },
  mounted(){
    let initData = this.initData;
    this.auths = initData.auths || {};

    let urlParams = qs.parse(window.location.search);
    this.id = urlParams.id;

    this.$nextTick(() => this.initialize(moment().subtract(6, "days"), moment()));
  },
  components: {
    [PartRecord.name]: PartRecord,
    [PartStock.name]: PartStock,
    [PartUsageRecord.name]: PartUsageRecord,
    [PartRemarkForm.name]: PartRemarkForm,
    [SampleTooltip.name]: SampleTooltip,
  }
}
</script>

<style lang="scss">
.part-delete{
  float:right;
  color:#f56c6c;
}
.part-image{
  display: block;
  max-width: 128px;
  max-height: 128px;
  cursor: pointer;
}

.part-record-loadmore{
  text-align: center;
}

.part-empty-tip{
  text-align: center;
  padding: 30px 0;
  color: #9a9a9a;
  font-weight: 600;
}
.part-use-form{
  margin:0 10px 0 10px;
  padding-bottom:10px;
  display: flex;
  flex-flow: row nowrap;
  color: #595854;
  border-bottom: 1px solid #ebeef5;
  .about-num{
    flex:1;
    margin-right: 20px;
    font-size: 14px;
    line-height: 26px;
    span{
      margin-right:30px;
    }
  }
  .part-use-form-group {
    display: flex;
    flex-flow: row nowrap;
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    margin-left: 5px;
    background-color: #fff;
  }

  .part-use-form-daterange{
    height: 24px;
    line-height: 24px;
    width: 200px;
    padding: 0 4px;
    border-radius: 2px;
    background: #fff;
    cursor: pointer;

    span {
      display: inline-block;      
      font-size: 14px;
      font-weight: 400;
      width: calc(100% - 14px);
    }
  }

  label{
    height: 24px;
    line-height: 24px;
    margin: 0;
  }

  input{
    border: none;
    outline: none;
    width: 200px;
    padding: 2px 6px;
  }
}
.category-detail{
  .daterangepicker .ranges {
    width: 180px !important;
  }
  .daterangepicker .input-mini {
    width: 84px !important;
  }
  .daterangepicker .btn-sm {
      font-size: 12px;
      line-height: 1.5;
      padding: 5px 10px;
      border-radius: 3px;
  }
  .daterangepicker .btn-primary {
    color: rgb(255, 255, 255);
    background-color: rgb(51, 122, 183);
    border-color: rgb(46, 109, 164);
  }
  .page-main-addition{
    overflow: hidden;
  }
  .base-timeline {
    padding-left: 0;
  }
  .base-timeline-item {
    border-left: 0px;
  }
}
</style>
