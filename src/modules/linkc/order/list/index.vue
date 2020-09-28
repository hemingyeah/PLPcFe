<template>
  <div class="my-shop-box" v-loading.fullscreen.lock="fullscreenLoading">
    <!-- search-modal-box start -->
    <div class="search-modal-box">
      <div class="flex-x search-input-box">
        <div class="flex-1"></div>
        <el-input
          class="search-input"
          placeholder="搜索订单编号商品名称"
          v-model="searchModel.keyWord"
          @keyup.enter.native="searchModel.pageNum=1,search()"
        >
          <el-button slot="append" @click="searchModel.pageNum=1,search()">
            <i class="iconfont icon-search"></i>
          </el-button>
        </el-input>
      </div>

      <div class="search-more">
        <div class="search-checkbox flex-x">
          <div class="flex-x min-w-500 pad-b-20">
            <div class>订单状态：</div>
            <el-select
              v-model="searchModel.moreConditions.stateList"
              @change="changeOrderState"
              placeholder="请选择"
              multiple
              style="width:340px"
            >
              <el-option
                v-for="(item, index) in search_checkbox"
                :key="index"
                :label="item.label"
                :value="item.value"
              >
                <span style="float: left">{{ item.label }}</span>
                <span
                  style="float: left; color: #8492a6; font-size: 13px; margin-left:12px;"
                >{{ stateNumObj[stateObj[item.value].key]}}</span>
              </el-option>
            </el-select>
          </div>
          <div class="search-datecheck min-w-650 flex-x pad-b-20">
            <div class>下单时间：</div>
            <div class="search-date">
              <el-date-picker
                v-model="searchModel.moreConditions.orderTime"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </div>
            <el-button class="mar-l-32" type="primary" @click="searchModel.pageNum=1,search()">查询</el-button>
            <el-button @click="resetParams">重置</el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- search-modal-box end -->

    <!-- start 产品模板列表 -->
    <div class="product-template-list-view mar-t-12" ref="productTemplateListPage">
      <!-- start 搜索 -->
      <div class="product-template-list-search-group">
        <!-- start  搜索header -->
        <!-- <form
          class="base-search"
          @submit.prevent="searchModel.pageNum=1;search();"
        >
          <div class="product-template-list-base-search-group">
            <el-input v-model="searchModel.keyword" placeholder="请输入手机号或关联编号">
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <base-button type="primary" native-type="submit">搜索</base-button>
            <base-button type="ghost" @event="resetParams">重置</base-button>
          </div>
          <span class="advanced-search-visible-btn" @click.self="panelSearchAdvancedToggle">
            <i class="iconfont icon-add"></i>
            高级搜索
          </span>
        </form>-->
        <!-- end 搜索 header -->

        <!-- start 高级搜索表单 -->
        <!-- <product-template-search-panel
          :config="{
          fields: this.productFields,
        }"
          ref="searchPanel"
        >
          <div class="advanced-search-btn-group" slot="footer">
            <base-button type="ghost" @event="resetParams">重置</base-button>
            <base-button type="primary" @event="powerfulSearch" native-type="submit">搜索</base-button>
          </div>
        </product-template-search-panel>-->
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
            <span class="el-dropdown-link el-dropdown-btn">
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
            <!-- <span class="el-dropdown-link el-dropdown-btn" @click="showAdvancedSetting">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>-->
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
        <div class="myShop-order-list-table">
          <el-table
            :data="page.list"
            :row-key="getRowKey"
            stripe
            @sort-change="sortChange"
            @select="selectionHandle"
            @select-all="selectionHandle"
            :highlight-current-row="false"
            border
            header-row-class-name="myShop-order-list-heard"
            ref="productTemplateTable"
          >
            <template v-for="column in columns">
              <el-table-column
                v-if="column.show"
                :key="column.field"
                :label="column.label"
                :prop="column.field"
                :width="column.width"
                :min-width="column.minWidth"
                :sortable="column.sortable"
                show-overflow-tooltip
                :align="column.align"
              >
                <template slot-scope="scope">
                  <template v-if="column.conType === 'goods'">
                    <div class="flex-x">
                      <div class="flex-x goods-img-list flex-1">
                        <template v-for="(item, index) in scope.row[column.field]">
                          <img
                            :key="index"
                            v-if="index <= 4"
                            :src="item.thumbnailUrl ? `${item.thumbnailUrl}?x-oss-process=image/resize,m_fill,h_32,w_32` : defaultImg"
                            @click.stop="previewImg(item.thumbnailUrl)"
                          />
                        </template>
                        <div
                          class="flex-1 overHideCon-1"
                          v-if="scope.row[column.field].length==1"
                        >{{scope.row[column.field][0].name}}</div>
                        <div>{{scope.row[column.field].length>5?`+${scope.row[column.field].length-5}`:''}}</div>
                      </div>
                      <div>共{{scope.row.goodsCount}}件</div>
                    </div>
                  </template>
                  <template v-else-if="column.conType === 'btnArray'">
                    <div class="flex-x btnArray-box">
                      <a
                        v-for="(item, index) in column.btnArr"
                        :key="index"
                        href
                        :class="`view-detail-btn ${index>0?'mar-l-10':''}`"
                        :style="item.styleType(scope.row)"
                        @click.stop.prevent="item.click(scope.row)"
                      >{{item.name}}</a>
                    </div>
                  </template>
                  <template v-else-if="column.conType === 'click'">
                    <a
                      href
                      class="view-detail-btn"
                      :style="`color:${item.color}`"
                      @click.stop.prevent="column.click(scope.row)"
                      v-if="hasViewCustomerAuth(scope.row)"
                    >{{scope.row[column.field]}}</a>
                    <p v-else>{{scope.row[column.field]}}</p>
                  </template>
                  <template
                    v-else-if="column.field === 'createTime'"
                  >{{ scope.row.createTime | formatDate }}</template>
                  <template v-else-if="column.field === 'logisticsState'">
                    <div class="flex-x">
                      <div
                        :class="[`status-tips-${scope.row.logisticsState}`,'status-tips-box']"
                      >{{stateObj[scope.row.logisticsState].name}}</div>
                    </div>
                  </template>

                  <template v-else>{{scope.row[column.field]}}</template>
                </template>
              </el-table-column>
            </template>
          </el-table>
          <!-- end 表格 -->
        </div>

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
    </div>
    <!-- end 产品模板列表 -->

    <goods-dialog ref="goodsDialog" :info-data="goodsInfo" @confirm="goodsConfirm"></goods-dialog>
    <out-stock-dialog ref="outStockDialog" :info-data="outStockInfo" @confirm="outStockConfirm"></out-stock-dialog>
  </div>
