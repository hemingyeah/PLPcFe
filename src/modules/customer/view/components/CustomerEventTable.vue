<template>
  <div class="customer-event-table-container">
    <el-table
      stripe
      :data="eventList"
      :highlight-current-row="false"
      header-row-class-name="customer-event-table-header"
      row-class-name="customer-event-table-row"
      @sort-change="sortChange"
      v-loading="loading"
      class="customer-event-table">
      <el-table-column
        v-for="(column, index) in columns"
        v-if="column.show"
        :key="`${column.field}_${index}`"
        :label="column.label"
        :prop="column.field"
        :width="column.width"
        :class-name="column.field == 'eventNo' ? 'customer-event-name-superscript-td' : ''"
        :sortable="column.sortable"
        :show-overflow-tooltip="column.field !== 'eventNo'"
        :align="column.align">
        <template slot-scope="scope">
          <template v-if="column.field === 'templateId'">
            {{scope.row.templateName}}
          </template>
          <template v-else-if="column.field === 'executor'">
            {{scope.row.executorName}}
          </template>
          <template v-else-if="column.field === 'eventNo'">

              <sample-tooltip :row="scope.row">
                <template slot="content" slot-scope="{isContentTooltip}">
                  <el-tooltip :content="scope.row[column.field]" placement="top" :disabled="!isContentTooltip">
                    <a 
                      :href="`/event/view/${scope.row.id}`" 
                      :data-id="scope.row.id" 
                      @click="openDetail" 
                      class="event-link">
                      {{scope.row[column.field]}}
                    </a>
                  </el-tooltip>
                </template>
              </sample-tooltip>

          </template>
          <template v-else>
            {{scope.row[column.field]}}
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="event-table-footer">
      <p class="total-count">共<span>{{searchModel.totalItems}}</span>条记录</p>
      <el-pagination
        v-if="searchModel.totalItems"
        class="customer-event-table-pagination"
        background
        @current-change="jump"
        :page-size="searchModel.pageSize"
        :current-page="searchModel.pageNum"
        layout="prev, pager, next"
        :total="searchModel.totalItems">
      </el-pagination>
    </div>

  </div>
</template>

<script>
import {formatDate,} from '@src/util/lang';
import EventStateEnum from '@model/enum/EventStateEnum';
import platform from '@src/platform';

export default {
  name: "customer-event-table",
  props: {
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      eventList: [],
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
    openDetail(event){
      event.preventDefault();
      if (!window.frameElement) return;

      let el = event.target;
      var fromId = window.frameElement.getAttribute('id');
      //TODO: 统一id命名
      platform.openTab({
        id: "taskView_" + el.dataset.id,
        title: "正在加载",
        close: true,
        url: el.getAttribute('href'),
        fromId: fromId
      });
    },
    jump(pN) {
      this.searchModel.pageNum = pN;
      this.fetchData();
    },
    fetchData() {
      const {pageNum, pageSize, orderDetail,} = this.searchModel;
      const params = {
        cusId: this.customerId,
        pageNum,
        pageSize,
      };

      if (Object.keys(orderDetail).length) {
        params.orderDetail = orderDetail;
      }

      this.loading = true;
      this.$http.get('/customer/event/list', params)
        .then(res => {
          if (!res) return;
          this.eventList = res.list
            .map(event => {
              event.createTime = formatDate(new Date(event.createTime), 'YYYY-MM-DD HH:mm:ss');
              event.state = EventStateEnum.getName(event.state);
              return Object.freeze(event);
            });
          this.searchModel.totalItems = res.total;
          this.loading = false;
        })
        .catch(e => console.error('fetch event caught e', e));
    },
    buildColumns() {
      return [{
        label: '事件编号',
        field: 'eventNo',
        show: true,
      }, {
        label: '事件类型',
        field: 'templateId',
        show: true,
        sortable: 'custom'
      }, {
        label: '负责人',
        field: 'executor',
        show: true,
        sortable: 'custom'
      }, {
        label: '状态',
        field: 'state',
        show: true,
        width: '70px',
        sortable: 'custom'
      }, {
        label: '创建时间',
        field: 'createTime',
        show: true,
        width: '150px',
        sortable: 'custom'
      }]
    }
  },
}
</script>

<style lang="scss">

  .customer-event-table-container {
    padding: 10px 10px 10px 5px;
    
    .event-link {
      color: $color-primary;
    }

    .customer-event-table-header th{
      background: #F5F5F5;
      color: $text-color-primary;
    }

    .customer-event-table-pagination {
      text-align: right;
      margin-top: 7px;
    }

    .event-table-footer {
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

  td.customer-event-name-superscript-td {
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