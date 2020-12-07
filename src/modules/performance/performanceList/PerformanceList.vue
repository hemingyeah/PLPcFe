<template>
    <div class="page">
      <div class="page-panel">
        <div class="page-panel-body search-form-nano">
          <el-input v-model="model.pname" placeholder="根据绩效信息名称搜索"></el-input>
          <el-button-group>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button @click="reset">重置</el-button>
          </el-button-group>
          <el-button type="text" @click="isExpand = !isExpand" :icon="isExpand ? 'el-icon-minus' : 'el-icon-plus'">高级搜索</el-button>
        </div>
      </div>
      <base-collapse-panel :value="isExpand" class="page-panel">
        <div class="page-panel-head">
          <h5>高级搜索</h5>
        </div>
        <div class="page-panel-body">
          <div class="form-row">
            <div class="form-item">
              <label>绩效类型</label>
              <el-select class="form-item-content" placeholder="请选择绩效类型" v-model="model.settleType">
                <el-option label="全部" value=""></el-option>
                <el-option label="按部门" value="tuandui"></el-option>
                <el-option label="按个人" value="geren"></el-option>
              </el-select>
            </div>
            <div class="form-item">
              <label>创建时间</label>
              <div class="form-item-content">
                <el-date-picker style="width:100%;"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="-"
                  v-model="dateRange"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期">
                </el-date-picker>
              </div>
            </div>
          </div>
          <!-- <div class="form-row">
            <div class="form-item">
              <label>操作人</label>
              <div class="form-item-content">
                  <el-select class="srp-list-form-item" style="width: 100%;"
                      filterable
                      clearable
                      placeholder="选择人员"
                      v-model="model.createUser"
                      :loading="loadingUser"
                      @focus="getUsers">

                      <el-option
                        v-for="item in users"
                        :key="item.userId"
                        :label="item.loginName"
                        :value="item.userId">

                        <div class="srp-user-item">
                          <img :src="item.head || '/resource/images/account_userhead.png'">
                          <span>{{item.loginName}}</span>
                        </div>
                      </el-option>
                  </el-select>
                </div>
            </div>
            <div class="form-item"></div>
          </div> -->
          <div class="form-row">
            <div class="text-right" style="width:100%;">
              <el-button @click="reset">重置</el-button>
              <el-button type="primary" @click="search">确定</el-button>
            </div>
          </div>
        </div>
      </base-collapse-panel>
    <div class="page-panel">
      <div class="page-panel-body clearfix">
        <el-button type="primary" icon="el-icon-plus"  :loading="dialogWaitting" @click="addReport" v-if="allowEdit"> 新建</el-button>
        <el-button type="danger" icon="el-icon-delete" :disabled="deleting" @click="remove" v-if="allowEdit"> 删除</el-button>  
        <a @click.prevent="openDoc">如何通过绩效报告统计部门或个人数据?</a>

        <div class="pull-right">
          <el-button-group>
            <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150"> 
              <el-button>选择列 <i class="el-icon-arrow-down el-icon--right"></i></el-button>

              <el-dropdown-menu slot="dropdown" class="dropdown-more">
                <el-dropdown-item v-for="column in columns" :key="column.field"> 
                  <el-checkbox :value="column.show" @input="chooseColnum(column)" class="dropdown-item">{{column.label}}</el-checkbox>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>  

            <el-dropdown trigger="click" :show-timeout="150" v-if="allowExport"> 
              <el-button>
                更多操作 <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>

              <el-dropdown-menu slot="dropdown" class="dropdown-more">
                <el-dropdown-item>  
                  <span class="dropdown-item" @click="exportPart(false)">导出</span>
                </el-dropdown-item>
                <el-dropdown-item>
                  <span class="dropdown-item" @click="exportPart(true)">导出全部</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> 
             
          </el-button-group>  
        </div>
      </div>
    </div>
    <div class="page-panel" style="padding: 10px">
      <el-table stripe ref="table"
        :data="list"
        @selection-change="select"
        @sort-change="sort">

        <el-table-column
          type="selection"
          width="44"
          fixed="left">
        </el-table-column>

        <el-table-column v-for="column in showColnums" :key="column.field" 
          :label="column.label"
          :min-width="column.minWidth"
          :width="column.width"
          :prop="column.field"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.showTip !== false">
        </el-table-column>
        <el-table-column
        width="80px"
        label="报告">
          <template slot-scope="scope" width="80px">
            <el-button
              size="mini"
              @click="showReport(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper clearfix">
        <el-pagination
          @size-change="pageSizeChange"
          background
          @current-change="pageCurrentChange"
          :current-page="page.pageNum"
          :page-sizes="[10, 30, 50]"
          :page-size="page.pageSize"
          layout="sizes, prev, pager, next, jumper"
          :total="total"
          style="margin-top:10px;float: right">
        </el-pagination>
      </div>
    </div>
    <add-performance-report ref="addPerformanceReportDialog" :rules="rules" @submit="submit"></add-performance-report>
    <report-sta-mode ref="reportStaMode" @confirm="confirmed" :data="repeatData"></report-sta-mode>
    <add-report-succ ref="addReportSucc"></add-report-succ>
    <base-export ref="exportPanel" 
      v-if="allowExport"
      :columns="columns"
      action="/performance/export"></base-export>
  </div>
