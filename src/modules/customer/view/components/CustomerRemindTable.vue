<template>
  <div class="customer-remind-table-container">
    <el-table
      stripe
      :data="remindList"
      :highlight-current-row="false"
      header-row-class-name="customer-remind-table-header"
      row-class-name="customer-remind-table-row"
      class="customer-remind-table">
      <el-table-column
        v-for="column in columns"
        v-if="column.show"
        :key="column.field"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.tooltip"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'remindName'">
            <a href="javascript:;" class="edit-btn" @click="$eventBus.$emit('customer_detail_view.update_remind', scope.row)">{{scope.row.remind.name}}</a>
          </template>
          <template v-else-if="column.field === 'remindTime'">
            {{scope.row.remind.remindTime || '无'}}
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
    <el-pagination
      class="customer-remind-table-pagination"
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
    this.$eventBus.$on('customer_remind_table.update_remind_list', this.fetchData);
  },
  beforeDestroy() {
    this.$eventBus.$off('customer_remind_table.update_remind_list', this.fetchData);
  },
  methods: {
    async deleteRemind(rm) {
      try {
        const action = await this.$platform.confirm(`确定删除 ${rm.remind.name}`);
        if (!action) return;
        this.pending[rm.id] = true;

        await this.$http.get(`/scheduler/delete/${rm.id}`);
        this.fetchData();
        this.$eventBus.$emit('customer_info_record.update_record_list');
      } catch (e) {
        console.error('deleteRemind catch err', e);
      }
    },
    jump(pN) {
      this.paginationInfo.pageNum = pN;
      this.fetchData();
    },
    fetchData() {
      const params = {
        modalId: this.customerId,
        modal: 'customer'
      };
      this.$http.get('/customer/remind/list', params)
        .then(res => {
          this.remindList = res
            .map(rm => {
              this.$set(this.pending, rm.id, false);
              return Object.freeze(rm);
            });
        })
    },
    buildColumns() {
      return [{
        label: '提醒名称',
        field: 'remindName',
        show: true,
        tooltip: true,
        // sortable: 'custom',
      }, {
        label: '预计发生时间',
        field: 'remindTime',
        show: true,
        tooltip: true
      }, {
        label: '提醒内容',
        field: 'remindContent',
        show: true,
        tooltip: true
      }, {
        label: '操作',
        field: 'action',
        show: true,
        tooltip: false
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
      font-weight: normal;
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
  }
</style>