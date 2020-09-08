<template>
  <div class="product-list-container" v-loading.fullscreen.lock="loading">

    <div class="product-list-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="product-list-base-search-group">
          <el-input v-model="searchModel.keyword" placeholder="根据产品信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="searchModel.pageNum=1;search();trackEventHandler('search')" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="resetParams">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="panelSearchAdvancedToggle">
          <i class="iconfont icon-add"></i>
          高级搜索
        </span>
      </form>
    </div>

    <div class="product-list-section">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @event="goToCreate" v-if="createdPermission">新建</base-button>
          <base-button type="ghost" icon="icon-qingkongshanchu" @event="deleteProducts" v-if="deletePermission">删除</base-button>
        </div>

        <div class="action-button-group">
          <base-button type="plain" @event="openDialog('sendMessage')" v-if="editedPermission === 3">发送短信</base-button>
          <base-button type="plain" @event="openDialog('edit')" v-if="editedPermission === 3">批量编辑</base-button>
          <base-button type="plain" @event="openDialog('remind')" v-if="editedPermission === 3">批量提醒</base-button>
          <el-dropdown trigger="click" v-if="exportPermission">
            <span class="el-dropdown-link el-dropdown-btn" @click="trackEventHandler('moreAction')">
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
          <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">选择列 <i class="iconfont icon-nav-down"></i></span>
        </div>
      </div>

      <div style="background: #fff;padding: 0 10px">
        <base-selection-bar ref="baseSelectionBar" v-model="multipleSelection" @toggle-selection="toggleSelection" @show-panel="() => multipleSelectionPanelShow = true" />
      </div>

      <el-table
        :data="page.list"
        :key="tableKey"
        :row-key="getRowKey"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        :highlight-current-row="false"
        header-row-class-name="product-table-header"
        ref="multipleTable" class="product-table">

        <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>

        <el-table-column
          v-for="(column, index) in columns"
          v-if="column.show"
          :key="`${column.field}_${index}`"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          :class-name="column.field == 'name' ? 'product-name-superscript-td' : ''"
          :min-width="column.minWidth || '120px'"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.field !== 'name'"
          :align="column.align">
          <template slot-scope="scope">
            <template v-if="column.field === 'name'">

              <sample-tooltip :row="scope.row">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                    <a
                      href="" 
                      class="view-detail-btn"
                      @click.stop.prevent="openProductTab(scope.row.id)">
                      {{scope.row[column.field]}}
                    </a>
                  </el-tooltip>
                </template>
              </sample-tooltip>

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
            <!-- 自定义的选择类型字段显示， 与type 区别-->
            <template v-else-if="column.formType === 'select' && !column.isSystem">
              {{scope.row.attribute[column.field] | displaySelect}}
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
            <template v-else-if="column.formType === 'address'">
              {{formatCustomizeAddress(scope.row.attribute[column.field])}}
            </template>
            <template v-else-if="column.formType === 'user' && scope.row.attribute[column.field]">
              {{scope.row.attribute[column.field].displayName || scope.row.attribute[column.field].name}}
            </template>
            <template v-else-if="column.formType === 'location'">
              {{ scope.row.attribute[column.field] && scope.row.attribute[column.field].address}}
            </template>
            <template v-else-if="column.field === 'createUser'">
              {{ scope.row.createUser && scope.row.createUser.displayName }}
            </template>
            <template v-else-if="column.field === 'createTime'">
              {{ scope.row.createTime | formatDate }}
            </template>
            <div v-else-if="column.formType === 'textarea'" v-html="buildTextarea(scope.row.attribute[column.field])" @click="openOutsideLink">
            </div>

            <template v-else-if="column.fieldName == 'linkmanName'">
              {{ scope.row.linkman.name }}
            </template>

            <template v-else-if="column.fieldName == 'phone'">
              {{ scope.row.linkman.phone }}
            </template>

            <template v-else-if="column.fieldName == 'address'">
              {{ getAddress(scope.row.address) }}
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

    <base-panel class="product-panel" :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title">
        <span>已选中产品({{multipleSelection.length}})</span>
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

    <send-message-dialog ref="messageDialog" :selected-ids="selectedIds" :sms-rest="smsRest"></send-message-dialog>

    <batch-editing-dialog
      ref="batchEditingDialog"
      :config="{fields: productFields, productTypes: productTypes}"
      :callback="search"
      :selected-ids="selectedIds"></batch-editing-dialog>

    <batch-reminding-dialog ref="batchRemindingDialog" :selected-ids="selectedIds"></batch-reminding-dialog>

    <base-import
      title="导入产品"
      ref="importProductModal"
      @success="search"
      action="/excels/customer/customerProductImport">
      <div slot="tip">
        <div class="base-import-warn">
          <p>请先下载<a href="/product/import/template">导入模版 </a>，填写完成后再上传导入。</p>
          <!--<p>导入产品前，请确保产品所属客户已存在。您可以 <a href="/customer/import/getAllCustomerId">点这里</a>导出包含所有已存在客户的模板</p>-->
        </div>
      </div>
    </base-import>

    <base-export
      ref="exportPanel"
      :columns="exportColumns"
      :build-params="buildExportParams"
      :validate="checkExportCount"
      method="post"
      action="/excels/customer/customerProduct"/>


    <batch-update-dialog
      ref="batchUpdateDialog"
      :selected-ids="selectedIds"
      :total-items="page.total"
      :build-download-params="buildParams"
      @success="search"
      action="/excels/customer/customerProductUpdateBatch"
    ></batch-update-dialog>

    <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus"/>

    <search-panel
      :init-data="initData"
      :config="{
        fields: this.productFields,
      }"
      ref="searchPanel"
    >
      <div class="advanced-search-btn-group" slot="footer">
        <base-button type="ghost" @event="resetParams">重置</base-button>
        <base-button type="primary" @event="powerfulSearch" native-type="submit">搜索</base-button>
      </div>
    </search-panel>
  </div>
