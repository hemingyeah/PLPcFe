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
          <template v-if="column.field === 'templateId'">
            {{scope.row.templateName}}
          </template>
          <template v-else-if="column.field === 'executor'">
            {{scope.row.executorName}}
          </template>
          <template v-else-if="column.field === 'eventNo'">
            <a :href="`/event/view/${scope.row.id}`" :data-id="scope.row.id" @click="openDetail" class="event-link">{{scope.row[column.field]}}</a>
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
import {formatDate, } from '@src/util/lang';
import EventStateEnum from '@model/enum/EventStateEnum';
import platform from '@src/platform';

import { getEventOfProduct } from '@src/api/ProductApi';


export default {
  name: 'event-table',
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
    productId() {
      return this.shareData.product.id;
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
      let fromId = window.frameElement.getAttribute('id');
      // TODO: 统一id命名
      platform.openTab({
        id: `taskView_${ el.dataset.id}`,
        title: '正在加载',
        close: true,
        url: el.getAttribute('href'),
        fromId
      });
    },
    jump(pN) {
      this.searchModel.pageNum = pN;
      this.fetchData();
    },
    fetchData() {
      const {pageNum, pageSize, orderDetail, } = this.searchModel;
      const params = {
        productId: this.productId,
        pageNum,
        pageSize,
      };

      if (Object.keys(orderDetail).length) {
        params.orderDetail = orderDetail;
      }

      this.loading = true;
      getEventOfProduct(params)
        .then(res => {
          if (!res) return;
          this.eventList = res.list
            .map(event => {
              event.createTime = formatDate(new Date(event.createTime), 'YYYY-MM-DD HH:mm:ss');
              event.completeTime = event.completeTime && formatDate(new Date(event.completeTime), 'YYYY-MM-DD HH:mm:ss');
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
      }, {
        label: '完成时间',
        field: 'completeTime',
        show: true,
        sortable: 'custom',
      }, {
        label: '客户评价',
        field: 'suggestion',
        show: true,
        sortable: 'custom',
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
</style>