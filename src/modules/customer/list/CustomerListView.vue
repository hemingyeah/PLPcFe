<template>
  <div class="customer-list-container" ref="customerListPage">
    <!--搜索-->
    <div class="customer-list-search-group-container">
      <form @submit.prevent="search" class="base-search">
        <div>
          <el-input v-model="params.keyword" placeholder="根据客户信息搜索"></el-input>
          <el-button type="primary" @click="search" native-type="submit">搜索</el-button>
          <el-button type="primary" class="reset-btn" @click="resetParams">重置</el-button>
        </div>
        <el-button type="primary"  @click="advancedSearchPanelShow = !advancedSearchPanelShow" class="advanced-search-visible-btn">高级搜索</el-button>
      </form>

      <base-panel :show.sync="advancedSearchPanelShow" width="420px" class="advanced-search-form-wrap">
        <h4 class="panel-title">高级搜索</h4>
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
              placeholder="请输入关键词"
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
              placeholder="请输入关键词"
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
            <base-dist-picker v-on:city-selector-change="handleCitySelectorChange" ref="baseDistPicker"></base-dist-picker>
          </el-form-item>
          <el-form-item label-width="100px" label="详细地址">
            <el-input type="text" v-model="params.customerAddress.adAddress"></el-input>
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
              placeholder="请输入关键词"
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
              placeholder="请输入关键词"
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
                placeholder="请输入关键词"
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
        <el-button-group>
          <el-button type="primary" icon="el-icon-plus">新建</el-button>
          <el-button type="primary" icon="el-icon-delete" @click="deleteCustomer">删除</el-button>
        </el-button-group>

        <div>
          <el-dropdown trigger="click">
            <el-button type="primary">
              批量操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item >
                <span @click="openDialog('sendMessage')">发送短信</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <span @click="openDialog('edit')">批量编辑</span>
              </el-dropdown-item>
              <el-dropdown-item>
                <span @click="openDialog('remind')">批量提醒</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-dropdown :hide-on-click="false" trigger="click" :show-timeout="150">
            <el-button type="primary">
              选择列<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.label">
                <el-checkbox v-model="item.show" @input="modifyColumnStatus($event)" :label="item.label">{{item.label}}</el-checkbox>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown>
            <el-button type="primary">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>导入客户</el-dropdown-item>
              <el-dropdown-item>导入联系人</el-dropdown-item>
              <el-dropdown-item>导出</el-dropdown-item>
              <el-dropdown-item>导出全部</el-dropdown-item>
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
        <el-table-column type="selection" width="35"></el-table-column>
        <el-table-column
          v-for="column in columns"
          :key="column.field"
          :label="column.label"
          :width="column.width"
          :prop="column.field"
          v-if="column.show"
          :sortable="column.sortable"
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
              <el-checkbox v-model="scope.row.status === 1"></el-checkbox>
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
          已选中 <span class="selectedCount">{{multipleSelection.length}}</span> 条 <a href="javasript:;" class="clearSelectedBtn" @click="toggleSelection()">清空</a>
          共 {{paginationInfo.totalItems}} 记录  共 {{paginationInfo.totalPages}} 页
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
      ref="messageDialog"
      :selectedCustomer="multipleSelection">

    </send-message-dialog>

    <batch-editing-customer-dialog
      ref="batchEditingCustomerDialog"
      :selectedCustomer="multipleSelection">

    </batch-editing-customer-dialog>
    <!--batch-reminding-customer-dialog-->

    <batch-reminding-customer-dialog
      ref="batchRemindingCustomerDialog"
      :selectedCustomer="multipleSelection">

    </batch-reminding-customer-dialog>


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


  export default {
  name: 'customer-list-view',
  data() {
    return {
      // self state
      pending: false,
      advancedSearchPanelShow: false,
      address: [],
      customizedSearchModel: {},
      params: {
        linkmanName: '',
        createUserName: '',
        tagName: '',
        customerManagerName: '',
        keyword: '',
        viewId: '',
        serialNumber: '',
        linkmanId: '',
        customerAddress: {
          // adProvince: '',
          // adCity: '',
          // adDist: '',
          adAddress: '',
        },
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
      // allSelection: [],
      // data from remote
      customers: [],
      columns: [],
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
  mounted() {
    this.fetchConfig();
    const localStorageData = this.getLocalStorageData();
    if (localStorageData.pageSize) {
      this.params.pageSize = Number(localStorageData.pageSize);
      this.paginationInfo.pageSize = Number(localStorageData.pageSize);
    }

    this.search();
  },
  methods: {
    search() {
      let instance = this.$loading.show(this.$refs.customerListPage);
      const params = this.buildParams();

      this.$http.post('/v2/customer/list', params)
        .then(res => {
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
          instance.hide();
        })
        .catch(err => {
          instance.hide();
          console.log('err', err);
        })
    },
    fetchConfig() {
      this.$http.get('/v2/customer/getConfig')
        .then(result => {
          const customerConfig = result;
          customerConfig.fieldInfo = result.fieldInfo
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
              }
              return f;
            });
          this.customerConfig = customerConfig;
          this.columns = this.buildTableColumn();
        });
    },
    // process raw data
    buildParams() {
      let tv = null; // tv means temporary variable that used inside the loop.
      let params = _.cloneDeep(this.params);
      params.conditions = [];
      console.log('enter buildParams this.params', this.params);

      if (this.address.length) {
        params.customerAddress = {
          adProvince: this.address[0],
          adCity: this.address[1] || '',
          adDist: this.address[2] || '',
          adAddress: params.customerAddress.adAddress || '',
        };
      }

      if (params.createTime && params.createTime.length) {
        params.createTimeStart = formatDate(params.createTime[0]);
        params.createTimeEnd = `${formatDate(params.createTime[1])} 23:59:59`;
        delete params.createTime;
      }

      for(let key in params.customerAddress) {
        tv = params.customerAddress[key];
        if (!tv && tv !== 0) {
          delete params.customerAddress[key];
        }
      }

      Object.keys(this.customizedSearchModel)
        .map(key => {
          tv = this.customizedSearchModel[key];
          if (tv.value && tv.formType === 'date') {
            return params.conditions.push({
              property: tv.fieldName,
              operator: tv.operator,
              betweenValue1: formatDate(tv.value[0], 'YYYY-MM-DD'),
              betweenValue2: formatDate(tv.value[1], 'YYYY-MM-DD'),
            });
          }
          if (tv.value && tv.formType === 'datetime') {
            return params.conditions.push({
              property: tv.fieldName,
              operator: tv.operator,
              betweenValue1: formatDate(tv.value[0], 'YYYY-MM-DD HH:mm:ss'),
              betweenValue2: `${formatDate(tv.value[1], 'YYYY-MM-DD')} 23:59:59`,
            });
          }

          if (tv.value) {
            params.conditions.push({
              property: tv.fieldName,
              operator: tv.operator,
              value: tv.value,
            });
          }
        });
      for(let key in params) {
        tv = params[key];
        if ((!tv && tv !== 0) || (typeof tv === 'object' && !Object.keys(tv).length)) {
          delete params[key];
        }
      }

      console.log('buildParams params', params);

      // params.sortBy["customer.createTime"] = true;
      return params;
    },
    processRawData(cl) {
      //  cl means customer list.
      let temp = null;
      let tv = null; // tv means temporary variable that used inside the loop.

      return cl.map(c => { // c means customer.
        temp = c.customerAddress;
        c.customerAddress.str = `${temp.adProvince}-${temp.adCity}-${temp.adDist}`;
        c.tagsStr = c.tags.map(t => t.tagName).join(' ');

        // c.attribute is the object that includes all customized field.
        Object.keys(c.attribute)
          .map(key => {
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
    matchSelected() {
      if (!this.multipleSelection.length) return;
      const selected = this.customers
        .filter(c => this.multipleSelection.some(sc => sc.id === c.id)) || [];
      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
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

    handleCitySelectorChange(city) {
      this.address = city;
      console.log('this.address', this.address);
    },

    // search method end
    // list method start
    sortChange(column, prop, order) {
      console.log('column, prop, order', column, prop, order);

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
    selectRow(selection, row) {
      console.log('selectRow selection',selection);
      console.log('selectRow row',row);

      if (selection.length < this.multipleSelection.length) {
        this.multipleSelection = this.multipleSelection
          .filter(sRow => sRow.id !== row.id);
      }
    },
    selectAll(selection) {
      console.log('selectAll selection',selection);
      if (selection.length) return;
      this.multipleSelection = this.multipleSelection
        .filter(sR => this.customers.every(c => c.id !== sR.id));
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          console.log('row.name', row.name);
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
      console.log('category', category);
      if (category === 'sendMessage') {
        console.log('this.$ref.messageDialog', this.$refs.messageDialog);
        this.$refs.messageDialog.openSendMessageDialog();
      }
      if (category === 'edit') {
        this.$refs.batchEditingCustomerDialog.openBatchEditingCustomerDialog();
      }
      if (category === 'remind') {
        this.$refs.batchRemindingCustomerDialog.openBatchRemindingCustomerDialog();
      }
    },
    deleteCustomer() {
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的客户');
      }

      this.$platform.confirm('确定要删除选择的客户？')
        .then(result => {
          if (!result) return;
          console.log('确定要删除选择的客户!!!!', result)

        })
    },
    sendMessage() {
      console.log('sendMessage');
    },
    batchEditCustomer() {
      // console.log('batchEditCustomer');
    },
    remindMultipleCustomer() {
      // console.log('remindMultipleCustomer');
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
      let baseColumns = [{
        label: '客户',
        field: 'name',
        show: true,
        // width: '100px',
      }, {
        label: '客户编号',
        field: 'serialNumber',
        show: true,
        // width: '100px',
      }, {
        label: '联系人',
        field: 'lmName',
        show: true,
        // width: '100px',
      }, {
        label: '电话',
        field: 'lmPhone',
        show: true,
        // width: '120px',
      }, {
        label: '区域',
        field: 'customerAddress',
        show: true,
        // width: '150px',
      }, {
        label: '详细地址',
        field: 'detailAddress',
        show: true,
        // width: '100px',
      }, {
        label: '服务团队',
        field: 'tags',
        show: true,
        // width: '100px',
      }, {
        label: '客户负责人',
        field: 'customerManagerName',
        show: true,
      }, {
        label: '启用/禁用',
        field: 'status',
        show: true,
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        sortable: 'custom',
        width: '100px',
      }
        , {
          label: '创建人',
          field: 'createUser',
          show: true,
        }, {
          label: '提醒数量',
          field: 'remindCount',
          show: true,
        }]
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
        customerAddress: {
          // adProvince: '',
          // adCity: '',
          // adDist: '',
          adAddress: '',
        },
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        pageNum: 1,
        pageSize: 10,

      };
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
    },
    searchCreator(keyword) {
      this.inputRemoteSearch.creator.loading = true;
      this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.creator.options = res.list;
          this.inputRemoteSearch.creator.loading = false;
        })
    },
    searchLinkman(keyword) {
      this.inputRemoteSearch.linkman.loading = true;
      this.$http.get('/linkman/getListAsyn', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.linkman.options = res.list;
          this.inputRemoteSearch.linkman.loading = false;
        })
    },
    searchTag(keyword) {
      this.inputRemoteSearch.tag.loading = true;
      this.$http.get('/task/tag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.inputRemoteSearch.tag.options = res.list;
          this.inputRemoteSearch.tag.loading = false;
        })
    },

  },
  components: {
    [BasePanel.name]: BasePanel,
    [BaseDistPicker.name]: BaseDistPicker,
    [SendMessageDialog.name]: SendMessageDialog,
    [BatchEditingCustomerDialog.name]: BatchEditingCustomerDialog,
    [BatchRemindingCustomerDialog.name]: BatchRemindingCustomerDialog,
  }
}
</script>

<style lang="scss">
  html, body {
    height: 100%;
  }

  .customer-list-container {
    height: 100%;
    overflow: auto;
    background: #f4f7f5;
    padding: 10px;
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
      padding: 12px 24px;

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
        color: #00ac97;
        border-color: #00ac97;
        background: #fff;
      }
    }

    .advanced-search-form-wrap {
      .panel-title {
        font-size: 18px;
        line-height: 60px;
        padding-left: 25px;
        color: rgb(132, 138, 147);
        border-bottom: 1px solid rgb(242, 248, 247);
        font-weight: normal;
      }
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
      margin-top: 10px;
      border-radius: 3px;
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
        .selectedCount {
          color: #00ac97;
          padding: 0 3px;
        }
      }

      .el-pagination__jump {
        margin-left: 0;
      }
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
  }
</style>
