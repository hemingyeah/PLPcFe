<!--  -->
<template>
  <div>
    <el-table
      :data="page.list"
      v-loading="fullscreenLoading"
      stripe
      style="width: 100%"
      :highlight-current-row="false"
      :border="true"
      class="task-list-table"
      header-row-class-name="common-list-table-header taks-list-table-header"
      ref="multipleTable"
    >
      <template v-if="dataType == 'part'">
        <el-table-column
          show-overflow-tooltip
          prop="serialNumber"
          label="编号"
          width="180"
        >
          <template slot-scope="scope">
            <sample-tooltip :row="scope.row">
              <template slot="content" slot-scope="{ isContentTooltip }">
                <el-tooltip
                  :content="scope.row.serialNumber"
                  placement="top"
                  :disabled="!isContentTooltip"
                >
                  <a
                    href=""
                    class="view-detail-btn"
                    @click.stop.prevent="openMenuTab(scope.row.id)"
                  >
                    {{ scope.row.serialNumber }}
                  </a>
                </el-tooltip>
              </template>
            </sample-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="name"
          label="名称"
          width="180"
        >
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="type" label="类别">
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="standard" label="规格">
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="unit" label="单位">
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="salePrice" label="销售价">
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="costPrice" label="出库价">
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="description" label="说明">
        </el-table-column>
      </template>
      <template v-if="dataType == 'wiki'">
        <el-table-column
          prop="title"
          label="标题"
          width="180"
        >
          <template slot-scope="scope">
            <sample-tooltip :row="scope.row">
              <template slot="content" slot-scope="{ isContentTooltip }">
                <el-tooltip
                  :content="scope.row.title"
                  placement="top"
                  :disabled="!isContentTooltip"
                >
                  <a
                    href=""
                    class="view-detail-btn"
                    @click.stop.prevent="openMenuTab(scope.row.id)"
                  >
                    {{ scope.row.title }}
                  </a>
                </el-tooltip>
              </template>
            </sample-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="type"
          label="分类"
          width="180"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="createUserName"
          label="创建人"
        >
        </el-table-column>
      </template>
      <template v-if="dataType == 'product'">
        <el-table-column
          prop="productName"
          label="产品名称"
          width="180"
        >
          <template slot-scope="scope">
            <sample-tooltip :row="scope.row">
              <template slot="content" slot-scope="{ isContentTooltip }">
                <el-tooltip
                  :content="scope.row.productName"
                  placement="top"
                  :disabled="!isContentTooltip"
                >
                  <a
                    href=""
                    class="view-detail-btn"
                    @click.stop.prevent="openMenuTab(scope.row.productId)"
                  >
                    {{ scope.row.productName }}
                  </a>
                </el-tooltip>
              </template>
            </sample-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="serialNumber"
          label="产品编号"
          width="180"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="type"
          label="类型"
          width="180"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="customerName"
          label="客户"
        >
        </el-table-column>
        <el-table-column
          show-overflow-tooltip
          prop="createUserName"
          label="创建人"
        >
        </el-table-column>
      </template>

      <el-table-column show-overflow-tooltip prop="createTime" label="创建时间">
        <template slot-scope="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>
      <el-table-column
        show-overflow-tooltip
        prop="address"
        v-if="pageType == 'edit'"
        label="操作"
      >
        <template slot-scope="scope">
          <a href class="color-danger" @click.stop.prevent="dlete(scope.row)"
          >删除</a
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="table-footer comment-list-table-footer">
      <div class="comment-list-table-footer-info task-flex task-ai">
        共<span class="level-padding">{{ page.total || 0 }}</span
        >条
        <div class="task-font14 task-c6 task-ml12">
          每页
          <el-select
            v-model="searchModel.pageSize"
            placeholder="请选择"
            @change="handleSizeChange(searchModel.pageSize)"
            class="table-footer-select"
          >
            <el-option :label="10" :value="10"></el-option>
            <el-option :label="20" :value="20"></el-option>
            <el-option :label="50" :value="50"></el-option>
          </el-select>
          条
        </div>
      </div>
      <el-pagination
        v-if="page.list.length"
        class="comment-list-table-footer-pagination"
        background
        @current-change="jump"
        @size-change="handleSizeChange"
        :page-size="page.pageSize"
        :current-page="page.pageNum"
        layout="prev, pager, next, jumper"
        :total="page.total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import mixin from "./tableMixin.js";
