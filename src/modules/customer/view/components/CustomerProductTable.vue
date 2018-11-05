<template>
  <div class="customer-product-table-container">
    <el-table
      stripe
      :data="productList"
      :highlight-current-row="false"
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
            <a :href="`/customer/product/view/${scope.row.id}`" :data-id="scope.row.id">{{scope.row[column.field]}}</a>
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
          customerId: this.shareData.customerId,
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
          // sortable: 'custom',
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
    .customer-product-table-pagination {
      text-align: right;
    }
  }
</style>