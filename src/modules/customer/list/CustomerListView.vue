<template>
  <div class="customer-list-container" ref="customerListPage">
    <!--搜索-->
    <div class="customer-list-search-group-container">
      <div class="base-search">
        <div>
          <el-input v-model="params.keyword" placeholder="根据客户信息搜索"></el-input>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button type="primary" class="reset-btn" @click="resetParams">重置</el-button>
        </div>
        <el-button type="primary"  @click="advancedSearchPanelShow = !advancedSearchPanelShow" class="advanced-search-visible-btn">高级搜索</el-button>
      </div>

      <base-panel :show.sync="advancedSearchPanelShow" width="420px" class="advanced-search-form-wrap">
        <h4 class="panel-title">高级搜索</h4>
        <el-form ref="form" :model="form" label-width="100px" class="advanced-search-form">
          <el-form-item label="客户编号">
            <el-input type="text" v-model="form.serialNumber"></el-input>
          </el-form-item>
          <el-form-item label="联系人">
            <el-select
              v-model="form.linkmanId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :loading="searchLinkmanLoading"
              :remote-method="searchLinkman">
              <el-option
                v-for="item in linkmanOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择团队">
            <el-select
              v-model="form.tagId"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :loading="searchTagLoading"
              :remote-method="searchTag">
              <el-option
                v-for="item in tagOptions"
                :key="item.id"
                :label="item.tagName"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="区域">
            <base-dist-picker field="address" v-on:city-selector-change="handleCitySelectorChange"></base-dist-picker>
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input type="text" v-model="form.adAddress"></el-input>
          </el-form-item>
          <el-form-item label="有无提醒">
            <el-select v-model="form.hasRemind" placeholder="请选择">
              <el-option :value="null" label="全部"></el-option>
              <el-option :value="1" label="有"></el-option>
              <el-option :value="0" label="无"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status" placeholder="请选择">
              <el-option :value="null" label="全部"></el-option>
              <el-option :value="1" label="启用"></el-option>
              <el-option :value="0" label="禁用"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建人">
            <el-select
              v-model="form.createUser"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :loading="searchCreatorLoading"
              :remote-method="searchCreator">
              <el-option
                v-for="item in creatorOptions"
                :key="item.userId"
                :label="item.displayName"
                :value="item.userId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="客户负责人">
            <el-select
              v-model="form.customerManager"
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :loading="searchCustomerManagerLoading"
              :remote-method="searchCustomerManager">
              <el-option
                v-for="item in customerManagerOptions"
                :key="item.userId"
                :label="item.displayName"
                :value="item.userId">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="form.createTime"
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
          <el-form-item :label="field.displayName" v-for="field in searchFields" :key="field.fieldName">
            <template v-if="field.formType === 'text' || field.formType === 'code'">
              <el-input v-model="form[field.fieldName]" :placeholder="field.placeHolder" type="text"></el-input>
            </template>
            <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
              <el-select v-model="form[field.fieldName]" :placeholder="field.placeHolder">
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
              <el-input v-model="form[field.fieldName]" :placeholder="field.placeHolder" type="number"></el-input>
            </template>
            <template v-else-if="field.formType === 'date' || field.formType === 'datetime'">
              <el-date-picker
                v-model="form[field.fieldName]"
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
                v-model="form[field.fieldName]"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :loading="searchCreatorLoading"
                :remote-method="searchCreator">
                <el-option
                  v-for="item in creatorOptions"
                  :key="item.userId"
                  :label="item.displayName"
                  :value="item.userId">
                </el-option>
              </el-select>

            </template>
            <template v-else>
              <el-input v-model="form[field.fieldName]" :placeholder="field.placeHolder"></el-input>
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
                <el-checkbox v-model="item.show" :label="item.label">{{item.label}}</el-checkbox>
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
        <el-table-column type="selection" width="35" reserve-selection></el-table-column>
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
  import BaseDistPicker from '../../../component/common/BaseDistPicker';
  import BasePanel from '../../../component/common/BasePanel';
  import SendMessageDialog from './operationDialog/SendMessageDialog.vue';
  import BatchEditingCustomerDialog from './operationDialog/BatchEditingCustomerDialog.vue';
  import BatchRemindingCustomerDialog from './operationDialog/BatchRemindingCustomerDialog.vue';


  export default {
  name: 'customer-list-view',
  data() {
    return {
      // search data
      linkmanOptions: [],
      tagOptions: [],
      creatorOptions: [],
      customerManagerOptions: [],
      searchLinkmanLoading: false,
      searchTagLoading: false,
      searchCreatorLoading: false,
      searchCustomerManagerLoading: false,
      advancedSearchPanelShow: false,
      form: {
        serialNumber: null,
        linkmanId: null,
        tagId: null,
        address: [],
        customerAddress: {
          adProvince: '',
          adCity: '',
          adDist: '',
          adAddress: '',
        },
        hasRemind: null,
        status: null,
        createUser: null,
        createTime: null,
      },
      params: {
        linkmanName: '',
        createUserName: '',
        tagName: '',
        customerManagerName: '',
        keyword: '',
        isAdvanced: 0,
        viewId: '',
        serialNumber: '',
        linkmanId: '',
        customerAddress: {
          adProvince: '',
          adCity: '',
          adDist: '',
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
      searchFields: [],
      // search end
      // list start
      customers: [],
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
        totalPages: 0,
      },
      multipleSelection: [],
      allSelection: [],
      columns: [],
      // list end
      // operation start
      pending: false,
      // operation end
      // view
      customerConfig: {},
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
    fetchConfig() {
      const localStorageData = this.getLocalStorageData();

      this.$http.get('/v2/customer/getConfig')
        .then(result => {
          const customerConfig = result;
          customerConfig.fieldInfo = result.fieldInfo
            .map(f => {
              if (['date', 'datetime', 'number'].indexOf(f.formType) >= 0) {
                f.sortable = 'custom';
              }

              if (f.isSearch) {
                // 需要搜索的字段
                this.$set(this.form, f.fieldName, null);
                this.searchFields.push(f);
              }

              return f;
            });
          this.customerConfig = customerConfig;
          this.columns = this.buildTableColumn();
        });
    },
    handleChange(value) {
      console.log('handleChange value', value);

    },
    search() {
      let instance = this.$loading.show(this.$refs.customerListPage);
      const params = this.buildParams();

      console.log('search');
      this.fetchCustomerData(params)
        .then(() => {
          this.$refs.customerListPage.scrollTop = 0;
          instance.hide();
        })
        .catch(err => {
          instance.hide();
          console.log('err', err);
        })
    },
    buildParams() {
      let params = _.cloneDeep(this.params);
      for(let key in params.customerAddress) {
        if (!params.customerAddress[key]) {
          delete params.customerAddress[key];
        }
      }
      for(let key in params) {
        if (!params[key] || (typeof params[key] === 'object' && !Object.keys(params[key]).length)) {
          delete params[key];
        }

      }
      return params;
    },
    resetParams() {
      this.params = {
        linkmanName: '',
        createUserName: '',
        tagName: '',
        customerManagerName: '',
        keyword: '',
        isAdvanced: 0,
        viewId: '',
        serialNumber: '',
        linkmanId: '',
        customerAddress: {
          adProvince: '',
          adCity: '',
          adDist: '',
          adAddress: '',
        },
        hasRemind: '',
        status: '',
        createUser: '',
        customerManager: '',
        createTime: '',
        pageNum: 1,
        pageSize: 10,

      }
      this.search();
    },
    handleCitySelectorChange(city) {
      this.form[city.field] = city.value;
    },
    // input search method
    searchCustomerManager(keyword) {
      this.searchCustomerManagerLoading = true;
      this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.customerManagerOptions = res.list;
          this.searchCustomerManagerLoading = false;
        })
    },
    searchCreator(keyword) {
      this.searchCreatorLoading = true;
      this.$http.get('/customer/userTag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.creatorOptions = res.list;
          this.searchCreatorLoading = false;
        })
    },
    searchLinkman(keyword) {
      this.searchLinkmanLoading = true;
      this.$http.get('/linkman/getListAsyn', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.linkmanOptions = res.list;
          this.searchLinkmanLoading = false;
        })
    },
    searchTag(keyword) {
      this.searchTagLoading = true;
      this.$http.get('/task/tag/list', { keyword: keyword, pageNum: 1, })
        .then(res => {
          this.tagOptions = res.list;
          this.searchTagLoading = false;
        })
    },

    // search method end
    // list method start
    sortChange(column, prop, order) {
      console.log('column, prop, order', column, prop, order);

    },
    processRawData(cl) {
      //  cl is customer list.
      let temp = null;
      let nameTemp = null;
      let nameKey = null;

      return cl.map(c => {
        temp = c.customerAddress;
        c.customerAddress.str = `${temp.adProvince}-${temp.adCity}-${temp.adDist}`;
        c.tagsStr = c.tags.map(t => t.tagName).join(' ');

        Object.keys(c.attribute)
          .map(key => {
            if (typeof c.attribute[key] === "string") return key;

            if (Array.isArray(c.attribute[key]) && (typeof c.attribute[key][0] === "string")) {
              c.attribute[key] = JSON.stringify(c.attribute[key]);
              c.attribute[key] = c.attribute[key].replace(/"/g, '',);
              return key;
            }

            if (Array.isArray(c.attribute[key]) && (typeof c.attribute[key][0] === "object")) {
              c.attribute[key] = c.attribute[key].map(a => this.getNameFromObject(a)).join(',');
              return key;
            }

            if (typeof c.attribute[key] === "object") {
              c.attribute[key] = this.getNameFromObject(c.attribute[key]);
              return key;
            }
          });
        return c;
      })
    },
    getNameFromObject(obj) {
      if (!obj) return;
      let name = '';
      let objKeys = Object.keys(obj) || [];
      let nameKeys = [];

      nameKeys = objKeys
        .filter(aKey => /name/gi.test(aKey)) || [];

      if (!objKeys.length) return null;

      if (!nameKeys[0]) return obj[objKeys[0]];
      return obj[nameKeys[0]];
    },
    fetchCustomerData(params) {
      return this.$http.get('/v2/customer/list', params)
        .then(res => {
          this.customers = this.processRawData(res.list);

          console.log('this.customers', this.customers);

          const {pages, total, pageNum, } = res;
          this.paginationInfo.totalItems = total;
          this.paginationInfo.totalPages = pages;
          this.paginationInfo.pageNum = pageNum;
          this.matchSelected();

          // 把选中的匹配出来
          return res;
        })
    },
    matchSelected() {
      if (!this.multipleSelection.length) return;
      const selected = this.customers
        .filter(c => this.multipleSelection.some(sc => sc.id === c.id)) || [];
      this.toggleSelection(selected);
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

    // operation method start
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
    // operation method end

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
      let columnStatus = [];
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
        .map(field => ({
          label: field.displayName,
          field: field.fieldName,
          show: field.show,
          formType: field.formType,
          sortable: field.sortable,
          isSystem: 0,
        }));
      columns = [...baseColumns, ...dynamicColumns];

      if (!localStorageData || !localStorageData.columnStatus || !localStorageData.columnStatus.length) {
        return columns;
      }

      columnStatus = localStorageData.columnStatus;
      columns = columns.map(bc => {
        bc.show = columnStatus.some(sc => sc.field === bc.field);
        return bc;
      });

      return columns;
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
