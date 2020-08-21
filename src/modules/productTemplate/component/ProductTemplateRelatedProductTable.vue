<template>
  <div class="product-template-related-product-view">

    <!-- start 相关产品表格 -->
    <el-table
      stripe
      :data="productList"
      :highlight-current-row="false"
      header-row-class-name="product-related-table-header"
      row-class-name="product-related-table-row"
      @sort-change="sortChange"
      v-loading="loading"
      class="product-related-table">
      <!-- start 列 -->
      <el-table-column
        v-for="column in columns"
        v-if="column.show"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        show-overflow-tooltip
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'name'">
            <a :href="`/customer/product/view/${scope.row.id}?noHistory=1`" :data-id="scope.row.id" @click="openProductDetail" class="product-link">{{ scope.row[column.field] }}</a>
          </template>
          <template v-else-if="column.field === 'customerName'">
            <a :href="`/customer/view/${scope.row.customerId}`" :data-id="scope.row.id" @click="openCustomerDetail" class="product-link">{{ scope.row[column.field] }}</a>
          </template>
          <template v-else>
            {{ scope.row[column.field] }}
          </template>
        </template>
      </el-table-column>
      <!-- end 列 -->
    </el-table>
    <!-- end 相关产品表格 -->

    <!-- start 表格底部 分页 -->
    <div class="product-related-table-footer">
      <p class="total-count">共<span>{{searchModel.totalItems}}</span>条记录</p>
      <el-pagination
        v-if="searchModel.totalItems"
        class="product-related-table-pagination"
        background
        @current-change="jump"
        :page-size="searchModel.pageSize"
        :current-page="searchModel.pageNum"
        layout="prev, pager, next"
        :total="searchModel.totalItems">
      </el-pagination>
    </div>
    <!-- end 表格底部 分页 -->

  </div>
</template>

<script>

import platform from '@src/platform';
import { formatDate } from '@src/util/lang';
import { productTemplateRelatedProducts } from '@src/api/ProductApi.js';

export default {
  name: 'product-template-related-product-table',
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columns: this.buildColumns(),
      loading: false, // 加载状态
      productList: [], // 产品列表
      searchModel: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
        orderDetail: {}
      }
    }
  },
  mounted () {
    this.fetchData();
  },
  methods: {
    // 构建表格列
    buildColumns() {
      return [{
        label: '产品名称',
        field: 'name',
        show: true,
        sortable: 'custom',
      }, {
        label: '产品编号',
        field: 'serialNumber',
        show: true,
        sortable: 'custom',
      }, {
        label: '客户名称',
        field: 'customerName',
        show: true,
        sortable: 'custom',
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        sortable: 'custom',
      }]
    },
    // 获取数据
    async fetchData() {
      const {pageNum, pageSize, orderDetail} = this.searchModel;
      const params = {
        templateId: this.shareData.productTemplate.id,
        pageNum,
        pageSize,
      };

      if(Object.keys(orderDetail).length > 0) params.orderDetail = orderDetail;

      this.loading = true;
      try {
        let result = await productTemplateRelatedProducts(params);

        if(!result) return 

        this.productList = result.list.map(product => {
          product.createTime = formatDate(new Date(product.createTime), 'YYYY-MM-DD HH:mm:ss');
          return Object.freeze(product);
        });
        
        this.searchModel.totalItems = result.total;
        this.loading = false;

      } catch (err) {
        console.log('product-related-table fetch data err', err)
      }
    },
    jump(pageNum) {
      this.searchModel.pageNum = pageNum;
      this.fetchData();
    },
    // 打开客户详情
    openCustomerDetail(event) {
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;
      let fromId = window.frameElement.getAttribute('id');

      // TODO: 统一id命名
      platform.openTab({
        id: `customer_view_${el.dataset.id}`,
        title: '正在加载',
        close: true,
        url: el.getAttribute('href'),
        fromId,
      });
    },
    // 打开产品详情
    openProductDetail(event) {
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;
      let fromId = window.frameElement.getAttribute('id');

      // TODO: 统一id命名
      platform.openTab({
        id: `product_view_${el.dataset.id}`,
        title: '正在加载',
        close: true,
        url: el.getAttribute('href'),
        fromId,
      });
    },
    // 排序变化
    sortChange({ prop, order}) {
      this.searchModel.orderDetail = {
        column: prop === 'customerName' ? 'c.name' : `product.${prop}`,
        sequence: order === 'ascending' ? 'ASC' : 'DESC',
        isSystem: 1,
      };
      this.fetchData();
    }
  }
}
</script>

<style lang="scss">
.product-template-related-product-view {
    padding: 10px 10px 10px 5px;

    .product-link {
      color: $color-primary;
    }

    .product-related-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .product-related-table-pagination {
      text-align: right;
      margin-top: 7px;
    }

    .product-related-table-footer {
      display: flex;
      justify-content: space-between;

      .total-count {
        padding: 0 10px;
        font-size: 12px;
        margin: 0;
        line-height: 46px;
        span {
          padding: 0 5px;
          color: $color-primary;
        }
      }
    }
  }

</style>