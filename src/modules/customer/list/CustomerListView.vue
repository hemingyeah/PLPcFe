<template>
  <div
    class="customer-list-container"
    ref="customerListPage"
    v-loading.fullscreen.lock="loadingListData"
  >
    <!--搜索-->
    <div class="customer-list-search-group-container">
      <form class="base-search" onsubmit="return false;">
        <div class="customer-list-base-search-group">
          <el-input v-model="params.keyword" placeholder="根据客户信息搜索" v-trim:blur>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button
            type="primary"
            @event="params.pageNum=1;search();trackEventHandler('search')"
            native-type="submit"
          >搜索</base-button>
          <base-button type="ghost" @event="resetParams">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="panelSearchAdvancedToggle">
          <i class="iconfont icon-add"></i>
          高级搜索
        </span>
      </form>
      <!--高级搜索-->
    </div>

    <!--list start-->
    <div class="customer-list-component">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @event="jumpPage" v-if="createdPermission">新建</base-button>
          <base-button
            type="ghost"
            icon="icon-qingkongshanchu"
            v-if="deletePermission"
            @event="deleteCustomer"
          >删除</base-button>
        </div>

        <div class="action-button-group">
          <base-button
            type="plain"
            @event="openDialog('sendMessage')"
            v-if="editedPermission === 3"
          >发送短信</base-button>
          <base-button type="plain" @event="openDialog('edit')" v-if="editedPermission === 3">批量编辑</base-button>
          <base-button type="plain" @event="openDialog('remind')" v-if="editedPermission === 3 && isShowCustomerRemind">批量提醒</base-button>
          <el-dropdown trigger="click" v-if="exportPermission">
            <span class="el-dropdown-link el-dropdown-btn" @click="trackEventHandler('moreAction')">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="!isExperienceEdition">
                <div @click="openDialog('importCustomer')">导入客户</div>
              </el-dropdown-item>
              <el-dropdown-item v-if="!isExperienceEdition">
                <div @click="openDialog('importLinkman')">导入联系人</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(true)">导出全部</div>
              </el-dropdown-item>
              <el-dropdown-item v-if="!isExperienceEdition">
                <div @click="openDialog('update')">批量更新</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">
            选择列
            <i class="iconfont icon-nav-down"></i>
          </span>
          <!-- <el-dropdown :hide-on-click="false" :show-timeout="150" trigger="click">
            <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.field">
                <el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label"
                             :disabled="item.field === 'name'"/>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>-->
        </div>
      </div>
      <!--operation bar end-->

      <div style="background: #fff;padding: 0 10px">
        <base-selection-bar
          ref="baseSelectionBar"
          v-model="multipleSelection"
          @toggle-selection="toggleSelection"
          @show-panel="() => multipleSelectionPanelShow = true"
        />
      </div>

      <el-table
        :data="customers"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        :row-key="getRowKey"
        :highlight-current-row="false"
        header-row-class-name="customer-table-header"
        ref="multipleTable"
        class="customer-table"
      >
        <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>
        <el-table-column
          v-for="(column, index) in columns"
          v-if="column.show"
          :key="`${column.field}_${index}`"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          :min-width="column.minWidth || '120px'"
          :class-name="column.field == 'name' ? 'customer-name-superscript-td' : ''"
          :sortable="column.sortable"
          :show-overflow-tooltip="column.field !== 'name'"
          :align="column.align"
        >
          <template slot-scope="scope">
            <template v-if="column.field === 'name'">
              <sample-tooltip :row="scope.row">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip
                    :content="scope.row[column.field]"
                    placement="top"
                    :disabled="!isContentTooltip"
                  >
                    <a
                      href
                      :class="scope.row.isGuideData ? column.className : ''"
                      class="view-detail-btn"
                      @click.stop.prevent="createCustomerTab(scope.row.id)">
                      <pre class="pre-text">{{ scope.row[column.field] }}</pre>
                    </a>
                  </el-tooltip>
                </template>
              </sample-tooltip>
            </template>
            <template v-else-if="column.field === 'customerAddress'">
              {{formatAddress(scope.row[column.field])}}
            </template>
            <template v-else-if="column.field === 'detailAddress'">
              <pre class="pre-text">{{scope.row.customerAddress && scope.row.customerAddress.adAddress}}</pre>
            </template>
            <template v-else-if="column.field === 'tags' && scope.row.tags">
              {{scope.row.tags | tagName}}
            </template>
            <template v-else-if="column.field === 'status'">
              <el-switch
                :disabled="scope.row.pending"
                @change="toggleStatus(scope.row)"
                :value="Boolean(scope.row.status)"
              ></el-switch>
            </template>
            <template v-else-if="column.field === 'updateTime'">
              <template v-if="scope.row.latesetUpdateRecord">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="scope.row.latesetUpdateRecord"
                  placement="top"
                >
                  <div @mouseover="showLatestUpdateRecord(scope.row)">{{scope.row[column.field]}}</div>
                </el-tooltip>
              </template>
              <template v-else>
                <div @mouseover="showLatestUpdateRecord(scope.row)">{{scope.row[column.field]}}</div>
              </template>
            </template>
            <template v-else-if="column.field === 'lmPhone'">
              <span class="align-items-center"> {{scope.row.lmPhone}} <el-tooltip content="拨打电话" placement="top"><i @click.stop="makePhoneCall(scope.row.lmPhone)" v-if="hasCallCenterModule" class="iconfont icon-dianhua1" style="color: #55B7B4;padding-left: 5px;font-size: 16px;cursor:pointer;"></i></el-tooltip></span>
            </template>
            <template v-else-if="column.field === 'createUser'">
              {{scope.row.createUserName}}
            </template>
            <template v-else-if="column.field === 'remindCount'">
              {{scope.row.attribute.remindCount || 0}}
            </template>
            <template v-else-if="column.formType === 'location'">
              {{ scope.row.attribute[column.field] && scope.row.attribute[column.field].address}}
            </template>
            <template v-else-if="column.formType === 'address'">
              {{formatCustomizeAddress(scope.row.attribute[column.field])}}
            </template>
            <div class="pre-text" v-else-if="column.formType === 'textarea'" v-html="buildTextarea(scope.row.attribute[column.field])" @click="openOutsideLink"></div>

            <template v-else-if="column.isSystem === 0">
              <pre class="pre-text">{{scope.row.attribute[column.field] | fmt_form_field(column.formType, column.fieldName, scope.row.attribute)}}</pre>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="list-info">
          共
          <span class="level-padding">{{totalItems}}</span>记录，
          已选中
          <span
            class="customer-selected-count"
            @click="multipleSelectionPanelShow = true"
          >{{multipleSelection.length}}</span>条
          <span class="customer-selected-count" @click="toggleSelection()">清空</span>
        </div>
        <el-pagination
          class="customer-table-pagination"
          background
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="params.pageSize"
          :current-page="params.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="totalItems"
        ></el-pagination>
      </div>
    </div>
    <!--list end-->

    <!-- dialog of operation -->
    <batch-reminding-customer-dialog
      ref="batchRemindingCustomerDialog"
      :selected-ids="selectedIds"
      @success-callback="remindSuccess"
    ></batch-reminding-customer-dialog>
    <send-message-dialog ref="messageDialog" :selected-ids="selectedIds" :sms-rest="smsRest"></send-message-dialog>
    <batch-editing-customer-dialog
      ref="batchEditingCustomerDialog"
      :config="{fields: fieldInfo, defaultAddress: defaultAddress}"
      :callback="search"
      :selected-ids="selectedIds"
    ></batch-editing-customer-dialog>

    <!-- start 批量更新 -->
    <batch-update-customer-dialog
      ref="batchUpdateCustomerDialog"
      :selected-ids="selectedIds"
      :total-items="totalItems"
      :build-download-params="buildParams"
      action="/excels/customer/update"
    ></batch-update-customer-dialog>
    <!-- end 批量更新 -->

    <!-- start 导入客户 -->
    <base-import title="导入客户" ref="importCustomerModal" action="/excels/customer/import">
      <div slot="tip">
        <div class="base-import-warn">
          请先下载
          <a href="/customer/import/templateNew">导入模版</a>，填写完成后再上传导入。
        </div>
      </div>
    </base-import>
    <!-- end 导入客户 -->

    <!-- start 导入联系人 -->
    <base-import
      title="导入联系人"
      ref="importLinkmanModal"
      @success="importSucc"
      action="/excels/contact/import"
    >
      <div slot="tip">
        <div class="base-import-warn">
          <p style="margin: 0">
            请先下载
            <a href="/contacts/import/template">导入模版</a>，填写完成后再上传导入。
          </p>
          <!--<p style="margin: 0">联系人导入可以先下载 <a href="/contacts/import/mesTemplate">产品数据模版文档</a>，导入信息可以依照此模板填写。</p>-->
          <!--<p style="margin: 0">联系人导入可以先下载 <a href="/contacts/import/getAllCustomerId">客户数据模版文档</a>，导入信息可以依照此模板填写。</p>-->
        </div>
      </div>
    </base-import>
    <!-- 导入联系人 -->

    <!-- start 导出客户 -->
    <base-export
      ref="exportPanel"
      :columns="exportColumns"
      :build-params="buildExportParams"
      :validate="checkExportCount"
      method="post"
      action="/excels/customer/export"
    />
    <!-- end 导出客户 -->

    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title">
        <span>已选中数据({{multipleSelection.length}})</span>
        <i
          v-if="multipleSelection.length > 0"
          class="iconfont icon-qingkongshanchu customer-panel-btn"
          @click="toggleSelection()"
          title="清空已选中数据"
          data-placement="right"
          v-tooltip
        ></i>
      </h3>

      <div class="customer-selected-panel">
        <div class="customer-selected-tip" v-if="multipleSelection.length <= 0">
          <img src="../../../assets/img/no-data.png" />
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="customer-selected-list">
            <div class="customer-selected-row customer-selected-head">
              <span class="customer-selected-sn">编号</span>
              <span class="customer-selected-name">客户</span>
            </div>
            <div class="customer-selected-row" v-for="c in multipleSelection" :key="c.id">
              <span class="customer-selected-sn">{{c.serialNumber}}</span>
              <span class="customer-selected-name">{{c.name}}</span>
              <button
                type="button"
                class="customer-selected-delete"
                @click="cancelSelectCustomer(c)"
              >
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>

    <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus" />

    <search-panel :config="{
      fields: fieldInfo,
    }" ref="searchPanel">
      <div class="advanced-search-btn-group" slot="footer">
        <base-button type="ghost" @event="resetParams">重置</base-button>
        <base-button type="primary" @event="powerfulSearch" native-type="submit">搜索</base-button>
      </div>
    </search-panel>
  </div>