import Page from "@model/Page";
import { formatDate } from "@src/util/lang";

import {
  getPageLinkPart,
  getPageLinkWiki,
  getPageLinkProduct,
  removePartOrWiki,
} from "@src/api/ProductV2Api";

export default {
  name: "product-menu-mini-table",
  props: {
    id: {
      type: Number | String,
    },
    pageType: {
      type: String,
      default: "view",
    },
    dataType: {
      type: String,
    },
  },
  filters: {
    formatDate(val) {
      if (!val) return "";
      return formatDate(val, "YYYY-MM-DD HH:mm:ss");
    },
  },
  mixins: [mixin],
  data() {
    return {
      searchModel: {
        pageSize: 10,
        pageNum: 1,
      },
      page: new Page(),
      fullscreenLoading: false,
      httpObj: {
        part: getPageLinkPart,
        wiki: getPageLinkWiki,
        product: getPageLinkProduct
      },
    };
  },
  mounted() {
    this.reflash();
  },
  methods: {
    // 搜索
    search() {
      this.fullscreenLoading = true;
      return this.httpObj[this.dataType]({ ...this.searchModel, id: this.id })
        .then((res) => {
          if (res.code == 0) {
            this.page = res.result;
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
    dlete(data) {
      this.$confirm(
        `此操作将删除该类型所关联的${
          this.dataType == "part" ? "备件" : "知识库"
        }?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          removePartOrWiki({
            id: this.id,
            relationId: data.id,
            type: this.dataType,
          }).then((res) => {
            if (res.code == 0) {
              this.reflash();
              window.parent.flashSomePage({
                type: "M_PRODUCT_CATALOG",
              });
            } else {
              this.$notify.close();
              this.$notify.error({
                title: "网络错误",
                message: res.message,
                duration: 2000,
              });
            }
          });
        })
        .catch(() => {});
    },
    // 页码数切换
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.searchModel.pageNum = 1;
      this.search();
    },
    // 跳转
    jump(pageNum) {
      this.searchModel.pageNum = pageNum;
      this.search();
    },
    reflash() {
      this.searchModel.pageSize = 10;
      this.searchModel.pageNum = 1;
      if(this.id){
        this.search();
      }
    },
    // 新页面打开通知公告详情
    openFrame(id) {
      let fromId = window.frameElement.getAttribute("id");

      this.$platform.openTab({
        id: `document_detail_${this.detail.id}`,
        title: "知识库列表",
        url: `/wiki/detail/page?wikiId=${this.detail.id}`,
        reload: true,
        close: true,
        fromId,
      });
    },
    openMenuTab(id) {
      let fromId = "";
      try {
        fromId = window.frameElement.getAttribute("id");
      } catch (error) {}
      this.$platform.openTab({
        id: `${
          this.dataType == "part"
            ? "partV2_category_detail_" : this.dataType == "wiki"
              ? "document_detail_" : "product_detail_"
        }${id}`,
        title: `${
          this.dataType == "part"
            ? "备件品类详情" : this.dataType == "wiki"
              ? "知识库详情" : "产品详情"
        }`,
        close: true,
        url: `${
          this.dataType == "part"
            ? "/partV2/category/detail?id=" : this.dataType == "wiki"
              ? "/wiki/detail/page?wikiId=" : "/customer/product/view/"
        }${id}`,
        fromId,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.table-footer {
  margin-top: 12px;
}
</style>
