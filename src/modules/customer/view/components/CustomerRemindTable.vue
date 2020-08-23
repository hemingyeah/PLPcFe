<template>
  <div class="customer-remind-table-container">
    <el-table
      stripe
      :data="remindList"
      :highlight-current-row="false"
      header-row-class-name="customer-remind-table-header"
      row-class-name="customer-remind-table-row"
      @sort-change="sortChange"
      v-loading="loading"
      class="customer-remind-table">
      <el-table-column
        v-for="(column, index) in columns"
        v-if="column.show"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.tooltip"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'remind.name'">
            <a href="javascript:;" class="edit-btn" @click="$eventBus.$emit('customer_detail_view.update_remind', scope.row)">{{scope.row.remind.name}}</a>
          </template>
          <template v-else-if="column.field === 'remindTime'">
            {{scope.row.remindTime || '无'}}
          </template>
          <template class="rm-action" v-else-if="column.field === 'action'">
            <el-button type="text" @click="deleteRemind(scope.row)" :disabled="pending[scope.row.id]"
                       class="delete-remind-btn" size="mini">删除
            </el-button>
          </template>

          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <p class="total-count">共<span>{{remindList.length}}</span>条记录</p>
  </div>
</template>

<script>
import {formatDate,} from '@src/util/lang';
import * as CustomerApi from '@src/api/CustomerApi';

export default {
  name: "customer-remind-table",
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pending: {},
      remindList: [],
      columns: this.buildColumns(),
      loading: false,
      searchModel: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
        orderDetail: {}
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
    this.$eventBus.$on('customer_remind_table.update_remind_list', this.fetchData);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_remind_table.update_remind_list', this.fetchData);
  },
  methods: {
    sortChange({ prop, order, }) {
      this.searchModel.orderDetail = {
        column: prop,
        sequence: order === 'ascending' ? 'ASC' : 'DESC',
        isSystem: 1,
      };
      this.fetchData();
    },
    async deleteRemind(rm) {
      try {
        const action = await this.$platform.confirm(`确定删除 ${rm.remind.name}`);
        if (!action) return;
        this.pending[rm.id] = true;

        await this.$http.get(`/scheduler/delete/${rm.id}`);
        this.fetchData();
        this.$eventBus.$emit('customer_info_record.update_record_list');
        this.$eventBus.$emit('customer_detail_view.update_statistical_data');
      } catch (e) {
        console.error('deleteRemind catch err', e);
      }
    },
    jump(pN) {
      this.searchModel.pageNum = pN;
      this.fetchData();
    },
    fetchData() {
      const {orderDetail,} = this.searchModel;
      const params = {
        modalId: this.customerId,
        modal: 'customer',
      };

      if (Object.keys(orderDetail).length) {
        params.orderDetail = orderDetail;
      }

      this.loading = true;

      CustomerApi.getRemindOfCustomer(params)
        .then(res => {
          if (!res) return;

          this.remindList = res
            .map(rm => {
              this.$set(this.pending, rm.id, false);
              return Object.freeze(rm);
            });
          this.loading = false;
        })
        .catch(e => {
          this.loading = false;
          console.error('e', e);
        })
    },
    buildColumns() {
      return [{
        label: '提醒名称',
        field: 'remind.name',
        show: true,
        tooltip: true,
        sortable: 'custom',
      }, {
        label: '预计发生时间',
        field: 'remindTime',
        show: true,
        tooltip: true,
        sortable: 'custom',
      }, {
        label: '提醒内容',
        field: 'remindContent',
        show: true,
        tooltip: true,
        sortable: 'custom',
      }, {
        label: '操作',
        field: 'action',
        show: true,
        tooltip: false,
        width: '80px',
      }]
    }
  },
}
</script>

<style lang="scss">
  .customer-remind-table-container {

    padding: 10px 10px 10px 5px;
    .edit-btn {
      color: $color-primary;
    }

    .customer-remind-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .delete-remind-btn {
      color: $color-danger;
    }

    .delete-remind-btn.is-disabled,
    .delete-remind-btn.is-disabled:hover,
    .el-button.delete-remind-btn:focus {
      color: #c0c4cc;
      cursor: not-allowed;
      background-image: none;
    }

    .customer-remind-table-pagination {
      text-align: right;
      margin-top: 7px;
    }

    .total-count {
      line-height: 30px;
      padding: 0 10px;
      font-size: 12px;
      span {
        padding: 0 5px;
        color: $color-primary;
      }
    }
  }
</style>