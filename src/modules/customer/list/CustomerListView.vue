<template>
  <div class="customer-list-container" ref="customerListPage" v-loading.fullscreen.lock="loadingListData">
    <!--搜索-->
    <div class="customer-list-search-group-container">
      <form @submit.prevent="search" class="base-search">
        <div>
          <el-input v-model="params.keyword" placeholder="根据客户信息搜索"></el-input>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button type="primary" class="reset-btn" @click="resetParams">重置</el-button>
        </div>
        <el-button type="primary" @click="advancedSearchPanelShow = !advancedSearchPanelShow" class="advanced-search-visible-btn">高级搜索</el-button>
      </form>
      <!--高级搜索-->
      <base-panel :show.sync="advancedSearchPanelShow" width="420px" class="advanced-search-form-wrap">
        <h4 class="panel-title">
          高级搜索
          <i class="iconfont icon-guanbi" @click="advancedSearchPanelShow = false"></i>
        </h4>
        <el-form class="advanced-search-form">
          <el-form-item label-width="100px" label="客户编号">
            <el-input type="text" v-model="params.serialNumber"></el-input>
          </el-form-item>
          <el-form-item label-width="100px" label="联系人">
            <el-select
              v-model="params.linkmanId"
              filterable
              remote
              reserve-keyword
              placeholder=""
              :loading="inputRemoteSearch.linkman.loading"
              :remote-method="searchLinkman">
              <el-option
                v-for="item in inputRemoteSearch.linkman.options"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label-width="100px" label="选择团队">
            <el-select
              v-model="params.tagId"
              filterable
              remote
              reserve-keyword
              placeholder=""
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
            <base-dist-picker @city-selector-change="handleCitySelectorChange" ref="baseDistPicker"></base-dist-picker>
          </el-form-item>
          <el-form-item label-width="100px" label="详细地址">
            <el-input type="text" v-model="specialParams.adAddress"></el-input>
          </el-form-item>
          <el-form-item label-width="100px" label="有无提醒">
            <el-select v-model="params.hasRemind" placeholder="请选择">
              <el-option :value="null" label="全部"></el-option>
              <el-option :value="1" label="有"></el-option>
              <el-option :value="0" label="无"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label-width="100px" label="状态">
            <el-select v-model="params.status" placeholder="请选择">
              <el-option :value="null" label="全部"></el-option>
              <el-option :value="1" label="启用"></el-option>
              <el-option :value="0" label="禁用"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label-width="100px" label="创建人">
            <el-select
              v-model="params.createUser"
              filterable
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
          </el-form-item>
          <el-form-item label-width="100px" label="客户负责人">
            <el-select
              v-model="params.customerManager"
              filterable
              remote
              reserve-keyword
              placeholder=""
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
          <el-form-item label-width="100px" :label="field.displayName" v-for="field in searchFields" :key="field.fieldName">
            <template v-if="field.formType === 'text' || field.formType === 'code'">
              <el-input v-model="customizedSearchModel[field.fieldName]['value']" :placeholder="field.placeHolder" type="text"></el-input>
            </template>
            <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
              <el-select v-model="customizedSearchModel[field.fieldName]['value']" :placeholder="field.placeHolder">
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
              <el-input v-model="customizedSearchModel[field.fieldName]['value']" :placeholder="field.placeHolder" type="number"></el-input>
            </template>
            <template v-else-if="field.formType === 'date' || field.formType === 'datetime'">
              <el-date-picker
                v-model="customizedSearchModel[field.fieldName]['value']"
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
                v-model="customizedSearchModel[field.fieldName]['value']"
                filterable
                remote
                reserve-keyword
                placeholder="                   "
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
              <el-input v-model="customizedSearchModel[field.fieldName]['value']" :placeholder="field.placeHolder"></el-input>
            </template>
          </el-form-item>

          <div class="advanced-search-btn-group">
            <el-button type="primary" class="reset-btn" @click="resetParams">重置</el-button>
            <el-button type="primary" class="search-btn" @click="search">搜索</el-button>
          </div>
        </el-form>
      </base-panel>
    </div>

    <!--list start-->
    <div class="customer-list-component">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <el-button type="primary" icon="el-icon-plus" @click="jumpPage">新建</el-button>
          <el-button type="primary" icon="el-icon-delete" @click="deleteCustomer" class="delete-customer-btn">删除</el-button>
        </div>

        <div>
          <el-dropdown>
            <el-button type="primary">
              批量操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item >
                <div @click="openDialog('sendMessage')">发送短信</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="openDialog('edit')">批量编辑</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="openDialog('remind')">批量提醒</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown >
            <el-button type="primary">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
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
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown :hide-on-click="false" :show-timeout="150">
            <el-button type="primary">
              选择列<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.label">
                <el-checkbox v-model="item.show" @input="modifyColumnStatus($event)" :label="item.label">{{item.label}}</el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <!--operation bar end-->

      <el-table
        stripe
        :data="customers"
        @select="selectRow"
        @select-all="selectAll"
        @sort-change="sortChange"
        row-key="serialNumber"
        @selection-change="handleSelectionChange" ref="multipleTable" class="customer-table">
        <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>
        <el-table-column
          v-for="column in columns"
          :key="column.field"
          :label="column.label"
          :width="column.width"
          :prop="column.field"
          v-if="column.show"
          :sortable="column.sortable"
          :align="column.align"
          show-overflow-tooltip>
          <template slot-scope="scope">
            <template v-if="column.field === 'customerAddress'">
              {{scope.row[column.field].str}}
            </template>
            <template v-else-if="column.field === 'detailAddress'">
              {{scope.row.customerAddress.adAddress}}
            </template>
            <template v-else-if="column.field === 'tags'">
              {{scope.row.tagsStr}}
            </template>
            <template v-else-if="column.field === 'status'">
              <el-switch
                :disabled="pending"
                @change="toggleStatus(scope.row)"
                v-model="scope.row.status">
              </el-switch>
            </template>
            <template v-else-if="column.field === 'createUser'">
              {{scope.row.createUserName}}
            </template>
            <template v-else-if="column.field === 'remindCount'">
              {{scope.row.attribute.remindCount}}
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
          <i class="iconfont icon-abnormal"></i>
          已选中 <span class="selectedCount" @click="multipleSelectionPanelShow = true">{{multipleSelection.length}}</span> 条
          <span class="selectedCount" @click="toggleSelection()">清空</span>
          <span class="level-padding">共<span class="level-padding">{{paginationInfo.totalItems}}</span>记录</span>
          <span class="level-padding">共<span class="level-padding">{{paginationInfo.totalPages}}</span>页</span>
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
    <send-message-dialog
      ref="messageDialog" :selected-customer="multipleSelection"/>

    <batch-editing-customer-dialog
      ref="batchEditingCustomerDialog"
      :fields="customerConfig.fieldInfo"
      :selected-ids="selectedIds"/>
    <!--batch-reminding-customer-dialog-->

    <batch-reminding-customer-dialog
      ref="batchRemindingCustomerDialog"
      :selected-ids="selectedIds"/>

    <base-import
      ref="importCustomerModal"
      @success="importSucc"
      action="/customer/import">
      <div slot="tip">
        <div class="base-import-warn">
          请先下载<a href="/customer/import/template">导入模版 </a>，填写完成后再上传导入。
        </div>
      </div>
    </base-import>

    <base-import
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
      :columns="columns"
      :build-params="buildExportParams"
      action="/customer/export" />

    <base-panel :show.sync="multipleSelectionPanelShow" width="420px" class="selected-customer-panel">
      <h4 class="panel-title">
        已选择({{multipleSelection.length}})
        <i class="iconfont icon-guanbi" @click="multipleSelectionPanelShow = false"></i>
      </h4>
      <dl class="selected-customer-list">
        <dt>
          <span class="sn">编号</span>
          <span class="name-column">客户</span>
          <i></i>
        </dt>
        <dd v-for="c in multipleSelection" :key="c.id" @click="cancelSelectCustomer(c)">
          <span class="sn">{{c.serialNumber}}</span>
          <span class="name-column">{{c.name}}</span>
          <i class="iconfont icon-close"></i>
        </dd>
      </dl>
      <el-button type="info" class="cancel-select-customer-btn" @click="toggleSelection()">清除</el-button>
    </base-panel>

  </div>
