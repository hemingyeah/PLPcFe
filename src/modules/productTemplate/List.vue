<template>
  <!-- start 产品模板列表 -->
  <div class="product-template-list-view" ref="productTemplateListPage" v-loading.fullscreen.lock="loadingListData">
    
    <!-- start 搜索 -->
    <div class="product-template-list-search-group">

      <!-- start  搜索header -->
      <form class="base-search" @submit.prevent="search({ pageNum: 1, }, true);trackEventHandler('search')">
        <div class="product-template-list-base-search-group">
          <el-input v-model="paramsBackup.keyword" placeholder="请输入关键字">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="paramsReset">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="panelSearchAdvancedToggle">高级搜索</span>
      </form>
      <!-- end 搜索 header -->

      <!--  start 高级搜索 -->
      <base-panel :show.sync="panelTheSearchAdvancedShow" :width="panelWidth">
        <h3 slot="title">
          <span>高级搜索</span>
          <el-dropdown class="pull-right" trigger="click" @command="setAdvanceSearchColumn">
            <i class="iconfont icon-xitongguanli product-template-panel-btn" style="float: none;"></i>

            <el-dropdown-menu slot="dropdown" class="product-template-advance-setting">
              <el-dropdown-item command="1">一栏</el-dropdown-item>
              <el-dropdown-item command="2">两栏</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </h3>
        <!-- start 高级搜索 表单 -->
        <el-form class="advanced-search-form" onsubmit="return false;">
          <div class="form-item-container" :class="{'two-columns': columnNum == 2, }">

            <!-- start 创建时间 -->
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
            <!-- end 创建时间 -->

            <!-- start 产品名称 -->
            <el-form-item label-width="100px" label="产品名称">
              <el-input :placeholder="advancedSearchPlaceholder.name" type="text" v-model="params.name"></el-input>
            </el-form-item>
            <!-- end 产品名称 -->

            <!-- start 产品编号 -->
            <el-form-item label-width="100px" label="产品编号">
              <el-input :placeholder="advancedSearchPlaceholder.serialNumber" type="text" v-model="params.serialNumber"></el-input>
            </el-form-item>
            <!-- end 产品编号 -->

            <!-- start 产品类型 -->
            <el-form-item label-width="100px" label="产品类型">
              <el-select
                v-model="params.type"
                @change="modifyUser('type')"
                filterable
                clearable
                reserve-keyword
                :placeholder="advancedSearchPlaceholder.type">

                <el-option
                  v-for="item in inputRemoteSearch.type.options"
                  :key="`${item}_product_template_list_search_type`"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <!-- end 产品类型 -->

            <!-- start 动态搜索框 -->
            <el-form-item label-width="100px" :label="field.displayName" v-for="field in searchCustomizeFields"
                          :key="field.fieldName">
              
              <!-- start 产品名称 -->
              <template v-if="field.fieldName === 'name'">
                <el-input type="text" v-model="params[field.fieldName]" :placeholder="field.placeHolder"></el-input>
              </template>
              <!-- end 产品名称 -->

              <!-- start 产品编号 -->
              <template v-else-if="field.fieldName === 'serialNumber'">
                <el-input type="text" v-model="params[field.fieldName]" :placeholder="field.placeHolder"></el-input>
              </template>
              <!-- end 产品编号 -->

              <!-- start 产品类型 -->
              <template v-else-if="field.fieldName === 'type'">
                <el-select
                  v-model="params[field.fieldName]"
                  @change="modifyUser('type')"
                  filterable
                  clearable
                  reserve-keyword
                  :placeholder="field.placeHolder || '请选择'">

                  <el-option
                    v-for="item in inputRemoteSearch.type.options"
                    :key="`${item}_product_template_list_search_type`"
                    :label="item"
                    :value="item">
                  </el-option>
                </el-select>
              </template>
              <!-- end 产品类型 -->

              <!-- start text || code -->
              <template v-else-if="field.formType === 'text' || field.formType === 'code'">
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder" type="text"></el-input>
              </template>
              <!-- end text || code -->

              <!-- start select || selectMulti  -->
              <template v-else-if="field.formType === 'select' || field.formType === 'selectMulti'">
                <el-select 
                  v-model="params.customizedSearchModel[field.fieldName]['value']"
                  clearable
                  :placeholder="field.placeHolder || '请选择'">
                  <el-option
                    v-for="item in field.setting.dataSource"
                    :key="item"
                    :label="item"
                    :value="item"
                    :disabled="item.disabled">
                  </el-option>
                </el-select>
              </template>
              <!-- end select || selectMulti  -->

              <!-- start number  -->
              <template v-else-if="field.formType === 'number'">
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder" type="number"></el-input>
              </template>
              <!-- end number  -->

              <!-- start date || datetime  -->
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
              <!-- end date || datetime  -->

              <!-- start user -->
              <template v-else-if="field.formType === 'user'">
                <el-select
                  v-model="params.customizedSearchModel[field.fieldName]['value']"
                  @change="modifyUser('user', field.fieldName)"
                  filterable
                  clearable
                  remote
                  reserve-keyword
                  :placeholder="field.placeHolder"
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
              <!-- end user -->

              <!-- start other -->
              <template v-else>
                <el-input v-model="params.customizedSearchModel[field.fieldName]['value']"
                          :placeholder="field.placeHolder"></el-input>
              </template>
              <!-- end other -->

            </el-form-item>
            <!-- end 动态搜索框 -->

          </div>
          <!-- start 高级搜索 footer -->
          <div class="advanced-search-btn-group">
            <base-button type="ghost" @event="paramsReset">重置</base-button>
            <base-button type="primary" @event="search({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
          </div>
          <!-- end 高级搜索 footer -->
          
        </el-form>
        <!-- end 高级搜索表单  -->

      </base-panel>
      <!-- end 高级搜索 -->

    </div>
    <!-- end 搜索 -->

    <!-- start content -->
    <div class="product-template-list-content">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @event="productCreate" v-if="authEdit == 3">新建</base-button>
          <base-button type="ghost" icon="icon-yemianshanchu" v-if="authDelete" @event="productDelete">删除</base-button>
        </div>
        <!-- end operation bar-->

        <!-- start 操作按钮组 -->
        <div class="action-button-group">
          <base-button type="plain" @event="openDialog('edit')" v-if="authEdit === 3">批量编辑</base-button>
          <el-dropdown trigger="click" v-if="authExport">
            <span class="el-dropdown-link el-dropdown-btn" @click="trackEventHandler('moreAction')">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="openDialog('importProduct')">导入产品模板</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportProduct(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportProduct(true)">导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">选择列 <i class="iconfont icon-nav-down"></i></span>
        </div>
        <!-- end 操作按钮组 -->

      </div>
      <!-- end  -->

      <!-- start 表格 -->
      <el-table
        :data="page.list"
        stripe
        @select="selectionHandle"
        @select-all="selectionHandle"
        @sort-change="sortChange"
        :highlight-current-row="false"
        header-row-class-name="product-template-table-header"
        ref="productTemplateTable" class="product-template-table">

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
              <a href="" class="view-detail-btn" @click.stop.prevent="goProductTemplateView(scope.row.id)">{{scope.row[column.field]}}</a>
            </template>
            <template v-else-if="column.formType === 'select' && column.isMulti">
              <span v-if="scope.row[column.field] && scope.row[column.field].length > 0">
                {{ Array.isArray(scope.row[column.field]) ? scope.row[column.field].join(',') : scope.row[column.field] }}
              </span>
            </template>
            <template v-else-if="column.formType === 'user'">
              {{ scope.row[column.field] && (scope.row[column.field].displayName || scope.row[column.field].name) }}
            </template>
            <template v-else-if="column.formType === 'location'">
              {{ scope.row.attribute[column.field] && scope.row.attribute[column.field].address}}
            </template>
            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>
        </el-table-column>
      </el-table>
      <!-- end 表格 -->

      <!-- start 表格底部 -->
      <div class="table-footer">
        <div class="list-info">
          共<span class="level-padding">{{ page.total || 0 }}</span>记录，
          已选中<span class="product-template-selected-count" @click="panelTheMultipleSelectionShow = true">{{ multipleSelection.length }}</span>条
          <span class="product-template-selected-count" @click="selectionToggle()">清空</span>
        </div>
        <el-pagination
          class="product-template-table-pagination"
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
      <!-- end 表格底部 -->

    </div>
    <!-- end content -->

    <!-- start 导入产品 -->
    <base-import
      title="导入产品"
      ref="importProductTemplateModal"
      @success="search"
      action="/excels/productTemplateImport">
      <div slot="tip">
        <div class="base-import-warn">
          请先下载<a href="/product/importTemplate/template">导入模版 </a>，填写完成后再上传导入。
        </div>
      </div>
    </base-import>
    <!-- end 导入客户 -->

    <!-- start 导出 -->
    <base-export
      ref="exportProductTemplatePanel"
      :columns="exportColumns()"
      :build-params="exportParamsBuild"
      :validate="exportCountCheck"
      method="post"
      action="/excels/productTemplate"/>
    <!-- end 导出 -->

    <!-- start 已选择列表 -->
    <base-panel :show.sync="panelTheMultipleSelectionShow" width="420px">
      <h3 slot="title">
        <span>已选中产品模板({{ multipleSelection.length }})</span>
        <i 
          v-if="multipleSelection.length > 0"
          class="iconfont icon-qingkongshanchu product-template-panel-btn" 
          @click="selectionToggle()" 
          title="清空已选中数据" data-placement="right" v-tooltip></i>
      </h3>

      <div class="product-template-selected-panel">
        <div class="product-template-selected-tip" v-if="multipleSelection.length <= 0">
          <img src="../../assets/img/no-data.png">
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="product-template-selected-list">
            <div class="product-template-selected-row product-template-selected-head">
              <span class="product-template-selected-name">名称</span>
              <span class="product-template-selected-sn">编号</span>
            </div>
            <div class="product-template-selected-row" v-for="item in multipleSelection" :key="item.id" >
              <span class="product-template-selected-name">{{ item.name }}</span>
              <span class="product-template-selected-sn">{{ item.serialNumber }}</span>
              <button type="button" class="product-template-selected-delete" @click="selectProductTemplateCancel(item)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>
    <!-- end 已选择列表 -->

    <!-- start  批量编辑 -->
    <batch-edit-product-template-dialog
      ref="batchEditProductTemplateDialog"
      :fields="productFields"
      :init-data="initData"
      @submit-callback="search"
      :selected-ids="selectedIds">

    </batch-edit-product-template-dialog>
    <!-- end 批量编辑 -->
    
    <base-table-advanced-setting ref="advanced" @save="columnStatusModify"/>
  </div>
  <!-- end 产品模板列表 -->
</template>

<script>
import _ from 'lodash';
import Page from '@model/Page';
import platform from '@src/platform'
import { formatDate } from '@src/util/lang';

import { getProductTemplateList, productTemplateDelete } from '@src/api/ProductApi.js'

import DialogBatchEditProductTemplate from './component/DialogBatchEditProductTemplate.vue';

/* 高级搜索面板 列数 */
const PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER = 'product_template_list_advance_search_column_number';
/* 高级搜索 搜索数据 */
const STORE_USER_FOR_SEARCH_PRODUCT_TEMPLATE = 'store_user_for_search_product_template';
// 产品模板列表数据
const PRODUCT_TEMPLATE_LIST_DATA = 'product_template_list_data';
// 产品模板列表选择
const PRODUCT_CHECK = 'productCheck'

export default {
  name: 'product-template-list-view',
  props: {
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      auth: {}, // 权限
      columns: this.buildTableFixedColumns(), // 列
      columnNum: 1, // 高级搜索 列数
      createTimePickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 7));
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 30));
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - (3600 * 1000 * 24 * 90));
            picker.$emit('pick', [start, end]);
          }
        }]
      }, // 日期配置
      inputRemoteSearch: {
        type: {
          options: [],
          loading: false,
        },
        creator: {
          options: [],
          loading: false,
        },
      }, // 远程搜索配置项
      loadingListData: false, // 加载列表数据
      multipleSelection: [], // 已选择列表
      searchCustomizeFields: [], // 搜索自定义字段
      selectedLimit: 200, // 最大选择数量
      page: new Page(), // page 对象
      panelTheSearchAdvancedShow: false, // 高级搜索面板显示
      panelTheMultipleSelectionShow: false, // 已选择列表 面板显示
      paramsBackup: {
        createTime: '', // 创建时间
        customizedSearchModel: {}, // 自定义搜索模型
        name: '', // 产品名称
        serialNumber: '', // 产品编号
        type: '', // 产品类型
        keyword: '',
        pageNum: 1,
        pageSize: 10,
      },
      params: {
        createTime: '', // 创建时间
        customizedSearchModel: {}, // 自定义搜索模型
        name: '', // 产品名称
        serialNumber: '', // 产品编号
        type: '', // 产品类型
      },
      productTemplateConfig: {
        productTemplateConfig: {},
        productFields: []
      }, // 产品配置项
    }
  },
  computed: {
    // 高级搜索 占位符
    advancedSearchPlaceholder() {
      let fields = this.initData.productFields || [];
      return {
        name: fields.filter(f => f.fieldName == 'name')[0].placeHolder || '',
        serialNumber: fields.filter(f => f.fieldName == 'serialNumber')[0].placeHolder || '',
        type: fields.filter(f => f.fieldName == 'name')[0].placeHolder || '',
      }
    },
    // 编辑权限
    authEdit() {
      return this.auth.CUSTOMER_EDIT;
    },
    // 删除权限
    authDelete() {
      return (this.authEdit === 3);
    },
    // 导出权限
    authExport() {
      return this.auth.EXPORT_IN;
    },
    /* 已选择 id列表 */
    selectedIds() {
      return this.multipleSelection.map(item => item.id) || [];
    },

    // 高级搜索面板宽度
    panelWidth() {
      return `${420 * this.columnNum}px`;
    },
    productFields() {
      return (this.initData.productFields || [])
        .filter(f => f.formType !== 'separator')
        .map(f => {

          // 调整字段顺序
          if (f.fieldName === 'name') {
            f.orderId = -10;
          }

          if (f.fieldName === 'serialNumber') {
            f.orderId = -9;
          }

          if (f.fieldName === 'type') {
            f.orderId = -8;
          }

          f.operator = this.matchOperator(f);

          return f;
        })
        .sort((a, b) => a.orderId - b.orderId)
    },
  },
  mounted() {
    this.auth = (this.initData && this.initData.authorities) || {};


    this.productTemplateConfig = {
      productConfig: (this.initData && this.initData.productConfig) || {productType: []},
      productFields: (this.initData.productFields || []).sort((a, b) => a.orderId - b.orderId)
    };
    this.inputRemoteSearch.type.options = [...this.productTemplateConfig.productConfig.productType];

    this.paramsSearchRevert();
    this.buildConfig(this.paramsBackup.customizedSearchModel);
    this.search();

    // [tab_spec]标准化刷新方式
    window.__exports__refresh = this.search;
  },
  methods: {
    showAdvancedSetting(){
      window.TDAPP.onEvent('pc：产品管理-选择列事件');

      this.$refs.advanced.open(this.columns);
    },
    // 构建配置项
    buildConfig(storage) {
      const storageData = storage || {};
      /**
       * storageData如果存在，那就还原storage中的值
       * date、datetime类型的要注意 new Date一下
       * 人员选择初始化值是一个id，还要初始化它的options
       */
      this.productTemplateConfig.productFields = this.productTemplateConfig.productFields
        .filter(f => f.fieldName !== 'customer')
        .map(f => {

          if (f.isSearch && !f.isSystem) {
            if (
              storageData[f.fieldName] 
              && (storageData[f.fieldName].formType === 'date' || storageData[f.fieldName].formType === 'datetime') 
              && storageData[f.fieldName].operator === 'between'
            ) {
              storageData[f.fieldName].value = storageData[f.fieldName].value && storageData[f.fieldName].value.map(t => new Date(t));
            }

            // 需要搜索的字段
            this.$set(this.params.customizedSearchModel, f.fieldName, {
              fieldName: f.fieldName,
              value: storageData[f.fieldName] ? storageData[f.fieldName].value : null,
              operator: this.matchOperator(f),
              formType: f.formType,
            });
            this.searchCustomizeFields.push(f);
          }

          return f;
        });

      this.columns = this.buildTableColumn();
    },
    // 构建表格固定列
    buildTableFixedColumns() {
      // return []
      return [{
        label: '产品名称',
        field: 'name',
        show: true,
        fixed: true,
        minWidth: '150px',
      }, {
        label: '产品编号',
        field: 'serialNumber',
        fixed: true,
        show: true,
      }, {
        label: '产品类型',
        sortable: 'custom',
        field: 'type',
        show: true,
      }]
    },
    buildDefaultColumns(){
      return [
        'name',
        'customer',
        'serialNumber',
        'type'
      ]
    },
    // 构建表格列
    buildTableColumn() {
      const localStorageData = this.localStorageGet(PRODUCT_TEMPLATE_LIST_DATA);
      let columnStatus = localStorageData.columnStatus || [];
      let localColumns = columnStatus
        .map(i => typeof i == 'string' ? {field: i, show: true} : i)
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});

      let baseColumns = this.buildTableFixedColumns();
      let customizedColumns = this.productTemplateConfig.productFields
        .filter(f => !f.isSystem && f.formType !== 'attachment' && f.formType !== 'separator' && f.fieldName !== 'customer')
        .map(field => {
          let sortable = false;
          let minWidth = null;

          if (['date', 'datetime', 'number'].indexOf(field.formType) >= 0 || field.fieldName == 'type') {
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
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            minWidth: typeof minWidth == 'number' ? minWidth : `${minWidth}px`,
            sortable,
            isMulti: field.setting && field.setting.isMulti,
            isSystem: field.isSystem,
          };
        });

      let columns = [...baseColumns, ...customizedColumns].map(col => {
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

      return columns;
    },
    // 兼容旧版本的 已选择列
    backwardCompatibleColumn() {
      let checkedColumnsOldVersion = localStorage.getItem(PRODUCT_CHECK);

      if (!checkedColumnsOldVersion) return;

      let columns = checkedColumnsOldVersion.split(',');
      localStorage.removeItem(PRODUCT_CHECK);

      return (columns || []).filter(c => c)
        .map(c => {
          return c;
        })
    },  
    // 修改列状态
    columnStatusModify(event) {
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
      this.localStorageSet('columnStatus', columnsStatus, PRODUCT_TEMPLATE_LIST_DATA);
    },
    // 连接数组和 key去重
    concatArrayAndItemUnique(arr1, arr2, key) {
      // 数组中的对象根据id去重
      let obj = {};
      if (!arr1 || !arr1.length) return arr2 || [];
      if (!arr2 || !arr2.length) return arr1 || [];
      return [...arr1, ...arr2].reduce((cur, next) => {
        obj[next[key]] ? '' : obj[next[key]] = true && cur.push(next);
        return cur;
      }, []);
    },
    /** 把对象中!!为false的值去除（eg. false, undefined, null...），except 可以把想保留的值留下(eg.[0])
    * 主要用于向后端传参，把无用的空值过滤掉
    * var a = { a: 0, b: 1, c: null, d: undefined, e: false}
    * deleteValueFromObject(a) =>  {b: 1}
    * deleteValueFromObject(a, [0]) =>  {a: 0, b: 1}
    */
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
      } 
      return undefined;
    },
    // 构建产品导出参数
    exportParamsBuild(checkedArr, ids) {
      let exportAll = !ids || ids.length == 0;
      return {
        productChecked: checkedArr.join(','),
        data: exportAll ? '' : ids.join(','),
        exportSearchModel: exportAll ? JSON.stringify(this.paramsBuild() || {}) : ''
      };
    },
    // 导出 列
    exportColumns() {
      return this.columns.map(c => {
        if (c.field !== 'customerAddress' && c.field !== 'remindCount' && c.field !== 'updateTime') {
          c.export = true;
        }

        return c;
      });
    },
    /** 
    * 导出产品
    * @param {Boolean} exportAll -- 是否导出全部
    */
    exportProduct(exportAll = false) {
      let ids = [];
      let fileName = `${formatDate(new Date(), 'YYYY-MM-DD')}产品模板数据.xlsx`;

      if (!exportAll) {
        if (!this.multipleSelection.length) return this.$platform.alert('请选择要导出的数据');
        ids = this.selectedIds;
      }
      this.$refs.exportProductTemplatePanel.open(ids, fileName);
    },
    // 检测导出条数
    exportCountCheck(ids, max){
      let exportAll = !ids || ids.length == 0;

      return exportAll && this.page.total > max ? `为了保障响应速度，暂不支持超过${max}条以上的数据导出，请您分段导出。` : null;
    },
    // 跳转 产品模板信息
    goProductTemplateView(id) {
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `product_template_view_${id}`,
        title: '产品模板信息',
        close: true,
        url: `/product/detail/${id}?noHistory=1`,
        fromId
      })
    },
    // 页码数切换
    handleSizeChange(pageSize) {
      this.page.pageSize = pageSize;
      this.page.pageNum = 1;
      this.paramsBackup.pageNum = 1;
      this.paramsBackup.pageSize = pageSize;
      this.page.list = [];

      this.localStorageSet('pageSize', pageSize, PRODUCT_TEMPLATE_LIST_DATA);
      this.search();
    },
    // 跳转
    jump(pageNum) {
      this.page.pageNum = pageNum;
      this.paramsBackup.pageNum = pageNum;

      this.search();
    },
    /* 获取本地数据 */
    localStorageGet(key) {
      try {
        const dataStr = localStorage.getItem(key) || '{}'
        return JSON.parse(dataStr); 
      } catch (error) {
        console.log('error: ', error);
        return {}
      }
    },
    /* 设置本地数据 */
    localStorageSet(key, value, rootKey = null) {
      try {
        if(!rootKey) {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          const data = this.localStorageGet(rootKey);
  
          data[key] = value;
          localStorage.setItem(rootKey, JSON.stringify(data));
        }
      } catch(err) {
        console.log('localStorageSet err', err)
      } 
    },
    // 批量操作
    matchOperator(field) {
      let formType = field.formType;
      let operator = '';

      switch (formType) {
      case 'date': {
        operator = 'between';
        break;
      }
      case 'datetime': {
        operator = 'between';
        break;
      }
      case 'select': {
        if(field.setting && field.setting.isMulti) {
          operator = 'contain';
        } else {
          operator = 'eq';
        }
        break;
      }
      case 'user': {
        operator = 'user';
        break;
      }
      case 'location': {
        operator = 'location';
        break;
      }
      default: {
        operator = 'like';
        break;
      }
      }
      return operator;
    },
    /**
     *  -- 人员类型的字段
     *  绑定在form中的value是一个id，在初始化的时候却要给一个对象
     *  所以选择某个人的时候，储存这个对象
     *  在还原搜索状态的时候，取这个对象初始化这个form，
    */
    modifyUser(type, fieldName) {
      const store = {};
      if (type === 'type') {
        store.type = this.inputRemoteSearch.type.options.filter(t => t === this.params.type);
      }
      // 自定义字段
      if (type === 'user') {
        const selected = this.inputRemoteSearch.creator.options.filter(ct => ct.userId === this.params.customizedSearchModel[fieldName].value);

        let storageData = localStorage.getItem(STORE_USER_FOR_SEARCH_PRODUCT_TEMPLATE) || '{}';
        storageData = JSON.parse(storageData);
        if (storageData.creator) {
          store.creator = this.concatArrayAndItemUnique(storageData.creator, selected, 'userId');
        } else {
          store.creator = selected;
        }
      }

      localStorage.setItem(STORE_USER_FOR_SEARCH_PRODUCT_TEMPLATE, JSON.stringify(store));
    },
    // 批量匹配选中
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
        this.selectionToggle(selected);
      });
    },
    /** 
     * 打开弹窗
     * @param {String} type -- 弹窗类型
     */
    openDialog(type) {
      // 导出产品
      if (type === 'importProduct') {
        this.$refs.importProductTemplateModal.open();
      }
      // 编辑
      if (type === 'edit') {
        window.TDAPP.onEvent('pc：产品模板-批量编辑事件');
        this.$refs.batchEditProductTemplateDialog.open();
      }
    },
    // 搜索
    search(templateParams, fullSearch = false) {
      let params = {};
      this.loadingListData = true;

      // 全量搜索
      if (fullSearch) {
        this.paramsBackup = {
          ...this.paramsBackup,
          ..._.cloneDeep(this.params),
        };
      }

      params = {
        ...this.paramsBuild(),
        ...templateParams,
      };

      return getProductTemplateList(params)
        .then(res => {
          if (!res || !res.list) {
            this.page = new Page();
          } else {
            this.page.merge(res)

            this.page.list = res.list
              .map(l => {
                let attribute = l.attribute ? l.attribute : {};

                let list = {
                  ...l,
                  ...attribute,
                }
                return list;
              });
              
            // 把已选中的匹配出来
            this.matchSelected();
          }

          return res;
        })
        .then(() => {
          this.$refs.productTemplateListPage.scrollTop = 0;
          this.loadingListData = false;
        })
        .catch(err => {
          this.loadingListData = false;
          console.error('err', err);
        })
    },
    searchCreator(keyword) {
      this.inputRemoteSearch.creator.loading = true;
      return this.$http.get('/customer/userTag/list', { keyword, pageNum: 1 })
        .then(res => {
          if (res && res.list) {
            this.inputRemoteSearch.creator.options = res.list;
            this.inputRemoteSearch.creator.loading = false;
          }
          return res;
        })
        .catch(err => console.error('searchCreator function catch err', err));
    },
    // 设置高级搜索面板 列
    setAdvanceSearchColumn(command){
      this.columnNum = Number(command);
      try {
        localStorage.setItem(PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER, this.columnNum); 
      } catch (error) {
        console.log(error)
      }
    },
    // 取消选择的产品
    selectProductTemplateCancel(productItem) {
      if (!productItem || !productItem.id) return;

      this.multipleSelection = this.multipleSelection.filter(ms => ms.id !== productItem.id);
      this.multipleSelection.length < 1 ? this.selectionToggle() : this.selectionToggle([productItem]);
    },
    // 切换已选择
    selectionToggle(rows) {
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
          this.$refs.productTemplateTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.productTemplateTable.clearSelection();
        this.multipleSelection = [];
      }
    },
    // 操作选择
    selectionHandle(selection) {
      let tv = this.selectionCompute(selection);

      let original = this.multipleSelection
        .filter(ms => this.page.list.some(cs => cs.id === ms.id));

      let unSelected = this.page.list
        .filter(c => original.every(oc => oc.id !== c.id));

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
          ? unSelected.forEach(row => {
              this.$refs.productTemplateTable.toggleRowSelection(row, false);
            })
          : this.$refs.productTemplateTable.clearSelection();
        })
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }

      this.multipleSelection = tv;
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
          isSystem: prop === 'createTime' || prop === 'updateTime' || prop === 'type' ? 1 : 0,
          sequence: order === 'ascending' ? 'ASC' : 'DESC',
          column: prop === 'createTime' || prop === 'updateTime' || prop === 'type' ? `productTemplate.${prop}` : prop,
        };

        const sortedField = this.productTemplateConfig.productFields.filter(sf => sf.fieldName === prop)[0] || {};

        if (prop === 'createTime' || prop === 'updateTime' || sortedField.formType === 'date' || sortedField.formType === 'datetime') {
          sortModel.type = 'date';
        } else {
          sortModel.type = sortedField.formType;
        }

        this.paramsBackup.orderDetail = sortModel;

        this.search();

      } catch (e) {
        console.error('product template sortChange err', e);
      }
    },
    // 参数构建
    paramsBuild() {
      const conditions = [];
      let tv = null; // tv means temporary variable that used inside the loop.
      let params = _.cloneDeep(this.paramsBackup);

      // createTime
      if (params.createTime && params.createTime.length) {
        params.createTimeStart = formatDate(params.createTime[0]);
        params.createTimeEnd = `${formatDate(params.createTime[1]).replace('00:00:00', '23:59:59')}`;
        delete params.createTime;
      }

      params = this.deleteValueFromObject(params, [0, false]);

      if(!params) params = {};
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
    // 搜索参数恢复
    paramsSearchRevert() {
      const localStorageData = this.localStorageGet(PRODUCT_TEMPLATE_LIST_DATA);

      if (localStorageData && localStorageData.pageSize) {
        this.paramsBackup.pageSize = Number(localStorageData.pageSize);
        this.page.pageSize = Number(localStorageData.pageSize);
      }

      if (Array.isArray(this.paramsBackup.createTime) && this.paramsBackup.createTime.length) {
        this.paramsBackup.createTime = this.paramsBackup.createTime.map(ct => new Date(ct));
      }


      let storeUser = this.localStorageGet(STORE_USER_FOR_SEARCH_PRODUCT_TEMPLATE);

      if (storeUser.creator) {
        this.inputRemoteSearch.creator.options = storeUser.creator || [];
      }

      this.params = _.cloneDeep(this.paramsBackup);
      delete this.params.keyword;

      const num = localStorage.getItem(PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER) || 1;
      this.columnNum = Number(num);
    },
    // 参数重置
    paramsReset() {
      window.TDAPP.onEvent('pc：产品模板-重置事件')
      this.paramsBackup = {
        createTime: '', // 创建时间
        customizedSearchModel: {}, // 自定义搜索模型
        name: '', // 产品名称
        serialNumber: '', // 产品编号
        type: '', // 产品类型
        keyword: '',
        pageNum: 1,
        pageSize: this.paramsBackup.pageSize,
      };

      this.params = {
        createTime: '', // 创建时间
        name: '', // 产品名称
        serialNumber: '', // 产品编号
        type: '', // 产品类型
        customizedSearchModel: {
          ...this.params.customizedSearchModel,
        },
      };

      for (let key in this.params.customizedSearchModel) {
        this.params.customizedSearchModel[key].value = null;
      }

      this.inputRemoteSearch.creator.options = [];

      this.search();
    },
    // 产品新建
    productCreate() {
      window.TDAPP.onEvent('pc：产品模板-新建事件');

      // window.location = '/product/create';
      let fromId = window.frameElement.getAttribute('id');
      
      this.$platform.openTab({
        id: 'product_create',
        title: '新建产品模板',
        url: '/product/create',
        reload: true,
        close: true,
        fromId
      });
    },
    // 产品 删除
    async productDelete() {
      window.TDAPP.onEvent('pc：产品模板-删除事件');

      if(this.multipleSelection.length <= 0) return platform.alert('请您至少选择一个需要删除的产品！');
      
      const confirm = await platform.confirm('您确定要删除所选产品吗？');
      if(!confirm) return

      try {
        this.loadingListData = true;
        let result = await productTemplateDelete(this.selectedIds.join(','));
        const isSucc = (result.status == 0);

        this.$platform.notification({
          title: `删除产品模板${ isSucc ? '成功' : '失败' }`,
          message: !isSucc && result.message,
          type: isSucc ? 'success' : 'error',
        });

        if(isSucc) {
          this.selectionToggle();
          this.search();
        } else {
          this.loadingListData = false;
        }

      } catch(err) {
        console.log(`productDelete err ${err}`)
      }
    },
    panelSearchAdvancedToggle() {
      window.TDAPP.onEvent('pc：产品模板-高级搜索事件');

      this.panelTheSearchAdvancedShow = !this.panelTheSearchAdvancedShow;
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
        window.TDAPP.onEvent('pc：产品模板-搜索事件');
        return;
      }
      if (type === 'moreAction') {
        window.TDAPP.onEvent('pc：产品管理-更多操作事件');
        return;
      }
    }
  },
  components: {
    [DialogBatchEditProductTemplate.name]: DialogBatchEditProductTemplate 
  }
}
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

