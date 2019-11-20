<template>
  <div class="page-list" v-loading.fullscreen.lock="loadingListData">

    <list-search :placeholder="placeholder" :config="{fields: this.partFields}" @search="search" @reset="reset">
      <div class="bill-date">
        <el-date-picker
          v-model="originModel.createTime"
          type="daterange"
          unlink-panels
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions">
        </el-date-picker>
      </div>
    </list-search>

    <div class="page-list-section">
      <div class="operation-bar-container bill-bar-container">

        <div class="action-button-group">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link el-dropdown-btn" @click="trackEventHandler()">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="exportData(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportData(true)">导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">选择列 <i class="iconfont icon-nav-down"></i></span>
        </div>
      </div>
    </div>

    <div class="page-panel">
      <el-table stripe ref="table"
                :data="page.list"
                @selection-change="select"
                @sort-change="sort"
                header-row-class-name="page-table-header"
                class="page-table">

        <el-table-column
          type="selection"
          width="48"
          class-name="select-column"
          align="center">
        </el-table-column>

        <el-table-column v-for="column in columns" :key="column.field"
                         v-if="column.show"
                         :label="column.label"
                         :width="column.width"
                         :min-width="column.minWidth || '120px'"
                         :prop="column.field"
                         :sortable="column.sortable"
                         :class-name="column.field == 'taskNo' ? 'page-name-superscript-td' : ''"
                         :show-overflow-tooltip="column.tooltip && column.field !== 'taskNo'">

          <template slot-scope="scope" style="position: relative;">

            <template v-if="column.field == 'taskNo'">
              <sample-tooltip :row="scope.row">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                    <a
                      :href="`/partV2/category/detail?id=${scope.row.id}`"
                      class="view-detail-btn"
                      @click.prevent="openDetail(scope.row)">
                      {{scope.row.taskNo}}
                    </a>
                  </el-tooltip>
                </template>
              </sample-tooltip>
            </template>

            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>

        </el-table-column>
      </el-table>

      <table-footer 
        :page="page" 
        :multipleSelection="multipleSelection" 
        @search="search"
        @toggleRowSelection="toggleRowSelection"
        @clearSelection="clearSelection"></table-footer>

      <base-export ref="exportPanel"
                   v-if="allowImportAndExport"
                   :columns="filterColumns"
                   action="/partV2/repertory/sparepartRepertory"></base-export>

      <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus"/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Page from '../../../model/Page';
import AuthUtil from '@src/util/auth';
import * as DateUtil from '@src/util/lang';
import StorageUtil from '@src/util/storageUtil';

import ListSearch from './components/ListSearch';
import TableFooter from './components/TableFooter';

const STORAGE_COLNUM_KEY = 'bill_list_column';
const STORAGE_PAGESIZE_KEY = 'bill_list_pagesize';

export default {
  name: 'bill-list',
  data(){
    let pageSize = StorageUtil.get(STORAGE_PAGESIZE_KEY) || 10;
    let originModel = {
      keyWord: '', // 关键字
      // amount: {}, // 金额范围
      // taskNo: '', // 工单编号
      // orderNo: '', // 商家订单编号
      // customerName: '', // 客户名称
      // billType: [], // 账单类型
      // alipayAccount: '', // 买家账号
      // alipayNo: '', // 交易号
      // payChannel: [], // 支付渠道
      createTime: [], // 交易创建时间
      pageNum: 1,
      pageSize,
      sortBy: {},
      isMissingPart: 0,
    };

    return {
      placeholder: '根据客户/订单编号/工单编号/交易号搜索',
      multipleSelection: {
        leftName: '客户名称',
        rightName: '收支金额',
        list: []
      },

      auths: {}, // 权限对象

      columns: this.buildColumns(),
      isExpand: false,
      pending: false,
      bill: {
        options: [],
        dateRange: ''
      },


      originModel,
      model: _.assign({}, originModel),

      page: new Page(),

      pickerOptions: {
        shortcuts: [{
          text: '今日',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '昨日',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 2);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近7天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近30天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      loadingListData: false,
    }
  },
  computed: {
    partFields () {
      let fixedFields = [
        {
          displayName: '客户',
          fieldName: 'customer',
          formType: 'customer',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '商家订单号',
          fieldName: 'orderNo',
          formType: 'text',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '工单编号',
          fieldName: 'taskNo',
          formType: 'text',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '支付渠道',
          fieldName: 'payChannel',
          formType: 'select',
          isExport: false,
          isSystem: 1,
          setting: {
            dataSource: this.bill.options,
            isMulti: false
          }
        }, 
        {
          displayName: '交易号',
          fieldName: 'alipayNo',
          formType: 'text',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '交易创建时间',
          fieldName: 'createTime',
          formType: 'date',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          operator: 'between',
          orderId: 99
        },
        {
          displayName: '交易付款时间',
          fieldName: 'paymentTime',
          formType: 'date',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          operator: 'between',
          orderId: 99
        },
        {
          displayName: '买家账号',
          fieldName: 'alipayAccount',
          formType: 'text',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '金额范围',
          fieldName: 'amountRange',
          formType: 'range',
          isExport: false,
          isSystem: 1,
          components: 'bill-amount-range',
        },
        {
          displayName: '账单类型',
          fieldName: 'billType',
          formType: 'select',
          isExport: false,
          isSystem: 1,
          setting: {
            dataSource: this.bill.options,
            isMulti: false
          }
        }
      ];

      return fixedFields
        .filter(f => f.formType !== 'separator' && f.formType !== 'info')
        .map(f => {

          // 调整字段顺序
          if (f.fieldName === 'partType') {
            f.orderId = 1;
            f.show = true
          }

          if (f.fieldName === 'partName') {
            f.orderId = 0;
            f.show = true
          }

          return f;
        })
        .sort((a) => a.orderId)
    },

    // 是否允许导入导出
    allowImportAndExport(){
      return AuthUtil.hasAuth(this.auths, 'EXPORT_IN')
    },
    // 是否有编辑权限
    allowEdit(){
      // return true;
      return AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_EDIT');
    },
    allowInout(){
      return AuthUtil.hasAuth(this.auths, 'VIP_SPAREPART_INOUT');
    },
    filterColumns() {
      return this.columns.filter(c => c.label);
    }
  },
  methods: {
    // 表格底部组件
    toggleRowSelection (row) {
      this.$refs.table.toggleRowSelection(row);
    },

    clearSelection () {
      this.$refs.table.clearSelection();
    },

    // 选择列
    showAdvancedSetting(){
      // window.TDAPP.onEvent('pc：在线支付管理-选择列事件');
      this.$refs.advanced.open(this.columns);
    },

    modifyColumnStatus(event) {
      let columns = event.data || [];
      let colMap = columns.reduce((acc, col) => (acc[col.field] = col) && acc, {});

      this.columns.forEach(col => {
        let newCol = colMap[col.field];
        if(null != newCol) {
          this.$set(col, 'show', newCol.show);
          this.$set(col, 'width', newCol.width);
        }
      })

      const columnsStatus = this.columns.map(c => ({field: c.field, show: c.show, width: c.width}));
      this.saveDataToStorage('columnStatus', columnsStatus);
    },

    saveDataToStorage(key, value) {
      StorageUtil.save(STORAGE_COLNUM_KEY, value);
    },

    // 导出支付记录
    exportData(exportAll){
      if(!this.allowImportAndExport || !this.allowEdit || !this.allowInout) return;
      let ids = [];

      if(!exportAll){
        if(this.selected.length == 0) return this.$platform.alert('请选择要导出的数据');
        ids = this.selected.map(item => item.id);
      }

      this.$refs.exportPanel.open(ids, `${DateUtil.formatDate(new Date(), 'yyyy-MM-dd')}在线支付记录.xlsx`);
    },

    importSucc(){
      this.loadData();
    },

    chooseColnum(column){
      this.trackEventHandler('selectColumn');

      column.show = !column.show;

      let data = {};
      this.filterColumns.forEach(item => data[item.field] = item.show)
      StorageUtil.save(STORAGE_COLNUM_KEY, data);
    },

    openDetail(row){
      this.$platform.openView({
        id: `partV2_detail_${row.id}`,
        url:`/partV2/detail?id=${row.id}`,
        title: '备件品类详情'
      })
    },

    select(data){
      this.selected = data;
      this.multipleSelection.list = [];
      data.forEach((item) => {
        item.serialNumber = item.sparepart.serialNumber;
        item.name = item.sparepart.name;
        this.multipleSelection.list.push(item)
      })
    },

    jump(pageNum){
      this.model.pageNum = pageNum;
      this.loadData();
    },

    pageSizeChange(pageSize){
      this.model.pageSize = pageSize;
      this.originModel.pageSize = pageSize;

      this.loadData();

      // 存入localStorage
      StorageUtil.save(STORAGE_PAGESIZE_KEY, pageSize);
    },

    search (data) {
      this.buildModel(data);
      this.loadData();
    },

    buildModel (data) {
      this.model = _.assign({}, this.originModel);
      this.$refs.table.clearSort();
      
      this.model.keyWord = data.keyWord;

      if(data.pageNum) this.model.pageNum = data.pageNum;
      
      if(data.pageSize) {
        this.model.pageSize = data.pageSize;
        this.originModel.pageSize = data.pageSize;
        // 存入localStorage
        StorageUtil.save(STORAGE_PAGESIZE_KEY, data.pageSize);
      }

      if(!data.moreConditions || !data.moreConditions.fields) return;

      let fields = data.moreConditions.fields;
      let form = data.moreConditions.form;

      let tv = null;
      let fn = '';

      for(let i = 0; i < fields.length; i++) {
        tv = fields[i];
        fn = tv.fieldName;

        if (!form[fn] || (Array.isArray(form[fn]) && !form[fn].length)) {
          continue;
        }


        // if (tv.fieldName === 'partType') {
        //   this.model.type = form[fn];
        //   continue;
        // }

      }
    },

    reset(){
      this.model = _.assign({}, this.originModel);
      this.originModel.createTime = [];
      this.$refs.table.clearSort();
      this.loadData();
    },

    sort({column, prop, order}){
      let sortBy = {};

      if(prop){
        let tableName = 'repertorySparepart';
        let key = `${tableName}.${prop}`
        sortBy[key] = order == 'ascending';
      }

      this.model.sortBy = sortBy;
      this.loadData();
    },

    async loadData(){
      this.loadingListData = true;
      try{
        // this.page = await this.fetchData();
        this.model.pageNum = this.page.pageNum;
        this.model.pageSize = this.page.pageSize;
      }catch(error){
        this.loadingListData = false;
        console.error(error);
      }
      this.loadingListData = false;
    },

    fetchData(){
      // 获取支付列表
      // return this.$http.get('/partV2/repertory/list', this.model)
    },

    buildParams(pageNum, pageSize){
      return {
        ...this.model,
        pageNum,
        pageSize
      };
    },

    buildColumns(){
      let localData = StorageUtil.get(STORAGE_COLNUM_KEY) || {};

      let columns = [
        {
          label: '客户',
          field: 'customerName',
          show: true,
          width: '200px',
          exportAlias: 'bill.serialNumber',
          tooltip: true,
        },
        {
          label: '工单编号',
          field: 'taskNo',
          show: true,
          width: '170px',
          exportAlias: 'bill.name',
          tooltip: true,
        },
        {
          label: '商家订单号',
          field: 'orderNo',
          show: true,
          width: '200px',
          exportAlias: 'bill.name',
          tooltip: true,
        },
        {
          label: '支付渠道',
          field: 'payChannel',
          show: true,
          tooltip: true,
        },
        {
          label: '交易号',
          field: 'alipayNo',
          show: true,
          width: '170px',
          tooltip: true,
        },
        {
          label: '收支金额（元）',
          field: 'amount',
          show: true,
          width: '150px',
          exportAlias: 'bill.standard',
          tooltip: true,
        },
        {
          label: '交易付款时间',
          field: 'paymentTime',
          show: true,
          width: '170px',
          exportAlias: 'bill.name',
          tooltip: true,
        },
        {
          label: '交易创建时间',
          field: 'createTime',
          show: true,
          width: '170px',
          exportAlias: 'bill.type',
          tooltip: true,
        },
        {
          label: '买家账号',
          field: 'alipayAccount',
          show: true,
          width: '200px',
          exportAlias: 'safetyStock',
          tooltip: true,
        },
        {
          label: '账单类型',
          field: 'billType',
          show: true,
          tooltip: true,
        }
      ];

      columns.forEach(column => {
        if(!column.export && column.export != false) column.export = true;
        if(Array.isArray(localData)) {
          localData.forEach(item => {
            if(item.field == column.field) column.show = item.show;         
          })
        }
        
        column.type = 'column'
      })

      return columns;
    },
   
    trackEventHandler() {
      // this.$tdOnEvent('pc：在线支付管理-更多操作事件');
    }
  },
  mounted(){
    let initData = JSON.parse(JSON.stringify(window._init_data || {}));

    this.page.pageNum = this.model.pageNum;
    this.page.pageSize = this.model.pageSize;

    // this.loadData();
  },
  components: {
    [ListSearch.name]: ListSearch,
    [TableFooter.name]: TableFooter
  }
}
</script>

<style lang="scss">
.bill-date {
  width: 300px;
  padding-right: 10px;

  .el-input__inner {
    height: 34px;
  }
}

.bill-bar-container {
  flex-direction: row-reverse;
}
</style>