</template>
<script>
import _ from "lodash";
import Page from "@model/Page";
import platform from "@src/platform";
import { formatDate } from "@src/util/lang";

import { orderList, orderNum } from "@src/api/Linkc";
import componentMixin from "../component/index";
import BaseGallery from "../../../../../packages/BaseGallery";

// import SearchPanel from "../components/SearchPanel.vue";
import AuthUtil from "@src/util/auth";
import defaultImg from "@src/assets/img/myShop/default.png";

/* 高级搜索面板 列数 */
const PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER =
  "customer_contact_search_column_number";
/* 高级搜索 搜索数据 */
const STORE_USER_FOR_SEARCH_PRODUCT_TEMPLATE =
  "store_user_for_search_product_template";
// 产品模板列表数据
const MYSHOP_ORDER_LIST_TEMPLATE_DATA = "myshop_order_list_template_data";
// 产品模板列表选择
const MY_SHOP_ORDER_CHECK = "myShopOrderCheck";

// 页面刷新记住当前页面信息
const MY_SHOP_ORDER_SEARCH_MODEL = "my_shop_order_search_model";

const MY_SHOP_ORDER_SEARCH_MODEL_REAL = "my_shop_order_search_model_real";

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g;

let pending = false; // 记录交互pending

export default {
  name: "my-shop",
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  mixins: [componentMixin],
  data() {
    return {
      defaultImg,
      fullscreenLoading: false,
      search_checkbox: [
        { label: "待发货", value: 1, num: 0 },
        { label: "待收货", value: 2, num: 0 },
        { label: "已完成", value: 3, num: 0 },
      ],
      stateNumObj: {},
      pickerOptions: {
        shortcuts: [
          {
            text: "昨天",
            onClick(picker) {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", [start, start]);
            },
          },
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },

      auth: {}, // 权限
      columns: this.buildTableFixedColumns(), // 列
      columnNum: 1, // 高级搜索 列数
      page: new Page(), // page 对象
      productTemplateConfig: {
        productTemplateConfig: {},
        productFields: [],
      }, // 产品配置项
      searchModel: {
        keyWord: "",
        pageSize: 10,
        pageNum: 1,
        orderDetail: {},
        moreConditions: {
          stateList: [],
          orderTime: this.findWeekTime(),
        },
      },
      selectedContact: {}, // 编辑联系人弹窗参数,
      // 表单选择系列组件相关参数ƒ
      multipleSelection: [],
      panelTheMultipleSelectionShow: false,
      goodsInfo: {},
      outStockInfo: {},
    };
  },
  created() {
    if (localStorage.getItem(MY_SHOP_ORDER_SEARCH_MODEL_REAL)) {
      this.$set(
        this,
        "searchModel",
        JSON.parse(localStorage.getItem(MY_SHOP_ORDER_SEARCH_MODEL))
      );
      localStorage.removeItem(MY_SHOP_ORDER_SEARCH_MODEL_REAL);
      localStorage.removeItem(MY_SHOP_ORDER_SEARCH_MODEL);
    }
    this.search();
    this.getStateNum();
  },
  mounted() {
    window.onbeforeunload = (e) => {
      if (localStorage.getItem(MY_SHOP_ORDER_SEARCH_MODEL_REAL)) {
        localStorage.setItem(
          MY_SHOP_ORDER_SEARCH_MODEL,
          JSON.stringify(this.searchModel)
        );
      }
    };
  },
  computed: {
    productFields() {
      return (this.initData.productFields || []).sort(
        (a, b) => a.orderId - b.orderId
      );
    },
    // 导出权限
    authExport() {
      return this.initData.loginUser.authorities.EXPORT_IN;
    },

    /* 已选择 id列表 */
    selectedIds() {
      return this.multipleSelection.map((item) => item.id) || [];
    },
  },
  filters: {
    formatDate(val) {
      if (!val) return "";
      return formatDate(val, "YYYY-MM-DD HH:mm:ss");
    },
  },
  methods: {
    findWeekTime() {
      let weekTime = [];

      weekTime.push(
        formatDate(new Date() - 7 * 24 * 60 * 60 * 1000, "YYYY-MM-DD")
      );
      weekTime.push(formatDate(new Date(), "YYYY-MM-DD"));
      return weekTime;
    },
    showAdvancedSetting() {
      window.TDAPP.onEvent("pc：客户联系人-选择列事件");
      this.$refs.advanced.open(this.columns);
    },
    openTab(id) {
      let fromId = window.frameElement.getAttribute("id");
      platform.openTab({
        id: "my_shop_order_detail",
        title: "订单详情",
        url: `/linkc/order/detail?id=${id}`,
        reload: true,
        fromId,
      });
    },
    buildParams() {
      const sm = _.cloneDeep(this.searchModel);
      let params = {
        keyWord: sm.keyWord,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum,
      };

      if (Object.keys(sm.orderDetail || {}).length) {
        params.orderDetail = sm.orderDetail;
      }

      if (Object.keys(sm.moreConditions).length > 0) {
        if (sm.moreConditions.orderTime.length > 0) {
          sm.moreConditions["startTime"] = sm.moreConditions.orderTime[0];
          sm.moreConditions["endTime"] = sm.moreConditions.orderTime[1];
        }
        delete sm.moreConditions.orderTime;
        params = {
          ...params,
          ...sm.moreConditions,
        };
      }

      if (params.createTime && params.createTime.length) {
        let createTime = params.createTime.split("-");

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
          label: "商品",
          field: "goodsInfos",
          conType: "goods",
          show: true,
          minWidth: "450px",
        },
        {
          label: "订单号",
          field: "orderNum",
          width: "220px",
          show: true,
        },
        {
          label: "下单时间",
          field: "createTime",
          width: "160px",
          show: true,
        },
        {
          label: "实付金额",
          field: "payAmount",
          width: "140px",
          show: true,
        },
        {
          label: "订单状态",
          field: "logisticsState",
          width: "100px",
          show: true,
        },
        {
          label: "操作",
          field: "btnArray",
          conType: "btnArray",
          align: "center",
          width: "140px",
          btnArr: [
            {
              name: "查看详情",
              styleType: (obj) => {
                return obj.isMain
                  ? "color:#999;cursor: not-allowed;"
                  : "color:#55b7b4";
              },
              click: (obj) => {
                this.openTab(obj.orderId);
              },
            },
            {
              name: "出库",
              styleType: (obj) => {
                return obj.repertoryState != 2
                  ? "color:#999;cursor: not-allowed;"
                  : "color:#55b7b4";
              },
              click: (obj) => {
                if (pending || obj.repertoryState != 2) return;
                this.outStockInfo = obj;
                this.$refs.outStockDialog.changeDialog(true);
              },
            },
            {
              name: "发货",
              styleType: (obj) => {
                return obj.logisticsState != 1
                  ? "color:#999;cursor: not-allowed;"
                  : "color:#55b7b4";
              },
              click: (obj) => {
                if (pending || obj.logisticsState != 1) return;
                this.goodsInfo = obj;
                this.$refs.goodsDialog.changeDialog(true);
              },
            },
          ],
          fixed: true,
          show: true,
        },
      ];
    },
    // 构建表格列
    buildTableColumn() {
      let localColumns = []
        .map((i) => (typeof i == "string" ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});
      let baseColumns = this.buildTableFixedColumns();
      let columns = [...baseColumns].map((col) => {
        let show = col.show;
        let width = col.width;
        let localField = localColumns[col.field];

        if (null != localField) {
          width =
            typeof localField.width == "number" ? `${localField.width}px` : "";
          show = localField.show !== false;
        }
        col.show = show;
        col.width = width;
        col.type = "column";

        return col;
      });

      return columns;
    },
    // 兼容旧版本的 已选择列
    backwardCompatibleColumn() {
      let checkedColumnsOldVersion = localStorage.getItem(MY_SHOP_ORDER_CHECK);

      if (!checkedColumnsOldVersion) return;

      let columns = checkedColumnsOldVersion.split(",");
      localStorage.removeItem(MY_SHOP_ORDER_CHECK);

      return (columns || [])
        .filter((c) => c)
        .map((c) => {
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

      this.columns.forEach((col) => {
        let newCol = colMap[col.field];
        if (null != newCol) {
          this.$set(col, "show", newCol.show);
          this.$set(col, "width", newCol.width);
        }
      });

      const columnsStatus = this.columns.map((c) => ({
        field: c.field,
        show: c.show,
        width: c.width,
      }));
      this.localStorageSet(
        "columnStatus",
        columnsStatus,
        MYSHOP_ORDER_LIST_TEMPLATE_DATA
      );
    },
    // 搜索参数恢复
    paramsSearchRevert() {
      const localStorageData = this.localStorageGet(
        MYSHOP_ORDER_LIST_TEMPLATE_DATA
      );

      if (localStorageData && localStorageData.pageSize) {
        this.searchModel.pageSize = Number(localStorageData.pageSize);
      }

      // const num =
      //   localStorage.getItem(
      //     PRODUCT_TEMPLATE_LIST_ADVANCE_SEARCH_COLUMN_NUMBER
      //   ) || 1;
      // this.columnNum = Number(num);
    },

    // 操作选择
    selectionHandle(selection) {
      let tv = this.selectionCompute(selection);

      let original = this.multipleSelection.filter((ms) =>
        this.page.list.some((cs) => cs.id === ms.id)
      );

      let unSelected = this.page.list.filter((c) =>
        original.every((oc) => oc.id !== c.id)
      );

      if (tv.length > this.selectedLimit) {
        this.$nextTick(() => {
          original.length > 0
            ? unSelected.forEach((row) => {
                this.$refs.productTemplateTable.toggleRowSelection(row, false);
              })
            : this.$refs.productTemplateTable.clearSelection();
        });
        return this.$platform.alert(`最多只能选择${this.selectedLimit}条数据`);
      }

      this.multipleSelection = tv;
      console.log(this.multipleSelection, "select");

      this.$refs.baseSelectionBar.openTooltip();
    },

    // 计算已选择
    selectionCompute(selection) {
      let tv = [];

      tv = this.multipleSelection.filter((ms) =>
        this.page.list.every((c) => c.id !== ms.id)
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
        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] === "object" && obj[key]) {
            obj[key] = this.deleteValueFromObject(obj[key], except);
          }
          if (!obj[key] && except.every((ex) => ex !== obj[key])) {
            delete obj[key];
          }
        });
      } else {
        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] === "object" && obj[key]) {
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

      this.localStorageSet(
        "pageSize",
        pageSize,
        MYSHOP_ORDER_LIST_TEMPLATE_DATA
      );
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
        const dataStr = localStorage.getItem(key) || "{}";
        return JSON.parse(dataStr);
      } catch (error) {
        console.log("error: ", error);
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
        console.log("localStorageSet err", err);
      }
    },
    // 搜索
    search() {
      const params = this.buildParams();
      console.log(params, "searchP");
      this.fullscreenLoading = true;
      return orderList(params)
        .then((res) => {
          if (res.status == 200) {
            this.page = res.data;
          } else {
            this.$notify.close();
            this.$notify.error({
              title: "网络错误",
              message: res.message,
              duration: 2000,
            });
          }
        })
        .catch((err) => {
          // this.$emit("pageLoading", false);
        })
        .finally(() => {
          this.fullscreenLoading = false;
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
          this.searchModel.orderDetail = {};
          return this.search();
        }

        let sortModel = {
          isSystem:
            prop === "createTime" || prop === "updateTime" || prop === "type"
              ? 1
              : 0,
          sequence: order === "ascending" ? "ASC" : "DESC",
          column:
            prop === "createTime" || prop === "updateTime" || prop === "type"
              ? `productTemplate.${prop}`
              : prop,
        };

        const sortedField =
          this.productTemplateConfig.productFields.filter(
            (sf) => sf.fieldName === prop
          )[0] || {};

        if (
          prop === "createTime" ||
          prop === "updateTime" ||
          sortedField.formType === "date" ||
          sortedField.formType === "datetime"
        ) {
          sortModel.type = "date";
        } else {
          sortModel.type = sortedField.formType;
        }

        this.searchModel.orderDetail = sortModel;

        this.search();
      } catch (e) {
        console.error("product template sortChange err", e);
      }
    },
    panelSearchAdvancedToggle() {
      window.TDAPP.onEvent("pc：产品模板-高级搜索事件");
      this.$refs.searchPanel.open();

      this.$nextTick(() => {
        let forms = document.getElementsByClassName("advanced-search-form");
        for (let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute("novalidate", true);
        }
      });
    },
    /**
     * @description 全量搜索
     */
    powerfulSearch() {
      this.searchModel.pageNum = 1;
      this.searchModel.moreConditions = this.$refs.searchPanel.buildParams();
      this.search();
    },
    resetParams() {
      window.TDAPP.onEvent("pc：订单管理-重置事件");
      this.searchIncludeMoreConditions = false;
      this.searchModel = {
        keyWord: "",
        pageNum: 1,
        pageSize: this.page.pageSize,
        orderDetail: {},
        moreConditions: {
          stateList: [],
          orderTime: this.findWeekTime(),
        },
      };

      // this.$refs.searchPanel.resetParams();
      this.search();
    },
    openOutsideLink(e) {
      let url = e.target.getAttribute("url");
      if (!url) return;
      if (!/http/gi.test(url))
        return this.$platform.alert("请确保输入的链接以http或者https开始");
      this.$platform.openLink(url);
    },
    buildTextarea(value) {
      return value
        ? value.replace(link_reg, (match) => {
            return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`;
          })
        : "";
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
        "CUSTOMER_EDIT",
        // 团队权限判断
        () => {
          let tags = Array.isArray(customer.tags) ? customer.tags : [];
          // 无团队则任何人都可编辑
          if (tags.length == 0) return true;

          let loginUserTagIds =
            this.initData.loginUser.tagIdsWithChildTag || [];
          return tags.some((tag) => loginUserTagIds.indexOf(tag.id) >= 0);
        },
        // 个人权限判断
        () => {
          return (
            customer.createUser == loginUserId ||
            this.isCustomerManager(customer)
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
        "CUSTOMER_VIEW",
        // 团队权限判断
        () => {
          let tags = Array.isArray(customer.tags) ? customer.tags : [];
          // 无团队则任何人都可编辑
          if (tags.length == 0) return true;

          let loginUserTagIds =
            this.initData.loginUser.tagIdsWithChildTag || [];
          return tags.some((tag) => loginUserTagIds.indexOf(tag.id) >= 0);
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
          isNotOnCurrentPage = this.page.list.every((item) => {
            return item.id !== row.id;
          });
          if (isNotOnCurrentPage) return;
        }
        rows.forEach((row) => {
          this.$refs.productTemplateTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.productTemplateTable.clearSelection();
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
          isNotOnCurrentPage = this.page.list.every((item) => {
            return item.id !== row.id;
          });
          if (isNotOnCurrentPage) return;
        }
        rows.forEach((row) => {
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
        "YYYY-MM-DD"
      )}客户联系人数据.xlsx`;

      if (!exportAll) {
        if (!this.multipleSelection.length)
          return this.$platform.alert("请选择要导出的数据");
        ids = this.selectedIds;
      }
      console.log(ids, "export");
      this.$refs.exportProductTemplatePanel.open(ids, fileName);
    },
    // 导出 列
    exportColumns() {
      return this.columns.map((c) => {
        if (
          c.field !== "customerAddress" &&
          c.field !== "remindCount" &&
          c.field !== "updateTime"
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
            exportTotal: this.page.total,
          }
        : { exportTotal: ids.length };

      return {
        productChecked: checkedArr.join(","),
        data: exportAll ? "" : ids.join(","),
        exportSearchModel: JSON.stringify(exportSearchModel),
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
        (ms) => ms.id !== productItem.id
      );
      this.multipleSelection.length < 1
        ? this.selectionToggle()
        : this.selectionToggle([productItem]);
    },
    // match data
    matchSelected() {
      if (!this.multipleSelection.length) return;
      const selected =
        this.page.list.filter((c) => {
          if (this.multipleSelection.some((sc) => sc.id === c.id)) {
            this.multipleSelection = this.multipleSelection.filter(
              (sc) => sc.id !== c.id
            );
            this.multipleSelection.push(c);
            return c;
          }
        }) || [];

      this.$nextTick(() => {
        this.toggleSelection(selected);
      });
    },
    goodsConfirm() {
      this.search();
    },
    outStockConfirm() {
      this.search();
    },
    changeOrderState() {
      this.searchModel.pageNum = 1;
      this.search();
    },
    getStateNum() {
      return orderNum().then((res) => {
        if (res.status == 200) {
          this.stateNumObj = res.data;
        } else {
          this.$notify.close();
          this.$notify.error({
            title: "网络错误",
            message: res.message,
            duration: 2000,
          });
        }
      });
    },
  },
};
</script>
<style lang="scss">
@import url("../../assets/public.scss");
label {
  margin-bottom: 0;
}
.table-footer {
  padding-top: 10px;
}
.myShop-order-list-table {
  padding: 12px;
  background: #fff;
  .goods-img-list {
    img {
      width: 32px;
      height: 32px;
      margin-right: 4px;
      cursor: pointer;
    }
  }
}
.el-table {
  .myShop-order-list-heard th {
    background: #f5f5f5;
    color: $text-color-primary;
    font-weight: normal;
  }
}
.search-modal-box {
  background: #fff;

  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.06);

  .search-input-box {
    padding: 8px 12px;
    .search-input {
      width: 272px;
      height: 32px;

      .icon-search {
        color: #fff;
        font-size: 13px;
      }
      .el-input-group__append {
        background-color: $color-primary;
        width: 35px;
        box-sizing: border-box;
        padding: 0;
        text-align: center;
      }
    }
  }

  .search-more {
    padding: 0 12px;
    .search-checkbox {
      margin-top: 20px;
      flex-wrap: wrap;
      .el-checkbox {
        margin-right: 0;
      }
    }
    .search-datecheck {
      .search-date {
        height: 32px;
        width: 340px;
        .el-range-separator{
          padding: 0;
        }
      }
    }
  }
}
.status-tips-box {
  padding: 0 8px;
  border-radius: 11px;
  font-size: 12px;
}
.status-tips-1 {
  border: 1px solid rgba(110, 207, 64, 0.16);
  background: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}
.status-tips-2 {
  border: 1px solid rgba(255, 174, 0, 0.41);

  background: rgba(255, 174, 0, 0.18);
  color: #ffae00;
}
.status-tips-3 {
  border: 1px solid #999(110, 207, 64, 0.16);
  color: #999;
  background: rgba(153, 153, 153, 0.27);
}

.btnArray-box {
  width: 100%;
  justify-content: space-around;
}
</style>