</template>

<script>
  import _ from 'lodash';
  import { formatDate, } from '../../../util/lang';

  import BaseDistPicker from '../../../component/common/BaseDistPicker';
  import BasePanel from '../../../component/common/BasePanel';
  import SendMessageDialog from './operationDialog/SendMessageDialog.vue';
  import BatchEditingCustomerDialog from './operationDialog/BatchEditingCustomerDialog.vue';
  import BatchRemindingCustomerDialog from './operationDialog/BatchRemindingCustomerDialog.vue';
  import BaseImport from '../../../component/common/BaseImport';
  import BaseExport from '../../../component/common/BaseExport';

  export default {
  name: 'customer-list-view',
  data() {
    return {
      // self state
      pending: false,
      loadingListData: false,
      advancedSearchPanelShow: false,
      multipleSelectionPanelShow: false,
      customizedSearchModel: {},
      specialParams: {
        sortBy: {
          'customer.createTime': null,
        },
        addressSelector: [],
        adAddress: '',
      },
      params: {
        linkmanName: '',
        createUserName: '',
        tagName: '',
        customerManagerName: '',
        keyword: '',
        viewId: '',
        serialNumber: '',
        linkmanId: '',
        customerAddress: {},
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        pageNum: 1,
        pageSize: 10,
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
    };
  },
  computed: {
    selectedIds() {
      return this.multipleSelection.map(c => c.id) || [];
    },
  },
  mounted() {
    let initData = JSON.parse(window._init) || {};
    const localStorageData = this.getLocalStorageData();
    if (localStorageData.pageSize) {
      this.params.pageSize = Number(localStorageData.pageSize);
      this.paginationInfo.pageSize = Number(localStorageData.pageSize);
    }
    this.customerConfig = {
      customerAddressConfig: initData.customerAddressConfig,
      customerConfig: initData.customerConfig,
      fieldInfo: initData.fieldInfo,
    };

    this.buildConfig();

    this.search();
  },
  methods: {
    buildConfig() {
      this.customerConfig.fieldInfo = this.customerConfig.fieldInfo
        .map(f => {
          if (f.isSearch) {
            // 需要搜索的字段
            this.$set(this.customizedSearchModel, f.fieldName, {
              fieldName: f.fieldName,
              value: null,
              operator: this.matchOperator(f.formType),
              formType: f.formType,
            });
            this.searchFields.push(f);
            if (f.formType === 'number') {
              this.$set(this.specialParams, `lpad(myOrderConvertor(customer.attribute->>'$.${f.fieldName}'),16,0)`, '')
            }
            if (f.formType === 'date' || f.formType === 'datetime') {
              this.$set(this.specialParams, `myOrderConvertor(customer.attribute->>'$.${f.fieldName}')`, '')
            }
          }

          return f;
        });
      this.columns = this.buildTableColumn();
    },
    jumpPage() {
      window.location = '/customer/create';
    },
    buildExportParams(checkedArr, ids) {
      let params = {};

      if (ids && ids.length) {
        params = {
          customerChecked: checkedArr.join(','),
          data: ids.join(','),
          exportSearchModel: '',
        };
      } else {
        params = {
          customerChecked: checkedArr.join(','),
          data: '',
          exportSearchModel: JSON.stringify(this.buildParams() || {}),
        }
      }
      return params;
    },
    exportCustomer(exportAll){
      let ids = [];
      let fileName = `${formatDate(new Date(),'YYYY-MM-dd')}客户数据.xlsx`;
      if(!exportAll){
        if(!this.multipleSelection.length) return this.$platform.alert('请选择要导出的数据');
        ids = this.selectedIds;
      }
      this.$refs.exportPanel.open(ids, fileName);
    },
    importSucc() {
      console.log('importSucc');
    },
    search() {
      const params = this.buildParams();
      this.loadingListData = true;

      this.$http.post('/v2/customer/list', params)
        .then(res => {
          if (!res || !res.list) {
            this.customers = [];
            this.paginationInfo.totalItems = 0;
            this.paginationInfo.totalPages = 0;
            this.paginationInfo.pageNum = 1;
          }

          this.customers = this.processRawData(res.list);

          const { pages, total, pageNum, } = res;
          this.paginationInfo.totalItems = total;
          this.paginationInfo.totalPages = pages;
          this.paginationInfo.pageNum = pageNum;
          this.matchSelected();          // 把选中的匹配出来

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
    // process raw data
    buildParams() {
      let tv = null; // tv means temporary variable that used inside the loop.
      const conditions = [];
      let params = {
        ..._.cloneDeep(this.params),
        ..._.cloneDeep(this.specialParams),
      };

      // createTime
      if (params.createTime && params.createTime.length) {
        params.createTimeStart = formatDate(params.createTime[0]);
        params.createTimeEnd = `${formatDate(params.createTime[1])} 23:59:59`;
        delete params.createTime;
      }

      // address
      if (this.specialParams.addressSelector.length) {
        params.customerAddress = {
          adProvince: this.specialParams.addressSelector[0],
          adCity: this.specialParams.addressSelector[1] || '',
          adDist: this.specialParams.addressSelector[2] || '',
        };
      }
      params.customerAddress.adAddress = this.specialParams.adAddress || '';

      params = this.deleteValueFromObject(params, [0, false]);

      // build customized search fields
      Object.keys(this.customizedSearchModel)
        .map(key => {
          tv = this.customizedSearchModel[key];
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

      // console.log('[build params end]params', params);
      return params;
    },
    deleteValueFromObject(obj, except = [] ) {
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
    processRawData(cl) {
      //  cl means customer list.
      let temp = null;
      let tv = null; // tv means temporary variable that used inside the loop.

      if (!cl || !cl.length) return [];

      return cl.map(c => { // c means customer.
        temp = c.customerAddress;
        c.customerAddress.str = `${temp.adProvince}-${temp.adCity}-${temp.adDist}`;
        c.tagsStr = c.tags.map(t => t.tagName).join(' ');
        c.status = Boolean(c.status);

        // c.attribute is the object that includes all customized field.
        Object.keys(c.attribute)
          .forEach(key => {
            tv = c.attribute[key];

            if (Array.isArray(c.attribute[key]) && (typeof c.attribute[key][0] === "string")) {
              tv = JSON.stringify(tv);
              c.attribute[key] = tv.replace(/"/g, '',);
              return key;
            }

            if (Array.isArray(tv) && (typeof tv[0] === "object")) {
              c.attribute[key] = tv.map(a => this.getNameFromObject(a)).join(',');
              return key;
            }

            if (typeof tv === "object") {
              c.attribute[key] = this.getNameFromObject(tv);
              return key;
            }
          });
        return c;
      })
    },
    handleCitySelectorChange(city) {
      this.specialParams.addressSelector = city;
    },
    cancelSelectCustomer(customer) {
      if (!customer || !customer.id) return;
      this.multipleSelection = this.multipleSelection.filter(ms => ms.id !== customer.id);
      this.toggleSelection([customer]);
    },
    toggleStatus(row) {
      const params = {
        id: row.id,
        status: Number(row.status),
      };

      this.pending = true;
      this.$http.post('/customer/changeState', params, false)
        .then(res => {
          this.pending = false;
        })
        .catch(err => {
          this.pending = false;
          console.error('toggleStatus catch err', err);
        })
    },
    sortChange(option) {
      const { column, prop, order } = option;
      if (!column || !prop || !order) return;
      const numberField = `lpad(myOrderConvertor(customer.attribute->>'$.${prop}'),16,0)`;
      const dateField = `myOrderConvertor(customer.attribute->>'$.${prop}')`;
      let type = null;

      if (prop === 'createTime') {
        this.specialParams.sortBy = {
          'customer.createTime': this.matchSortValue(order),
          [numberField]: '',
          [dateField]: '',
        }
      } else {
        type = this.searchFields.filter(sf => sf.fieldName === prop)[0].formType;
      }
      if (type === 'number') {
        this.specialParams.sortBy = {
          'customer.createTime': '',
          [numberField]: this.matchSortValue(order),
          [dateField]: '',
        }
      }
      this.search();
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
    selectRow(selection, row) {
      if (selection.length < this.multipleSelection.length) {
        this.multipleSelection = this.multipleSelection
          .filter(sRow => sRow.id !== row.id);
      }
    },
    selectAll(selection) {
      if (selection.length) return;
      this.multipleSelection = this.multipleSelection
        .filter(sR => this.customers.every(c => c.id !== sR.id));
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
    handleSelectionChange(val) {
      this.multipleSelection = _.uniqWith([...this.multipleSelection, ...val], _.isEqual);
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
    },
    async deleteCustomer() {
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的客户');
      }
      try {
        const result = this.$platform.confirm('确定要删除选择的客户？');
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
    modifyColumnStatus() {
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
    buildTableColumn() {
      const localStorageData = this.getLocalStorageData();
      let columnStatus = localStorageData.columnStatus || [];

      let baseColumns = this.fixedColumns();
      let dynamicColumns = [];
      let columns = [];

      dynamicColumns = this.customerConfig.fieldInfo
        .filter(f => !f.isSystem)
        .map(field => {
          let sortable = false;
          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0) {
            sortable = 'custom';
          }

          return {
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            sortable,
            isSystem: 0,
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
      this.params = {
        linkmanName: '',
        createUserName: '',
        tagName: '',
        customerManagerName: '',
        keyword: '',
        // isAdvanced: 0,
        viewId: '',
        serialNumber: '',
        linkmanId: '',
        customerAddress: {},
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        pageNum: 1,
        pageSize: 10,

      };
      for (let key in this.specialParams.sortBy) {
        this.specialParams.sortBy[key] = '';
      }
      this.specialParams.addressSelector = [];
      this.specialParams.adAddress = '';

      for (let key in this.customizedSearchModel) {
        this.customizedSearchModel[key].value = null;
      }
      this.$refs.baseDistPicker.clearValue();
      this.search();
    },
    // input search method
    searchCustomerManager(keyword) {
      this.inputRemoteSearch.customerManager.loading = true;
      this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.customerManager.options = res.list;
          this.inputRemoteSearch.customerManager.loading = false;
        })
        .catch(err => console.error('searchCustomerManager function catch err', err));
    },
    searchCreator(keyword) {
      this.inputRemoteSearch.creator.loading = true;
      this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.creator.options = res.list;
          this.inputRemoteSearch.creator.loading = false;
        })
        .catch(err => console.error('searchCreator function catch err', err));
    },
    searchLinkman(keyword) {
      this.inputRemoteSearch.linkman.loading = true;
      this.$http.get('/linkman/getListAsyn', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.linkman.options = res.list;
          this.inputRemoteSearch.linkman.loading = false;
        })
        .catch(err => console.error('searchLinkman function catch err', err));
    },
    searchTag(keyword) {
      this.inputRemoteSearch.tag.loading = true;
      this.$http.get('/task/tag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.tag.options = res.list;
          this.inputRemoteSearch.tag.loading = false;
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
    matchSortValue(order) {
      let value = '';
      switch (order) {
        case null:
          value = '';
          break;
        case 'descending':
          value = false;
          break;
        case 'ascending':
          value = true;
          break;
        default:
          value = '';
          break;
      }
      return value;
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
    getNameFromObject(obj) {
      if (!obj) return;
      let objKeys = Object.keys(obj) || [];
      let nameKeys = [];

      nameKeys = objKeys
        .filter(aKey => /name/gi.test(aKey)) || [];

      if (!objKeys.length) return null;

      if (!nameKeys[0]) return obj[objKeys[0]];
      return obj[nameKeys[0]];
    },
    fixedColumns() {
      return [{
        label: '客户',
        field: 'name',
        show: true,
      }, {
        label: '客户编号',
        field: 'serialNumber',
        show: true,
      }, {
        label: '联系人',
        field: 'lmName',
        show: true,
      }, {
        label: '电话',
        field: 'lmPhone',
        show: true,
      }, {
        label: '区域',
        field: 'customerAddress',
        show: true,
      }, {
        label: '详细地址',
        field: 'detailAddress',
        show: true,
      }, {
        label: '服务团队',
        field: 'tags',
        show: true,
      }, {
        label: '客户负责人',
        field: 'customerManagerName',
        show: true,
        width: '100px',
      }, {
        label: '启用/禁用',
        field: 'status',
        show: true,
        align: 'center'
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        sortable: 'custom',
        width: '100px',
      }, {
        label: '创建人',
        field: 'createUser',
        show: true,
      }, {
        label: '提醒数量',
        field: 'remindCount',
        show: true,
      }]
    }

  },
  components: {
    [BasePanel.name]: BasePanel,
    [BaseDistPicker.name]: BaseDistPicker,
    [SendMessageDialog.name]: SendMessageDialog,
    [BatchEditingCustomerDialog.name]: BatchEditingCustomerDialog,
    [BatchRemindingCustomerDialog.name]: BatchRemindingCustomerDialog,
    [BaseImport.name]: BaseImport,
    [BaseExport.name]: BaseExport,
  }
}
</script>

<style lang="scss">
  html, body {
    height: 100%;
  }

  .level-padding {
    padding: 0 5px;
  }

  .customer-list-container {
    height: 100%;
    overflow: auto;
    background: #f4f7f5;
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

      div {
        .el-input {
          width: 260px;
          margin-right: 10px;
        }
        .el-button {
          font-size: 14px;
          font-weight: lighter;
          height: 32px;
          line-height: 12px;
        }
        .reset-btn {
          color: #9398a0;
          border-color: #e0e1e2;
          background: #fff;
        }
      }

      .advanced-search-visible-btn {
        font-size: 14px;
        font-weight: lighter;
        height: 32px;
        line-height: 12px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
      }
    }

    .advanced-search-form-wrap {
      .advanced-search-form {
        .el-form-item {
          .el-form-item__content,
          .el-select,
          .base-dist-picker,
          .el-cascader,
          .el-date-editor
          {
            width: 290px;
          }
        }

        .advanced-search-btn-group {
          display: flex;
          justify-content: space-between;
          width: 365px;
          height: 40px;
          margin: 0 auto 25px;

          .el-button {
            width: 160px;
            font-size: 18px;
            font-weight: lighter;
          }
          .reset-btn {
            background: #E5E8F0;
            color: #656B77;
            border: #656B77;
          }
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

    .customer-table {
      border-radius: 3px;
      th {
        color: #606266;
        font-size: 14px;
      }
      td {
        color: #909399;
        font-size: 13px;
      }


      .select-column .el-checkbox {
        position: relative;
        top: 3px;
      }
    }

    .table-footer {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background: #fff;

      .list-info {
        font-size: 12px;
        line-height: 28px;
        margin: 0;
        color: #767e89;
        .iconfont {
          position: relative;
          top: 1px;
        }
        .selectedCount {
          color: $color-primary;
          padding: 0 3px;
          width: 15px;
          text-align: center;
          &:hover {
            cursor: pointer;
          }
        }
      }

      .el-pagination__jump {
        margin-left: 0;
      }
    }
  }

  //
  .selected-customer-panel {


    .selected-customer-list {
      overflow-y: scroll;
      padding: 0 20px;
      line-height: 30px;
      font-size: 14px;
      height: calc(100% - 130px);
      dt, dd {
        display: flex;
        border-bottom: 1px dashed #F0F5F5;
        font-weight: normal;
      }

      dd {
        &:hover {
          cursor: pointer;
          .iconfont {
            display: block;
          }
        }
        span.name-column, .iconfont {
          color: $color-primary;
        }
        .iconfont {
          display: none;
        }
      }

      .name-column {
        padding: 0 5px;
        width: 220px;
        @include text-ellipsis;
      }
      .sn {
        padding: 0 5px;
        @include text-ellipsis;
        width: 120px;
      }
    }

    .cancel-select-customer-btn {
      margin-right: 20px;
      float: right;
      background: #E5E8F0;
      border-color: #E5E8F0;
      color: #646B78;
    }
  }

  // operation
  .customer-columns-dropdown-menu {
    max-height: 300px;
    overflow: auto;
    .el-checkbox {
      width: 100%;
    }
  }

  .operation-bar-container {
    background: #fff;
    border-radius: 3px;
    display: flex;
    justify-content: space-between;
    padding: 10px;

    .top-btn-group .el-button, .el-button {
      font-weight: lighter;
      font-size: 14px;
    }

    /*.el-dropdown-menu li {*/
      /*font-size: 13px;*/
    /*}*/

    .delete-customer-btn {
      background: #fff;
      color: #81848F;
      border-color: rgb(218, 218, 220);
      margin-left: 5px;
    }
  }
</style>