html, body {
  height: 100%;
}

.product-template-list-view {
  height: 100%;
  overflow: auto;
  padding: 10px;

  .panel-title {
    border-bottom: 1px solid rgb(242, 248, 247);
    color: rgb(132, 138, 147);

    font-size: 16px;
    font-weight: normal;
    line-height: 60px;

    display: flex;
    justify-content: space-between;

    padding: 0 25px;

    .iconfont:hover {
      cursor: pointer;
    }

  }
}

// search
.product-template-list-search-group {

  .advanced-search-function, .base-search {
    background: #fff;
    border-radius: 3px;
  }

  .base-search {
    font-size: 14px;

    display: flex;
    justify-content: space-between;

    padding: 12px 10px;

    .product-template-list-base-search-group {
      display: flex;
      justify-content: space-between;

      width: 440px;

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
      background: #fff;
      border-color: $color-primary;
      color: $color-primary;

      font-size: 14px;
      font-weight: lighter;
      line-height: 32px;
      
      padding: 0 13px;

      &:hover {
        cursor: pointer;
      }

    }
  }
}

.advanced-search-form {
  height: calc(100% - 51px);
  overflow: auto;
  padding: 10px 0 63px 0;

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
      width: 290px !important;
    }
  }

  .advanced-search-btn-group {
    background: #fff;

    display: flex;
    justify-content: flex-end;

    width: 100%;
    padding: 15px 20px;

    position: absolute;
    bottom: 0px;

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

// list 
.product-template-list-content {
  padding-top: 10px;

  .product-template-table {
    padding: 10px;

    &:before {
      height: 0;
    }

    .product-template-table-header th {
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
    background: #fff;
    border-radius: 0 0 3px 3px;

    display: flex;
    justify-content: space-between;

    padding: 0px 10px 10px 10px ;

    .list-info {
      color: #767e89;

      font-size: 13px;
      line-height: 32px;

      margin: 0;

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

.product-template-panel-btn{
  float: right;
  cursor: pointer;
  font-size: 14px;
  margin-right: 5px;

  &:hover{
    color: $color-primary;
  }
}

// product-template selected panel 
.product-template-selected-count{
  cursor: pointer;
  color: $color-primary;

  font-size: 13px;

  padding: 0 3px;
  width: 15px;

  text-align: center;
}

.product-template-selected-panel{
  font-size: 14px;
  height: calc(100% - 51px);
}

.product-template-selected-tip{
  padding-top: 80px;

  img{
    display: block;
    width: 240px;
    margin: 0 auto;
  }

  p{
    color: #9a9a9a;

    line-height: 20px;
    text-align: center;

    margin: 30px 0 0 0;
  }
}

.product-template-selected-list{
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}

.product-template-selected-row{
  border-bottom: 1px solid #ebeef5;

  display: flex;
  flex-flow: row nowrap;

  font-size: 13px;
  line-height: 36px;


  &:hover{
    background-color: #f5f7fa;

    .product-template-selected-delete{
      visibility: visible;
    }
  }
}

.product-template-selected-head{
  background-color: #F0F5F5;
  color: #333;
  font-size: 14px;
}

.product-template-selected-sn{
  padding-left: 10px;
  flex: 1;
  @include text-ellipsis;
}

.product-template-selected-name{
  padding-left: 10px;
  width: 150px;
  @include text-ellipsis;
}

.product-template-selected-delete{
  width: 36px;
}

.product-template-selected-row button.product-template-selected-delete{
  background-color: transparent;
  color: #646B78;

  border: none;
  
  padding: 0;
  width: 36px;
  height: 36px;

  outline: none;
  visibility: hidden;

  i{
    font-size: 14px;
  }

  &:hover{
    color: #e84040;
  }
}

// operation
.product-template-columns-dropdown-menu {
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
  border-bottom: 1px solid #f2f2f2;
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
    background: $color-primary-light-9;
    color: $text-color-primary;

    display: inline-block;
    margin-left: 5px;
    padding: 0 15px;

    line-height: 32px;
    outline: none;
    .iconfont {
      margin-left: 5px;
      font-size: 12px;
    }

    &:hover {
      background: $color-primary;
      cursor: pointer;
      color: #fff;
    }
  }
}
</style>