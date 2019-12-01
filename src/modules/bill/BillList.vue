<template>
  <div class="page-list" v-loading.fullscreen.lock="loadingListData">

    <list-search :placeholder="placeholder" :config="{fields: this.partFields}" :options="options" @search="search" @reset="reset" @updateCreateTime="updateCreateTime">
      <div class="bill-date">
        <el-date-picker
          v-model="options.createTime"
          type="daterange"
          unlink-panels
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="options.pickerOptions">
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

    <div style="background: #fff;padding: 0 10px">
      <base-selection-bar ref="baseSelectionBar" v-model="multipleSelection.list" @toggle-selection="toggleSelection" @show-panel="() => multipleSelection.multipleSelectionPanelShow = true" />
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

            <template v-else-if="column.field === 'createTime'">
              {{scope.row.createTime | fmt_datetime}}
            </template>

            <template v-else-if="column.field === 'payTime'">
              {{scope.row.payTime | fmt_datetime}}
            </template>

            <template v-else-if="column.field === 'receiptAmount'">
              {{scope.row.receiptAmount.toFixed(2)}}
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

      <!-- v-if="allowImportAndExport" -->
      <base-export ref="exportPanel"
                   :columns="filterColumns"
                   :build-params="buildExportParams"
                   :validate="checkExportCount"
                   method="get"
                   download-url="/excels/paymentBillOnline/export"
                   action="/excels/downloadByToken"></base-export>

      <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus"/>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import Page from '../../../model/Page';
import AuthUtil from '@src/util/auth';
import StorageUtil from '@src/util/storageUtil';
import {formatDate} from '@src/util/lang';

import ListSearch from './components/ListSearch';
import TableFooter from './components/TableFooter';

const STORAGE_COLNUM_KEY = 'bill_list_column';
const STORAGE_PAGESIZE_KEY = 'bill_list_pagesize';

