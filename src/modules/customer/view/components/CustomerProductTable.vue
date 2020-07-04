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
        v-for="(column, index) in columns"
        v-if="column.show"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :class-name="column.field == 'name' ? 'customer-product-name-superscript-td' : ''"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.field !== 'name'"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'state'">
            {{scope.row[column.field]}}
          </template>
          <template v-else-if="column.field === 'name'">

            <sample-tooltip :row="scope.row">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                    <a 
                        href="" 
                        :data-id="scope.row.id" 
                        @click.prevent="createProductTab(scope.row.id)" 
                        class="product-link"
                      >
                      {{scope.row[column.field]}}
                    </a>
                  </el-tooltip>
                </template>
              </sample-tooltip>
            
          </template>
          <template v-else-if="column.field == 'address' && scope.row[column.field]">
            {{getAddress(scope.row[column.field])}}
          </template>
          <template v-else-if="column.field == 'linkman' && scope.row[column.field]">
            {{scope.row[column.field].name}}
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="product-table-footer">
      <p class="total-count">共<span>{{paginationInfo.totalItems}}</span>条记录</p>
      <el-pagination
        v-if="paginationInfo.totalItems"
        class="customer-product-table-pagination"
        background
        @current-change="jump"
        :page-size="paginationInfo.pageSize"
        :current-page="paginationInfo.pageNum"
        layout="prev, pager, next"
        :total="paginationInfo.totalItems">
      </el-pagination>
    </div>
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
    getAddress(field) {
      return field.province + field.city + field.dist + field.address || ''
    },
    createProductTab(productId){
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `product_view_${productId}`,
        title: '产品信息',
        close: true,
        url: `/customer/product/view/${productId}?noHistory=1`,
        fromId: fromId
      })
    },
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

      this.$http.get('/product/getProductByPage', params)
        .then(res => {
          this.productList = res.list
            .map(product => {
              product.createTime = formatDate(new Date(product.createTime), 'YYYY-MM-DD HH:mm:ss');
              return Object.freeze(product);
            });
          this.paginationInfo.totalItems = res.total;

          if(!this.productList[0].linkmanName) this.columns[3].show = false;
          if(!this.productList[0].addressName) this.columns[4].show = false;
          
        })
        .catch(e => console.error('fetchData product caught e', e));
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
        label: '默认联系人',
        field: 'linkmanName',
        show: true,
      }, {
        label: '产品地址',
        field: 'addressName',
        show: true,
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        width: '150px'
      }]
    }
  },
}
</script>

<style lang="scss">

  .customer-product-table-container {
    padding: 10px 10px 10px 5px;

    .product-link {
      color: $color-primary;
    }

    .customer-product-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .customer-product-table-pagination {
      text-align: right;
      margin-top: 7px;
    }

    .product-table-footer {
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

  td.customer-product-name-superscript-td {
    padding: 0 !important;

    & > .cell {
      padding-left: 0 !important;
    }

    & > div {
      height: 43px;
      line-height: 43px !important;
      a {
        display: inline-block;
        height: 43px;
        line-height: 43px;
      }
    }

  }
</style>