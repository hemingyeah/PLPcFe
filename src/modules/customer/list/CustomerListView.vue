<template>
  <div class="customer-list-container" ref="customerListPage" v-loading.fullscreen.lock="loadingListData">
    <!--搜索-->
    <div class="customer-list-search-group-container">
      <form class="base-search"r onsubmit="return false;">
        <div class="customer-list-base-search-group">
          <el-input v-model="paramsBackup.keyword" placeholder="根据客户信息搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" @event="search({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="resetParams">重置</base-button>
          <a href="/customer/oldList">返回旧版</a>
        </div>
        <span class="advanced-search-visible-btn" @click="advancedSearchPanelShow = !advancedSearchPanelShow">高级搜索</span>
      </form>
      <!--高级搜索-->
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
            <el-form-item label-width="100px" label="客户编号">
              <el-input type="text" v-model="params.serialNumber"></el-input>
            </el-form-item>
            <el-form-item label-width="100px" label="联系人">
              <el-select
                popper-class="advanced-search-linkman"
                v-model="params.linkmanId"
                @change="modifyUser('linkman')"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                :loading="inputRemoteSearch.linkman.loading"
                :remote-method="searchLinkman">
                <el-option
                  v-for="item in inputRemoteSearch.linkman.options"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                  <p>{{item.name}}</p>
                  <p>电话：{{item.phone || ''}}</p>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="选择团队">
              <el-select
                v-model="params.tagId"
                @change="modifyUser('tags')"
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
            <el-form-item label-width="100px" label="区域">
              <base-dist-picker @input="handleCitySelectorChange" :value="params.specialSearchModel.addressSelector" ref="baseDistPicker"></base-dist-picker>
            </el-form-item>
            <el-form-item label-width="100px" label="详细地址">
              <el-input type="text" v-model="params.specialSearchModel.adAddress"></el-input>
            </el-form-item>
            <el-form-item label-width="100px" label="有无提醒">
              <el-select v-model="params.hasRemind" clearable placeholder="请选择">
                <el-option :value="null" label="全部"></el-option>
                <el-option :value="1" label="有"></el-option>
                <el-option :value="0" label="无"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="状态">
              <el-select v-model="params.status" clearable placeholder="请选择">
                <el-option :value="null" label="全部"></el-option>
                <el-option :value="1" label="启用"></el-option>
                <el-option :value="0" label="禁用"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="创建人">
              <el-select
                v-model="params.createUser"
                @change="modifyUser('createUser')"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                :loading="inputRemoteSearch.creator.loading"
                :remote-method="searchCreator">
                <el-option
                  v-for="item in inputRemoteSearch.creator.options"
                  :key="item.userId"
                  :label="item.displayName"
                  :value="item.userId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="客户负责人">
              <el-select
                v-model="params.customerManager"
                @change="modifyUser('customerManager')"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入关键词搜索"
                :loading="inputRemoteSearch.customerManager.loading"
                :remote-method="searchCustomerManager">
                <el-option
                  v-for="item in inputRemoteSearch.customerManager.options"
                  :key="item.userId"
                  :label="item.displayName"
                  :value="item.userId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label-width="100px" label="创建时间">
              <el-date-picker
                v-model="params.createTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="createTimePickerOptions">
              </el-date-picker>
            </el-form-item>

            <!-- 动态搜索框 -->
            <el-form-item label-width="100px" :label="field.displayName" v-for="field in searchFields"
                          :key="field.fieldName">
              <template v-if="field.formType === 'text' || field.formType === 'code'">
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder" type="text"></el-input>
              </template>
              <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
                <el-select v-model="params.customizedSearchModel[field.fieldName]['value']" clearable
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
              <template v-else-if="field.formType === 'number'">
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder" type="number"></el-input>
              </template>
              <template v-else-if="field.formType === 'date' || field.formType === 'datetime'">
                <el-date-picker
                  v-model="params.customizedSearchModel[field.fieldName]['value']"
                  type="daterange"
                  align="right"
                  unlink-panels
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="createTimePickerOptions">
                </el-date-picker>
              </template>
              <template v-else-if="field.formType === 'user'">
                <el-select
                  v-model="params.customizedSearchModel[field.fieldName]['value']"
                  @change="modifyUser('user', field.fieldName)"
                  filterable
                  clearable
                  remote
                  reserve-keyword
                  placeholder=""
                  :loading="inputRemoteSearch.creator.loading"
                  :remote-method="searchCreator">
                  <el-option
                    v-for="item in inputRemoteSearch.creator.options"
                    :key="item.userId"
                    :label="item.displayName"
                    :value="item.userId">
                  </el-option>
                </el-select>
              </template>
              <template v-else>
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder"></el-input>
              </template>
            </el-form-item>
          </div>
          <div class="advanced-search-btn-group">
            <base-button type="ghost" @event="resetParams">重置</base-button>
            <base-button type="primary" @event="search({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
          </div>
        </el-form>
      </base-panel>
    </div>

    <!--list start-->
    <div class="customer-list-component">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @event="jumpPage" v-if="editedPermission">新建</base-button>
          <base-button type="ghost" icon="icon-yemianshanchu" v-if="deletePermission" @event="deleteCustomer">删除</base-button>
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
                <div @click="openDialog('importCustomer')">导入客户</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="openDialog('importLinkman')">导入联系人</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportCustomer(true)">导出全部</div>
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
            <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.field">
                <el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label" :disabled="item.field == 'name'"/>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <!--operation bar end-->
      <el-table
        :data="customers"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        :highlight-current-row="false"
        header-row-class-name="customer-table-header"
        ref="multipleTable" class="customer-table">

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
              <a :href="`/customer/view/${scope.row.id}`" class="view-detail-btn" @click="viewCustomer">{{scope.row[column.field]}}</a>
            </template>
            <template v-else-if="column.field === 'customerAddress'">
              {{formatAddress(scope.row[column.field])}}
            </template>
            <template v-else-if="column.field === 'detailAddress'">
              {{scope.row.customerAddress && scope.row.customerAddress.adAddress}}
            </template>
            <template v-else-if="column.field === 'tags' && scope.row.tags">
              {{scope.row.tags | tagName}}
            </template>
            <template v-else-if="column.field === 'status'">
              <el-switch
                :disabled="scope.row.pending"
                @change="toggleStatus(scope.row)"
                :value="Boolean(scope.row.status)">
              </el-switch>
            </template>
            <template v-else-if="column.field === 'createUser'">
              {{scope.row.createUserName}}
            </template>
            <template v-else-if="column.field === 'remindCount'">
              {{scope.row.attribute.remindCount || 0}}
            </template>
            <template v-else-if="column.formType === 'select' && scope.row.attribute[column.field]">
              {{scope.row.attribute[column.field] | displaySelect}}
            </template>
            <template v-else-if="column.formType === 'user' && scope.row.attribute[column.field]">
              {{scope.row.attribute[column.field].displayName}}
            </template>
            <template v-else-if="column.isSystem === 0">
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
          共<span class="level-padding">{{paginationInfo.totalItems}}</span>记录，
          已选中<span class="customer-selected-count" @click="multipleSelectionPanelShow = true">{{multipleSelection.length}}</span>条
          <span class="customer-selected-count" @click="toggleSelection()">清空</span>
        </div>
        <el-pagination
          class="customer-table-pagination"
          background
          @current-change="jump"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50]"
          :page-size="paginationInfo.pageSize"
          :current-page="paginationInfo.pageNum"
          layout="prev, pager, next, sizes, jumper"
          :total="paginationInfo.totalItems">
        </el-pagination>
      </div>
    </div>
    <!--list end-->

    <!-- dialog of operation -->
    <batch-reminding-customer-dialog ref="batchRemindingCustomerDialog" :selected-ids="selectedIds"
                                     @success-callback="remindSuccess"></batch-reminding-customer-dialog>
    <send-message-dialog ref="messageDialog" :selected-ids="selectedIds" :sms-rest="smsRest"></send-message-dialog>
    <batch-editing-customer-dialog
      ref="batchEditingCustomerDialog"
      :fields="customerConfig.fieldInfo"
      :default-address="defaultAddress"
      @submit-callback="search"
      :selected-ids="selectedIds"></batch-editing-customer-dialog>
    <batch-update-customer-dialog
      ref="batchUpdateCustomerDialog"
      :selected-ids="selectedIds"
      :total-items="paginationInfo.totalItems"
      :build-download-params="buildParams"
      @success="search"
      action="/customer/importCoverNew"
    ></batch-update-customer-dialog>

    <base-import
      title="导入客户"
      ref="importCustomerModal"
      @success="search"
      action="/customer/importNew">
      <div slot="tip">
        <div class="base-import-warn">
          请先下载<a href="/customer/import/templateNew">导入模版 </a>，填写完成后再上传导入。
        </div>
      </div>
    </base-import>

    <base-import
      title="导入联系人"
      ref="importLinkmanModal"
      @success="importSucc"
      action="/contacts/import">
      <div slot="tip">
        <div class="base-import-warn">
          <p style="margin: 0">请先下载<a href="/contacts/import/template">导入模版 </a>，填写完成后再上传导入。</p>
          <p style="margin: 0">联系人导入可以先下载 <a href="/contacts/import/mesTemplate">产品数据模版文档</a>，导入信息可以依照此模板填写。</p>
          <p style="margin: 0">联系人导入可以先下载 <a href="/contacts/import/getAllCustomerId">客户数据模版文档</a>，导入信息可以依照此模板填写。</p>
        </div>
      </div>
    </base-import>

    <base-export
      ref="exportPanel"
      :columns="exportColumns"
      :build-params="buildExportParams"
      :validate="checkExportCount"
      method="post"
      action="/customer/exportNew"/>

    <base-panel :show.sync="multipleSelectionPanelShow" width="420px">
      <h3 slot="title">
        <span>已选中数据({{multipleSelection.length}})</span>
        <i 
          v-if="multipleSelection.length > 0"
          class="iconfont icon-qingkongshanchu customer-panel-btn" 
          @click="toggleSelection()" 
          title="清空已选中数据" data-placement="right" v-tooltip></i>
      </h3>

      <div class="customer-selected-panel">
        <div class="customer-selected-tip" v-if="multipleSelection.length <= 0">
          <img src="../../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="customer-selected-list">
            <div class="customer-selected-row customer-selected-head">
              <span class="customer-selected-sn">编号</span>
              <span class="customer-selected-name">客户</span>
            </div>
            <div class="customer-selected-row" v-for="c in multipleSelection" :key="c.id" >
              <span class="customer-selected-sn">{{c.serialNumber}}</span>
              <span class="customer-selected-name">{{c.name}}</span>
              <button type="button" class="customer-selected-delete" @click="cancelSelectCustomer(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>

  </div>
