<template>
  <div class="customer-product-table-container">
    <el-table
      stripe
      :data="productList"
      :highlight-current-row="false"
      header-row-class-name="customer-product-table-header"
      row-class-name="customer-product-table-row"
      class="customer-product-table">
      <el-table-column
        v-for="column in columns"
        v-if="column.show"
        :key="column.field"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        show-overflow-tooltip
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'state'">
            {{scope.row[column.field]}}
          </template>
          <template v-else-if="column.field === 'name'">
            <a :href="`/customer/product/view/${scope.row.id}`" :data-id="scope.row.id" class="product-link">{{scope.row[column.field]}}</a>
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="customer-product-table-pagination"
      background
      @current-change="jump"
      :page-size="paginationInfo.pageSize"
      :current-page="paginationInfo.pageNum"
      layout="prev, pager, next"
      :total="paginationInfo.totalItems">
    </el-pagination>

  </div>
</template>

<script>
  import {formatDate,} from '@src/util/lang';

  export default {
    name: "customer-product-table",
    props: {
      shareData: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        productList: [],
        columns: this.buildColumns(),
        paginationInfo: {
          pageSize: 10,
          pageNum: 1,
          totalItems: 0,
        }
      }
    },
    computed: {
      customerId() {
        return this.shareData.customer ? this.shareData.customer.id : '';
      },
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      jump(pN) {
        this.paginationInfo.pageNum = pN;
        this.fetchData();
      },
      fetchData() {
        const params = {
          customerId: this.customerId,
          pageNum: this.paginationInfo.pageNum,
          pageSize: this.paginationInfo.pageSize,
        };

        this.$http.get('/v2/customer/product/list', params)
        .then(res => {
          this.productList = res.list
          .map(product => {
            product.createTime = formatDate(new Date(product.createTime), 'YYYY-MM-DD HH:mm:ss');
            return Object.freeze(product);
          });
          this.paginationInfo.totalItems = res.total;
        })
      },
      buildColumns() {
        return [{
          label: '名称',
          field: 'name',
          show: true,
        }, {
          label: '产品编号',
          field: 'serialNumber',
          show: true,
        }, {
          label: '类型',
          field: 'type',
          show: true,
        }, {
          label: '创建时间',
          field: 'createTime',
          show: true,
        }]
      }
    },
  }
</script>

<style lang="scss">

  .customer-product-table-container {
    padding: 15px 15px 15px 5px;

    .product-link {
      color: $color-primary;
    }

    .customer-product-table-header th{
      background: #F5F5F5;
      line-height: 37px;
      font-size: 14px;
      color: $text-color-primary;
      font-weight: normal;
    }

    .customer-product-table-row .cell {
      line-height: 37px;
      font-size: 14px;
    }

    .customer-product-table-pagination {
      text-align: right;
      margin-top: 7px;
    }
  }
</style>