export default {
  name: 'bill-list',
  data(){
    let pageSize = StorageUtil.get(STORAGE_PAGESIZE_KEY) || 10;
    let originModel = {
      keyword: '', // 关键字
      // amount: {}, // 金额范围
      // taskNo: '', // 工单编号
      // orderNo: '', // 商家订单编号
      // customerName: '', // 客户名称
      // billType: [], // 账单类型
      // alipayAccount: '', // 买家账号
      // alipayNo: '', // 交易号
      // payChannel: [], // 支付渠道
      pageNum: 1,
      pageSize,
      sortBy: {}
    };

    return {
      placeholder: '根据客户/订单编号/工单编号/交易号搜索',
      multipleSelection: {
        leftName: '客户名称',
        rightName: '收支金额',
        list: [],
        multipleSelectionPanelShow: false,
      },

      auths: {}, // 权限对象

      columns: this.buildColumns(),
      isExpand: false,
      pending: false,
      bill: {
        payType: [{
          text: '支付宝',
          value: ''
        }, {
          text: '微信',
          value: 1
        }, {
          text: '银行卡',
          value: 0
        }, {
          text: '其他',
          value: 2
        }],
        billType: ['工单支付'],
        dateRange: ''
      },


      originModel,
      model: _.assign({}, originModel),

      page: new Page(),
      selected: [],

      pickerOptions: {
        shortcuts: [{
          text: '今日',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '昨日',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
            end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
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
      options: {
        pickerOptions: {
          shortcuts: [{
            text: '今日',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '昨日',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 1);
              end.setTime(end.getTime() - 3600 * 1000 * 24 * 1);
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
        createTime: [],
        amount: {
          amountStart: '',
          amountEnd: ''
        }
      },
      selectedLimit: 200,
    }
  },
  computed: {
    partFields () {
      let fixedFields = [
        {
          displayName: '客户',
          fieldName: 'customerId',
          formType: 'customer',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '商家订单号',
          fieldName: 'shbTradeNo',
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
        // {
        //   displayName: '支付渠道',
        //   fieldName: 'payType',
        //   formType: 'select',
        //   isExport: false,
        //   isSystem: 1,
        //   setting: {
        //     dataSource: this.bill.payType,
        //     isMulti: false
        //   }
        // }, 
        {
          displayName: '交易号',
          fieldName: 'tradeNo',
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
          fieldName: 'payTime',
          formType: 'date',
          isExport: false,
          isNull: 1,
          isSystem: 1,
          operator: 'between',
          orderId: 99
        },
        {
          displayName: '付款账号',
          fieldName: 'buyerLogonId',
          formType: 'text',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '收款账号',
          fieldName: 'sellerLogonId',
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
        // {
        //   displayName: '账单类型',
        //   fieldName: 'billType',
        //   formType: 'select',
        //   isExport: false,
        //   isSystem: 1,
        //   setting: {
        //     dataSource: this.bill.billType,
        //     isMulti: false
        //   }
        // }
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

    buildExportParams(checkedArr, ids) {
      let exportAll = !ids || !ids.length;
      let exportSearchModel = exportAll ? {
        ...this.buildParams(),
        exportTotal: this.page.total
      } : {exportTotal: ids.length};

      return {
        checked: checkedArr.join(','),
        data: exportAll ? '' : ids.join(','),
        exportSearchModel: JSON.stringify(exportSearchModel)
      };
    },
    /** 检测导出条数 */
    checkExportCount(ids, max) {
      let exportAll = !ids || !ids.length;
      return exportAll && this.page.total > max ? '为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。' : null;
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
      // if(!this.allowImportAndExport || !this.allowEdit || !this.allowInout) return;
      let ids = [];
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}在线支付记录.xlsx`;
      if (!exportAll) {
        if (!this.selected.length) return this.$platform.alert('请选择要导出的数据');
        ids = this.selected.map(item => item.id);
      }
      this.$refs.exportPanel.open(ids, fileName, true);
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
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `frame_tab_taskView_${row.taskId}`,
        url:`/task/view/${row.taskId}`,
        title: `工单${row.taskId}`,
        close: true,
        fromId
      })
    },

    // 计算已选择
    selectionCompute(selection) {
      let tv = [];
      
      tv = this.multipleSelection.list
        .filter(ms => this.page.list.every(c => c.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);

      return tv;
    },
    select(data){
      let tv = this.selectionCompute(data);
      
      let original = this.multipleSelection.list
        .filter(ms => this.page.list.some(cs => cs.id === ms.id));

      let unSelected = this.page.list
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach(row => {
              this.$refs.table.toggleRowSelection(row, false);
            })
            : this.$refs.table.clearSelection();
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }

      this.multipleSelection.list = [];
      this.selected = tv;
      tv.forEach((item) => {
        item.serialNumber = item.customerName;
        item.name = item.receiptAmount.toFixed(2);
        this.multipleSelection.list.push(item)
      })
    },
    // 匹配选中的列
    matchSelected() {
      if (!this.multipleSelection.list.length) return;

      const selected = this.page.list
        .filter(c => {
          if (this.multipleSelection.list.some(sc => sc.id === c.id)) {
            this.multipleSelection.list = this.multipleSelection.list.filter(sc => sc.id !== c.id);
            this.multipleSelection.list.push(c);
            return c;
          }
        }) || [];

      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },

    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let row = undefined;

      if (rows && rows.length <= 0) this.$refs.table.clearSelection();

      if (rows) {
        for(let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.page.list.every(item => {
            return item.id !== row.id;
          })
          if(isNotOnCurrentPage) return
        }
        rows.forEach(row => {
          this.$refs.table.toggleRowSelection(row);
        });
      } else {
        this.$refs.table.clearSelection();
        this.multipleSelection.list = [];
      }
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

    search (data, type) {
      if(type == 'jump') {
        this.jump(data.pageNum);
        return;
      }
      if(type == 'pageSizeChange') {
        this.pageSizeChange(data.pageSize);
        return;
      }
      this.buildModel(data);
      this.loadData();
    },

    buildModel (data) {
      this.model = _.assign({}, this.originModel);
      this.$refs.table.clearSort();
      
      this.model.keyword = data.keyword;

      this.buildTime(this.options.createTime);

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

        if (tv.fieldName === 'customerId') {
          this.model.customerId = form[fn];
          continue;
        }

        if (tv.fieldName === 'shbTradeNo') {
          this.model.shbTradeNo = form[fn];
          continue;
        }

        if (tv.fieldName === 'taskNo') {
          this.model.taskNo = form[fn];
          continue;
        }

        if (tv.fieldName === 'payType') {
          this.model.payType = form[fn];
          continue;
        }

        if (tv.fieldName === 'tradeNo') {
          this.model.tradeNo = form[fn];
          continue;
        }

        if (tv.fieldName === 'payTime') {
          this.model.payTimeStart = formatDate(form[fn][0], 'YYYY-MM-DD 00:00:00')
          this.model.payTimeEnd = `${formatDate(form[fn][1], 'YYYY-MM-DD')} 23:59:59`
          continue;
        }

        if (tv.fieldName === 'buyerLogonId') {
          this.model.buyerLogonId = form[fn];
          continue;
        }

        if (tv.fieldName === 'sellerLogonId') {
          this.model.sellerLogonId = form[fn];
          continue;
        }

        if (tv.fieldName === 'amountRange') {
          this.model.receiptAmountMin = form[fn].amountStart;
          this.model.receiptAmountMax = form[fn].amountEnd;
          this.options.mounted = form[fn];
          continue;
        }

        if (tv.fieldName === 'billType') {
          this.model.billType = form[fn];
          continue;
        }
      }
    },

    reset(){
      this.model = _.assign({}, this.originModel);
      this.options.createTime = [];
      this.options.amount.amountStart = '';
      this.options.amount.amountEnd = '';
      this.$refs.table.clearSort();
      this.loadData();
    },

    sort({column, prop, order}){
      let sortBy = {};

      if(prop){
        let tableName = 'pbo';
        let key = `${tableName}.${prop}`
        sortBy[key] = order == 'ascending';
      }

      this.model.sortBy = sortBy;
      this.loadData();
    },

    async loadData(){
      this.loadingListData = true;
      try{
        let res = await this.fetchData();
        if(res.success == false) {
          this.loadingListData = false;
          this.$platform.notification({
            title: res.message,
            type: 'error',
          });
          return;
        }
        this.page = res.result;
        this.model.pageNum = this.page.pageNum;
        this.model.pageSize = this.page.pageSize;
        this.matchSelected();
      }catch(error){
        this.loadingListData = false;
        console.error(error);
      }
      this.loadingListData = false;
    },

    fetchData(){
      // 获取支付列表
      return this.$http.post('/api/payment/outside/paymentBill/online/list', this.model)
      // return this.$http.post('/outside/paymentBill/online/list', this.model)
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
          width: '160px',
          exportAlias: 'export_customerName',
          tooltip: true,
        },
        {
          label: '工单编号',
          field: 'taskNo',
          show: true,
          width: '150px',
          exportAlias: 'export_taskNo',
          tooltip: true,
        },
        {
          label: '商家订单号',
          field: 'shbTradeNo',
          show: true,
          width: '150px',
          exportAlias: 'export_shbTradeNo',
          tooltip: true,
        },
        {
          label: '支付渠道',
          field: 'payType',
          show: true,
          exportAlias: 'export_payType',
          tooltip: true,
        },
        {
          label: '交易号',
          field: 'tradeNo',
          show: true,
          width: '150px',
          exportAlias: 'export_tradeNo',
          tooltip: true,
        },
        {
          label: '收支金额（元）',
          field: 'receiptAmount',
          show: true,
          width: '150px',
          sortable: 'pbo',
          exportAlias: 'export_receiptAmount',
          tooltip: true,
        },
        {
          label: '交易付款时间',
          field: 'payTime',
          show: true,
          width: '170px',
          sortable: 'pbo',
          exportAlias: 'export_payTime',
          tooltip: true,
        },
        {
          label: '交易创建时间',
          field: 'createTime',
          show: true,
          width: '170px',
          sortable: 'pbo',
          exportAlias: 'export_createTime',
          tooltip: true,
        },
        {
          label: '付款账号',
          field: 'buyerLogonId',
          show: true,
          width: '150px',
          exportAlias: 'export_buyerLogonId',
          tooltip: true,
        },
        {
          label: '收款账号',
          field: 'sellerLogonId',
          show: true,
          width: '150px',
          exportAlias: 'export_sellerLogonId',
          tooltip: true,
        },
        {
          label: '账单类型',
          field: 'billType',
          show: true,
          exportAlias: 'export_billType',
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

    buildTime(value) {
      if(!value || !value.length) return;
      this.model.createTimeStart = formatDate(value[0], 'YYYY-MM-DD 00:00:00')
      this.model.createTimeEnd = `${formatDate(value[1], 'YYYY-MM-DD')} 23:59:59`
    },

    updateCreateTime(value) {
      this.options.createTime = value;
    },
   
    trackEventHandler() {
      window.TDAPP.onEvent('pc：在线支付管理-更多操作事件');
    }
  },
  mounted(){
    this.page.pageNum = this.model.pageNum;
    this.page.pageSize = this.model.pageSize;

    // this.loadData();
    window.__exports__refresh = this.loadData();
    console.log(3333);
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