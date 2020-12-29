<template>
  <div class="product-list-container"
       v-loading.fullscreen.lock="loading">
    <div class="product-list-search-group-container flex-x jus-end bg-w">
      <!-- 搜索 -->
      <div class="task-list-header-seach ">
        <form onsubmit="return false;">
          <div class="seach task-span1 task-flex task-ai guide-box">
            <div style="position: relative;"></div>

            <el-input v-model="searchModel.keyWord"
                      placeholder="请输入名称/分级/编号进行搜索"
                      class="task-with-input task-ml12">
            </el-input>

            <base-button type="primary"
                         @event="searchModel.pageNum = 1;
                                 search();
                                 trackEventHandler('search');"
                         native-type="submit"
                         class="task-ml12">
              搜索
            </base-button>
            <base-button type="ghost"
                         @event="resetParams"
                         class="task-ml12">
              重置
            </base-button>
            <div class="guide-box">
              <div id="v-task-step-2"
                   :class="['advanced-search-visible-btn', 'task-ml12']"
                   @click.self="panelSearchAdvancedToggle">
                <i class="iconfont icon-gaojisousuo task-font12 task-mr4"></i>
                高级搜索
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div class="product-list-section">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary"
                       icon="icon-add"
                       @event="goToCreate"
                       v-if="createdPermission">新建</base-button>
          <base-button type="ghost"
                       icon="icon-qingkongshanchu"
                       @event="deleteProducts"
                       v-if="deletePermission">删除</base-button>
        </div>

        <div class="action-button-grou flex-x">
          <!-- <base-button type="plain" @event="openDialog('sendMessage')" v-if="editedPermission === 3">发送短信</base-button> -->
          <!-- <base-button
            type="plain"
            @event="openDialog('edit')"
            v-if="editedPermission === 3"
          >批量编辑</base-button
          > -->
          <!-- <base-button type="plain" @event="openDialog('remind')" v-if="editedPermission === 3 && isShowCustomerRemind">批量提醒</base-button> -->
          <el-dropdown v-if="exportPermission || exportPermissionTaskEdit">
            <div class="task-ai task-flex task-font14 task-c6 task-pointer"
                 @click="trackEventHandler('moreAction')">
              <span class="task-mr4 task-ml4">更多操作</span>
              <i class="iconfont icon-triangle-down task-icon"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div @click="openDialog('importProduct')">导入产品类型</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportProduct(false)">导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div @click="exportProduct(true)">导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 选择列 -->
          <div class="guide-box mar-l-25">
            <!-- <div class="guide-disable-cover" v-if="nowGuideStep == 2"></div> -->
            <div :class="[
                   'task-ai',
                   'task-flex',
                   'task-font14',
                   'task-c6',
                   'task-pointer',
                   'task-width103',
                 ]"
                 id="v-task-step-1"
                 @click="showAdvancedSetting">
              <span class="task-mr4 task-ml4">选择列</span>
              <i class="iconfont icon-triangle-down task-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <div style="background: #fff;padding: 0 10px">
        <base-selection-bar ref="baseSelectionBar"
                            v-model="multipleSelection"
                            @toggle-selection="toggleSelection"
                            @show-panel="() => (multipleSelectionPanelShow = true)" />
      </div>

      <!-- <el-table
        :data="page.list"
        :key="tableKey"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        @sort-change="sortChange"
        :highlight-current-row="false"
        header-row-class-name="product-table-header"
        ref="multipleTable"
        class="product-table"
      > -->
      <el-table stripe
                :data="page.list"
                :highlight-current-row="false"
                :key="tableKey"
                :border="true"
                @select="handleSelection"
                @select-all="handleSelection"
                @sort-change="sortChange"
                @header-dragend="headerDragend"
                :class="['task-list-table', 'common-list-table']"
                header-row-class-name="common-list-table-header taks-list-table-header"
                ref="multipleTable">
        <el-table-column type="selection"
                         width="48"
                         align="center"
                         class-name="flex-x jus-center"></el-table-column>
        <template v-for="(column, index) in columns">
          <el-table-column v-if="column.show"
                           :key="`${column.field}_${index}`"
                           :label="column.label"
                           :prop="column.field"
                           :width="column.width"
                           :class-name="
                             column.field == 'name' ? 'product-name-superscript-td' : ''
                           "
                           :min-width="column.minWidth || '120px'"
                           :sortable="column.sortable"
                           :show-overflow-tooltip="column.fieldName !== 'productPic' && column.fieldName !== 'thumbnail'"
                           :align="column.align">
            <template slot-scope="scope">
              <template v-if="column.fieldName === 'pathName'">
                <a href=""
                   class="color-primary"
                   @click.stop.prevent="openProductMenuTab(scope.row.id)">
                  {{ (scope.row[column.field] && scope.row[column.field].replace(new RegExp("/","g") ,' / ')) || '' }}
                </a>
              </template>

              <template v-else-if="column.fieldName === 'productVideo'">
                <template v-if="scope.row.productVideo.length">
                  <a href=""
                     class="color-primary"
                     @click.stop.prevent="
                       previewVideo(scope.row.productVideo[0].url)
                     ">
                    {{
                      scope.row.productVideo[0] &&
                        scope.row.productVideo[0].filename
                    }}
                  </a>

                </template>
              </template>

              <template v-else-if="column.field === 'tags'">
                {{ scope.row | formatTags }}
              </template>
              <template v-else-if="column.formType === 'cascader'">
                {{ scope.row.attribute[column.field] | displayCascader }}
              </template>
              <template v-else-if="column.formType === 'select' && !column.isSystem">
                {{scope.row.attribute[column.field] | displaySelect}}
              </template>
              <template v-else-if="column.formType === 'user' && scope.row.attribute[column.field]">
                {{ getUserName(column, scope.row.attribute[column.field]) }}
              </template>
              <template v-else-if="column.formType == 'related_task'">
                {{ getRelatedTask(scope.row.attribute[column.field]) }}
              </template>
              <template v-else-if="column.field === 'updateTime'">
                <template v-if="scope.row.latesetUpdateRecord">
                  <el-tooltip class="item"
                              effect="dark"
                              :content="scope.row.latesetUpdateRecord"
                              placement="top-start">
                    <div @mouseover="showLatestUpdateRecord(scope.row)">
                      {{ scope.row.updateTime | formatDate }}
                    </div>
                  </el-tooltip>
                </template>
                <template v-else>
                  <div @mouseover="showLatestUpdateRecord(scope.row)">
                    {{ scope.row.updateTime | formatDate }}
                  </div>
                </template>
              </template>
              <template v-else-if="column.field === 'createUser'">
                {{ scope.row.createUser && scope.row.createUser.displayName }}
              </template>
              <template v-else-if="column.field === 'createTime'">
                {{ scope.row.createTime | formatDate }}
              </template>
              <div v-else-if="
                     column.formType === 'textarea' && column.isSystem != 1
                   "
                   v-html="buildTextarea(scope.row.attribute[column.field])"
                   @click="openOutsideLink"></div>

              <template v-else-if="column.fieldName == 'address'">
                {{ getAddress(scope.row.address) }}
              </template>

              <template v-else-if="!column.isSystem">
                {{ scope.row.attribute && scope.row.attribute[column.field] }}
              </template>

              <template v-else-if="column.fieldName == 'catalogId'">
                {{ scope.row.pathName }}
              </template>
              <template v-else-if="column.fieldName === 'productPic'">
                <div class="flex-x goods-img-list"
                     style="height:100%">
                  <template v-for="(item, index) in scope.row.productPic">
                    <img :key="index"
                         v-if="index <= 4"
                         class="cur-point mar-r-8"
                         :src="
                           item.url
                             ? `${item.url}?x-oss-process=image/resize,m_fill,h_32,w_32`
                             : defaultImg
                         "
                         @click.stop="previewImg(item.url)" />
                  </template>
                  <div>
                    {{
                      scope.row[column.field].length > 5
                        ? `+${scope.row[column.field].length - 5}`
                        : ''
                    }}
                  </div>
                </div>
              </template>
              <!-- <template v-else-if="column.fieldName == 'productNum'">
                  {{ scope.row['remind'] || '' }}
                </template> -->

              <template v-else-if="column.fieldName === 'thumbnail'">
                <div class="flex-x">
                  <div class="flex-x goods-img-list"
                       style="height:100%">
                    <template v-for="(item, index) in scope.row.thumbnail">
                      <img :key="index"
                           v-if="index==0"
                           class="cur-point"
                           :src="
                             item.url
                               ? `${item.url}?x-oss-process=image/resize,m_fill,h_32,w_32`
                               : defaultImg
                           "
                           @click.stop="previewImg(item.url)" />
                    </template>
                  </div>
                </div>
              </template>
              <template v-else>
                {{ scope.row[column.field] || '' }}
              </template>
            </template>
          </el-table-column>
        </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="list-info">
          共<span class="level-padding">{{ page.total }}</span>记录， 已选中<span class="product-selected-count"
                                                                           @click="multipleSelectionPanelShow = true">{{ multipleSelection.length }}</span>条
          <span class="product-selected-count"
                @click="toggleSelection()">清空</span>
        </div>
        <el-pagination class="product-table-pagination"
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

    <base-panel class="product-panel"
                :show.sync="multipleSelectionPanelShow"
                width="420px">
      <h3 slot="title">
        <span>已选中类型({{ multipleSelection.length }})</span>
        <i v-if="multipleSelection.length"
           class="iconfont icon-qingkongshanchu product-panel-btn"
           @click="toggleSelection()"
           title="清空已选中数据"
           data-placement="right"
           v-tooltip></i>
      </h3>

      <div class="product-selected-panel">
        <div class="product-selected-tip"
             v-if="!multipleSelection.length">
          <img src="@src/assets/img/no-data.png" />
          <p>暂无选中的数据，请从列表中选择。</p>
        </div>
        <template v-else>
          <div class="product-selected-list">
            <div class="product-selected-row product-selected-head">
              <span class="product-selected-sn">产品类型</span>
            </div>
            <div class="product-selected-row"
                 v-for="c in multipleSelection"
                 :key="c.id">
              <span class="product-selected-sn overHideCon-1">{{
                c.pathName
              }}</span>
              <button type="button"
                      class="product-selected-delete"
                      @click="removeFromSelection(c)">
                <i class="iconfont icon-fe-close"></i>
              </button>
            </div>
          </div>
        </template>
      </div>
    </base-panel>

    <batch-editing-dialog ref="batchEditingDialog"
                          :config="{ fields: productFields, productTypes: productTypes }"
                          :callback="search"
                          :selected-ids="selectedIds"></batch-editing-dialog>

    <batch-reminding-dialog ref="batchRemindingDialog"
                            :selected-ids="selectedIds"></batch-reminding-dialog>

    <base-import title="导入产品"
                 ref="importProductModal"
                 @success="baseImportSuccess(), search()"
                 action="/excels/catalog/import">
      <div slot="tip">
        <div class="base-import-warn">
          <p>
            请先下载<a href="/catalog/import/template">导入模版 </a>，填写完成后再上传导入。
          </p>
          <!--<p>导入产品前，请确保产品所属客户已存在。您可以 <a href="/customer/import/getAllCustomerId">点这里</a>导出包含所有已存在客户的模板</p>-->
        </div>
      </div>
    </base-import>

    <base-export ref="exportPanel"
                 :columns="exportColumns"
                 :build-params="buildExportParams"
                 :validate="checkExportCount"
                 method="post"
                 action="/excels/catalog/export" />

    <!-- <batch-update-dialog
      ref="batchUpdateDialog"
      :selected-ids="selectedIds"
      :total-items="page.total"
      :build-download-params="buildParams"
      @success="search"
      action="/excels/customer/customerProductUpdateBatch"
    ></batch-update-dialog> -->

    <!-- start 选择列设置 -->
    <biz-select-column ref="advanced"
                       @save="saveColumnStatus" />
    <!-- <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus" /> -->

    <search-panel :init-data="initData"
                  :config="{
                    fields: this.productFields,
                  }"
                  ref="searchPanel">
      <div class="advanced-search-btn-group"
           slot="footer">
        <base-button type="ghost"
                     @event="resetParams">重置</base-button>
        <base-button type="primary"
                     @event="powerfulSearch"
                     native-type="submit">搜索</base-button>
      </div>
    </search-panel>
  </div>