</template>

<script>
import _ from 'lodash';
import {formatDate,} from '../../../util/lang';
import SendMessageDialog from './operationDialog/SendMessageDialog.vue';
import BatchEditingCustomerDialog from './operationDialog/BatchEditingCustomerDialog.vue';
import BatchRemindingCustomerDialog from './operationDialog/BatchRemindingCustomerDialog.vue';
import BatchUpdateCustomerDialog from './operationDialog/BatchUpdateCustomerDialog.vue';

export default {
  name: 'customer-list-view',
  data() {
    return {
      // self state
      pending: false,
      loadingListData: false,
      advancedSearchPanelShow: false,
      multipleSelectionPanelShow: false,
      paramsBackup: {
        specialSearchModel: {
          addressSelector: [],
          adAddress: '',
        },
        customizedSearchModel: {},
        createUserName: '',
        customerManagerName: '',
        serialNumber: '',
        linkmanId: '',
        tagId: '',
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        customerAddress: {},
        orderDetail: {},
        keyword: '',
        pageNum: 1,
        pageSize: 10,
      },
      params: {
        specialSearchModel: {
          addressSelector: [],
          adAddress: '',
        },
        customizedSearchModel: {},
        createUserName: '',
        customerManagerName: '',
        serialNumber: '',
        linkmanId: '',
        tagId: '',
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        customerAddress: {},
        orderDetail: {},
      },
      createTimePickerOptions: {
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
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
        totalPages: 0,
      },
      multipleSelection: [],
      defaultAddress: [],
      // data from remote
      customers: [],
      columns: this.fixedColumns(),
      customerConfig: {},
      searchFields: [],
      inputRemoteSearch: {
        linkman: {
          options: [],
          loading: false,
        },
        tag: {
          options: [],
          loading: false,
        },
        creator: {
          options: [],
          loading: false,
        },
        customerManager: {
          options: [],
          loading: false,
        },
      },
      selectedLimit: 200,
      auth: {},
      smsRest: 0,
      columnNum: 1,
    };
  },
  computed: {
    editedPermission() {
      return this.auth.CUSTOMER_EDIT;
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
      return this.columns.map(c => {
        if (c.field !== 'customerAddress' && c.field !== 'remindCount') {
          c.export = true;
        }

        if (c.field === 'detailAddress') {
          c.exportAlias = 'customerAddress';
        }

        if (c.field === 'tags') {
          c.exportAlias = 'customerTags';
        }

        if (c.field === 'customerManagerName') {
          c.exportAlias = 'customerManager';
        }

        if (c.field === 'status') {
          c.label = '状态';
        }

        return c;
      });
    },
    panelWidth() {
      return `${420 * this.columnNum}px`;
    }
  },
  filters: {
    tagName: function (value) {
      if (!value || !Array.isArray(value) || !value.length) return '';

      return value
        .filter(tag => tag && tag.tagName)
        .map(tag => tag.tagName)
        .join('，');
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
    let initData = JSON.parse(window._init) || {};
    this.customerConfig = {
      customerAddressConfig: initData.customerAddressConfig,
      customerConfig: initData.customerConfig,
      fieldInfo: (initData.fieldInfo || []).sort((a, b) => a.orderId - b.orderId)
    };
    const {adProvince, adCity, adDist,} = this.customerConfig.customerAddressConfig;
    this.defaultAddress = [adProvince, adCity, adDist,];

    this.auth = initData.auth || {};
    this.smsRest = initData.smsRest || 0;

    this.revertSearchParams();
    this.buildConfig(this.paramsBackup.customizedSearchModel);
    this.search();

    // 团队默认加载全部数据
    this.searchTag();
  },
  methods: {
    revertSearchParams() {

      let paramsFromStorage = sessionStorage.getItem('customer_list_search_status');
      sessionStorage.removeItem('customer_list_search_status');
      if (paramsFromStorage) {
        paramsFromStorage = JSON.parse(paramsFromStorage);

        this.paramsBackup = {
          ...paramsFromStorage.params,
          pageNum: paramsFromStorage.paginationInfo.pageNum,
        };
      }
      const localStorageData = this.getLocalStorageData();

      if (localStorageData.pageSize) {
        this.paramsBackup.pageSize = Number(localStorageData.pageSize);
        this.paginationInfo.pageSize = Number(localStorageData.pageSize);
      }

      if (Array.isArray(this.paramsBackup.createTime) && this.paramsBackup.createTime.length) {
        this.paramsBackup.createTime = this.paramsBackup.createTime.map(ct => new Date(ct));
      }

      let storeUser = localStorage.getItem('store_user_for_search_customer') || '{}';
      sessionStorage.removeItem('store_user_for_search_customer');
      storeUser = JSON.parse(storeUser);

      if (this.paramsBackup.linkmanId) {
        this.inputRemoteSearch.linkman.options = storeUser.linkman || [];
      }

      if (this.paramsBackup.tagId) {
        this.inputRemoteSearch.tag.options = storeUser.tags || [];
      }

      if (storeUser.creator) {
        this.inputRemoteSearch.creator.options = storeUser.creator || [];
      }

      if (this.paramsBackup.customerManager) {
        this.inputRemoteSearch.customerManager.options = storeUser.customerManager || [];
      }

      this.params = _.cloneDeep(this.paramsBackup);

      const num = localStorage.getItem('customer_list_advance_search_column_number') || 1;
      this.columnNum = Number(num);
    },
    /**
     *  人员类型的字段
     *  绑定在form中的value是一个id，在初始化的时候却要给一个对象
     *  所以选择某个人的时候，储存这个对象
     *  在还原搜索状态的时候，取这个对象初始化这个form，
     * */
    modifyUser(type, fieldName) {
      const store = {};
      if (type === 'linkman') {
        store.linkman = this.inputRemoteSearch.linkman.options.filter(lm => lm.id === this.params.linkmanId);
      }
      if (type === 'tags') {
        store.tags = this.inputRemoteSearch.tag.options.filter(tag => tag.id === this.params.tagId);
      }
      if (type === 'createUser') {
        const selected = this.inputRemoteSearch.creator.options.filter(ct => ct.userId === this.params.createUser);
        let storageData = localStorage.getItem('store_user_for_search_customer') || '{}';
        storageData = JSON.parse(storageData);
        if (storageData.creator) {
          storageData.creator = this.concatArrayAndItemUnique(storageData.creator, selected, 'userId');
        } else {
          store.creator = selected;
        }

      }
      if (type === 'customerManager') {
        store.customerManager = this.inputRemoteSearch.customerManager.options.filter(ct => ct.userId === this.params.customerManager);
      }

      // 自定义字段
      if (type === 'user') {
        const selected = this.inputRemoteSearch.creator.options.filter(ct => ct.userId === this.params.customizedSearchModel[fieldName].value);

        let storageData = localStorage.getItem('store_user_for_search_customer') || '{}';
        storageData = JSON.parse(storageData);
        if (storageData.creator) {
          store.creator = this.concatArrayAndItemUnique(storageData.creator, selected, 'userId');
        } else {
          store.creator = selected;
        }
      }

      localStorage.setItem('store_user_for_search_customer', JSON.stringify(store));
    },
    setAdvanceSearchColumn(command){
      this.columnNum = Number(command);
      localStorage.setItem('customer_list_advance_search_column_number', command);
    },
    viewCustomer(e) {

      const status = {
        params: {
          ...this.paramsBackup,
        },
        paginationInfo: this.paginationInfo
      };

      sessionStorage.setItem('customer_list_search_status', JSON.stringify(status));
    },
    formatAddress(ad) {
      if(null == ad) return '';
        
      const {adProvince, adCity, adDist,} = ad;
      return [adProvince, adCity, adDist,]
        .filter(d => !!d).join('-');
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
    buildConfig(storage) {
      const storageData = storage || {};
      /**
       * storageData如果存在，那就还原storage中的值
       * date、datetime类型的要注意 new Date一下
       * 人员选择初始化值是一个id，还要初始化它的options
       */

      this.customerConfig.fieldInfo = this.customerConfig.fieldInfo
        .map(f => {

          if (f.isSearch && !f.isSystem) {
            if (storageData[f.fieldName] && (storageData[f.fieldName].formType === 'date' || storageData[f.fieldName].formType === 'datetime') && storageData[f.fieldName].operator === 'between') {
              storageData[f.fieldName].value = storageData[f.fieldName].value && storageData[f.fieldName].value.map(t => new Date(t));
            }

            // 需要搜索的字段
            this.$set(this.params.customizedSearchModel, f.fieldName, {
              fieldName: f.fieldName,
              value: storageData[f.fieldName] ? storageData[f.fieldName].value : null,
              operator: this.matchOperator(f.formType),
              formType: f.formType,
            });
            this.searchFields.push(f);
          }

          return f;
        });
      this.columns = this.buildTableColumn();
    },
    jumpPage() {
      window.location = '/customer/create';
    },
    /** 构建客户导出参数 */
    buildExportParams(checkedArr, ids) {
      let exportAll = !ids || ids.length == 0;
      return {
        customerChecked: checkedArr.join(','),
        data: exportAll ? '' : ids.join(','),
        exportSearchModel: exportAll ? JSON.stringify(this.buildParams() || {}) : ''
      };
    },
    /** 导出客户 */
    exportCustomer(exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}客户数据.xlsx`;
      if (!exportAll) {
        if (!this.multipleSelection.length) return this.$platform.alert('请选择要导出的数据');
        ids = this.selectedIds;
      }
      this.$refs.exportPanel.open(ids, fileName);
    },
    /** 检测导出条数 */
    checkExportCount(ids, max){
      let exportAll = !ids || ids.length == 0;
      return exportAll && this.paginationInfo.totalItems > max ? '为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。' : null;
    },
    importSucc() {
      // console.log('importSucc');
      this.search();
    },
    search(cp = {}, fullSearch) {
      // cp({pageNum: 1, }) 用于 reset pageNum = 1，在需要的情况
      let params = {};
      this.loadingListData = true;

      if (fullSearch) {
        this.paramsBackup = {
          ...this.paramsBackup,
          ..._.cloneDeep(this.params),
        };
      }

      params = {
        ...this.buildParams(),
        ...cp,
      };

      this.$http.post('/customer/list', params)
        .then(res => {
          if (!res || !res.list) {
            this.customers = [];
            this.paginationInfo.totalItems = 0;
            this.paginationInfo.totalPages = 0;
            this.paginationInfo.pageNum = 1;
          } else {
            const {pages, total, pageNum, list,} = res;

            this.customers = list
              .map(c => {
                c.pending = false;
                return c;
              });

            this.paginationInfo.totalItems = total;
            this.paginationInfo.totalPages = pages;
            this.paginationInfo.pageNum = pageNum;
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
        })
    },
    buildParams() {
      let tv = null; // tv means temporary variable that used inside the loop.
      const conditions = [];
      let params = _.cloneDeep(this.paramsBackup);

      // createTime
      if (params.createTime && params.createTime.length) {
        params.createTimeStart = formatDate(params.createTime[0]);
        params.createTimeEnd = `${formatDate(params.createTime[1]).replace('00:00:00', '23:59:59')}`;
        delete params.createTime;
      }

      // address
      if (this.paramsBackup.specialSearchModel.addressSelector.length) {
        params.customerAddress = {
          adProvince: this.paramsBackup.specialSearchModel.addressSelector[0],
          adCity: this.paramsBackup.specialSearchModel.addressSelector[1] || '',
          adDist: this.paramsBackup.specialSearchModel.addressSelector[2] || '',
        };
      }
      params.customerAddress.adAddress = this.paramsBackup.specialSearchModel.adAddress || '';

      params = this.deleteValueFromObject(params, [0, false]);

      // build customized search fields
      Object.keys(this.paramsBackup.customizedSearchModel)
        .forEach(key => {
          tv = this.paramsBackup.customizedSearchModel[key];
          if (tv.value && tv.formType === 'date') {
            return conditions.push({
              property: tv.fieldName,
              operator: tv.operator,
              betweenValue1: formatDate(tv.value[0], 'YYYY-MM-DD'),
              betweenValue2: formatDate(tv.value[1], 'YYYY-MM-DD'),
            });
          }
          if (tv.value && tv.formType === 'datetime') {
            return conditions.push({
              property: tv.fieldName,
              operator: tv.operator,
              betweenValue1: formatDate(tv.value[0], 'YYYY-MM-DD HH:mm:ss'),
              betweenValue2: `${formatDate(tv.value[1], 'YYYY-MM-DD')} 23:59:59`,
            });
          }

          if (tv.value) {
            conditions.push({
              property: tv.fieldName,
              operator: tv.operator,
              value: tv.value,
            });
          }
        });

      if (conditions.length) {
        params.conditions = conditions;
      }

      delete params.customizedSearchModel;

      return params;
    },
    // 把对象中!!为false的值去除（eg. false, undefined, null...），except 可以把想保留的值留下(eg.[0])
    // 主要用于向后端传参，把无用的空值过滤掉
    // var a = { a: 0, b: 1, c: null, d: undefined, e: false}
    //deleteValueFromObject(a) =>  {b: 1}
    //deleteValueFromObject(a, [0]) =>  {a: 0, b: 1}
    deleteValueFromObject(sourceObj, except = []) {
      let obj = _.cloneDeep(sourceObj);
      if (except.length) {
        Object.keys(obj)
          .forEach(key => {
            if (typeof obj[key] === 'object' && obj[key]) {
              obj[key] = this.deleteValueFromObject(obj[key], except);
            }
            if (!obj[key] && except.every(ex => ex !== obj[key])) {
              delete obj[key];
            }
          });
      } else {
        Object.keys(obj)
          .forEach(key => {
            if (typeof obj[key] === 'object' && obj[key]) {
              obj[key] = this.deleteValueFromObject(obj[key]);
            }
            if (!obj[key]) {
              delete obj[key];
            }
          });
      }
      if (Object.keys(obj).length) {
        return obj;
      } else {
        return undefined;
      }
    },
    concatArrayAndItemUnique(arr1, arr2, key) {
      // 数组中的对象根据id去重
      let obj = {};
      if (!arr1 || !arr1.length) return arr2 || [];
      if (!arr2 || !arr2.length) return arr1 || [];
      return [...arr1, ...arr2].reduce((cur,next) => {
        obj[next[key]] ? "" : obj[next[key]] = true && cur.push(next);
        return cur;
      },[]);
    },
    handleCitySelectorChange(city) {
      this.params.specialSearchModel.addressSelector = city;
    },
    cancelSelectCustomer(customer) {
      if (!customer || !customer.id) return;
      this.multipleSelection = this.multipleSelection.filter(ms => ms.id !== customer.id);
      this.toggleSelection([customer]);
    },
    toggleStatus(row) {
      const ns = row.status ? 0 : 1;
      row.pending = true;
      const params = {
        id: row.id,
        status: ns,
      };

      this.$http.post('/customer/changeState', params, false, {cancelable: false})
        .then(res => {
          row.pending = false;
          
          if (res.status) {
            return this.$platform.alert(res.message);
          }
          
          this.customers.forEach(c => {
            if (c.id === row.id) {
              c.status = ns;
            }
          })
        })
        .catch(err => {
          row.pending = false;
          console.error('toggleStatus catch err', err);
        })
    },
    sortChange(option) {
      /**
       * 目前情况：
       * 所有字段理应后台获取，但是获取的所有字段中没有 createTime
       *
       */
      try {
        const {prop, order} = option;
        if (!order) {
          this.paramsBackup.orderDetail = {};
          return this.search();
        }

        let sortModel = {
          isSystem: prop === 'createTime' ? 1 : 0,
          sequence: order === 'ascending' ? 'ASC' : 'DESC',
          column: prop === 'createTime' ? `customer.${prop}` : prop,
        };

        const sortedField = this.customerConfig.fieldInfo.filter(sf => sf.fieldName === prop)[0] || {};

        if (prop === 'createTime' || sortedField.formType === 'date' || sortedField.formType === 'datetime') {
          sortModel.type = 'date';
        } else {
          sortModel.type = sortedField.formType;
        }

        this.paramsBackup.orderDetail = sortModel;

        this.search();

      } catch (e) {
        console.error('e', e);
      }
    },
    jump(pageNum) {
      this.paramsBackup.pageNum = pageNum;
      this.search();
    },
    handleSizeChange(pageSize) {
      this.saveDataToStorage('pageSize', pageSize);
      this.paramsBackup.pageNum = 1;
      this.paramsBackup.pageSize = pageSize;
      this.search();
    },
    // select customer
    handleSelection(selection) {
      let tv = this.computeSelection(selection);
      let original = this.multipleSelection
        .filter(ms => this.customers.some(cs => cs.id === ms.id));
      let unSelected = this.customers
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        unSelected.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row, false);
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }
      this.multipleSelection = tv;
    },
    computeSelection(selection) {
      let tv = [];
      tv = this.multipleSelection
        .filter(ms => this.customers.every(c => c.id !== ms.id));
      tv = _.uniqWith([...tv, ...selection], _.isEqual);
      return tv;
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
    // list method end

    // operation dialog
    openDialog(category) {
      if (category === 'sendMessage') {
        this.$refs.messageDialog.openSendMessageDialog();
      }
      if (category === 'edit') {
        this.$refs.batchEditingCustomerDialog.openBatchEditingCustomerDialog();
      }
      if (category === 'remind') {
        this.$refs.batchRemindingCustomerDialog.openBatchRemindingCustomerDialog();
      }
      if (category === 'importCustomer') {
        this.$refs.importCustomerModal.open();
      }
      if (category === 'importLinkman') {
        this.$refs.importLinkmanModal.open();
      }
      if (category === 'update') {
        this.$refs.batchUpdateCustomerDialog.openBatchUpdateCustomerDialog();
      }
    },
    async deleteCustomer() {
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的客户');
      }
      try {
        const result = await this.$platform.confirm('确定要删除选择的客户？');
        if (!result) return;

        this.$http.get(`/customer/delete/${this.selectedIds.join(',')}`)
          .then(res => {
            this.multipleSelection = [];
            this.search();
          })
          .catch(err => console.error('deleteCustomer err', err));
      } catch (e) {
        console.error('deleteCustomer catch error', e);
      }
    },
    // columns
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
    backwardCompatibleColumn() {
      let checkedColumnsOldVersion = localStorage.getItem('customerCheck');
      if (!checkedColumnsOldVersion) return;
      let columns = checkedColumnsOldVersion.split(',');
      localStorage.removeItem('customerCheck');
      return (columns || []).filter(c => c)
        .map(c => {
          if (c === 'address') return 'customerAddress';
          if (c === 'addressDetail') return 'detailAddress';
          if (c === 'manager') return 'customerManagerName';

          return c;
        })
    },
    buildTableColumn() {
      const localStorageData = this.getLocalStorageData();
      let columnStatus = localStorageData.columnStatus || [];
      if (!columnStatus.length) {
        columnStatus = this.backwardCompatibleColumn();
      }
      let minWidth = 100;

      let baseColumns = this.fixedColumns();
      let dynamicColumns = [];
      let columns = [];
      let sortable = false;

      dynamicColumns = this.customerConfig.fieldInfo
        .filter(f => !f.isSystem && f.formType !== 'attachment' && f.formType !== 'separator')
        .map(field => {
          sortable = false;
          minWidth = 100;
          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom';
            minWidth = 100;
          }

          if (field.displayName.length > 4) {
            minWidth = field.displayName.length * 20;
          }

          if (sortable && field.displayName.length >= 4) {
            minWidth += 25;
          }

          if (field.formType === 'datetime') {
            minWidth = 150;
          }

          return {
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            width: `${minWidth}px`,
            sortable,
            isSystem: field.isSystem,
          };
        });

      columns = [...baseColumns, ...dynamicColumns];

      if (!columnStatus || !columnStatus.length) {
        return columns;
      }

      columns = columns.map(bc => {
        bc.show = columnStatus.some(sc => sc === bc.field);
        return bc;
      });
      return columns;
    },
    resetParams() {

      this.paramsBackup = {
        specialSearchModel: {
          addressSelector: [],
          adAddress: '',
        },
        customizedSearchModel: {},
        createUserName: '',
        customerManagerName: '',
        serialNumber: '',
        linkmanId: '',
        tagId: '',
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        customerAddress: {},
        orderDetail: {},
        keyword: '',
        pageNum: 1,
        pageSize: this.paramsBackup.pageSize,
      };

      this.params = {
        createUserName: '',
        customerManagerName: '',
        serialNumber: '',
        linkmanId: '',
        tagId: '',
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        customerAddress: {},
        orderDetail: {},
        specialSearchModel: {
          addressSelector: [],
          adAddress: '',
        },
        customizedSearchModel: {
          ...this.params.customizedSearchModel,
        },
      };
      this.params.specialSearchModel.addressSelector = [];
      this.params.specialSearchModel.adAddress = '';

      for (let key in this.params.customizedSearchModel) {
        this.params.customizedSearchModel[key].value = null;
      }

      this.inputRemoteSearch.linkman.options = [];
      this.inputRemoteSearch.creator.options = [];
      this.$refs.baseDistPicker.clearValue();
      this.search();
      sessionStorage.removeItem('customer_list_search_status');
    },
    // input search method
    searchCustomerManager(keyword) {
      this.inputRemoteSearch.customerManager.loading = true;
      return this.$http.get('/customer/userTag/list', {keyword: keyword, pageNum: 1,})
        .then(res => {
          this.inputRemoteSearch.customerManager.options = res.list;
          this.inputRemoteSearch.customerManager.loading = false;
          return res;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
    searchCreator(keyword) {
      this.inputRemoteSearch.creator.loading = true;
      return this.$http.get('/customer/userTag/list', {keyword: keyword, pageNum: 1,})
        .then(res => {
          if (res && res.list) {
            this.inputRemoteSearch.creator.options = res.list;
            this.inputRemoteSearch.creator.loading = false;
          }
          return res;
        })
        .catch(err => console.error('searchCreator function catch err', err));
    },
    searchLinkman(keyword) {
      this.inputRemoteSearch.linkman.loading = true;
      return this.$http.get('/linkman/getListAsyn', {keyword: keyword, pageNum: 1,})
        .then(res => {
          if (res && res.list) {
            this.inputRemoteSearch.linkman.options = res.list;
            this.inputRemoteSearch.linkman.loading = false;
          }
          return res;
        })
        .catch(err => console.error('searchLinkman function catch err', err));
    },
    searchTag(keyword) {
      this.inputRemoteSearch.tag.loading = true;
      return this.$http.get('/customer/tag/list', {keyword: keyword, pageNum: 1, pageSize: 100 * 100, })
        .then(res => {
          if (res && res.list) {
            this.inputRemoteSearch.tag.options = res.list;
            this.inputRemoteSearch.tag.loading = false;
          }
          return res;
        })
        .catch(err => console.error('searchTag function catch err', err));
    },
    // match data
    matchOperator(formType) {
      let operator = '';
      switch (formType) {
      case 'date':
        operator = 'between';
        break;
      case 'datetime':
        operator = 'between';
        break;
      case 'select':
        operator = 'eq';
        break;
      case 'selectMulti':
        operator = 'contain';
        break;
      case 'user':
        operator = 'user';
        break;
      default:
        operator = 'like';
        break;
      }
      return operator;
    },
    matchSelected() {
      if (!this.multipleSelection.length) return;
      const selected = this.customers
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
    fixedColumns() {
      return [{
        label: '客户',
        field: 'name',
        show: true,
        fixed: true,
        minWidth: '150px',
      }, {
        label: '客户编号',
        field: 'serialNumber',
        // width: '150px',
        fixed: true,
        show: true,
      }, {
        label: '联系人',
        field: 'lmName',
        // width: '100px',
        show: true,
      }, {
        label: '电话',
        field: 'lmPhone',
        // width: '130px',
        show: true,
      }, {
        label: '区域',
        field: 'customerAddress',
        // width: '180px',
        show: true,
      }, {
        label: '详细地址',
        field: 'detailAddress',
        // width: '160px',
        show: true,
      }, {
        label: '服务团队',
        field: 'tags',
        // width: '110px',
        show: true,
      }, {
        label: '客户负责人',
        field: 'customerManagerName',
        show: true,
        width: '110px',
      }, {
        label: '启用/禁用',
        field: 'status',
        show: true,
        align: 'center',
        width: '100px',
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        sortable: 'custom',
        width: '150px',
      }, {
        label: '创建人',
        field: 'createUser',
        // width: '80px',
        show: true,
      }, {
        label: '提醒数量',
        field: 'remindCount',
        // width: '80px',
        show: true,
      }]
    }
  },
  components: {
    [SendMessageDialog.name]: SendMessageDialog,
    [BatchEditingCustomerDialog.name]: BatchEditingCustomerDialog,
    [BatchRemindingCustomerDialog.name]: BatchRemindingCustomerDialog,
    [BatchUpdateCustomerDialog.name]: BatchUpdateCustomerDialog,
  }
}
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

html, body {
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

.customer-advance-setting .el-dropdown-menu__item{
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

  .advanced-search-function, .base-search {
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
      width: 500px;
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

  .table-footer {
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
    }

    .el-pagination__jump {
      margin-left: 0;
    }
  }
}

.customer-panel-btn{
  float: right;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;

  &:hover{
    color: $color-primary;
  }
}

// -------- customer selected panel --------
.customer-selected-count{
  color: $color-primary;
  padding: 0 3px;
  width: 15px;
  text-align: center;
  cursor: pointer;
  font-size: 13px;
}

.customer-selected-panel{
  font-size: 14px;
  height: calc(100% - 51px);
}

.customer-selected-tip{
  padding-top: 80px;

  img{
    display: block;
    width: 240px;
    margin: 0 auto;
  }

  p{
    text-align: center;
    color: #9a9a9a;
    margin: 30px 0 0 0;
    line-height: 20px;
  }
}

.customer-selected-list{
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}

.customer-selected-row{
  display: flex;
  flex-flow: row nowrap;
  line-height: 36px;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;


  &:hover{
    background-color: #f5f7fa;

    .customer-selected-delete{
      visibility: visible;
    }
  }
}

.customer-selected-head{
  background-color: #F0F5F5;
  color: #333;
  font-size: 14px;
}

.customer-selected-sn{
  padding-left: 10px;
  width: 150px;
  @include text-ellipsis;
}

.customer-selected-name{
  padding-left: 10px;
  flex: 1;
  @include text-ellipsis;
}

.customer-selected-delete{
  width: 36px;
}

.customer-selected-row button.customer-selected-delete{
  padding: 0;
  width: 36px;
  height: 36px;
  border: none;
  background-color: transparent;
  outline: none;
  color: #646B78;
  visibility: hidden;

  i{
    font-size: 14px;
  }

  &:hover{
    color: #e84040;
  }
}

// operation
.customer-columns-dropdown-menu {
  max-height: 300px;
  overflow: auto;
  .el-dropdown-menu__item{
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
</style>