</template>

<script>
import _ from 'lodash';
import { formatDate } from '../../../util/lang';
import SendMessageDialog from './operationDialog/SendMessageDialog.vue';
import BatchEditingCustomerDialog from './operationDialog/BatchEditingCustomerDialog.vue';
import BatchRemindingCustomerDialog from './operationDialog/BatchRemindingCustomerDialog.vue';
import BatchUpdateCustomerDialog from './operationDialog/BatchUpdateCustomerDialog.vue';
import SearchPanel from './operationDialog/SearchPanel.vue';

import * as CustomerApi from '@src/api/CustomerApi.ts';
// import {searchLinkman} from '@src/api/EcSearchApi.js';
import TeamMixin from '@src/mixins/teamMixin';
import { isShowCustomerRemind } from '@src/util/version.ts'
import VersionMixin from '@src/mixins/versionMixin/index.ts'

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g;

export default {
  name: 'customer-list-view',
  mixins: [TeamMixin, VersionMixin],
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // self state
      pending: false,
      loadingListData: false,
      multipleSelectionPanelShow: false,
      params: {
        orderDetail: {},
        moreConditions: {
          conditions: []
        },
        keyword: '',
        pageNum: 1,
        pageSize: 10
      },
      totalItems: 0,
      multipleSelection: [],
      defaultAddress: [],
      // data from remote
      customers: [],
      columns: this.fixedColumns(),
      selectedLimit: 500,
      columnNum: 1,
      tableKey: (Math.random() * 1000) >> 2,
      hasCallCenterModule:localStorage.getItem('call_center_module') == 1,
      fieldInfo: []
    };
  },
  computed: {
    editedPermission() {
      return this.auth.CUSTOMER_EDIT;
    },
    createdPermission() {
      return this.auth.CUSTOMER_CREATE;
    },
    viewedPermission() {
      return this.auth.CUSTOMER_VIEW === 3;
    },
    deletePermission() {
      return this.auth.CUSTOMER_EDIT === 3 && this.auth.CUSTOMER_DELETE;
    },
    exportPermission() {
      return this.auth.EXPORT_IN;
    },
    selectedIds() {
      return this.multipleSelection.map(c => c.id) || [];
    },
    exportColumns() {
      const fixedFields = [
        {
          field: 'id',
          export: true,
          label: '客户系统编号'
        }
      ];

      return this.columns.concat(fixedFields).map(c => {
        if (
          c.field !== 'customerAddress'
          && c.field !== 'remindCount'
          && c.field !== 'updateTime'
          && c.formType !== 'info'
          && c.formType !== 'autograph'
        ) {
          c.export = true;
        }

        if (c.field === 'detailAddress') {
          c.exportAlias = 'customerAddress';
        }

        // if (c.field === 'tags') {
        //   c.exportAlias = 'customerTags';
        // }

        if (c.field === 'customerManagerName') {
          c.exportAlias = 'manager';
        }

        if (c.field === 'status') {
          c.label = '状态';
        }

        return c;
      });
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
    customerConfig() {
      let initData = this.initData;
      return {
        customerAddressConfig: initData.customerAddressConfig,
        customerConfig: initData.customerConfig,
        fieldInfo: (this.fieldInfo || []).sort(
          (a, b) => a.orderId - b.orderId
        )
      };
    },
    auth() {
      return this.initData.auth || {};
    },
    smsRest() {
      return this.initData.smsRest || 0;
    },
    isShowCustomerRemind() {
      return isShowCustomerRemind()
    }
  },
  filters: {
    tagName(value) {
      if (!value || !Array.isArray(value) || !value.length) return '';

      return value
        .filter(tag => tag && tag.tagName)
        .map(tag => tag.tagName)
        .join('，');
    }
  },
  async mounted() {
    try {
      // 获取客户表单字段列表
      let result = await CustomerApi.getCustomerFields({isFromSetting: false});
      if (result.succ) {
        this.fieldInfo = result.data;
      }

    } catch(err) {
      console.error('customer list get fields error', err);
    }

    const {
      adProvince,
      adCity,
      adDist
    } = this.customerConfig.customerAddressConfig;
    this.defaultAddress = [adProvince, adCity, adDist];
    this.revertStorage();
    this.columns = this.buildTableColumn();
    this.search();

    // 对外开放刷新方法，用于其他tab刷新本tab数据
    // TODO: [tab_spec]标准化刷新方式
    window.__exports__refresh = this.search;
  },
  methods: {
    getRelatedTask(field) {
      return Array.isArray(field) ? field.map(item => item.taskNo).join(',') : '';
    },
    // 处理人员显示
    getUserName(field, value) {
      // 多选
      if(Array.isArray(value)) {
        return value.map(i => i.displayName || i.name).join(',');
      }

      let user = value || {};
      return user.displayName || user.name;
    },
    async makePhoneCall(phone){
      if(!this.hasCallCenterModule) return
      try {
        const { code, message } = await this.$http.post('/api/callcenter/outside/callcenter/api/dialout', {phone, taskType:'customer'}, false)
        if (code !== 0) return this.$platform.notification({
          title: '呼出失败',
          message: message || '',
          type: 'error',
        }) 
      } catch (error) {
        console.error(error);
      }
    },
    powerfulSearch() {
      this.params.pageNum = 1;
      this.params.moreConditions = this.$refs.searchPanel.buildParams();

      this.search();
    },
    showAdvancedSetting() {
      window.TDAPP.onEvent('pc：客户管理-选择列事件');

      this.$refs.advanced.open(this.columns);
    },
    showLatestUpdateRecord(row) {
      if (row.latesetUpdateRecord) return;

      CustomerApi.getUpdateRecord({
        customerId: row.id
      })
        .then(res => {
          if (!res || res.status) return;

          this.customers = this.customers.map(c => {
            if (c.id === row.id) {
              c.latesetUpdateRecord = res.data;
            }
            return c;
          });
          this.matchSelected();
        })
        .catch(e => console.error('e', e));
    },
    createCustomerTab(customerId) {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `customer_view_${customerId}`,
        title: '客户详情',
        close: true,
        url: `/customer/view/${customerId}?noHistory=1`,
        fromId
      });
    },
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      localStorage.setItem(
        'customer_list_advance_search_column_number',
        command
      );
    },
    formatAddress(ad) {
      if (null == ad) return '';

      const { adProvince, adCity, adDist } = ad;
      return [adProvince, adCity, adDist].filter(d => !!d).join('-');
    },
    formatCustomizeAddress(ad) {
      if (null == ad) return '';

      const { province, city, dist, address } = ad;
      return [province, city, dist, address].filter(d => !!d).join('-');
    },
    remindSuccess(ids) {
      let tv = false;
      if (!ids || !ids.length) return;

      this.customers.forEach(c => {
        tv = ids.some(id => c.id === id);
        if (!tv) return;
        if (!c.attribute.remindCount) {
          c.attribute.remindCount = 1;
        } else {
          c.attribute.remindCount += 1;
        }
      });
    },
    jumpPage() {
      window.TDAPP.onEvent('pc：客户管理-新建事件');

      // window.location = '/customer/create';
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: 'customer_create',
        title: '新建客户',
        url: '/customer/create',
        reload: true,
        close: true,
        fromId
      });
    },
    /** 构建客户导出参数 */
    buildExportParams(checkedArr, ids) {
      let exportAll = !ids || ids.length == 0;
      let exportSearchModel = exportAll
        ? {
          ...this.buildParams(),
          exportTotal: this.totalItems
        }
        : { exportTotal: ids.length };

      return {
        customerChecked: checkedArr.join(','),
        data: exportAll ? '' : ids.join(','),
        exportSearchModel: JSON.stringify(exportSearchModel)
      };
    },
    /** 导出客户 */
    exportCustomer(exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}客户数据.xlsx`;
      if (!exportAll) {
        if (!this.multipleSelection.length)
          return this.$platform.alert('请选择要导出的数据');
        ids = this.selectedIds;
      }
      this.$refs.exportPanel.open(ids, fileName);
    },
    /** 检测导出条数 */
    checkExportCount(ids, max) {
      let exportAll = !ids || ids.length == 0;
      return exportAll && this.totalItems > max
        ? '为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。'
        : null;
    },
    importSucc() {
      // console.log('importSucc');
      // this.search();
    },
    revertStorage() {
      const { pageSize, column_number } = this.getLocalStorageData();
      if (pageSize) {
        this.params.pageSize = pageSize;
      }
      if (column_number) this.columnNum = Number(column_number);
    },
    search() {
      const params = this.buildParams();

      this.loadingListData = true;

      return CustomerApi.getCustomerList(params)
        .then(res => {
          if (!res || !res.list) {
            this.customers = [];
            this.totalItems = 0;
            this.params.pageNum = 1;
          } else {
            const { total, pageNum, list } = res;

            this.customers = list.map(c => {
              c.pending = false;
              return c;
            });
            this.totalItems = total;
            this.params.pageNum = pageNum;
            this.matchSelected(); // 把选中的匹配出来
          }

          return res;
        })
        .then(() => {
          this.$refs.customerListPage.scrollTop = 0;
          this.loadingListData = false;
        })
        .catch(err => {
          this.loadingListData = false;
          console.error('err', err);
        });
    },
    buildParams() {
      const sm = Object.assign({}, this.params);
      let params = {
        keyword: sm.keyword,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum
      };

      if (Object.keys(sm.orderDetail || {}).length) {
        params.orderDetail = sm.orderDetail;
      }

      if (
        Object.keys(sm.moreConditions).length > 1
        || sm.moreConditions.conditions.length
      ) {
        params = {
          ...params,
          ...sm.moreConditions
        };
      }

      return params;
    },
    cancelSelectCustomer(customer) {
      if (!customer || !customer.id) return;
      this.multipleSelection = this.multipleSelection.filter(
        ms => ms.id !== customer.id
      );
      this.toggleSelection([customer]);
    },
    toggleStatus(row) {
      window.TDAPP.onEvent('pc：客户管理-状态开启事件');

      const ns = row.status ? 0 : 1;
      row.pending = true;
      const params = {
        id: row.id,
        status: ns
      };

      this.$http
        .post('/customer/changeState', params, false, { cancelable: false })
        .then(res => {
          row.pending = false;

          if (res.status) {
            return this.$platform.alert(res.message);
          }

          this.customers.forEach(c => {
            if (c.id === row.id) {
              c.status = ns;
            }
          });
        })
        .catch(err => {
          row.pending = false;
          console.error('toggleStatus catch err', err);
        });
    },
    sortChange(option) {
      /**
       * 目前情况：
       * 所有字段理应后台获取，但是获取的所有字段中没有 createTime
       *
       */
      try {
        const { prop, order } = option;
        if (!order) {
          this.params.orderDetail = {};
          return this.search();
        }

        let sortModel = {
          isSystem: prop === 'createTime' || prop === 'updateTime' ? 1 : 0,
          sequence: order === 'ascending' ? 'ASC' : 'DESC',
          column:
            prop === 'createTime' || prop === 'updateTime'
              ? `customer.${prop}`
              : prop
        };

        const sortedField = this.customerConfig.fieldInfo.filter(sf => sf.fieldName === prop)[0] || {};

        if (prop === 'createTime' || prop === 'updateTime' || sortedField.formType === 'date' || sortedField.formType === 'datetime') {
          sortModel.type = 'date';
        } else {
          sortModel.type = sortedField.formType;
        }

        this.params.orderDetail = sortModel;

        this.search();
      } catch (e) {
        console.error('e', e);
      }
    },
    jump(pageNum) {
      this.params.pageNum = pageNum;
      this.search();
    },
    handleSizeChange(pageSize) {
      this.saveDataToStorage('pageSize', pageSize);
      this.params.pageNum = 1;
      this.params.pageSize = pageSize;
      this.search();
    },
    // select customer
    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      let original = this.multipleSelection.filter(ms =>
        this.customers.some(cs => cs.id === ms.id)
      );
      let unSelected = this.customers.filter(c =>
        original.every(oc => oc.id !== c.id)
      );

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
    computeSelection(selection) {
      let tv = [];
      tv = this.multipleSelection.filter(ms =>
        this.customers.every(c => c.id !== ms.id)
      );
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
    },
    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let row = undefined;

      if (rows) {
        for (let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.customers.every(item => {
            return item.id !== row.id;
          });
          if (isNotOnCurrentPage) return;
        }
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },
    // list method end

    // operation dialog
    openDialog(category) {
      if (category === 'sendMessage') {
        window.TDAPP.onEvent('pc：客户管理-发送短信事件');

        this.$refs.messageDialog.openSendMessageDialog();
      }
      if (category === 'edit') {
        window.TDAPP.onEvent('pc：客户管理-批量编辑事件');

        this.$refs.batchEditingCustomerDialog.open();
      }
      if (category === 'remind') {
        window.TDAPP.onEvent('pc：客户管理-批量提醒事件');

        this.$refs.batchRemindingCustomerDialog.openBatchRemindingCustomerDialog();
      }
      if (category === 'importCustomer') {
        this.$refs.importCustomerModal.open();
      }
      if (category === 'importLinkman') {
        this.$refs.importLinkmanModal.open();
      }
      if (category === 'update') {
        // if (!this.multipleSelection || !this.multipleSelection.length) {
        //   return this.$platform.alert('您尚未选择数据，请选择数据后点击批量更新');
        // }
        this.$refs.batchUpdateCustomerDialog.openBatchUpdateCustomerDialog();
      }
    },
    async deleteCustomer() {
      window.TDAPP.onEvent('pc：客户管理-删除事件');

      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的客户');
      }
      try {
        // fuck
        const result = await this.$platform.confirm('确定要删除选择的客户？');
        if (!result) return;

        this.loadingListData = true;
        const params = { ids: this.selectedIds.join(',') };
        this.$http
          .post('/customer/delete', params)
          .then(res => {
            this.multipleSelection = [];
            this.search();
          })
          .catch(err => console.error('deleteCustomer err', err))
          .finally(() => {
            this.loadingListData = false;
          });
      } catch (e) {
        console.error('deleteCustomer catch error', e);
        this.loadingListData = false;
      }
    },
    // columns
    modifyColumnStatus(event) {
      let columns = event.data || [];
      let colMap = columns.reduce(
        (acc, col) => (acc[col.field] = col) && acc,
        {}
      );

      this.columns.forEach(col => {
        let newCol = colMap[col.field];
        if (null != newCol) {
          this.$set(col, 'show', newCol.show);
          this.$set(col, 'width', newCol.width);
        }
      });

      const showColumns = this.columns.map(c => ({
        field: c.field,
        show: c.show,
        width: c.width
      }));
      this.saveDataToStorage('columnStatus', showColumns);
    },
    // common methods
    getLocalStorageData() {
      const dataStr = localStorage.getItem('customerListData') || '{}';
      return JSON.parse(dataStr);
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem('customerListData', JSON.stringify(data));
    },
    buildTableColumn() {
      const localStorageData = this.getLocalStorageData();
      let columnStatus = localStorageData.columnStatus || [];
      let localColumns = columnStatus
        .map(i => (typeof i == 'string' ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});

      let baseColumns = this.fixedColumns();
      let dynamicColumns = this.customerConfig.fieldInfo
        .filter(
          f =>
            !f.isSystem
            && f.formType !== 'attachment'
            && f.formType !== 'separator'
            && f.formType !== 'info'
            && f.formType !== 'autograph'
        )
        .map(field => {
          let sortable = false;
          let minWidth = null;
          
          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom';
            minWidth = 100;
          }

          if (field.displayName.length > 4) {
            minWidth = field.displayName.length * 20;
          }

          if (sortable && field.displayName.length >= 4) {
            minWidth = 125;
          }

          if (field.formType === 'datetime') {
            minWidth = 150;
          }

          return {
            ...field,
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            minWidth: typeof minWidth == 'number' ? minWidth : `${minWidth}px`,
            sortable,
            isSystem: field.isSystem
          };
        });

      let columns = [...baseColumns, ...dynamicColumns].map(col => {
        let show = col.show === true;
        let width = col.width;
        let localField = localColumns[col.field];

        if (null != localField) {
          width = typeof localField.width == 'number' ? `${localField.width}px` : '';
          show = localField.show !== false;
        }

        col.show = show;
        col.width = width;
        col.type = 'column';

        return col;
      });

      return columns;
    },
    resetParams() {
      window.TDAPP.onEvent('pc：客户管理-重置事件');
      this.$refs.searchPanel.resetParams();

      this.params = {
        keyword: '',
        pageNum: 1,
        pageSize: this.params.pageSize,
        orderDetail: {},
        moreConditions: {
          conditions: []
        }
      };

      this.search();
    },
    // match data
    matchSelected() {
      if (!this.multipleSelection.length) return;
      const selected = this.customers.filter(c => {
        if (this.multipleSelection.some(sc => sc.id === c.id)) {
          this.multipleSelection = this.multipleSelection.filter(
            sc => sc.id !== c.id
          );
          this.multipleSelection.push(c);
          return c;
        }
      }) || [];

      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    fixedColumns() {
      return [
        {
          label: '客户',
          field: 'name',
          show: true,
          fixed: true,
          minWidth: '150px'
        },
        {
          label: '客户编号',
          field: 'serialNumber',
          // width: '150px',
          fixed: true,
          show: true
        },
        {
          label: '联系人',
          field: 'lmName',
          // width: '100px',
          show: true
        },
        {
          label: '电话',
          field: 'lmPhone',
          minWidth: '150px',
          show: true
        },
        {
          label: '区域',
          field: 'customerAddress',
          // width: '180px',
          show: true
        },
        {
          label: '详细地址',
          field: 'detailAddress',
          // width: '160px',
          show: true
        },
        {
          label: '服务部门',
          field: 'tags',
          // width: '110px',
          show: true
        },
        {
          label: '客户负责人',
          field: 'customerManagerName',
          show: true,
          width: '110px'
        },
        {
          label: '启用/禁用',
          field: 'status',
          show: true,
          align: 'center',
          width: '100px'
        },
        {
          label: '创建时间',
          field: 'createTime',
          show: true,
          sortable: 'custom',
          width: '150px'
        },
        {
          label: '最近更新',
          field: 'updateTime',
          show: true,
          sortable: 'custom',
          width: '150px'
        },
        {
          label: '创建人',
          field: 'createUser',
          // width: '80px',
          show: true
        },
        {
          label: '提醒数量',
          field: 'remindCount',
          // width: '80px',
          show: true
        }
      ];
    },
    panelSearchAdvancedToggle() {
      window.TDAPP.onEvent('pc：客户管理-高级搜索事件');
      this.$refs.searchPanel.open();
      this.$nextTick(() => {
        let forms = document.getElementsByClassName('advanced-search-form');
        for (let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute('novalidate', true);
        }
      });
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      if (type === 'search') {
        window.TDAPP.onEvent('pc：客户管理-搜索事件');
        return;
      }
      if (type === 'moreAction') {
        window.TDAPP.onEvent('pc：客户管理-更多操作事件');
        return;
      }
    },
    openOutsideLink(e) {
      let url = e.target.getAttribute('url');
      if (!url) return;
      if (!/http/gi.test(url))
        return this.$platform.alert('请确保输入的链接以http或者https开始');
      this.$platform.openLink(url);
    },
    buildTextarea(value) {
      let textareaValue = value
        ? value.replace(link_reg, (match) => {
          return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`
        })
        : '';

      return textareaValue.replace(/\s/g, '&nbsp;');
    },
    getRowKey(row) {
      return row.id;
    }
  },
  components: {
    [SendMessageDialog.name]: SendMessageDialog,
    [BatchEditingCustomerDialog.name]: BatchEditingCustomerDialog,
    [BatchRemindingCustomerDialog.name]: BatchRemindingCustomerDialog,
    [BatchUpdateCustomerDialog.name]: BatchUpdateCustomerDialog,
    [SearchPanel.name]: SearchPanel
  }
};
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