</template>

<script>
import _ from "lodash";

import Page from "@model/Page";
import { formatDate } from "@src/util/lang";
import BatchEditingDialog from "@src/modules/productV2/productMenuList/compoment/BatchEditingDialog.vue";
import BatchRemindingDialog from "@src/modules/productV2/productMenuList/compoment/BatchRemindingDialog.vue";
import BatchUpdateDialog from "@src/modules/productV2/productMenuList/compoment/BatchUpdateDialog.vue";
import SearchPanel from "@src/modules/productV2/productMenuList/compoment/SearchPanel.vue";

import { getUpdateRecord } from "@src/api/ProductApi";

import { catalogFieldFix } from "@src/modules/productV2/public.js";
import {
  getPageList,
  getProductMenuField,
  delTreeList,
} from "@src/api/ProductV2Api";
import TeamMixin from "@src/mixins/teamMixin";
import { isShowCustomerRemind } from "@src/util/version.ts";

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g;

export default {
  name: "product-list",
  mixins: [TeamMixin],
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
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
        keyWord: "",
        pageSize: 10,
        pageNum: 1,
        orderDetail: {},
        moreConditions: {
          conditions: [],
        },
      },

      dynamicFields: [],
      filterTeams: [],
      tableKey: (Math.random() * 1000) >> 2,
    };
  },
  computed: {
    auth () {
      return (
        this.initData?.loginUser?.authorities || this.initData?.authorities
      );
    },
    editedPermission () {
      return this.auth.PRODUCT_EDIT;
    },
    createdPermission () {
      return this.auth.PRODUCT_CREATE;
    },
    viewedPermission () {
      return this.auth.CUSTOMER_VIEW === 3;
    },
    deletePermission () {
      return this.auth.PRODUCT_EDIT === 3 && this.auth.PRODUCT_DELETE;
    },
    exportPermission () {
      return this.auth.EXPORT_IN;
    },
    productFields () {
      return this.dynamicFields
        .concat(catalogFieldFix)
        .filter(
          (f) =>
            f.formType !== "separator"
            && f.formType !== "info"
            && f.formType !== "autograph"
            && f.formType !== "attachment"
        )
        .map((f) => {
          if (f.isSystem == 1) {
            f.show = true;
          }
          return f;
        })
        .sort((a, b) => a.orderId - b.orderId);
    },
    productTypes () {
      return this.initData.productConfig.productType || [];
    },
    panelWidth () {
      return `${420 * this.columnNum}px`;
    },
    selectedIds () {
      return this.multipleSelection.map((p) => p.id);
    },
    exportColumns () {
      return [...this.columns].map((field) => {
        if (
          ["customer", "productTemplate", "remindCount"].some(
            (key) => key === field.fieldName
          )
          || field.formType === "info"
        ) {
          field.export = false;
        } else {
          field.export = true;
        }

        return field;
      });
    },
    smsRest () {
      return this.initData.smsRest || 0;
    },
    isShowCustomerRemind () {
      return isShowCustomerRemind();
    },
  },
  filters: {
    formatTags ({ customer }) {
      if (!customer) return "";
      if (!customer.tags || !customer.tags.length) return "";
      return customer.tags.map((t) => t.tagName).join(" ");
    },
    formatDate (val) {
      if (!val) return "";
      return formatDate(val, "YYYY-MM-DD HH:mm:ss");
    },
    displaySelect (value) {
      if (!value) return null;
      if (value && typeof value === "string") {
        return value;
      }
      if (Array.isArray(value) && value.length) {
        return value.join("，");
      }
      return null;
    },
    displayCascader (value) {
      if (!value) return null;
      if (value && typeof value === "string") {
        return value;
      }
      if (Array.isArray(value) && value.length) {
        return value.join("/");
      }
      return null;
    }
  },
  async mounted () {
    this.resetPage();

    // [tab_spec]标准化刷新方式
    window.__exports__refresh = this.resetPage;

  },
  beforeDestroy () {
  },
  methods: {
    async resetPage () {
      

      // 获取产品动态字段
      try {
        let res = await getProductMenuField();
        this.dynamicFields = res.result || [];
        this.buildColumns();
      } catch (error) {
        this.buildColumns();
        console.error("product-list fetch product fields error", error);
      }
      this.revertStorage();
      this.search();

      if (!this.viewedPermission) {
        this.filterTeams = this.matchTags(this.teamsWithChildTag.slice());
      }
    },
    getAddress (field) {
      return field.province + field.city + field.dist + field.address || "";
    },
    getRelatedTask (field) {
      return Array.isArray(field)
        ? field.map((item) => item.taskNo).join(",")
        : "";
    },
    // 处理人员显示
    getUserName (field, value) {
      // 多选
      if (Array.isArray(value)) {
        return value.map((i) => i.displayName || i.name).join(",");
      }

      let user = value || {};
      return user.displayName || user.name;
    },
    openOutsideLink (e) {
      let url = e.target.getAttribute("url");
      if (!url) return;
      if (!/http/gi.test(url))
        return this.$platform.alert("请确保输入的链接以http或者https开始");
      this.$platform.openLink(url);
    },
    buildTextarea (value) {
      return value
        ? value.replace(link_reg, (match) => {
          return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`;
        })
        : "";
    },
    powerfulSearch () {
      this.searchModel.pageNum = 1;
      this.searchModel.moreConditions = this.$refs.searchPanel.buildParams();

      this.search();
    },
    formatCustomizeAddress (ad) {
      if (null == ad) return "";

      const { province, city, dist, address } = ad;
      return [province, city, dist, address].filter((d) => !!d).join("-");
    },
    // 选择列 s

    /**
     * @description 表头更改
     */
    headerDragend (newWidth, oldWidth, column, event) {
      let data = this.columns
        .map((item) => {
          if (item.displayName === column.label) {
            item.width = column.width;
          }
          return item;
        })
        .map((item) => {
          return {
            field: item.field,
            show: item.show,
            width: item.width,
          };
        });
      this.modifyColumnStatus({ type: "column", data });
    },

    /**
     * @description 修改选择列设置
     * @param {Object} event 事件对象
     */
    modifyColumnStatus (event) {
      let columns = event.data || [],
        colMap = columns.reduce(
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

      this.saveColumnStatusToStorage();
    },
    showAdvancedSetting () {
      window.TDAPP.onEvent("pc：产品类型管理-选择列事件");
      this.$refs.advanced.open(this.columns);
    },
    /**
     * @description 修改选择列设置
     * @param {Object} event 事件对象
     */
    saveColumnStatus (event) {
      let columns = event.data || [];

      this.columns = [];

      this.$nextTick(() => {
        this.$set(this, "columns", columns.slice());
        this.saveColumnStatusToStorage();
      });
    },

    saveColumnStatusToStorage () {
      const localStorageData = this.getLocalStorageData();
      let columnsStatus = null;

      // 判断是否存储选择列
      const columnsList = this.columns.map((c) => ({
        field: c.field,
        show: c.show,
        width: c.width,
      }));

      if (localStorageData.columnStatus) {
        localStorageData.columnStatus = columnsList;
        columnsStatus = localStorageData.columnStatus;
      } else {
        columnsStatus = columnsList;
      }

      this.saveDataToStorage("columnStatus", columnsStatus);
    },

    // 选择列 e

    openProductMenuTab (id) {
      let fromId;
      try {
        fromId = window.frameElement.getAttribute("id");
      } catch (error) {
        console.warn(error, "error try catch");
      }
      this.$platform.openTab({
        id: `productV2_catalog_view_${id}`,
        title: "产品类型详情",
        close: true,
        url: `/productV2/catalog/view?id=${id}`,
        fromId
      });
    },
    search () {
      const params = this.buildParams();
      this.loading = true;

      return getPageList(params)
        .then((res) => {
          this.loading = false;
          res.result.list = res.result.list.map((item) => {
            item.productDesc = item.productDesc || "";
            item["catalogName"] = item.catalogName || "";
            return item;
          });
          this.page = Page.as(Object.freeze(res.result));
          this.matchSelected();
        })
        .catch((e) => console.error("fetch product catch an error", e));
    },
    buildParams () {
      const sm = Object.assign({}, this.searchModel);
      let params = {
        keyWord: sm.keyWord,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum,
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
          ...sm.moreConditions,
        };
      }

      return params;
    },
    jump (pageNum) {
      this.searchModel.pageNum = pageNum;
      this.search();
    },
    resetParams () {
      window.TDAPP.onEvent("pc：产品管理-重置事件");
      this.searchIncludeMoreConditions = false;
      this.searchModel = {
        keyWord: "",
        pageNum: 1,
        pageSize: this.page.pageSize,
        orderDetail: {},
        moreConditions: {
          conditions: [],
        },
      };

      this.$refs.searchPanel.resetParams();
      this.search();
    },
    openDialog (action) {
      // if (action === 'sendMessage') {
      //   window.TDAPP.onEvent('pc：产品管理-发送短信事件');
      //   this.$refs.messageDialog.openSendMessageDialog();
      // }

      // if (action === 'edit') {
      //   window.TDAPP.onEvent('批量编辑	pc：产品类型管理-批量编辑事件');
      //   this.$refs.batchEditingDialog.open();
      // }

      // if (action === 'remind') {
      //   window.TDAPP.onEvent('批量提醒	pc：产品类型管理-批量提醒事件');
      //   this.$refs.batchRemindingDialog.openBatchRemindingDialog();
      // }

      if (action === "importProduct") {
        this.$refs.importProductModal.open();
      }

      if (action === "update") {
        // if (!this.multipleSelection || !this.multipleSelection.length) {
        //   return this.$platform.alert('您尚未选择数据，请选择数据后点击批量更新');
        // }
        this.$refs.batchUpdateDialog.openBatchUpdateCustomerDialog();
      }
    },
    // operation
    async deleteProducts () {
      window.TDAPP.onEvent("pc：产品类型管理-删除事件");
      if (!this.multipleSelection.length) {
        return this.$platform.alert("请选择需要删除的产品类型");
      }

      try {
        if (!(await this.$platform.confirm("确定要删除选择的产品类型？")))
          return;

        const ids = this.multipleSelection.map((p) => p.id);
        this.loading = true;
        const res = await delTreeList({ ids });
        this.loading = false;

        if (!res || res.code != 0)
          return this.$platform.notification({
            title: "失败",
            type: "error",
            message: res.message || "发生未知错误",
          });
        this.$platform.notification({
          title: "删除成功",
          type: "success",
        });
        window.parent.flashSomePage([{
          type: "productV2_catalog_edit",
        }]);
        this.multipleSelection = [];
        this.search();
      } catch (e) {
        this.loading = false;
        console.error("e", e);
      }
    },
    // 批量添加提醒成功后，更新产品的提醒数量
    updateProductRemindCount () {
      let count = 0;
      this.page.list = this.page.list.map((product) => {
        count = product.attribute.remindCount || 0;

        if (this.selectedIds.some((id) => id === product.id)) {
          product.attribute.remindCount = count + 1;
        }

        return product;
      });

      this.matchSelected();
    },
    // table method
    handleSelection (selection) {
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
    selectionCompute (selection) {
      let tv = [];

      tv = this.multipleSelection.filter((ms) =>
        this.page.list.every((c) => c.id !== ms.id)
      );
      tv = _.uniqWith([...tv, ...selection], _.isEqual);

      return tv;
    },
    sortChange (option) {
      try {
        const { prop, order } = option;
        if (!order) {
          this.searchModel.orderDetail = {};
          return this.search();
        }
        const sortedField = this.productFields.filter((sf) => sf.fieldName === prop)[0] || {};

        let isSystem = 0;

        if (prop === "createTime" || prop === "updateTime") {
          isSystem = 1;
        } else {
          isSystem = sortedField.isSystem;
        }

        let sortModel = {
          isSystem,
          sequence: order === "ascending" ? "ASC" : "DESC",
          column: isSystem ? `product.${prop}` : prop,
        };

        if (
          prop === "createTime"
          || prop === "updateTime"
          || sortedField.formType === "date"
          || sortedField.formType === "datetime"
        ) {
          sortModel.type = "date";
        } else {
          sortModel.type = sortedField.formType;
        }

        this.searchModel.orderDetail = sortModel;

        this.search();
      } catch (e) {
        console.error("e", e);
      }
    },
    handleSizeChange (pageSize) {
      this.saveDataToStorage("pageSize", pageSize);
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNum = 1;
      this.search();
    },
    toggleSelection (rows) {
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
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
        this.multipleSelection = [];
      }
    },

    removeFromSelection (c) {
      if (!c || !c.id) return;

      this.multipleSelection = this.multipleSelection.filter(
        (ms) => ms.id !== c.id
      );
      this.multipleSelection.length < 1
        ? this.toggleSelection()
        : this.toggleSelection([c]);
    },
    // modifyColumnStatus(event) {
    //   let columns = event.data || [];
    //   let colMap = columns.reduce(
    //     (acc, col) => (acc[col.field] = col) && acc,
    //     {}
    //   );

    //   this.columns.forEach((col) => {
    //     let newCol = colMap[col.field];
    //     if (null != newCol) {
    //       this.$set(col, 'show', newCol.show);
    //       this.$set(col, 'width', newCol.width);
    //     }
    //   });

    //   const columnsStatus = this.columns.map((c) => ({
    //     field: c.field,
    //     show: c.show,
    //     width: c.width,
    //   }));
    //   this.saveDataToStorage('columnStatus', columnsStatus);
    // },
    buildColumns () {
      const localStorageData = this.getLocalStorageData();

      let columnStatus = localStorageData.columnStatus || [];
      let localColumns = columnStatus
        .map((i) => (typeof i == "string" ? { field: i, show: true } : i))
        .reduce((acc, col) => (acc[col.field] = col) && acc, {});

      this.columns = this.productFields
        .filter(
          (f) =>
            f.formType !== "attachment"
            && f.formType !== "separator"
            && f.formType !== "info"
            && f.formType !== "autograph"
        )
        .map((field) => {
          let sortable = false;
          let minWidth = null;

          if (["date", "datetime", "number"].indexOf(field.formType) >= 0) {
            sortable = "custom";
            minWidth = 100;
          }

          if (field.fieldName === "type") {
            sortable = "custom";
          }

          if (field.displayName.length > 4) {
            minWidth = field.displayName.length * 20;
          }

          if (sortable && field.displayName.length >= 4) {
            minWidth = 125;
          }

          if (
            field.formType === "datetime"
            || field.fieldName === "updateTime"
            || field.fieldName === "createTime"
          ) {
            minWidth = 150;
          }

          return {
            ...field,
            label: field.displayName,
            field: field.fieldName,
            formType: field.formType,
            minWidth: typeof minWidth == "number" ? minWidth : `${minWidth}px`,
            sortable,
            isSystem: field.isSystem,
          };
        })
        .map((col) => {
          let show = col.show === true;
          let width = col.width;
          let localField = localColumns[col.field];

          if (null != localField) {
            width = typeof localField.width == "number"
              ? `${localField.width}px`
              : "";
            show = localField.show !== false;
          }

          col.show = show;
          col.width = width;
          col.type = "column";

          return col;
        });
    },

    buildExportParams (checkedArr, ids) {
      let exportAll = !ids || !ids.length;
      let exportSearchModel = exportAll
        ? {
          ...this.buildParams(),
          exportTotal: this.page.total,
        }
        : { exportTotal: ids.length };

      return {
        catalogChecked: checkedArr.join(","),
        ids: exportAll ? "" : ids.join(","),
        exportSearchModel: JSON.stringify(exportSearchModel),
      };
    },
    /** 检测导出条数 */
    checkExportCount (ids, max) {
      let exportAll = !ids || !ids.length;
      return exportAll && this.page.total > max
        ? "为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。"
        : null;
    },

    exportProduct (exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), "YYYY-MM-DD")}产品类型数据.xlsx`;
      if (!exportAll) {
        if (!this.multipleSelection.length)
          return this.$platform.alert("请选择要导出的数据");
        ids = this.selectedIds;
      }
      this.$refs.exportPanel.open(ids, fileName);
    },
    showLatestUpdateRecord (row) {
      if (row.latesetUpdateRecord) return;
      getUpdateRecord({
        productId: row.id,
      })
        .then((res) => {
          if (!res || res.status) return;

          this.page.list = this.page.list.map((c) => {
            if (c.id === row.id) {
              c.latesetUpdateRecord = res.data;
            }
            return c;
          });

          this.matchSelected();
        })
        .catch((e) => console.error("e", e));
    },

    createCustomerTab (productId) {
      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `customer_view_${productId}`,
        title: "客户信息",
        close: true,
        url: `/customer/view/${productId}?noHistory=1`,
        fromId,
      });
    },

    goToCreate () {
      window.TDAPP.onEvent("pc：产品类型管理-新建事件");
      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: "productV2_catalog_edit",
        title: "新建产品类型",
        url: "/productV2/catalog/edit",
        reload: true,
        close: true,
        fromId,
      });
    },
    getLocalStorageData () {
      const dataStr = localStorage.getItem("productV2_product_menu_list") || "{}";
      return JSON.parse(dataStr);
    },
    saveDataToStorage (key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem("productV2_product_menu_list", JSON.stringify(data));
    },
    revertStorage () {
      const { pageSize, column_number } = this.getLocalStorageData();
      if (pageSize) {
        this.searchModel.pageSize = pageSize;
      }
      if (column_number) this.columnNum = Number(column_number);
    },
    // 匹配选中的列
    matchSelected () {
      if (!this.multipleSelection.length) return;

      const selected = this.page.list.filter((c) => {
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
    // 获取团队列表
    getTeamList (params) {
      return this.getBizTeamList(
        params,
        this.filterTeams,
        this.viewedPermission
      );
    },
    panelSearchAdvancedToggle () {
      window.TDAPP.onEvent("pc：产品类型管理-高级搜索事件");
      this.$refs.searchPanel.open();
      this.$nextTick(() => {
        let forms = document.getElementsByClassName("advanced-search-form");
        for (let i = 0; i < forms.length; i++) {
          let form = forms[i];
          form.setAttribute("novalidate", true);
        }
      });
    },
    // TalkingData事件埋点
    trackEventHandler (type) {
      if (type === "search") {
        window.TDAPP.onEvent("pc：产品类型管理-搜索事件");
        return;
      }
      if (type === "moreAction") {
        window.TDAPP.onEvent("pc：产品类型管理-更多操作事件");
        return;
      }
    },
    getRowKey (row) {
      return row.id || "";
    },
    previewImg (url) {
      this.$previewImg(url);
    },
    baseImportSuccess () {
      window.parent.flashSomePage([{
        type: "productV2_catalog_edit",
      }]);
    },
    previewVideo (e) {
      this.$previewVideo(e);
    },
  },
  components: {
    SearchPanel,
    [BatchEditingDialog.name]: BatchEditingDialog,
    [BatchRemindingDialog.name]: BatchRemindingDialog,
    [BatchUpdateDialog.name]: BatchUpdateDialog,
    [SearchPanel.name]: SearchPanel,
  },
};
</script>

<style lang="scss">
$color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

html,
body {
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
          height: 31px;
          line-height: 31px;
          width: 300px;
        }
      }

      a {
        line-height: 33px;
      }
    }

    .advanced-search-visible-btn {
      font-size: 14px;
      line-height: 31px;
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
    line-height: 31px;
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

.el-table{
  border:none;
}
.product-list-container .product-table {
  padding: 10px;

  &:before {
    height: 0;
  }

  .goods-img-list {
    img {
      width: 32px;
      height: 32px;
      margin-right: 4px;
      cursor: pointer;
    }
  }

  .product-table-header th {
    background: #f5f5f5;
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

    .product-selected-count {
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
      align-items: center;
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
      background-color: #f0f5f5;
      color: #333;
      font-size: 14px;
    }

    .product-selected-sn {
      padding-left: 10px;
      width: 100%;
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
    height: 31px;
    line-height: 31px !important;
    a {
      display: inline-block;
      height: 31px;
      line-height: 31px;
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
.el-table .cell {
  line-height: 31px;
}
</style>


<style lang="scss" scoped>
.task-list {
  &-header {
    background: #ffffff;
    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.06);
    border-radius: 4px;
    margin-bottom: 12px;
    border-top: none;

    &-seach {
      padding: 6px 0;

      .seach {
        justify-content: flex-end;
        padding-right: 16px;

        .advanced-search-visible-btn {
          width: 98px;
          height: 32px;
          background: #e9f9f9;
          border-radius: 4px;
          border: 1px solid #d0f3f4;
          font-size: 14px;
          color: #13c2c2;
          line-height: 32px;
          text-align: center;
          cursor: pointer;
        }
      }
    }

    &-nav {
      > div {
        position: relative;
        border-top: 1px solid #f5f5f5;
        .state {
          padding-top: 4px;
          padding-left: 11px;
          width: 90px;
          font-weight: 500;
          background-color: #fafafa;
        }
        .element-icon i {
          position: absolute;
          right: 12px;
          top: 6px;
        }
        .list {
          width: 90%;
          overflow: hidden;
          // height: 30px;
          .list-item {
            > div {
              padding-left: 11px;
              font-size: 13px;
              width: 130px;
              height: 30px;
              overflow-y: hidden;
              color: #808080;
              line-height: 30px;
              cursor: pointer;
              &:hover {
                color: #333;
              }
            }
          }
        }
      }
    }
  }
}
</style>
