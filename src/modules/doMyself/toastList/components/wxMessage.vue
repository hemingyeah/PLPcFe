<template>
  <!-- start 产品模板列表 -->
  <div class="product-template-list-view" ref="productTemplateListPage">
    <!-- start 搜索 -->
    <div class="product-template-list-search-group">
      <!-- start  搜索header -->
      <form
        class="base-search"
        @submit.prevent="searchModel.pageNum=1;search();trackEventHandler('search')"
      >
        <div class="product-template-list-base-search-group">
          <el-input v-model="searchModel.keyword" placeholder="请输入客户或关联编号">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button type="primary" native-type="submit">搜索</base-button>
          <base-button type="ghost" @event="resetParams">重置</base-button>
        </div>
        <span class="advanced-search-visible-btn" @click.self="panelSearchAdvancedToggle">
          <i class="iconfont icon-add"></i>
          高级搜索
        </span>
      </form>
      <!-- end 搜索 header -->

      <!-- start 高级搜索表单 -->
      <product-template-search-panel
        :config="{
          fields: this.productFields,
        }"
        ref="searchPanel"
      >
        <div class="advanced-search-btn-group" slot="footer">
          <base-button type="ghost" @event="resetParams">重置</base-button>
          <base-button type="primary" @event="powerfulSearch" native-type="submit">搜索</base-button>
        </div>
      </product-template-search-panel>
      <!-- end 高级搜索表单 -->
    </div>
    <!-- end 搜索 -->

    <!-- start content -->
    <div class="product-template-list-content">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group"></div>
        <!-- end operation bar-->

        <!-- start 操作按钮组 -->
        <div class="action-button-group">
          <!-- <el-dropdown trigger="click" v-if="authExport">
            <span class="el-dropdown-link el-dropdown-btn" @click="trackEventHandler('moreAction')">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="exportProduct(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportProduct(true)">导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>-->
          <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">
            选择列
            <i class="iconfont icon-nav-down"></i>
          </span>
        </div>
        <!-- end 操作按钮组 -->
      </div>
      <!-- end  -->

      <!-- <div style="background: #fff;padding: 0 10px">
        <base-selection-bar
          ref="baseSelectionBar"
          v-model="multipleSelection"
          @toggle-selection="selectionToggle"
          @show-panel="() => panelTheMultipleSelectionShow = true"
        />
      </div>-->

      <!-- start 表格 -->
      <el-table
        :data="page.list"
        :row-key="getRowKey"
        stripe
        @sort-change="sortChange"
        @select="selectionHandle"
        @select-all="selectionHandle"
        :highlight-current-row="false"
        header-row-class-name="product-template-table-header"
        ref="productTemplateTable"
        class="product-template-table"
      >
        <!-- <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column> -->
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
          :align="column.align"
        >
          <template slot-scope="scope">
            <template v-if="column.conType === 'btnArray'">
              <a
                v-for="(item, index) in column.btnArr"
                :key="index"
                href
                :class="`view-detail-btn ${index>0?'mar-l-10':''}`"
                :style="`color:${item.color}`"
                @click.stop.prevent="item.click(scope.row)"
              >{{item.name}}</a>
            </template>
            <template v-else-if="column.conType === 'click'">
              <a
                href
                class="view-detail-btn"
                :style="`color:${column.color}`"
                @click.stop.prevent="column.click(scope.row)"
                v-if="hasViewCustomerAuth(scope.row)"
              >{{scope.row[column.field]}}</a>
              <p v-else>{{scope.row[column.field]}}</p>
            </template>
            <!-- <template v-else-if="column.field === 'name'">
              <a
                href
                class="view-detail-btn"
                @click.stop.prevent="goProductTemplateView(scope.row.id)"
              >{{scope.row[column.field]}}</a>
            </template>-->
            <template
              v-else-if="column.formType === 'select'"
            >{{ scope.row[column.field] | displaySelect }}</template>
            <template
              v-else-if="column.formType === 'user'"
            >{{ scope.row[column.field] && (scope.row[column.field].displayName || scope.row[column.field].name) }}</template>
            <template
              v-else-if="column.field === 'feedbackStatus'"
            >{{scope.row.feedbackStatus === 0 ? '未点击':'已点击' }}</template>
            <template
              v-else-if="column.field === 'status'"
            >{{scope.row.status === 0 ? '成功':'失败' }}</template>
            <template
              v-else-if="column.formType === 'addr'"
            >{{ scope.row.attribute[column.field] && scope.row.attribute[column.field].all}}</template>
            <template
              v-else-if="column.field === 'createUser'"
            >{{ scope.row.createUser && scope.row.createUser.displayName }}</template>
            <template v-else-if="column.field === 'sendTime'">{{ scope.row.sendTime}}</template>

            <div
              v-else-if="column.formType === 'textarea'"
              v-html="buildTextarea(scope.row.attribute[column.field])"
              @click="openOutsideLink"
            ></div>

            <template v-else>{{scope.row[column.field]}}</template>
          </template>
        </el-table-column>
      </el-table>
      <!-- end 表格 -->

      <!-- start 表格底部 -->
      <div class="table-footer">
        <div class="list-info">
          共
          <span class="level-padding">{{ page.total || 0 }}</span>记录
          <!-- ，已选中
          <span
            class="product-template-selected-count"
            @click="panelTheMultipleSelectionShow = true"
          >{{ multipleSelection.length }}</span>条
          <span class="product-template-selected-count" @click="selectionToggle()">清空</span>-->
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
          :total="page.total"
        ></el-pagination>
      </div>
      <!-- end 表格底部 -->

      <!-- start 导出 -->
      <base-export
        ref="exportProductTemplatePanel"
        :columns="exportColumns()"
        :build-params="exportParamsBuild"
        :validate="exportCountCheck"
        method="post"
        action="/excels/productTemplate"
      />
      <!-- end 导出 -->

      <!-- start 已选择列表 -->
      <base-panel :show.sync="panelTheMultipleSelectionShow" width="420px">
        <h3 slot="title">
          <span>已选中产品模板({{ multipleSelection.length }})</span>
          <i
            v-if="multipleSelection.length > 0"
            class="iconfont icon-qingkongshanchu product-template-panel-btn"
            @click="selectionToggle()"
            title="清空已选中数据"
            data-placement="right"
            v-tooltip
          ></i>
        </h3>

        <div class="product-template-selected-panel">
          <div class="product-template-selected-tip" v-if="multipleSelection.length <= 0">
            <img src="@src/assets/img/no-data.png" />
            <p>暂无选中的数据，请从列表中选择。</p>
          </div>
          <template v-else>
            <div class="product-template-selected-list">
              <div class="product-template-selected-row product-template-selected-head">
                <span class="product-template-selected-name">名称</span>
                <span class="product-template-selected-sn">电话</span>
              </div>
              <div
                class="product-template-selected-row"
                v-for="item in multipleSelection"
                :key="item.id"
              >
                <span class="product-template-selected-name">{{ item.name }}</span>
                <span class="product-template-selected-sn">{{ item.phone }}</span>
                <button
                  type="button"
                  class="product-template-selected-delete"
                  @click="selectProductTemplateCancel(item)"
                >
                  <i class="iconfont icon-fe-close"></i>
                </button>
              </div>
            </div>
          </template>
        </div>
      </base-panel>
      <!-- end 已选择列表 -->
    </div>
    <!-- end content -->

    <base-table-advanced-setting ref="advanced" @save="columnStatusModify" />

    <!-- 编辑联系人弹窗 -->
    <edit-contact-dialog ref="EditContactDialog" :original-value="selectedContact"></edit-contact-dialog>
  </div>
  <!-- end 产品模板列表 -->