html,
body {
  height: 100%;
}

.level-padding {
  padding: 0 5px;
}

.advanced-search-linkman {
  .el-select-dropdown__item {
    height: 50px;
    padding: 5px 20px;
    p {
      margin: 0;
      line-height: 20px;
    }
  }
}

.customer-advance-setting .el-dropdown-menu__item {
  width: 80px;
  text-align: center;
}

.customer-list-container {
  height: 100%;
  overflow: auto;
  padding: 10px;

  .panel-title {
    font-size: 16px;
    line-height: 60px;
    padding: 0 25px;
    color: rgb(132, 138, 147);
    border-bottom: 1px solid rgb(242, 248, 247);
    font-weight: normal;
    display: flex;
    justify-content: space-between;
    .iconfont:hover {
      cursor: pointer;
    }
  }
}

// search
.customer-list-search-group-container {
  .advanced-search-function,
  .base-search {
    background: #fff;
    border-radius: 3px;
  }

  .base-search {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    padding: 12px 10px;

    .customer-list-base-search-group {
      display: flex;
      min-width: 440px;
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

  .advanced-search-form {
    overflow: auto;
    padding: 10px 0 63px 0;
    height: calc(100% - 51px);

    .form-item-container {
    }

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

  .advanced-search-function {
    margin-top: 10px;
    padding-bottom: 10px;

    h4 {
      border-bottom: 1px solid #f4f4f4;
      padding: 10px;
    }

    .el-row {
      padding: 5px 0;
    }
    .input-label {
      text-align: right;
      line-height: 32px;
      padding-right: 0;
    }
  }
}

// list
.customer-list-component {
  padding-top: 10px;
  /*min-height: calc(100% - 100px);*/

  .customer-table {
    padding: 10px;

    &:before {
      height: 0;
    }

    .customer-table-header th {
      background: #f5f5f5;
      color: $text-color-primary;
      font-weight: normal;
    }

      .view-detail-btn {
        width: 100%;
        color: $color-primary;
      }

    .view-detail-btn {
      color: $color-primary;
    }

    .select-column .el-checkbox {
      position: relative;
      top: 3px;
    }
  }

  .table-footer {
    display: flex;
    justify-content: space-between;
    padding: 0px 10px 10px 10px;
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
    }

    .el-pagination__jump {
      margin-left: 0;
    }
  }
}

.customer-panel-btn {
  float: right;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;

  &:hover {
    color: $color-primary;
  }
}

// -------- customer selected panel --------
.customer-selected-count {
  color: $color-primary;
  padding: 0 3px;
  width: 15px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
}

.customer-selected-panel {
  font-size: 14px;
  height: calc(100% - 51px);

  .customer-selected-tip {
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

  .customer-selected-list {
    height: 100%;
    padding: 10px;
    overflow-y: auto;

    .customer-selected-row {
      display: flex;
      flex-flow: row nowrap;
      line-height: 36px;
      border-bottom: 1px solid #ebeef5;
      font-size: 13px;

      &:hover {
        background-color: #f5f7fa;

        .customer-selected-delete {
          visibility: visible;
        }
      }
    }

    .customer-selected-head {
      background-color: #f0f5f5;
      color: #333;
      font-size: 14px;
    }

    .customer-selected-sn {
      padding-left: 10px;
      width: 150px;
      @include text-ellipsis;
    }

    .customer-selected-name {
      padding-left: 10px;
      flex: 1;
      @include text-ellipsis;
    }

    .customer-selected-delete {
      width: 36px;
    }

    .customer-selected-row button.customer-selected-delete {
      padding: 0;
      width: 36px;
      height: 36px;
      border: none;
      background-color: transparent;
      outline: none;
      color: #646b78;
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

// operation
.customer-columns-dropdown-menu {
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

.operation-bar-container {
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

// superscript
.customer-name-superscript-td {
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
</style>
