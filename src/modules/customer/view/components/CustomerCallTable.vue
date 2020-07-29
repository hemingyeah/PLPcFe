<template>
  <div class="customer-product-table-container">
    <el-table stripe :data="callList" :highlight-current-row="false" header-row-class-name="customer-product-table-header" row-class-name="customer-product-table-row" class="customer-product-table">
      <el-table-column v-for="column in columns" :key="column.field" :label="column.label" :prop="column.field" :width="column.width"
                       :class-name="column.field == 'name' ? 'customer-product-name-superscript-td' : ''" :sortable="column.sortable" :show-overflow-tooltip="column.field !== 'name'" :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'linkmanName'">
            {{scope.row.customerInfo && scope.row.customerInfo.linkmanName }}
          </template>
          <template v-else-if="column.field === 'agentname'">
            {{scope.row.agentInfo && scope.row.agentInfo.agentName}}
          </template>
          <template v-if="column.field === 'remarkStatus'">
            {{scope.row[column.field] == 1 ? '已解决' : (scope.row[column.field] == 0 ? '未解决' : '')}}
          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="product-table-footer">
      <p class="total-count">共<span>{{paginationInfo.totalItems}}</span>条记录</p>
      <el-pagination v-if="paginationInfo.totalItems" class="customer-product-table-pagination" background @current-change="jump" :page-size="paginationInfo.pageSize" :current-page="paginationInfo.pageNum"
                     layout="prev, pager, next" :total="paginationInfo.totalItems">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'customer-call-table',
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      callList: [],
      columns: this.buildColumns(),
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0
      }
    }
  },
  computed: {
    customerId() {
      return this.shareData.customer ? this.shareData.customer.id : '';
    },
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    jump(pN) {
      this.paginationInfo.pageNum = pN
      this.fetchData()
    },
    fetchData() {
      const params = {
        customerId: this.customerId,
        page: this.paginationInfo.pageNum,
        pageSize: this.paginationInfo.pageSize
      }

      this.$http.get('/api/callcenter/outside/callcenter/callrecord/page4CallTab', params)
        .then(res => {
          this.callList = res.result && res.result.list
          this.paginationInfo.totalItems = res.result.total
        })
        .catch(e => console.error('fetchData product caught e', e))
    },
    buildColumns() {
      return [
        {
          label: '通话ID',
          field: 'recordId',
          show: true
        },
        {
          label: '联系人',
          field: 'linkmanName',
          show: true
        },
        {
          label: '接待坐席',
          field: 'agentname',
          show: true
        },
        {
          label: '来去电时间',
          field: 'ring',
          show: true
        },
        {
          label: '呼叫类型',
          field: 'callTypeDisplayName',
          show: true
        },
        {
          label: '咨询分类',
          field: 'zxCategoryName',
          show: true
        },
        {
          label: '处理状态',
          field: 'remarkStatus',
          show: true
        }
      ]
    }
  }
}
</script>

<style lang="scss">
.customer-product-table-container {
  padding: 10px 10px 10px 5px;

  .product-link {
    color: $color-primary;
  }

  .customer-product-table-header th {
    background: #f5f5f5;
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