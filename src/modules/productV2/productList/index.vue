<template>
  <div class="product-list-container"
       v-loading.fullscreen.lock="loading">
    <div class="product-list-search-group-container bg-w">
      <!-- <form class="base-search" onsubmit="return false;">
        <div class="product-list-base-search-group">
          <el-input
            v-model="searchModel.keyword"
            placeholder="根据产品信息搜索"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <base-button
            type="primary"
            @event="
              searchModel.pageNum = 1;
              search();
              trackEventHandler('search');
            "
            native-type="submit"
          >搜索</base-button
          >
          <base-button type="ghost" @event="resetParams">重置</base-button>
        </div>
        <span
          class="advanced-search-visible-btn"
          @click.self="panelSearchAdvancedToggle"
        >
          <i class="iconfont icon-add"></i>
          高级搜索
        </span>
      </form> -->
      <!-- 搜索 -->
      <div class="task-list-header-seach ">
        <form onsubmit="return false;">
          <div class="seach task-span1 task-flex task-ai guide-box">
            <div style="position: relative;"></div>

            <el-input v-model="searchModel.keyword"
                      placeholder="请输入产品编号或产品名称"
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
      <!-- 筛选 -->
      <!-- <div class="task-list-header-nav bg-w">
        <div class="task-flex">
          <div class="task-font14 task-c6 state">产品类型：</div>
          <div class="list list-crate"
               :style="`width: ${navWidth}px`">
            <div class="list-item task-flex task-ai">
              <div v-for="(item, index) in selectList"
                   :key="index"
                   class="task-nav-create"
                   :class="{ 'task-c2': selectId === item.value }"
                   @click.stop="
                     createPerspective(item)
                   ">
                {{ item.name }} {{`${selectCount && selectCount[item.key] ? `(${selectCount[item.key]})` : ''}`}}
              </div>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <div class="product-list-section">
      <!--operation bar start-->
      <div class="operation-bar-container">
        <div class="top-btn-group flex-x">
          <base-button type="primary"
                       icon="icon-add"
                       @event="goToCreate"
                       v-if="createdPermission">新建</base-button>
          <div class="task-ai task-flex task-font14 task-c6 cur-point mar-l-20"
               @click="deleteProducts"
               v-if="deletePermission">
            <i class="iconfont icon-qingkongshanchu task-icon"></i>
            <span class="task-mr4 task-ml4">删除</span>
          </div>

          <div class="task-ai task-flex task-font14 task-c6 cur-point mar-l-24"
               @click="openDialog('edit')"
               v-if="editedPermission === 3">
            <i class="iconfont icon-edit task-icon"></i>
            <span class="task-mr4 task-ml4">批量编辑</span>
          </div>
          <div class="task-ai task-flex task-font14 task-c6 cur-point mar-l-24"
               @click="openDialog('remind')"
               v-if="editedPermission === 3 && isShowCustomerRemind">
            <i class="iconfont icon-notification task-icon"></i>
            <span class="task-mr4 task-ml4">批量提醒</span>
          </div>
          <div class="task-ai task-flex task-font14 task-c6 cur-point mar-l-24"
               @click="openDialog('sendMessage')"
               v-if="editedPermission === 3">
            <i class="iconfont icon-duanxin3 task-icon"></i>
            <span class="task-mr4 task-ml4">发送短信</span>
          </div>
        </div>

        <div class="action-button-group flex-x">
          <el-dropdown trigger="click"
                       v-if="exportPermission">
            <div class="task-ai task-flex task-font14 task-c6 cur-point"
                 @click="trackEventHandler('moreAction')">
              <span class="task-mr4 task-ml4">更多操作</span>
              <i class="iconfont icon-triangle-down task-icon"></i>
            </div>
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
          <!-- 选择列 -->
          <div class="guide-box mar-l-25">
            <!-- <div class="guide-disable-cover" v-if="nowGuideStep == 2"></div> -->
            <div :class="[
                   'task-ai',
                   'task-flex',
                   'task-font14',
                   'task-c6',
                   'cur-point',
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

      <el-table stripe
                :data="page.list"
                :highlight-current-row="false"
                :row-key="getRowKey"
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
                           :show-overflow-tooltip="column.field !== 'name' && column.fieldName !== 'productPic'"
                           :align="column.align">
            <template slot-scope="scope">
              <template v-if="column.field === 'name'">
                <sample-tooltip :row="scope.row">
                  <template slot="content"
                            slot-scope="{ isContentTooltip }">
                    <el-tooltip :content="scope.row[column.field]"
                                placement="top-start"
                                :disabled="!isContentTooltip">
                      <a href=""
                         class="view-detail-btn"
                         @click.stop.prevent="openProductTab(scope.row.id)">
                        {{ scope.row[column.field] }}
                      </a>
                    </el-tooltip>
                  </template>
                </sample-tooltip>
              </template>
              <template v-else-if="column.field === 'customer' && scope.row.customer">
                <a href=""
                   class="view-detail-btn"
                   @click.stop.prevent="createCustomerTab(scope.row.customer.id)">
                  {{ scope.row.customer.name }}
                </a>
              </template>
              <template v-else-if="column.field === 'productTemplate'">
                <a href=""
                   class="view-detail-btn"
                   @click.stop.prevent="createTemplateTab(scope.row.templateId)">
                  {{ scope.row.templateName }}
                </a>
              </template>
              <template v-else-if="column.field === 'tags'">
                {{ scope.row | formatTags }}
              </template>
              <!-- 自定义的选择类型字段显示， 与type 区别-->
              <template v-else-if="column.formType === 'cascader'">
                {{ scope.row[column.field] | displaySelect }}
              </template>
              <template v-else-if="column.formType === 'select' && !column.isSystem">
                {{ scope.row.attribute[column.field] | displaySelect }}
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
              <template v-else-if="column.formType === 'address'">
                {{ formatCustomizeAddress(scope.row.attribute[column.field]) }}
              </template>
              <template v-else-if="
                column.formType === 'user' &&
                  scope.row.attribute[column.field]
              ">
                {{ getUserName(column, scope.row.attribute[column.field]) }}
              </template>
              <template v-else-if="column.formType === 'location'">
                {{
                  scope.row.attribute[column.field] &&
                    scope.row.attribute[column.field].address
                }}
              </template>
              <template v-else-if="column.formType == 'related_task'">
                {{ getRelatedTask(scope.row.attribute[column.field]) }}
              </template>
              <template v-else-if="column.field === 'createUser'">
                {{ scope.row.createUser && scope.row.createUser.displayName }}
              </template>
              <template v-else-if="column.field === 'createTime'">
                {{ scope.row.createTime | formatDate }}
              </template>
              <div v-else-if="column.formType === 'textarea'"
                   v-html="buildTextarea(scope.row.attribute[column.field])"
                   @click="openOutsideLink"></div>

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
                {{ scope.row.attribute[column.field] }}
              </template>


              <!-- 移植自产品类型列表并同步更新 s -->

              <template v-else-if="column.fieldName === 'pathName'">
                <sample-tooltip :row="scope.row"
                                v-if="scope.row[column.field]">
                  <template slot="content"
                            slot-scope="{ isContentTooltip }">

                    <a href=""
                       class="view-detail-btn"
                       @click.stop.prevent="openProductMenuTab(scope.row.catalogId)">
                      {{ (scope.row[column.field] && scope.row[column.field].replace(new RegExp("/","g") ,' / ')) || '' }}
                    </a>
                  </template>
                </sample-tooltip>
              </template>

              <template v-else-if="column.fieldName === 'productPic'">
                <div v-if="scope.row.productPic" class="flex-x goods-img-list" style="height:100%">
                  <template v-for="(item, index) in scope.row.productPic">
                    <img :key="index"
                         v-if="index <= 4"
                         class="cur-point"
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

              <template v-else-if="column.fieldName === 'productVideo'">
                <template v-if="scope.row.productVideo">
                  <sample-tooltip :row="scope.row">
                    <template slot="content"
                              slot-scope="{ isContentTooltip }">
                      <a href=""
                         class="view-detail-btn"
                         @click.stop.prevent="
                           previewVideo(scope.row.productVideo[0].url)
                         ">
                        {{
                          scope.row.productVideo[0] &&
                            scope.row.productVideo[0].filename
                        }}
                      </a>
                    </template>
                  </sample-tooltip>
                </template>
              </template>

              <!-- 移植自产品类型列表并同步更新 e -->

              <template v-else>
                {{ scope.row[column.field] }}
              </template>


            </template>
          </el-table-column>
        </template>
      </el-table>

      <div class="table-footer">
        <div class="list-info">
          共<span class="level-padding">{{ page.totalElements }}</span>记录， 已选中<span class="product-selected-count"
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
                       :total="page.totalElements">
        </el-pagination>
      </div>
    </div>

    <base-panel class="product-panel"
                :show.sync="multipleSelectionPanelShow"
                width="420px">
      <h3 slot="title">
        <span>已选中产品({{ multipleSelection.length }})</span>
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
              <span class="product-selected-name">产品</span>
            </div>
            <div class="product-selected-row"
                 v-for="c in multipleSelection"
                 :key="c.id">
              <span class="product-selected-sn">{{ c.name }}</span>
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

    <send-message-dialog ref="messageDialog"
                         :selected-ids="selectedIds"
                         :sms-rest="smsRest"></send-message-dialog>

    <batch-editing-dialog ref="batchEditingDialog"
                          :config="{ fields: onlyProductFields, productTypes: productTypes }"
                          :callback="search"
                          :selected-ids="selectedIds"></batch-editing-dialog>

    <batch-reminding-dialog ref="batchRemindingDialog"
                            :selected-ids="selectedIds"></batch-reminding-dialog>

    <base-import title="导入产品"
                 ref="importProductModal"
                 @success="search"
                 action="/excels/customer/customerProductImportNew">
      <div slot="tip">
        <div class="base-import-warn">
          <p>
            请先下载<a href="/product/import/templateNew">导入模版 </a>，填写完成后再上传导入。
          </p>
          <!--<p>导入产品前，请确保产品所属客户已存在。您可以 <a href="/customer/import/getAllCustomerId">点这里</a>导出包含所有已存在客户的模板</p>-->
        </div>
      </div>
    </base-import>
    <!-- start 导出工单 -->
    <base-export-group ref="exportPanel"
                       :alert="exportAlert"
                       :columns="exportColumns"
                       :build-params="buildExportParams"
                       :group="true"
                       :validate="checkExportCount"
                       :needchoose-break="false"
                       method="post"
                       action="/excels/customer/customerProductNew" />
    <!-- end 导出工单 -->

    <batch-update-dialog ref="batchUpdateDialog"
                         :selected-ids="selectedIds"
                         :total-items="page.totalElements"
                         :build-download-params="buildParams"
                         @success="search"
                         action="/excels/customer/customerProductUpdateBatchNew"></batch-update-dialog>
    <biz-select-column ref="advanced"
                       :sotrage-key="'productV2_select_colum'"
                       @save="saveColumnStatus" />
    <!-- <base-table-advanced-setting ref="advanced" @save="modifyColumnStatus"/> -->

    <search-panel :init-data="initData"
                  :config="{
                    fields: onlyProductFields,
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
import { getRootWindow } from "@src/util/dom";
import SendMessageDialog from "@src/modules/productV2/productList/compoment/SendMessageDialog.vue";
import BatchEditingDialog from "@src/modules/productV2/productList/compoment/BatchEditingDialog.vue";
import BatchRemindingDialog from "@src/modules/productV2/productList/compoment/BatchRemindingDialog.vue";
import BatchUpdateDialog from "@src/modules/productV2/productList/compoment/BatchUpdateDialog.vue";
import SearchPanel from "@src/modules/productV2/productList/compoment/SearchPanel.vue";
import { storageGet, storageSet } from "@src/util/storage";

