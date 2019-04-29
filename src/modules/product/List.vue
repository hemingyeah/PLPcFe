<template>
  <div class="product-list-container" v-loading.fullscreen.lock="loading">

    <div class="product-list-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="product-list-base-search-group">
          <el-input v-model="searchModel.keyword" placeholder="根据产品信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="search({resetPageNum: true})" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="resetParams">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="advancedSearchPanelShow = !advancedSearchPanelShow">高级搜索</span>
      </form>
    </div>

    <div class="product-list-section">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @event="goToCreate" v-if="editedPermission">新建</base-button>
          <base-button type="ghost" icon="icon-yemianshanchu" @event="deleteProducts" v-if="deletePermission">删除</base-button>
        </div>

        <div class="action-button-group">
          <base-button type="plain" @event="openDialog('sendMessage')" v-if="editedPermission === 3">发送短信</base-button>
          <base-button type="plain" @event="openDialog('edit')" v-if="editedPermission === 3">批量编辑</base-button>
          <base-button type="plain" @event="openDialog('remind')" v-if="editedPermission === 3">批量提醒</base-button>
          <el-dropdown trigger="click" v-if="exportPermission">
            <span class="el-dropdown-link el-dropdown-btn">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="openDialog('importProduct')">导入产品</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportProduct(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportProduct(true)">导出全部</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="openDialog('update')">批量更新</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown :hide-on-click="false" :show-timeout="150" trigger="click">
            <span class="el-dropdown-link el-dropdown-btn">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="product-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.field">
                <el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label"/>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>


      <el-table
        :data="page.list"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        :highlight-current-row="false"
        header-row-class-name="product-table-header"
        ref="multipleTable" class="product-table">

        <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>

        <el-table-column
          v-for="column in columns"
          v-if="column.show"
          :key="column.field"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          :min-width="column.minWidth || '120px'"
          :sortable="column.sortable"
          show-overflow-tooltip
          :align="column.align">
          <template slot-scope="scope">
            <template v-if="column.field === 'name'">
              <a href="" class="view-detail-btn" @click.stop.prevent="openProductTab(scope.row.id)">{{scope.row[column.field]}}</a>
            </template>
            <template v-else-if="column.field === 'customer'">
              <a href="" class="view-detail-btn" @click.stop.prevent="createCustomerTab(scope.row.customer.id)">
                {{scope.row.customerName}}
              </a>
            </template>
            <template v-else-if="column.field === 'productTemplate'">
              <a href="" class="view-detail-btn" @click.stop.prevent="createTemplateTab(scope.row.templateId)">
                {{scope.row.templateName}}
              </a>
            </template>
            <template v-else-if="column.field === 'tags'">
              {{scope.row | formatTags}}
            </template>
            <template v-else-if="column.field === 'updateTime'">
              <template v-if="scope.row.latesetUpdateRecord">
                <el-tooltip class="item" effect="dark" :content="scope.row.latesetUpdateRecord" placement="top">
                  <div @mouseover="showLatestUpdateRecord(scope.row)">
                    {{scope.row.updateTime | formatDate}}
                  </div>
                </el-tooltip>
              </template>
              <template v-else>
                <div @mouseover="showLatestUpdateRecord(scope.row)">
                  {{scope.row.updateTime | formatDate}}
                </div>
              </template>
            </template>
            <template v-else-if="column.formType === 'user' && scope.row.attribute[column.field]">
              {{scope.row.attribute[column.field].displayName || scope.row.attribute[column.field].name}}
            </template>
            <template v-else-if="!column.isSystem">
              {{scope.row.attribute[column.field]}}
            </template>

            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="list-info">
          共<span class="level-padding">{{page.total}}</span>记录，
          已选中<span class="product-selected-count" @click="multipleSelectionPanelShow = true">{{multipleSelection.length}}</span>条
          <span class="product-selected-count" @click="toggleSelection()">清空</span>
        </div>
        <el-pagination
          class="product-table-pagination"
          background
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="page.pageSize"
          :current-page="page.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="page.total">
        </el-pagination>
      </div>
    </div>

    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title">
        <span>已选中数据({{multipleSelection.length}})</span>
        <i
          v-if="multipleSelection.length"
          class="iconfont icon-qingkongshanchu product-panel-btn"
          @click="toggleSelection()"
          title="清空已选中数据" data-placement="right" v-tooltip></i>
      </h3>

      <div class="product-selected-panel">
        <div class="product-selected-tip" v-if="!multipleSelection.length">
          <img src="../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="product-selected-list">
            <div class="product-selected-row product-selected-head">
              <span class="product-selected-sn">编号</span>
              <span class="product-selected-name">产品</span>
            </div>
            <div class="product-selected-row" v-for="c in multipleSelection" :key="c.id" >
              <span class="product-selected-sn">{{c.serialNumber}}</span>
              <span class="product-selected-name">{{c.name}}</span>
              <button type="button" class="product-selected-delete" @click="removeFromSelection(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>

    <base-panel :show.sync="advancedSearchPanelShow" :width="panelWidth">
      <h3 slot="title">
        <span>高级搜索</span>
        <el-dropdown class="pull-right" trigger="click" @command="setAdvanceSearchColumn">
          <i class="iconfont icon-xitongguanli customer-panel-btn" style="float: none;"></i>

          <el-dropdown-menu slot="dropdown" class="customer-advance-setting">
            <el-dropdown-item command="1">一栏</el-dropdown-item>
            <el-dropdown-item command="2">两栏</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </h3>
      <el-form class="advanced-search-form" onsubmit="return false;">
        <div class="form-item-container" :class="{'two-columns': columnNum === 2, }">

          <el-form-item label-width="100px" label="客户">
            <el-select
              v-model="searchModel.customer"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词搜索"
              clearable
              :loading="inputRemoteSearch.customer.loading"
              :remote-method="searchCustomer">
              <el-option
                v-for="item in inputRemoteSearch.customer.options"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>

          </el-form-item>


          <el-form-item label-width="100px" label="选择团队">
            <el-select
              v-model="searchModel.tag"
              filterable
              clearable
              remote
              reserve-keyword
              placeholder="请输入关键词搜索"
              :loading="inputRemoteSearch.tag.loading"
              :remote-method="searchTag">

              <el-option
                v-for="item in inputRemoteSearch.tag.options"
                :key="item.id"
                :label="item.tagName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label-width="100px" label="创建时间">
            <el-date-picker
              v-model="searchModel.createTime"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="datePickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item label-width="100px" label="更新时间">
            <el-date-picker
              v-model="searchModel.updateTime"
              type="daterange"
              align="right"
              unlink-panels
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="datePickerOptions">
            </el-date-picker>
          </el-form-item>

          <el-form-item label-width="100px" label="产品名称">
            <el-input v-model="searchModel.name" type="text"></el-input>
          </el-form-item>

          <el-form-item label-width="100px" label="产品编号">
            <el-input v-model="searchModel.serialNumber" type="text"></el-input>
          </el-form-item>

          <el-form-item label-width="100px" label="产品类型">
            <el-select v-model="searchModel.type" clearable >
              <el-option
                v-for="item in productTypes"
                :key="item"
                :label="item"
                :value="item"
                :disabled="item.disabled">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label-width="100px" label="有无提醒">
            <el-select v-model="searchModel.hasRemind" clearable >
              <el-option
                v-for="item in searchRemindOptions"
                :key="item.label"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>


          <!-- 动态搜索框 -->
          <el-form-item label-width="100px" :label="field.displayName" v-for="field in searchFields"
                        :key="field.fieldName">
            <template v-if="field.formType === 'text' || field.formType === 'code'">
              <el-input v-model="searchModel[field.fieldName]"
                        :placeholder="field.placeHolder" type="text"></el-input>
            </template>
            <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
              <el-select v-model="searchModel[field.fieldName]" clearable
                         :placeholder="field.placeHolder">
                <el-option
                  v-for="item in field.setting.dataSource"
                  :key="item"
                  :label="item"
                  :value="item"
                  :disabled="item.disabled">
                </el-option>
              </el-select>
            </template>

            <template v-else-if="field.formType === 'user'">
              <el-select
                v-model="searchModel[field.fieldName]"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                clearable
                :loading="inputRemoteSearch.customerManager.loading"
                :remote-method="searchCustomerManager">
                <el-option
                  v-for="item in inputRemoteSearch.customerManager.options"
                  :key="item.userId"
                  :label="item.displayName"
                  :value="item.userId">
                </el-option>
              </el-select>
            </template>


            <template v-else-if="field.formType === 'date' || field.formType === 'datetime'">
              <el-date-picker
                v-model="searchModel[field.fieldName]"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="datePickerOptions">
              </el-date-picker>
            </template>

            <template v-else>
              <el-input v-model="searchModel[field.fieldName]"
                        :placeholder="field.placeHolder"></el-input>
            </template>
          </el-form-item>
        </div>
        <div class="advanced-search-btn-group">
          <base-button type="ghost" @event="resetParams">重置</base-button>
          <base-button type="primary" @event="search({resetPageNum: true, moreConditions: true})" native-type="submit">搜索</base-button>
        </div>
      </el-form>
    </base-panel>


    <send-message-dialog ref="messageDialog" :selected-ids="selectedIds" :sms-rest="smsRest"></send-message-dialog>
    <batch-editing-dialog
      ref="batchEditingDialog"
      :fields="productFields"
      :product-types="productTypes"
      @submit-callback="search"
      :selected-ids="selectedIds"></batch-editing-dialog>

    <batch-reminding-dialog ref="batchRemindingDialog" :selected-ids="selectedIds"></batch-reminding-dialog>

    <base-import
      title="导入产品"
      ref="importProductModal"
      @success="search"
      action="/product/import">
      <div slot="tip">
        <div class="base-import-warn">
          <p>请先下载<a href="/product/import/template">导入模版 </a>，填写完成后再上传导入。</p>
          <p>导入产品前，请确保产品所属客户已存在。您可以 <a href="/customer/import/getAllCustomerId">点这里</a>导出包含所有已存在客户的模板</p>
        </div>
      </div>
    </base-import>

    <base-export
      ref="exportPanel"
      :columns="exportColumns"
      :build-params="buildExportParams"
      :validate="checkExportCount"
      method="post"
      action="/customer/product/export"/>


    <batch-update-dialog
      ref="batchUpdateDialog"
      :selected-ids="selectedIds"
      :total-items="page.total"
      :build-download-params="buildParams"
      @success="search"
      action="/product/importCover"
    ></batch-update-dialog>

  </div>
</template>

<script>

import Page from '@model/Page';
import {formatDate} from '@src/util/lang';
import SendMessageDialog from './components/SendMessageDialog.vue';
import BatchEditingDialog from './components/BatchEditingDialog.vue'
import BatchRemindingDialog from './components/BatchRemindingDialog.vue';
import BatchUpdateDialog from './components/BatchUpdateDialog.vue';

import {
  getProduct,
  deleteProductByIds,
  getUpdateRecord,
} from '@src/api/ProductApi';


/**
 *  todo
 *  二维码编号显示
 */
export default {
  name: 'product-list',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      advancedSearchPanelShow: false,
      multipleSelectionPanelShow: false,
      page: new Page(),
      columns: [],
      multipleSelection: [],
      columnNum: 1,
      loading: false,
      searchIncludeMoreConditions: false,
      searchModel: {
        keyword: '',
        customer: '',
        tag: '',
        createTime: '',
        updateTime: '',
        name: '',
        serialNumber: '',
        type: '',
        hasRemind: '',

        pageSize: 10,
        pageNum: 1,
        orderDetail: {},
      },
      inputRemoteSearch: {
        customer: {
          options: [],
          loading: false,
        },
        tag: {
          options: [],
          loading: false,
        },
        customerManager: {
          options: [],
          loading: false,
        },
      },
      searchRemindOptions: [
        {
          label: '全部',
          value: '',
        },
        {
          label: '有',
          value: 1,
        },
        {
          label: '无',
          value: 0,
        },
      ],

      datePickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
    }
  },
  computed: {
    auth() {
      return this.initData.authorities;
    },
    editedPermission() {
      return this.auth.CUSTOMER_EDIT;
    },
    deletePermission() {
      return this.auth.CUSTOMER_EDIT === 3 && this.auth.CUSTOMER_DELETE;
    },
    exportPermission() {
      return this.auth.EXPORT_IN;
    },
    productFields() {

      let fixedFields = [
        {
          displayName: '最近更新',
          fieldName: 'updateTime',
          formType: 'date',
          isExport: false,
          isSystem: 1,
        },
        {
          displayName: '产品模板',
          fieldName: 'productTemplate',
          formType: 'text',
          isExport: false,
          isSystem: 0,
        },
        {
          displayName: '服务团队',
          fieldName: 'tags',
          isExport: true,
          isSystem: 0,
          exportAlias: 'customerTags'
        },
        {
          displayName: '提醒数量',
          fieldName: 'remindCount',
          isExport: false,
          isSystem: 0,
        },
      ];


      if (this.initData.productConfig.qrcodeEnabled) {
        fixedFields.push({
          displayName: '二维码编号',
          fieldName: 'qrcodeId',
          formType: 'text',
          isExport: false,
          isSystem: 1,
          orderId: -4
        })
      }

      return (this.initData.productFields || [])
        .concat(fixedFields)
        .map(f => {

          // 调整字段顺序
          if (f.fieldName === 'name') {
            f.orderId = -10;
          }

          if (f.fieldName === 'customer') {
            f.orderId = -9;
          }

          if (f.fieldName === 'serialNumber') {
            f.orderId = -6;
          }

          if (f.fieldName === 'type') {
            f.orderId = -5;
          }


          if (f.fieldName === 'tags') {
            f.orderId = -8;
          }

          if (f.fieldName === 'productTemplate') {
            f.orderId = -7;
          }

          if (f.fieldName === 'remindCount') {
            f.orderId = -3;
          }

          if (f.fieldName === 'updateTime') {
            f.orderId = -2;
          }

          return f;
        })
        .sort((a, b) => a.orderId - b.orderId)
    },
    productTypes() {
      return this.initData.productConfig.productType || [];
    },
    searchFields() {
      return this.productFields
        .filter(f => f.isSearch);
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
    selectedIds() {
      return this.multipleSelection.map(p => p.id);
    },
    exportColumns() {
      return [{
        label: '产品系统编号',
        field: 'productId',
        export: true,
      }, {
        label: '客户姓名',
        field: 'customerName',
        export: true,
      }, {
        label: '客户编号',
        field: 'customerSN',
        export: true,
      }, ...this.columns]
        .map(field => {

          if (['customer', 'updateTime', 'productTemplate', 'remindCount', 'qrcodeId'].some(key => key === field.fieldName)) {
            field.export = false;
          } else {
            field.export = true;
          }

          return field
        })
    },
    smsRest() {
      return this.initData.smsRest || 0;
    }
  },
  filters: {
    formatTags({customer}) {
      if (!customer) return '';
      if (!customer.tags || !customer.tags.length) return '';
      return customer.tags.map(t => t.tagName).join(' ')
    },
    formatDate(val) {
      if (!val) return '';
      return formatDate(val, 'YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted() {

    console.log('initData', this.initData);
    this.revertStorage();
    this.buildColumns();
    this.addCustomizedFieldToSearchModel();
    this.search();
    // updateProductRemindCount
    this.$eventBus.$on('product_list.update_product_list_remind_count', this.updateProductRemindCount)
  },
  beforeDestroy() {
    this.$eventBus.$off('product_list.update_product_list_remind_count', this.updateProductRemindCount)
  },
  methods: {
    openProductTab(productId) {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `customer_view_${productId}`,
        title: '产品详情',
        close: true,
        url: `/customer/product/detail/${productId}?noHistory=1`,
        fromId
      })

    },
    search({ resetPageNum = false, moreConditions = false } = {}) {
      if (resetPageNum) {
        this.searchModel.pageNum = 1;
      }
      if (moreConditions) {
        this.searchIncludeMoreConditions = true;
      }

      const params = this.buildParams();
      this.loading = true;

      return getProduct(params)
        .then(res => {
          this.loading = false;
          return this.page = Page.as(Object.freeze(res));
        })
        .catch(e => console.error('fetch product catch an error', e));
    },
    buildParams() {
      const { searchModel, searchIncludeMoreConditions, searchFields } = this;
      let params = {
        keyword: searchModel.keyword,
        pageSize: searchModel.pageSize,
        pageNum: searchModel.pageNum,
      };
      let conditions = [];
      let key = '';
      
      if (Object.keys(searchModel.orderDetail || {}).length) {
        params.orderDetail = searchModel.orderDetail;
      }

      if (!searchIncludeMoreConditions) return params;

      searchFields
        .forEach(field => {
          key = field.fieldName;
          if (searchModel[key] && field.formType === 'date') {
            return conditions.push({
              property: key,
              operator: field.operator,
              betweenValue1: formatDate(searchModel[key][0], 'YYYY-MM-DD'),
              betweenValue2: formatDate(searchModel[key][1], 'YYYY-MM-DD'),
            });
          }
          if (searchModel[key] && field.formType === 'datetime') {
            return conditions.push({
              property: key,
              operator: field.operator,
              betweenValue1: formatDate(searchModel[key][0], 'YYYY-MM-DD HH:mm:ss'),
              betweenValue2: `${formatDate(searchModel[key][1], 'YYYY-MM-DD')} 23:59:59`,
            });
          }

          if (searchModel[key]) {
            conditions.push({
              property: key,
              operator: field.operator,
              value: searchModel[key],
            });
          }
        });
      params.conditions = conditions;

      let keys = ['customer', 'tag', 'name', 'serialNumber', 'type'];
      let k = '';

      keys.forEach(key => {
        if (searchModel[key]) {
          k = key;

          if (key === 'customer') {
            k = 'customerId';
          }
          if (key === 'tag') {
            k = 'tagId';
          }

          params[k] = searchModel[key];
        }
      });

      params.hasRemind = searchModel.hasRemind;

      if (Array.isArray(searchModel.createTime) && searchModel.createTime.length === 2) {
        params.createTime = searchModel.createTime.map(t => formatDate(t, 'YYYY/MM/DD')).join('-');
      }

      if (Array.isArray(searchModel.updateTime) && searchModel.updateTime.length === 2) {
        params.updateTime = searchModel.updateTime.map(t => formatDate(t, 'YYYY/MM/DD')).join('-');
      }

      return params
    },
    jump(pageNum) {
      this.searchModel.pageNum = pageNum;
      this.search();
    },
    resetParams() {
      this.searchIncludeMoreConditions = false;
      this.searchModel = {
        keyword: '',
        pageNum: 1,
        pageSize: this.page.pageSize,
        orderDetail: {},
      };

      this.addCustomizedFieldToSearchModel();
      this.search();
    },
    openDialog(action) {

      if (action === 'sendMessage') {
        this.$refs.messageDialog.openSendMessageDialog();
      }

      if (action === 'edit') {
        this.$refs.batchEditingDialog.openBatchEditingDialog();
      }

      if (action === 'remind') {
        this.$refs.batchRemindingDialog.openBatchRemindingDialog();
      }

      if (action === 'importProduct') {
        this.$refs.importProductModal.open();
      }

      if (action === 'update') {
        this.$refs.batchUpdateDialog.openBatchUpdateCustomerDialog();
      }

    },
    // operation
    async deleteProducts() {
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的产品');
      }

      try {
        if (!await this.$platform.confirm('确定要删除选择的产品？')) return;

        const ids = this.multipleSelection.map(p => p.id).join(',');

        const res = await deleteProductByIds(ids);

        if (!res || res.status) return this.$platform.notification({
          title: '失败',
          type: 'error',
          message: res.message || '发生未知错误',
        });
        this.$platform.notification({
          title: '删除成功',
          type: 'success',
        });
        this.multipleSelection = [];
        this.search();

      } catch (e) {
        console.error('e', e);
      }
    },
    // 批量添加提醒成功后，更新产品的提醒数量
    updateProductRemindCount() {
      let count = 0;
      this.page.list = this.page.list
        .map(product => {
          count = product.attribute.remindCount || 0;

          if (this.selectedIds.some(id => id === product.id)) {
            product.attribute.remindCount = count + 1;
          }

          return product;
        })
    },
    // table method
    handleSelection(selection) {
      this.multipleSelection = selection;
    },
    sortChange(option) {
      try {
        const {prop, order} = option;
        if (!order) {
          this.searchModel.orderDetail = {};
          return this.search();
        }
        const sortedField = this.productFields.filter(sf => sf.fieldName === prop)[0] || {};

        let isSystem = 0;

        if (prop === 'createTime' || prop === 'updateTime') {
          isSystem = 1;
        } else {
          isSystem = sortedField.isSystem;
        }

        let sortModel = {
          isSystem,
          sequence: order === 'ascending' ? 'ASC' : 'DESC',
          column: isSystem ? `product.${prop}` : prop,
        };


        if (prop === 'createTime' || prop === 'updateTime' || sortedField.formType === 'date' || sortedField.formType === 'datetime') {
          sortModel.type = 'date';
        } else {
          sortModel.type = sortedField.formType;
        }

        this.searchModel.orderDetail = sortModel;

        this.search();

      } catch (e) {
        console.error('e', e);
      }
    },
    handleSizeChange(pageSize) {
      this.saveDataToStorage('pageSize', pageSize);
      this.searchModel.pageSize = pageSize;
      this.search({resetPageNum: true});
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },

    removeFromSelection(c) {
      this.multipleSelection = this.multipleSelection
        .filter(ms => ms.id !== c.id);
    },
    modifyColumnStatus(val, column) {
      this.columns = this.columns
        .map(c => {
          if (c.field === column.field) {
            c.show = val;
          }
          return c;
        });
      const showColumns = this.columns.filter(c => c.show).map(c => c.field);
      this.saveDataToStorage('columnStatus', showColumns);
    },
    buildColumns() {
      // productUpdateTime,productTemplate,tags,remindCount

      let sortable = false;
      let isExport = true;
      let {columnStatus} = this.getLocalStorageData();
      const customerProductCheck = localStorage.getItem('customerProductCheck');

      if (customerProductCheck) {
        columnStatus = (customerProductCheck.split(',') || [])
          .map(c => {
            if (c === 'customerName') return 'customer';
            return c;
          })
        localStorage.removeItem('customerProductCheck');
      }

      this.columns = this.productFields
        .filter(f => f.formType !== 'attachment')
        .map(field => {

          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom';
          } else {
            sortable = false;
          }


          if (field.fieldName === 'type') {
            sortable = 'custom';
          }

          return {
            ...field,
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            show: columnStatus.some(c => c === field.fieldName),
            sortable,
            isSystem: field.isSystem,
            // exportAlias: field.exportAlias || ''
          }
        });

      return this.columns;
    },

    buildExportParams(checkedArr, ids) {
      let exportAll = !ids || !ids.length;
      return {
        productChecked: checkedArr.join(','),
        data: exportAll ? '' : ids.join(','),
        exportSearchModel: exportAll ? JSON.stringify(this.buildParams() || {}) : ''
      };
    },
    /** 检测导出条数 */
    checkExportCount(ids, max) {
      let exportAll = !ids || !ids.length;
      return exportAll && this.page.total > max ? '为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。' : null;
    },

    exportProduct(exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}产品数据.xlsx`;
      if (!exportAll) {
        if (!this.multipleSelection.length) return this.$platform.alert('请选择要导出的数据');
        ids = this.selectedIds;
      }
      this.$refs.exportPanel.open(ids, fileName);
    },

    addCustomizedFieldToSearchModel() {

      this.searchFields.forEach(field => {
        this.$set(this.searchModel, field.fieldName)
      })
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      this.saveDataToStorage('column_number', command);
    },
    searchCustomerManager(keyword) {
      this.inputRemoteSearch.customerManager.loading = true;
      return this.$http.get('/customer/userTag/list', {keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.customerManager.options = res.list;
          this.inputRemoteSearch.customerManager.loading = false;
          return res;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },

    searchTag(keyword) {
      this.inputRemoteSearch.tag.loading = true;
      return this.$http.get('/customer/tag/list', {keyword, pageNum: 1, pageSize: 100 * 100, })
        .then(res => {
          this.inputRemoteSearch.tag.loading = false;
          this.inputRemoteSearch.tag.options = res && res.list ? res.list : [];
          return res;
        })
        .catch(err => console.error('searchTag function catch err', err));
    },
    searchCustomer(keyword) {
      this.inputRemoteSearch.customer.loading = true;
      this.$http.get('/customer/getListAsyn', {keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.customer.options = res.list;
          this.inputRemoteSearch.customer.loading = false;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
    showLatestUpdateRecord(row) {
      if (row.latesetUpdateRecord) return;
      getUpdateRecord({
        productId: row.id
      })
        .then(res => {
          if (!res || res.status) return;

          this.page.list = this.page.list
            .map(c => {
              if (c.id === row.id) {
                c.latesetUpdateRecord = res.data;
              }
              return c;
            });
        })
        .catch(e => console.error('e', e));
    },

    createCustomerTab(productId) {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `customer_view_${productId}`,
        title: '客户信息',
        close: true,
        url: `/customer/view/${productId}?noHistory=1`,
        fromId
      })
    },

    createTemplateTab(templateId) {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `product_template_view_${templateId}`,
        title: '产品模板',
        close: true,
        url: `/product/template/detail/${templateId}?noHistory=1`,
        fromId
      })
    },
    goToCreate() {
      window.location = '/customer/product/create';
    },
    getLocalStorageData() {
      const dataStr = localStorage.getItem('product_list_localStorage_19_4_24') || '{}';
      return JSON.parse(dataStr);
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem('product_list_localStorage_19_4_24', JSON.stringify(data));
    },
    revertStorage() {
      const {pageSize} = this.getLocalStorageData();
      if (pageSize) {
        this.searchModel.pageSize = pageSize;
      }
    },
  },
  components: {
    [SendMessageDialog.name]: SendMessageDialog,
    [BatchEditingDialog.name]: BatchEditingDialog,
    [BatchRemindingDialog.name]: BatchRemindingDialog,
    [BatchUpdateDialog.name]: BatchUpdateDialog,
  }
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;
  .product-list-container {
    padding: 10px;
  }

  // search
  .product-list-container .product-list-search-group-container {

    .base-search {
      background: #fff;
      border-radius: 3px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      padding: 12px 10px;

      .product-list-base-search-group {
        display: flex;
        width: 440px;
        justify-content: space-between;

        .el-input {
          width: 300px;
          input {
            height: 34px;
            line-height: 34px;
            width: 300px;
          }
        }

        a {
          line-height: 33px;
        }

      }

      .advanced-search-visible-btn {
        font-size: 14px;
        font-weight: lighter;
        line-height: 32px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
        padding: 0 13px;
        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .product-list-container .product-list-section {
    padding-top: 10px;
  }

  // operation
  .product-list-container .product-list-section .operation-bar-container {
    background: #fff;
    border-radius: 3px 3px 0 0;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #f2f2f2;

    .top-btn-group .base-button {
      margin-right: 5px;
    }

    .action-button-group {
      .base-button {
        margin-left: 5px;
      }
    }

    .el-dropdown-btn {
      padding: 0 15px;
      line-height: 32px;
      display: inline-block;
      background: $color-primary-light-9;
      color: $text-color-primary;
      outline: none;
      margin-left: 5px;
      .iconfont {
        margin-left: 5px;
        font-size: 12px;
      }

      &:hover {
        cursor: pointer;
        color: #fff;
        background: $color-primary;
      }
    }
  }


  // table
  .product-list-container .product-table {
    padding: 10px;

    &:before {
      height: 0;
    }

    .product-table-header th {
      background: #F5F5F5;
      color: $text-color-primary;
      font-weight: normal;
    }

    th {
      color: #606266;
      font-size: 14px;
    }
    td {
      color: #909399;
      font-size: 13px;
    }

    .view-detail-btn {
      color: $color-primary;
    }

    .select-column .el-checkbox {
      position: relative;
      top: 3px;
    }
  }

  .product-list-container .table-footer {
    display: flex;
    justify-content: space-between;
    padding: 0px 10px 10px 10px ;
    background: #fff;
    border-radius: 0 0 3px 3px;

    .list-info {
      font-size: 13px;
      line-height: 32px;
      margin: 0;
      color: #767e89;

      .iconfont {
        position: relative;
        top: 1px;
      }

      .product-selected-count{
        color: $color-primary;
        padding: 0 3px;
        width: 15px;
        text-align: center;
        cursor: pointer;
        font-size: 13px;
      }

    }

    .el-pagination__jump {
      margin-left: 0;
    }
  }
  
  // select panel
  .product-list-container .product-selected-panel {
    font-size: 14px;
    height: calc(100% - 51px);

    .product-selected-tip {
      padding-top: 80px;

      img {
        display: block;
        width: 240px;
        margin: 0 auto;
      }

      p {
        text-align: center;
        color: #9a9a9a;
        margin: 30px 0 0 0;
        line-height: 20px;
      }
    }

    .product-selected-list {
      height: 100%;
      padding: 10px;
      overflow-y: auto;

      .product-selected-row {
        display: flex;
        flex-flow: row nowrap;
        line-height: 36px;
        border-bottom: 1px solid #ebeef5;
        font-size: 13px;

        &:hover {
          background-color: #f5f7fa;

          .product-selected-delete {
            visibility: visible;
          }
        }
      }

      .product-selected-head {
        background-color: #F0F5F5;
        color: #333;
        font-size: 14px;
      }

      .product-selected-sn {
        padding-left: 10px;
        width: 150px;
        @include text-ellipsis;
      }

      .product-selected-name {
        padding-left: 10px;
        flex: 1;
        @include text-ellipsis;
      }

      .product-selected-delete {
        width: 36px;
      }

      .product-selected-row button.product-selected-delete {
        padding: 0;
        width: 36px;
        height: 36px;
        border: none;
        background-color: transparent;
        outline: none;
        color: #646B78;
        visibility: hidden;

        i {
          font-size: 14px;
        }

        &:hover {
          color: #e84040;
        }
      }
    }
  }

  // advanced search form
  .product-list-container .advanced-search-form {
    overflow: auto;
    padding: 10px 0 63px 0;
    height: calc(100% - 52px);

    .two-columns {
      display: flex;
      flex-wrap: wrap;
      .el-form-item {
        width: 50%;
      }
    }

    .el-form-item {
      .el-form-item__content,
      .el-select,
      .base-dist-picker,
      .el-cascader,
      .el-date-editor {
        width: 290px;
      }
    }

    .advanced-search-btn-group {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      position: absolute;
      bottom: 0px;
      background: #fff;
      padding: 15px 20px;

      .base-button {
        margin: 0 10px;
      }
    }
  }



  .base-import-warn {
    p {
      margin: 0;
    }
  }


</style>