</template>

<script>
import _ from 'lodash';

import Page from '@model/Page';
import {formatDate} from '@src/util/lang';
import SendMessageDialog from './components/SendMessageDialog.vue';
import BatchEditingDialog from './components/BatchEditingDialog.vue'
import BatchRemindingDialog from './components/BatchRemindingDialog.vue';
import BatchUpdateDialog from './components/BatchUpdateDialog.vue';
import SearchPanel from './components/SearchPanel.vue';

import {
  getProduct,
  deleteProductByIds,
  getUpdateRecord,
} from '@src/api/ProductApi';
import TeamMixin from '@src/mixins/teamMixin';

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g

export default {
  name: 'product-list',
  mixins: [TeamMixin],
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      multipleSelectionPanelShow: false,
      page: new Page(),
      columns: [],
      multipleSelection: [],
      columnNum: 1,
      loading: false,
      selectedLimit: 500,
      searchIncludeMoreConditions: false,
      searchModel: {
        keyword: '',
        pageSize: 10,
        pageNum: 1,
        orderDetail: {},
        moreConditions: {
          conditions: [],
        },
      },

      filterTeams: [],
      tableKey: Math.random() * 1000 >> 2,
    }
  },
  computed: {
    auth() {
      return this.initData?.loginUser?.authorities || this.initData?.authorities;
    },
    editedPermission() {
      return this.auth.PRODUCT_EDIT;
    },
    createdPermission() {
      return this.auth.PRODUCT_CREATE;
    },
    viewedPermission() {
      return this.auth.CUSTOMER_VIEW === 3
    },
    deletePermission() {
      return this.auth.PRODUCT_EDIT === 3 && this.auth.PRODUCT_DELETE;
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
          displayName: '服务部门',
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
        {
          displayName: '创建人',
          fieldName: 'createUser',
          isExport: true,
          isSystem: 0
        },
        {
          displayName: '创建时间',
          fieldName: 'createTime',
          isExport: true,
          isSystem: 0
        }
      ];


      if (this.initData.productConfig.qrcodeEnabled) {
        fixedFields.push({
          displayName: '二维码编号',
          fieldName: 'qrcodeId',
          formType: 'text',
          isExport: false,
          isSystem: 1,
          placeholder: '请输入产品二维码',
          orderId: 10001
        })
      }
      let field = this.initData.productFields.filter(item => item.formType == 'customer')[0]
      if(field && field.setting.customerOption?.linkman) {
        fixedFields.push({
          displayName: '联系人',
          fieldName: 'linkmanName',
          formType: 'text',
          isExport: true,
          isSystem: 0,
        })

        fixedFields.push({
          displayName: '电话',
          fieldName: 'phone',
          isExport: true,
          isSystem: 0,
        })
      }

      if(field && field.setting.customerOption?.address) {
        fixedFields.push({
          displayName: '地址',
          fieldName: 'address',
          isExport: true,
          formType: 'text',
          isSystem: 0,
        })
      }

      return (this.initData.productFields || [])
        .concat(fixedFields)
        .filter(f => f.formType !== 'separator' && f.formType !== 'info')
        .map(f => {

          // 调整字段顺序
          if (f.fieldName === 'name') {
            f.orderId = -13;
            f.show = true
          }

          if (f.fieldName === 'customer') {
            f.orderId = -12;
            f.show = true
          }

          if (f.fieldName === 'linkmanName') {
            f.orderId = -11;
            f.show = true
          }

          if (f.fieldName === 'phone') {
            f.orderId = -10;
            f.show = true
          }

          if (f.fieldName === 'address') {
            f.orderId = -9;
            f.show = true
          }

          if (f.fieldName === 'serialNumber') {
            f.orderId = -6;
            f.show = true
          }

          if (f.fieldName === 'type') {
            f.orderId = -5;
            f.show = true
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

          if (f.fieldName === 'createUser') {
            f.orderId = -1;
            f.show = true;
          }

          if (f.fieldName === 'createTime') {
            f.orderId = 0;
            f.show = true;
          }

          return f;
        })
        .sort((a, b) => a.orderId - b.orderId)
    },
    productTypes() {
      return this.initData.productConfig.productType || [];
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

          if (['customer', 'productTemplate', 'remindCount'].some(key => key === field.fieldName) || field.formType === 'info') {
            field.export = false;
          } else {
            field.export = true;
          }
          
          if ('qrcodeId' == field.fieldName) {
            field.export = Boolean(this.initData.productConfig.qrcodeEnabled);
          }

          if ('qrcodeId' == field.fieldName) {
            field.export = Boolean(this.initData.productConfig.qrcodeEnabled);
          }

          return field
        })
    },
    smsRest() {
      return this.initData.smsRest || 0;
    },
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
    },
    displaySelect(value) {
      if (!value) return null;
      if (value && typeof value === 'string') {
        return value;
      }
      if (Array.isArray(value) && value.length) {
        return value.join('，');
      }
      return null;
    },

  },
  mounted() {
    this.revertStorage();
    this.buildColumns();
    this.search();

    if(!this.viewedPermission) {
      this.filterTeams = this.matchTags(this.teamsWithChildTag.slice());
    }

    // [tab_spec]标准化刷新方式
    window.__exports__refresh = this.search;

    this.$eventBus.$on('product_list.update_product_list_remind_count', this.updateProductRemindCount)
  },
  beforeDestroy() {
    this.$eventBus.$off('product_list.update_product_list_remind_count', this.updateProductRemindCount)
  },
  methods: {
    getAddress(field) {
      return field.province + field.city + field.dist + field.address || ''
    },
    openOutsideLink(e) {
      let url = e.target.getAttribute('url');
      if (!url) return;
      if (!/http/gi.test(url)) return this.$platform.alert('请确保输入的链接以http或者https开始');
      this.$platform.openLink(url)
    },
    buildTextarea(value) {
      return value
        ? value.replace(link_reg, (match) => {
          return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`
        })
        : '';
    },
    powerfulSearch() {
      this.searchModel.pageNum = 1;
      this.searchModel.moreConditions = this.$refs.searchPanel.buildParams();

      this.search();

    },
    formatCustomizeAddress(ad) {
      if (null == ad) return '';

      const {province, city, dist, address} = ad;
      return [province, city, dist, address]
        .filter(d => !!d).join('-');
    },
    showAdvancedSetting(){
      window.TDAPP.onEvent('pc：产品管理-选择列事件');
      this.$refs.advanced.open(this.columns);
    },

    openProductTab(productId) {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `product_view_${productId}`,
        title: '产品详情',
        close: true,
        url: `/customer/product/view/${productId}?noHistory=1`,
        fromId
      })

    },
    search() {
      const params = this.buildParams();
      this.loading = true;

      return getProduct(params)
        .then(res => {
          this.loading = false;
          this.page = Page.as(Object.freeze(res));
          this.matchSelected();
        })
        .catch(e => console.error('fetch product catch an error', e));
    },
    buildParams() {
      const sm = Object.assign({}, this.searchModel);
      let params = {
        keyword: sm.keyword,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum,
      };

      if (Object.keys(sm.orderDetail || {}).length) {
        params.orderDetail = sm.orderDetail;
      }

      if (Object.keys(sm.moreConditions).length > 1 || sm.moreConditions.conditions.length) {
        params = {
          ...params,
          ...sm.moreConditions,
        }
      }

      return params
    },
    jump(pageNum) {
      this.searchModel.pageNum = pageNum;
      this.search();
    },
    resetParams() {
      window.TDAPP.onEvent('pc：产品管理-重置事件');
      this.searchIncludeMoreConditions = false;
      this.searchModel = {
        keyword: '',
        pageNum: 1,
        pageSize: this.page.pageSize,
        orderDetail: {},
        moreConditions: {
          conditions: [],
        }
      };

      this.$refs.searchPanel.resetParams();
      this.search();
    },
    openDialog(action) {

      if (action === 'sendMessage') {
        window.TDAPP.onEvent('pc：产品管理-发送短信事件');
        this.$refs.messageDialog.openSendMessageDialog();
      }

      if (action === 'edit') {
        window.TDAPP.onEvent('批量编辑	pc：产品管理-批量编辑事件');
        this.$refs.batchEditingDialog.open();
      }

      if (action === 'remind') {
        window.TDAPP.onEvent('批量提醒	pc：产品管理-批量提醒事件');
        this.$refs.batchRemindingDialog.openBatchRemindingDialog();
      }

      if (action === 'importProduct') {
        this.$refs.importProductModal.open();
      }

      if (action === 'update') {
        // if (!this.multipleSelection || !this.multipleSelection.length) {
        //   return this.$platform.alert('您尚未选择数据，请选择数据后点击批量更新');
        // }
        this.$refs.batchUpdateDialog.openBatchUpdateCustomerDialog();
      }

    },
    // operation
    async deleteProducts() {
      window.TDAPP.onEvent('pc：产品管理-删除事件');
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的产品');
      }

      try {
        if (!await this.$platform.confirm('确定要删除选择的产品？')) return;

        const ids = this.multipleSelection.map(p => p.id).join(',');
        this.loading = true;
        const res = await deleteProductByIds(ids);
        this.loading = false;

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
        this.loading = false;
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

      this.matchSelected();

    },
    // table method
    handleSelection(selection) {
      let tv = this.selectionCompute(selection);

      let original = this.multipleSelection
        .filter(ms => this.page.list.some(cs => cs.id === ms.id));

      let unSelected = this.page.list
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
          ? unSelected.forEach(row => {
              this.$refs.multipleTable.toggleRowSelection(row, false);
            })
          : this.$refs.multipleTable.clearSelection();
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }

      this.multipleSelection = tv;

      this.$refs.baseSelectionBar.openTooltip();
    },
    // 计算已选择
    selectionCompute(selection) {
      let tv = [];
      
      tv = this.multipleSelection
        .filter(ms => this.page.list.every(c => c.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);

      return tv;
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
      this.searchModel.pageNum = 1;
      this.search();
    },
    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let item = undefined;
      let row = undefined;

      if (rows) {
        for(let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.page.list.every(item => {
            return item.id !== row.id;
          })
          if(isNotOnCurrentPage) return
        }
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },

    removeFromSelection(c) {
      if(!c || !c.id) return 

      this.multipleSelection = this.multipleSelection
        .filter(ms => ms.id !== c.id);
      this.multipleSelection.length < 1 ? this.toggleSelection() : this.toggleSelection([c])
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
    buildColumns() {
      const localStorageData = this.getLocalStorageData();
     
      let columnStatus = localStorageData.columnStatus || [];
      let localColumns = columnStatus
        .map(i => typeof i == 'string' ? {field: i, show: true} : i)
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});

      this.columns = this.productFields
        .filter(f => f.formType !== 'attachment' && f.formType !== 'separator' && f.formType !== 'info')
        .map(field => {
          let sortable = false;
          let minWidth = null;

          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom';
            minWidth = 100;
          } 

          if (field.fieldName === 'type') {
            sortable = 'custom';
          }

          if (field.displayName.length > 4) {
            minWidth = field.displayName.length * 20;
          }

          if (sortable && field.displayName.length >= 4) {
            minWidth = 125;
          }

          if (field.formType === 'datetime' || field.fieldName === 'updateTime' || field.fieldName === 'createTime') {
            minWidth = 150;
          }

          return {
            ...field,
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            minWidth: typeof minWidth == 'number' ? minWidth : `${minWidth}px`,
            sortable,
            isSystem: field.isSystem,
          }
        })
        .map(col => {
          let show = col.show === true;
          let width = col.width;
          let localField = localColumns[col.field];
          
          if(null != localField){
            width = typeof localField.width == 'number' ? `${localField.width}px` : ''
            show = localField.show !== false;
          }
          
          col.show = show;
          col.width = width;
          col.type = 'column';

          return col;
        });
    },

    buildExportParams(checkedArr, ids) {
      let exportAll = !ids || !ids.length;
      let exportSearchModel = exportAll ? {
        ...this.buildParams(),
        exportTotal: this.page.total
      } : {exportTotal: ids.length};

      return {
        productChecked: checkedArr.join(','),
        data: exportAll ? '' : ids.join(','),
        exportSearchModel: JSON.stringify(exportSearchModel)
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

          this.matchSelected();
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
        url: `/product/detail/${templateId}?noHistory=1`,
        fromId
      })
    },
    goToCreate() {
      window.TDAPP.onEvent('pc：产品管理-新建事件');
      // window.location = '/customer/product/create';
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'customer_product_create',
        title: '新建产品',
        url: '/customer/product/create',
        reload: true,
        close: true,
        fromId
      });
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
      const {pageSize, column_number} = this.getLocalStorageData();
      if (pageSize) {
        this.searchModel.pageSize = pageSize;
      }
      if(column_number) this.columnNum = Number(column_number)
    },
    // 匹配选中的列
    matchSelected() {
      if (!this.multipleSelection.length) return;

      const selected = this.page.list
        .filter(c => {
          if (this.multipleSelection.some(sc => sc.id === c.id)) {

            this.multipleSelection = this.multipleSelection.filter(sc => sc.id !== c.id);
            this.multipleSelection.push(c);
            return c;
          }
        }) || [];

      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    // 获取团队列表
    getTeamList(params) {
      return this.getBizTeamList(params, this.filterTeams, this.viewedPermission);
    },
    panelSearchAdvancedToggle() {
      window.TDAPP.onEvent('pc：产品管理-高级搜索事件');
      this.$refs.searchPanel.open();
      this.$nextTick(() => {
        let forms = document.getElementsByClassName('advanced-search-form');
        for(let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute('novalidate', true)
        }
      })
    },
    // TalkingData事件埋点
    trackEventHandler (type) {
      if (type === 'search') {
        window.TDAPP.onEvent('pc：产品管理-搜索事件');
        return;
      } 
      if (type === 'moreAction') {
        window.TDAPP.onEvent('pc：产品管理-更多操作事件');
        return;
      }
    },
    getRowKey(row) {
      return row.id
    },
  },
  components: {
    SearchPanel,
    [SendMessageDialog.name]: SendMessageDialog,
    [BatchEditingDialog.name]: BatchEditingDialog,
    [BatchRemindingDialog.name]: BatchRemindingDialog,
    [BatchUpdateDialog.name]: BatchUpdateDialog,
    [SearchPanel.name]: SearchPanel,
  }
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  html, body {
    height: 100%;
  }
  .product-list-container {
    height: 100%;
    padding: 10px;
    overflow: auto;
  }

  .product-columns-dropdown-menu {
    max-height: 300px;
    overflow: auto;
    .el-dropdown-menu__item {
      padding: 0;
    }
    .el-checkbox {
      width: 100%;
      padding: 5px 15px;
      margin: 0;
    }
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
        line-height: 32px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
        padding: 0 13px;
        &:hover {
          cursor: pointer;
        }

        .iconfont {
          font-size: 12px;
          font-weight: bolder;
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

  .base-import-warn {
    p {
      margin: 0;
    }
  }

  // superscript
  .product-name-superscript-td {
    padding: 0 !important;
    & > div {
      height: 43px;
      line-height: 43px !important;
      a {
        display: inline-block;
        height: 43px;
        line-height: 43px;
      }
    }
  }

  .product-panel {
    .base-panel-title {
      h3 {
        display: flex;
        justify-content: space-between;
      }
      .product-panel-btn {
        cursor: pointer;
        &:hover {
          color: $color-primary;
        }
      }
    }
  }


</style>