import {
  getProductV2,
  deleteProductByIds,
  getUpdateRecord,
  getProductFields
} from "@src/api/ProductApi";

import { PRODUCT_LIST_LOCALSTORAGE_20_11_25 } from "@src/modules/productV2/storage.js"

import { catalogFieldFixForProduct, productFieldFix } from "@src/modules/productV2/public.js";
import { getListProductFields, getProductLinkCatalogCount } from "@src/api/ProductV2Api"
import TeamMixin from "@src/mixins/teamMixin";
import { isShowCustomerRemind } from "@src/util/version.ts";

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g;

export default {
  name: "product-list",
  mixins: [TeamMixin],
  inject: ["initData"],
  // props: {
  //   initData: {
  //     type: Object,
  //     default: () => ({}),
  //   },
  // },
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
        keyword: "",
        pageSize: 10,
        pageNum: 1,
        orderDetail: {},
        catalogState: "",
        moreConditions: {
          conditions: [],
        },
      },

      dynamicFields: [],
      filterTeams: [],
      tableKey: (Math.random() * 1000) >> 2,
      selectColumnState: "product_list_select",
      // 头部筛选列表 s
      selectList: [
        { name: "全部", key: "", value: "" },
        { name: "有产品类型", key: "buildCatalogNum", value: 1 },
        { name: "无产品类型", key: "unBuildCatalogNum", value: 0 }
      ],
      selectCount: null,
      navWidth: window.innerWidth - 120,
      selectId: "",
      // 头部筛选列表 e
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
      let fixedFields = _.cloneDeep(productFieldFix);
      if (this.initData.productConfig.qrcodeEnabled) {
        fixedFields.push({
          displayName: "二维码编号",
          fieldName: "qrcodeId",
          formType: "text",
          export: false,
          isSystem: 1,
          placeholder: "请输入产品二维码",
          orderId: 10001,
          tableName: "product",
        });
      }


      let field = this.dynamicFields.filter(
        (item) => item.formType == "customer"
      )[0];
      if (field && field.setting.customerOption?.linkman) {
        fixedFields.push({
          displayName: "联系人",
          fieldName: "linkmanName",
          formType: "text",
          export: true,
          isSystem: 0,
          tableName: "product",
        });

        fixedFields.push({
          displayName: "电话",
          fieldName: "phone",
          export: true,
          isSystem: 0,
          tableName: "product",
        });
      }

      if (field && field.setting.customerOption?.address) {
        fixedFields.push({
          displayName: "地址",
          fieldName: "address",
          export: true,
          formType: "text",
          isSystem: 0,
          tableName: "product",
        });
      }

      // .concat([...fixedFields, ...catalogFieldFixForProduct])
      return this.dynamicFields.concat([...fixedFields])
        .filter(
          (f) =>
            f.formType !== "separator"
            && f.formType !== "info"
            && f.formType !== "autograph"
        )
        .map((f) => {
          // 调整字段顺序
          if (f.fieldName === "name") {
            f.orderId = -13;
            f.show = true;
          }

          if (f.fieldName === "customer") {
            f.orderId = -12;
            f.show = true;
          }

          if (f.fieldName === "linkmanName") {
            f.orderId = -11;
            f.show = true;
          }

          if (f.fieldName === "phone") {
            f.orderId = -10;
            f.show = true;
          }

          if (f.fieldName === "address") {
            f.orderId = -9;
            f.show = true;
          }

          if (f.fieldName === "serialNumber") {
            f.orderId = -6;
            f.show = true;
          }

          if (f.fieldName === "type") {
            f.orderId = -5;
            f.show = true;
          }

          if (f.fieldName === "tags") {
            f.orderId = -8;
          }

          if (f.fieldName === "productTemplate") {
            f.orderId = -7;
          }

          if (f.fieldName === "remindCount") {
            f.orderId = -3;
          }

          if (f.fieldName === "updateTime") {
            f.orderId = -2;
          }

          if (f.fieldName === "createUser") {
            f.orderId = -1;
            f.show = true;
          }

          if (f.fieldName === "createTime") {
            f.orderId = 0;
            f.show = true;
          }
          if (f.fieldName === "catalogId" && f.tableName == "product") {
            // 转换产品类型表单数据
            f.fieldName = "pathName"
          }

          // 系统字段默认显示
          f["show"] = f.isSystem ? true : f.show

          return f;
        })
        .sort((a, b) => a.orderId - b.orderId);
    },
    onlyProductFields () {
      
      return this.productFields.filter(item => item.tableName == "product").map(item => { if (item.formType == "related_catalog") { item.fieldName = "catalogId" } return item })
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
      let arr = [
        {
          label: "产品系统编号",
          field: "productId",
          export: true,
        },
        {
          label: "客户姓名",
          field: "customerName",
          export: true,
        },
        {
          label: "客户编号",
          field: "customerSN",
          export: true,
        },
        ...this.columns,
      ].map((field) => {
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

        if ("qrcodeId" == field.fieldName) {
          field.export = Boolean(this.initData.productConfig.qrcodeEnabled);
        }

        if ("qrcodeId" == field.fieldName) {
          field.export = Boolean(this.initData.productConfig.qrcodeEnabled);
        }

        return field;
      });

      let arr_ = [
        {
          label: "产品信息",
          value: "productExport",
          columns: arr.filter(item => item.tableName == "product"),
        },
        // {
        //   label: "产品类型信息",
        //   value: "catalogExport",
        //   columns: arr.filter(item => item.tableName == "catalog"),
        // },
      ];
      return arr_
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
  },
  async mounted () {
    this.resetPage()
    // [tab_spec]标准化刷新方式
    window.__exports__refresh = this.resetPage;

    this.$eventBus.$on(
      "product_list.update_product_list_remind_count",
      this.updateProductRemindCount
    );
  },
  beforeDestroy () {
    this.$eventBus.$off(
      "product_list.update_product_list_remind_count",
      this.updateProductRemindCount
    );
  },
  methods: {
    async resetPage(){
      // 获取产品动态字段
      try {
        let res = await getProductFields({ isFromSetting: true });
        this.dynamicFields = res.data || [];
        this.buildColumns();
        this.getSelectCount();
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
      return (field && field.province + field.city + field.dist + field.address) || "";
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

    openProductTab (productId) {
      let fromId = window.frameElement.getAttribute("id");
      console.log(productId)
      this.$platform.openTab({
        id: `product_view_${productId}`,
        title: "产品详情",
        close: true,
        url: `/customer/product/view/${productId}?noHistory=1`,
        fromId,
      });
    },
    // 搜索
    search () {
      const params = this.buildParams();
      this.loading = true;

      return getProductV2(params)
        .then((res) => {
          this.loading = false;
          // this.page = Page.as(Object.freeze(res.result));
          let { number, content, totalPages, totalElements, size } = res.result;
          if (content.length) content = content.map((item) => {
            if (item.catalog) {
              item = { ...item, ...item.catalog };
              item["catalogId"] = item.catalogId || ""
              if (item.catalog.catalogAttribute) {
                item.attribute = { ...item.attribute, ...item.catalog.catalogAttribute }
              }
            }
            return item
          })

          this.page["list"] = content;
          this.page["total"] = totalPages;
          this.page["totalElements"] = totalElements
          this.page["pageNum"] = number;
          this.page["pageSize"] = size
          this.matchSelected();
        })
        .catch((e) => console.error("fetch product catch an error", e));
    },
    buildParams () {
      const sm = Object.assign({}, this.searchModel);
      let params = {
        keyword: sm.keyword,
        pageSize: sm.pageSize,
        pageNum: sm.pageNum,
        catalogState: sm.catalogState
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
        keyword: "",
        pageNum: 1,
        pageSize: this.page.pageSize,
        orderDetail: {},
        catalogState: "",
        moreConditions: {
          conditions: [],
        },
      };

      this.$refs.searchPanel.resetParams();
      this.search();
    },
    openDialog (action) {
      if (action === "sendMessage") {
        window.TDAPP.onEvent("pc：产品管理-发送短信事件");
        this.$refs.messageDialog.openSendMessageDialog();
      }

      if (action === "edit") {
        window.TDAPP.onEvent("批量编辑	pc：产品管理-批量编辑事件");
        this.$refs.batchEditingDialog.open();
      }

      if (action === "remind") {
        window.TDAPP.onEvent("批量提醒	pc：产品管理-批量提醒事件");
        this.$refs.batchRemindingDialog.openBatchRemindingDialog();
      }

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
      window.TDAPP.onEvent("pc：产品管理-删除事件");
      if (!this.multipleSelection.length) {
        return this.$platform.alert("请选择需要删除的产品");
      }

      try {
        if (!(await this.$platform.confirm("确定要删除选择的产品？"))) return;

        const ids = this.multipleSelection.map((p) => p.id).join(",");
        this.loading = true;
        const res = await deleteProductByIds(ids);
        this.loading = false;

        if (!res || res.status)
          return this.$platform.notification({
            title: "失败",
            type: "error",
            message: res.message || "发生未知错误",
          });
        this.$platform.notification({
          title: "删除成功",
          type: "success",
        });
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
          column: isSystem ? `${prop}` : prop,
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

    // 选择列 s

    /**
     * @description 表头更改
     */
    headerDragend (newWidth, oldWidth, column, event) {
      let data = this.columns
        .map((item) => {
          if (item.fieldName === column.property) {
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
      window.TDAPP.onEvent("pc：产品管理-选择列事件");
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
        localStorageData.columnStatus[
          `${this.selectColumnState}`
        ] = columnsList;
        columnsStatus = localStorageData.columnStatus;
      } else {
        columnsStatus = {
          [`${this.selectColumnState}`]: columnsList,
        };
      }

      this.saveDataToStorage("columnStatus", columnsStatus);
    },

    // 选择列 e

    buildColumns () {
      const localStorageData = this.getLocalStorageData();

      let columnStatus = localStorageData.columnStatus && localStorageData.columnStatus[this.selectColumnState];
      columnStatus = columnStatus || [];
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
          if (col.formType == "related_catalog") {
            col.show = true;
          }
          col.width = width;
          col.type = "column";

          return col;
        });
    },

    /**
     * @description 构建导出参数
     * @return {Object} 导出参数
     */
    buildExportParams (checkedMap, ids, exportOneRow) {
      const {
        productExport,
        catalogExport
      } = checkedMap
      const Params = Object.assign({}, this.params);
      const rootWindow = getRootWindow(window);
      const {
        loginUser
      } = this.initData;

      let exportAll = !ids || !ids.length;
      const all = exportAll ? {
        ...this.buildParams(),
        productIds: this.selectedIds,
        tagIds: loginUser.tagIds,
        tenantId: JSON.parse(rootWindow._init).user.tenantId,
      } : {
        productIds: this.selectedIds,
        tagIds: loginUser.tagIds,
        tenantId: JSON.parse(rootWindow._init).user.tenantId,
      };

      let exportSearchModel = {

      };
      let params = {
        exportSearchModel: JSON.stringify({
          ...all,
          ...{
            exportTotal: exportAll
              ? this.page.totalElements : this.selectedIds.length,
          },
        }),
      };
      /** ********************* *********************/
      // 产品信息
      let export_product = this.exportData(0, productExport)

      // 产品类型信息
      // let export_catalog = this.exportData(1, catalogExport)

      params["exportOneRow"] = exportOneRow
      params["data"] = exportAll ? "" : this.selectedIds.join(",");
      // params["catalogExport"] = export_catalog.join(",");
      params["productExport"] = export_product.join(",");

      return params;
    },
    /**
     * 导出数据
     */
    exportData (number, list = []) {
      const export_list = this.exportColumns;
      if(!list.length) return
      if (number === 3) {
        let cardField = []
        export_list.filter((item, index) => {
          return index > 2
        }).forEach(v => {
          v.columns.forEach(item => {
            cardField.push(item)
          })
        })
        return cardField.map(v => {
          let bool = list.some(item => {
            if (v.exportAlias) {
              return v.exportAlias === item
            }
            return v.fieldName === item

          })
          if (bool) {
            return v.exportAlias ? v.exportAlias : v.fieldName
          }
        }).filter(item => {
          return item
        })
      }

      return export_list[number].columns.map(v => {
        let bool = list.some(item => {
          if (v.exportAlias) {
            return v.exportAlias === item
          }
          return v.fieldName === item

        })
        if (bool) {
          return v.exportAlias ? v.exportAlias : v.fieldName
        }
      }).filter(item => {
        return item
      })
    },
    /** 检测导出条数 */
    checkExportCount (ids, max) {
      let exportAll = !ids || !ids.length;
      return exportAll && this.page.totalElements > max
        ? "为了保障响应速度，暂不支持超过5000条以上的数据导出，请您分段导出。"
        : null;
    },

    exportProduct (exportAll) {
      let ids = [];
      let fileName = `${formatDate(new Date(), "YYYY-MM-DD")}产品数据.xlsx`;
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

    createTemplateTab (templateId) {
      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `product_template_view_${templateId}`,
        title: "产品模板",
        close: true,
        url: `/product/detail/${templateId}?noHistory=1`,
        fromId,
      });
    },
    goToCreate () {
      window.TDAPP.onEvent("pc：产品管理-新建事件");
      // window.location = '/customer/product/create';
      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: "customer_product_create",
        title: "新建产品",
        url: "/customer/product/create",
        reload: true,
        close: true,
        fromId,
      });
    },
    getLocalStorageData () {
      const dataStr = localStorage.getItem(PRODUCT_LIST_LOCALSTORAGE_20_11_25) || "{}";
      return JSON.parse(dataStr);
    },
    saveDataToStorage (key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem(
        PRODUCT_LIST_LOCALSTORAGE_20_11_25,
        JSON.stringify(data)
      );
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
      window.TDAPP.onEvent("pc：产品管理-高级搜索事件");
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
        window.TDAPP.onEvent("pc：产品管理-搜索事件");
        return;
      }
      if (type === "moreAction") {
        window.TDAPP.onEvent("pc：产品管理-更多操作事件");
        return;
      }
    },
    getRowKey (row) {
      return row.id || "";
    },
    /**
     * 创建视角
     */
    createPerspective (item, bool = false) {
      this.searchModel.catalogState = item.value;
      this.selectId = item.value;
      this.searchModel.pageNum = 1;
      this.search();
    },
    /**
     * @description 导出提示
     */
    exportAlert (result, params = {}) {
      // let taskQueryInputString = params?.taskQueryInput || "{}";
      // let taskQueryInput = JSON.parse(taskQueryInputString);
      // let ids = taskQueryInput.ids || [];
      // let idsArr = ids;
      // let exportNum =
      //   idsArr.length > 0 && ids.length > 0
      //     ? idsArr.length
      //     : this.taskPage.totalElements;
      // let message = `您已选择${exportNum}条数据进行导出，导出进行中，导出完成后，您可以到右上角后台任务中查看导出数据，关闭本窗口不影响数据导出。`;

      this.$platform.alert(result.message);
    },

    getSelectCount () {
      getProductLinkCatalogCount().then(res => {
        this.selectCount = res.result
      })
    },

    // 移植产品类型表单 s
    previewVideo (e) {
      this.$previewVideo(e);
    },
    previewImg (url) {
      this.$previewImg(url);
    },
    openProductMenuTab (id) {
      this.$platform.openTab({
        id: `productV2_catalog_view_${id}`,
        title: "产品类型详情",
        close: true,
        url: `/productV2/catalog/view?id=${id}`
      });
    },
    // 移植产品类型表单 e

  },
  components: {
    SearchPanel,
    [SendMessageDialog.name]: SendMessageDialog,
    [BatchEditingDialog.name]: BatchEditingDialog,
    [BatchRemindingDialog.name]: BatchRemindingDialog,
    [BatchUpdateDialog.name]: BatchUpdateDialog,
    [SearchPanel.name]: SearchPanel,
  },
};
</script>
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
.el-table--small th,
.el-table--small td {
  height: 40px;
  padding: 3px 0;
}
.product-list-container .product-table {
  padding: 10px;

  &:before {
    height: 0;
  }

  .goods-img-list {
    height: 100%;
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