</template>
<script>
import StorageUtil from '@src/util/StorageUtil';
import AddPerformanceReport from './AddPerformanceReport.vue';
import errMsg from '../common/errorMsg';
import ReportStaMode from './ReportStaMode.vue';
import AddReportSucc from './AddReportSucc.vue';
import _ from 'lodash';
import DateUtil from '@src/util/date'
import Platform from '@src/util/Platform'
const STORAGE_COLNUM_KEY = 'category_list_column';

export default {
  data(){
    return {
      model:{},
      dateRange: [],
      page: {
        pageSize:10,
        pageNum: 1
      },
      deleting: false,
      total: 0,
      isExpand: false,
      users: [],
      allowEdit: true,
      allowExport: true,
      columns: this.buildColumns(),
      loadingRules: true,
      dialogWaitting: false,
      loadingUser: true,
      loadingTableData: false,
      //重复结算时重复数据
      repeatData:[],
      //列表数据
      list:[],
      //规则数据
      rules:[],
      //列表选中项
      selection: []
    }
  },
  async created(){
    /*  组件创建时
    **  1.加载表格数据
    **  2.加载绩效规则 进行绩效统计必须存在可用的绩效规则
    */
    this.loadTableData();
    try {
        let res = await this._getRules()
        if(res.succ){
          this.rules = res.data
        }
      }finally{
        this.loadingRules = false;
        if(this.dialogWaitting){
          this.addReport();
          this.dialogWaitting = false;
        }
      }
  },
  computed: {
    showColnums(){
      // 获取当前展示列
      return this.columns.filter(item => item.show);
    },
    // 是否在钉钉环境
    isDingTalk() {
      return Platform.isDingTalk()
    },
    // 绩效报告链接
    performanceReportLink() {
      return this.isDingTalk ? 'https://www.yuque.com/shb/help/operating#IbBYe' : 'https://www.yuque.com/shb/help2/operating#IbBYe'
    }
  },
  methods: {
    openDoc(event){
      this.$platform.openLink(this.performanceReportLink);
    },
    reset(){
      //清除查询条件
      this.model = {};
      this.dateRange = [];
      this.loadTableData();
    },
    search(){
      //搜索
      this.page.pageNum = 1;
      this.loadTableData();
    },
    normalizeParam(){
      this.param = _.assign({},this.model,this.page);
      if(this.dateRange && this.dateRange.length){
        this.param.startTime = DateUtil.format(this.dateRange[0],'yyyy-MM-dd');
        this.param.endTime = DateUtil.format(this.dateRange[1],'yyyy-MM-dd');
      }
    },
    async loadTableData(){
      if(this.loadingTableData){
        //防止数据重复加载
        return;
      }
      this.loadingTableData = true;
      //加载表格信息
      this.normalizeParam();
      this.tableLoading = this.$loading();
      try {
        let res = await this.$http.get('/performance/getMainMsg',this.param);
        if(res.succ) {
          this.list = this._normalizeData(res.data);
          this.total = res.data.totalSize;
          this.tableLoading.close();
        }else {
          throw new Error(res.message)
        }
      }catch(e){
        errMsg(this, e)
      }finally{
        this.loadingTableData = false;
        this.tableLoading.close();
      }
    },
    async getUsers(){
      //获取操作人
      if(!this.usersLoaded) {
        this.usersLoaded = true;
      }else{
        return;
      }
      try {
        this.loadingUser = true;
        let res = await this.$http.get('/performance/getUsers');
        if(res.succ) {
          this.users = res.data;
          this.loadingUser = false;
        }else {
          throw new Error(res.message)
        }
      }catch(e){
        //user未曾成功加载过
        this.usersLoaded = false;
        //users加载完毕
        this.loadingUser = false;
      }
    },
    addReport(){
      /** 
       * 打开新建绩效报告表单
       * 打开之前需要确定规则获取完毕
       * 没有获取完毕则将dialogWaitting标记为true，获取完毕后再打开
       * 获取完毕如果无可用规则提示用户进行添加
       * **/
      if(this.loadingRules) {
        this.dialogWaitting = true;
        return;
      }
      if(!this.rules.length){
        this.$platform.alert('当前无可用绩效计算规则，请前往系统管理-绩效报告设置模块进行添加，如已添加请刷新本页面后再试');
        return;
      }
      this.$refs.addPerformanceReportDialog.open()
    },
    async remove(){
      //删除
      if(!this.selection.length) {
        this.$platform.alert('请选择要删除的绩效报告');
        return;
      }
      try {
        if(!await this.$platform.confirm('确定要删除该绩效报告？')) return;

        this.deleting = true;
        let ids = this.selection.map(s => s.id);
        let res = await this.$http.post('/performance/deleteMain', { id:ids.join(',') + ',' }, false);
        if(res.succ) {
          this.$notify({
            title: '删除成功',
            type: 'success'
          });
        this.loadTableData();
        }else{
          throw new Error(res.message)
        }
      }catch(e){
        errMsg(this,e)
      }finally{
        this.deleting = false;
      }
      
      //this.$confirm()
    },
    exportPart(exportAll){
      //导出
      if(!this.allowExport) return;

      let ids = [];
      let fileName = `${DateUtil.format(new Date(),'yyyy-MM-dd')}结算数据.xlsx`;

      if(!exportAll){
        if(this.selection.length == 0) return this.$platform.alert('请选择要导出的数据');
        ids = this.selection.map(item => item.id);
      }

      this.$refs.exportPanel.open(ids, fileName);
    },
    select(selection){
      //表格选择
      this.selection = selection;
    },
    sort(){
      //排序
    },
    _getRules(){
      //获取规则数据
      return this.$http.get('/performance/seBatchRule')
    },
    chooseColnum(column){
      //选择展示列
      column.show = !column.show
    },
    buildColumns(){
      //根据所选展示列构建表格
      let localData = StorageUtil.get(STORAGE_COLNUM_KEY) || {};

      let columns = [
        {
          label: '类型',
          field: 'ptype',
          show: true,
          width: '100px'
        },
        {
          label: '名称',
          field: 'pname',
          show: true
        },
        {
          label: '创建时间',
          field: 'createTime',
          show: true
        },
        {
          label: '对象',
          field: 'users',
          show: true
        },
        {
          label: '周期',
          field: 'cycle',
          show: true
        },
        {
          label: '操作人',
          field: 'createUser',
          show: true
        },
        {
          label: '统计规则',
          field: 'ruleName',
          show: true
        }
      ]
      columns.forEach(column => {
        let isShow = localData[column.field];
        if(typeof isShow == 'boolean') column.show = isShow;
      })
      return columns;
    },
    confirmed(type){
      //重复结算时根据用户做出的选择进行下一步操作
      if(type == 'cancel') {
        this.$refs.addPerformanceReportDialog.open(true)
        return;
      }
      this.subData.sign = type;
      this.continueSubmit()
    },
    _normalizeData(datas){
      //将后端返回数据处理成可用格式
      
      let list = [];
      for(let data of datas.data){
        let item = {};
        item.ruleName = this.getRuleName(data.ruleId, datas.rule);
        item.createTime = DateUtil.format(new Date(data.createTime), 'yyyy-MM-dd h:mm');
        item.cycle = DateUtil.format(new Date(data.startTime), 'yyyy-MM-dd') + '至' + DateUtil.format(new Date(data.endTime), 'yyyy-MM-dd');
        
        //后端返回数据中users是一个包含一个对象的数组 这个对象的字段如果是users_gr为个人 如果是users_td为团队
        item.ptype = data.settleType == 'geren' ? '按个人' : '按部门';
        item.id = data.id;
        //拼接成xxx等几人或xxx等几团队 处理后端格式不一样的数据
        if(data.settleType == 'geren') {
          if(data.users.length > 1){
            item.users = data.users[0].usersName + '等' + data.users.length + '人';
          }else {
            item.users = data.users[0].usersName
          }
        }else {
          if(data.users[0].usersName.length > 1){
            item.users = data.users[0].usersName[0] + '等' + data.users[0].usersName.length + '部门';
          }else {
            item.users = data.users[0].usersName[0]
          }
        }
        
        item.pname = data.pname;
        item.createUser = data.createUser;
        list.push(item);
      }
      return list;
    },
    getRuleName(ruleId,rules) {
      for(let rule of rules) {
        if(rule.prId == ruleId) return rule.prName;
      }
    },
    showReport(row){
      //查看绩效报告
      this.$platform.openTab({
        id:'u_performance_report' + '_' + row.id,
        title: '绩效报告',
        url: '/performance/report' + '?id=' + row.id,
        close: true
      })
    },
    async submit() {
      /**
       * 运行绩效报告，获取表单数据并缓存在this.subData中
       * 若重复统计则打开重复统计对话框
       * 否则打开统计成功对话框
       */
      this.subData = this.$refs.addPerformanceReportDialog.getData();
      try {
        let res = await this.$http.post('/performance/containWorkOrder', this.subData, false);
        if(res.succ) {
          if(res.message === '结算重复') {
            this.$refs.addPerformanceReportDialog.close();
            this.$refs.reportStaMode.open(res.data);
          }else if(res.message === 'ok' || res.message == '结算成功'){
            this.$refs.addPerformanceReportDialog.close();
            this.loadTableData();
            this.$refs.addReportSucc.open(res.data[0]);
          }else {
            throw new Error(res.message)
          }
        }else {
          throw new Error(res.message)
        }
      }catch(e) {
        errMsg(this, e)
      }
      this.$refs.addPerformanceReportDialog.finished();
    },
    async continueSubmit(){
      /**
       * 重复统计提示用户后，用户选择继续或去重
       */
      try {
        let res = await this.$http.post('/performance/containWorkOrder', this.subData, false);
        if(res.succ) {
          if(res.message != '结算成功' && res.message != 'ok') throw new Error(res.message);
          this.$refs.reportStaMode.close();
          this.loadTableData();
          this.$refs.addReportSucc.open(res.data[0] || res.data);
        }else {
          throw new Error(res.message)
        }
        
      }catch(e) {
        errMsg(this, e)
      }
      this.$refs.reportStaMode.finished();
    },
    pageSizeChange(size){
      this.page.pageSize = size;
      this.loadTableData();
    },
    pageCurrentChange(page){
      this.page.pageNum = page;
      this.loadTableData();
    }
  },
  components: {
    AddPerformanceReport,
    ReportStaMode,
    AddReportSucc
  }
}
</script>
<style lang="scss">
  .srp-user-item {
    line-height: 34px;
    img {
      width: 34px;
      height: 34px;
      margin-right: 10px;
      vertical-align: middle;
    }
  }
</style>