</template>

<script>
import _ from 'lodash';
import Page from '@model/Page';
import platform from '@src/platform';
import { formatDate } from '@src/util/lang';

import EditContactDialog from '@src/modules/customer/view/operationDialog/EditContactDialog.vue';

import { getTemplateMessageList } from '@src/api/DoMyself.js';

import SearchPanel from '../components/SearchPanel.vue';
import AuthUtil from '@src/util/auth';

/* 高级搜索面板 列数 */
const PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER = 'customer_contact_search_column_number';
/* 高级搜索 搜索数据 */
const STORE_USER_FOR_SEARCH_PRODUCT_TEMPLATE = 'store_user_for_search_product_template';
// 产品模板列表数据
const PRODUCT_TEMPLATE_LIST_DATA = 'product_template_list_data';
// 产品模板列表选择
const PRODUCT_CHECK = 'productCheck';

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g;

let pending = false; // 记录交互pending
export default {
  name: 'customer-conctact-wx-message',
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
      page: new Page(), // page 对象
      productTemplateConfig: {
        productTemplateConfig: {},
        productFields: []
      }, // 产品配置项
      searchModel: {
        keyword: '',
        pageSize: 10,
        pageNum: 1,
        orderDetail: {},
        moreConditions: {}
      },
      selectedContact: {}, // 编辑联系人弹窗参数,
      // 表单选择系列组件相关参数
      multipleSelection: [],
      panelTheMultipleSelectionShow: false
    };
  },
  computed: {
    productFields() {
      return (
        this.initData.productFields || [
          {
            displayName: '通知类型',
            fieldName: 'remindType',
            formType: 'select',
            placeHolder: '请输入联系人姓名',
            isExport: false,
            setting: {
              isMulti: false,
              dataSource: [
                {
                  text: '全部类型',
                  value: ''
                },
                {
                  text: '事件分配通知',
                  value: '事件分配通知'
                },
                {
                  text: '事件完成通知',
                  value: '事件完成通知'
                },
                {
                  text: '工单响应通知',
                  value: '工单响应通知'
                },
                {
                  text: '工单完成通知',
                  value: '工单完成通知'
                },
                {
                  text: '工单计划时间提醒客户',
                  value: '工单计划时间提醒客户'
                }
              ]
            },
            isSystem: 1,
            orderId: 1
          },
          {
            displayName: '客户',
            fieldName: 'receiveCustomerName',
            formType: 'customer',
            placeHolder: '请输入客户名称',
            isExport: false,
            isNull: 1,
            isSystem: 1,
            orderId: 2
          },
          {
            displayName: '联系人',
            fieldName: 'linkmanName',
            formType: 'text',
            placeHolder: '请输入联系人名称',
            isExport: false,
            isSystem: 1,
            orderId: 3
          },
          {
            displayName: '发送时间',
            fieldName: 'time',
            formType: 'date',
            defaultTime: ['00:00:00', '23:59:59'],
            returnData: result => {
              let obj = {
                startTime: formatDate(result[0], 'YYYY-MM-DD HH:mm:ss'),
                endTime: formatDate(result[1], 'YYYY-MM-DD HH:mm:ss')
              };
              return obj;
            },
            isExport: false,
            isSystem: 1,
            orderId: 4
          },
          {
            displayName: '关联编号',
            fieldName: 'relationNumber',
            formType: 'text',
            placeHolder: '请输入关联编号',
            isExport: false,
            isSystem: 1,
            orderId: 5
          },
          {
            displayName: '状态',
            fieldName: 'status',
            formType: 'select',
            isExport: false,
            setting: {
              isMulti: false,
              dataSource: [
                {
                  text: '全部',
                  value: ''
                },
                {
                  text: '成功',
                  value: '0'
                },
                {
                  text: '失败',
                  value: '1'
                }
              ]
            },
            isSystem: 1,
            orderId: 6
          },
          {
            displayName: '反馈',
            fieldName: 'feedbackStatus',
            formType: 'select',
            isExport: false,
            setting: {
              isMulti: false,
              dataSource: [
                {
                  text: '全部',
                  value: ''
                },
                {
                  text: '已点击',
                  value: '1'
                },
                {
                  text: '未点击',
                  value: '0'
                }
              ]
            },
            isSystem: 1,
            orderId: 7
          }
        ]
      ).sort((a, b) => a.orderId - b.orderId);
    },
    // 导出权限
    authExport() {
      return this.initData.loginUser.authorities.EXPORT_IN;
    },

    /* 已选择 id列表 */
    selectedIds() {
      return this.multipleSelection.map(item => item.id) || [];
    }
  },
  filters: {
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
    formatDate(val) {
      if (!val) return '';
      return formatDate(val, 'YYYY-MM-DD HH:mm:ss');
    }
  },
  mounted() {
    this.auth = (this.initData && this.initData.authorities) || {};

    this.productTemplateConfig = {
      productConfig: (this.initData && this.initData.productConfig) || {
        productType: []
      },
      productFields: (this.initData.productFields || []).sort(
        (a, b) => a.orderId - b.orderId
      )
    };

    // this.paramsSearchRevert();
    this.columns = this.buildTableColumn();
    this.search();

    // [tab_spec]标准化刷新方式
    window.__exports__refresh = this.search;
  },
  methods: {
    showAdvancedSetting() {
      window.TDAPP.onEvent('pc：客户联系人-选择列事件');
      this.$refs.advanced.open(this.columns);
    },
    buildParams() {
      const sm = Object.assign({}, this.searchModel);
      let params = {
        keyword: sm.keyword,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum
      };

      if (Object.keys(sm.orderDetail || {}).length) {
        params.orderDetail = sm.orderDetail;
      }

      if (Object.keys(sm.moreConditions).length > 0) {
        params = {
          ...params,
          ...sm.moreConditions
        };
      }

      if (params.createTime && params.createTime.length) {
        let createTime = params.createTime.split('-');

        params.createTimeStart = `${createTime[0]} 00:00:00`;
        params.createTimeEnd = `${createTime[1]} 23:59:59`;
        delete params.createTime;
      }

      return params;
    },
    // 构建表格固定列
    buildTableFixedColumns() {
      // return []
      return [
        {
          label: '通知类型',
          field: 'remindType',
          show: true,
          fixed: true,
          minWidth: '150px'
        },
        {
          label: '接收客户',
          field: 'receiveCustomerName',
          fixed: true,
          show: true
        },
        {
          label: '联系人',
          field: 'linkmanName',
          fixed: true,
          show: true
        },
        {
          label: '模板名称',
          field: 'model',
          fixed: true,
          show: true
        },
        {
          label: '发送时间',
          field: 'sendTime',
          fixed: true,
          show: true
        },
        {
          label: '关联编号',
          field: 'relationNumber',
          fixed: true,
          show: true
        },
        {
          label: '状态',
          field: 'status',
          fixed: true,
          show: true,
          minWidth: '80px'
        },
        {
          label: '反馈',
          field: 'feedbackStatus',
          fixed: true,
          minWidth: '90px',
          show: true
        }
      ];
    },
    // 构建表格列
    buildTableColumn() {
      let localColumns = []
        .map(i => (typeof i == 'string' ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});
      let baseColumns = this.buildTableFixedColumns();
      let columns = [...baseColumns].map(col => {
        let show = col.show;
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
    // 兼容旧版本的 已选择列
    backwardCompatibleColumn() {
      let checkedColumnsOldVersion = localStorage.getItem(PRODUCT_CHECK);

      if (!checkedColumnsOldVersion) return;

      let columns = checkedColumnsOldVersion.split(',');
      localStorage.removeItem(PRODUCT_CHECK);

      return (columns || [])
        .filter(c => c)
        .map(c => {
          return c;
        });
    },
    // 修改列状态
    columnStatusModify(event) {
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

      const columnsStatus = this.columns.map(c => ({
        field: c.field,
        show: c.show,
        width: c.width
      }));
      this.localStorageSet(
        'columnStatus',
        columnsStatus,
        PRODUCT_TEMPLATE_LIST_DATA
      );
    },

    // 操作选择
    selectionHandle(selection) {
      let tv = this.selectionCompute(selection);

      let original = this.multipleSelection.filter(ms =>
        this.page.list.some(cs => cs.id === ms.id)
      );

      let unSelected = this.page.list.filter(c =>
        original.every(oc => oc.id !== c.id)
      );

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach(row => {
              this.$refs.productTemplateTable.toggleRowSelection(row, false);
            })
            : this.$refs.productTemplateTable.clearSelection();
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }

      this.multipleSelection = tv;
      console.log(this.multipleSelection, 'select');

      this.$refs.baseSelectionBar.openTooltip();
    },

    // 计算已选择
    selectionCompute(selection) {
      let tv = [];

      tv = this.multipleSelection.filter(ms =>
        this.page.list.every(c => c.id !== ms.id)
      );
      tv = _.uniqWith([...tv, ...selection], _.isEqual);

      return tv;
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
        Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'object' && obj[key]) {
            obj[key] = this.deleteValueFromObject(obj[key], except);
          }
          if (!obj[key] && except.every(ex => ex !== obj[key])) {
            delete obj[key];
          }
        });
      } else {
        Object.keys(obj).forEach(key => {
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
    // 跳转 至客户详情
    // goProductTemplateView(id) {
    //   let fromId = window.frameElement.getAttribute("id");

    //   this.$platform.openTab({
    //     id: `product_template_view_${id}`,
    //     title: "产品模板信息",
    //     close: true,
    //     url: `/product/detail/${id}?noHistory=1`,
    //     fromId
    //   });
    // },
    // 页码数切换
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNum = 1;

      this.localStorageSet('pageSize', pageSize, PRODUCT_TEMPLATE_LIST_DATA);
      this.search();
    },
    // 跳转
    jump(pageNum) {
      this.searchModel.pageNum = pageNum;
      this.search();
    },
    /* 获取本地数据 */
    localStorageGet(key) {
      try {
        const dataStr = localStorage.getItem(key) || '{}';
        return JSON.parse(dataStr);
      } catch (error) {
        console.log('error: ', error);
        return {};
      }
    },
    /* 设置本地数据 */
    localStorageSet(key, value, rootKey = null) {
      try {
        if (!rootKey) {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          const data = this.localStorageGet(rootKey);

          data[key] = value;
          localStorage.setItem(rootKey, JSON.stringify(data));
        }
      } catch (err) {
        console.log('localStorageSet err', err);
      }
    },
    // 搜索
    search() {
      const params = this.buildParams();

      this.$emit('pageLoading', true);

      return getTemplateMessageList(params).then(res => {
        if (!res || !res.result.list) {
          this.page = new Page();
        } else {
          this.page = res.result;
        }

        this.$emit('pageLoading', false);
      });
    },
    // 设置高级搜索面板 列
    setAdvanceSearchColumn(command) {
      this.columnNum = Number(command);
      try {
        localStorage.setItem(
          PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER,
          this.columnNum
        );
      } catch (error) {
        console.log(error);
      }
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
          this.searchModel.orderDetail = {};
          return this.search();
        }

        let sortModel = {
          isSystem:
            prop === 'createTime' || prop === 'updateTime' || prop === 'type'
              ? 1
              : 0,
          sequence: order === 'ascending' ? 'ASC' : 'DESC',
          column:
            prop === 'createTime' || prop === 'updateTime' || prop === 'type'
              ? `productTemplate.${prop}`
              : prop
        };

        const sortedField = this.productTemplateConfig.productFields.filter(
          sf => sf.fieldName === prop
        )[0] || {};

        if (
          prop === 'createTime'
          || prop === 'updateTime'
          || sortedField.formType === 'date'
          || sortedField.formType === 'datetime'
        ) {
          sortModel.type = 'date';
        } else {
          sortModel.type = sortedField.formType;
        }

        this.searchModel.orderDetail = sortModel;

        this.search();
      } catch (e) {
        console.error('product template sortChange err', e);
      }
    },
    // 搜索参数恢复
    paramsSearchRevert() {
      const localStorageData = this.localStorageGet(PRODUCT_TEMPLATE_LIST_DATA);

      if (localStorageData && localStorageData.pageSize) {
        this.searchModel.pageSize = Number(localStorageData.pageSize);
      }

      const num = localStorage.getItem(
        PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER
      ) || 1;
      this.columnNum = Number(num);
    },
    panelSearchAdvancedToggle() {
      window.TDAPP.onEvent('pc：产品模板-高级搜索事件');
      this.$refs.searchPanel.open();

      this.$nextTick(() => {
        let forms = document.getElementsByClassName('advanced-search-form');
        for (let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute('novalidate', true);
        }
      });
    },
    /**
     * @description 全量搜索
     */
    powerfulSearch() {
      this.searchModel.pageNum = 1;
      this.searchModel.moreConditions = this.$refs.searchPanel.buildParams();

      this.trackEventHandler('search');
      this.search();
    },
    resetParams() {
      window.TDAPP.onEvent('pc：产品模板-重置事件');
      this.searchIncludeMoreConditions = false;
      this.searchModel = {
        keyword: '',
        pageNum: 1,
        pageSize: this.page.pageSize,
        orderDetail: {},
        moreConditions: {}
      };

      this.$refs.searchPanel.resetParams();
      this.search();
    },
    // TalkingData事件埋点
    trackEventHandler(type) {
      if (type === 'search') {
        window.TDAPP.onEvent('pc：产品模板-搜索事件');
        return;
      }
      if (type === 'moreAction') {
        window.TDAPP.onEvent('pc：产品管理-更多操作事件');
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
      return value
        ? value.replace(link_reg, match => {
          return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`;
        })
        : '';
    },
    getRowKey(row) {
      return row.id;
    },
    openDialog(contact) {
      // 弹窗参考数据
      // TO DO 权限
      this.selectedContact = contact;
      this.$nextTick(this.$refs.EditContactDialog.openDialog);
    },
    /**
     * 是否有操作联系人权限，需要满足以下条件之一：
     *
     * 1. 编辑客户全部权限： 全部客户
     * 2. 编辑客户团队权限： 没有团队的客户都可编辑，有团队的按团队匹配。 包含个人权限
     * 3. 编辑客户个人权限： 自己创建的 或 客户负责人
     */
    hasEditCustomerAuth(customer) {
      let loginUserId = this.initData.loginUser.userId;
      return AuthUtil.hasAuthWithDataLevel(
        this.permission,
        'CUSTOMER_EDIT',
        // 团队权限判断
        () => {
          let tags = Array.isArray(customer.tags) ? customer.tags : [];
          // 无团队则任何人都可编辑
          if (tags.length == 0) return true;

          let loginUserTagIds = this.initData.loginUser.tagIdsWithChildTag || [];
          return tags.some(tag => loginUserTagIds.indexOf(tag.id) >= 0);
        },
        // 个人权限判断
        () => {
          return (
            customer.createUser == loginUserId
            || this.isCustomerManager(customer)
          );
        }
      );
    },
    /**
     * 当前用户是否是该客户负责人
     * 客户负责人用于和客户创建人相同权限
     */
    isCustomerManager(customer) {
      return this.initData.loginUser.userId === customer.customerManager;
    },
    /**
     * 是否有查看客户权限，需要满足以下条件之一：
     *
     * 1. 查看客户全部权限： 全部客户
     * 2. 查看客户团队权限： 没有团队的客户都可查看，有团队的按团队匹配。 包含个人权限
     * 3. 查看客户个人权限： 自己创建的 或 客户负责人
     */
    hasViewCustomerAuth(customer) {
      let loginUserId = this.initData.loginUser.userId;
      return AuthUtil.hasAuthWithDataLevel(
        this.permission,
        'CUSTOMER_VIEW',
        // 团队权限判断
        () => {
          let tags = Array.isArray(customer.tags) ? customer.tags : [];
          // 无团队则任何人都可编辑
          if (tags.length == 0) return true;

          let loginUserTagIds = this.initData.loginUser.tagIdsWithChildTag || [];
          return tags.some(tag => loginUserTagIds.indexOf(tag.id) >= 0);
        },
        // 个人权限判断
        () => {
          return customer.createUser == loginUserId || this.isCustomerManager;
        }
      );
    },

    toggleSelection(rows) {
      let isNotOnCurrentPage = false;
      let item = undefined;
      let row = undefined;

      if (rows) {
        for (let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.page.list.every(item => {
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

    // 切换已选择
    selectionToggle(rows) {
      let isNotOnCurrentPage = false;
      let item = undefined;
      let row = undefined;

      if (rows) {
        for (let i = 0; i < rows.length; i++) {
          row = rows[i];
          isNotOnCurrentPage = this.page.list.every(item => {
            return item.id !== row.id;
          });
          if (isNotOnCurrentPage) return;
        }
        rows.forEach(row => {
          this.$refs.productTemplateTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.productTemplateTable.clearSelection();
        this.multipleSelection = [];
      }
    },
    /**
     * 导出产品
     * @param {Boolean} exportAll -- 是否导出全部
     */
    exportProduct(exportAll = false) {
      let ids = [];
      let fileName = `${formatDate(
        new Date(),
        'YYYY-MM-DD'
      )}客户联系人数据.xlsx`;

      if (!exportAll) {
        if (!this.multipleSelection.length)
          return this.$platform.alert('请选择要导出的数据');
        ids = this.selectedIds;
      }
      console.log(ids, 'export');
      this.$refs.exportProductTemplatePanel.open(ids, fileName);
    },
    // 导出 列
    exportColumns() {
      return this.columns.map(c => {
        if (
          c.field !== 'customerAddress'
          && c.field !== 'remindCount'
          && c.field !== 'updateTime'
        ) {
          c.export = true;
        }

        return c;
      });
    },
    // 构建产品导出参数
    exportParamsBuild(checkedArr, ids) {
      let exportAll = !ids || ids.length == 0;
      let exportSearchModel = exportAll
        ? {
          ...this.buildParams(),
          exportTotal: this.page.total
        }
        : { exportTotal: ids.length };

      return {
        productChecked: checkedArr.join(','),
        data: exportAll ? '' : ids.join(','),
        exportSearchModel: JSON.stringify(exportSearchModel)
      };
    },
    // 检测导出条数
    exportCountCheck(ids, max) {
      let exportAll = !ids || ids.length == 0;

      return exportAll && this.multipleSelection.length > max
        ? `为了保障响应速度，暂不支持超过${max}条以上的数据导出，请您分段导出。`
        : null;
    },

    // 取消选择的产品
    selectProductTemplateCancel(productItem) {
      if (!productItem || !productItem.id) return;

      this.multipleSelection = this.multipleSelection.filter(
        ms => ms.id !== productItem.id
      );
      this.multipleSelection.length < 1
        ? this.selectionToggle()
        : this.selectionToggle([productItem]);
    }
  },
  components: {
    [SearchPanel.name]: SearchPanel,
    [EditContactDialog.name]: EditContactDialog
  }
};
</script>

<style lang="scss" scoped>
</style>