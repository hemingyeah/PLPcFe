<template>
  <div class="customer-event-table-container">
    <el-table
      stripe
      :data="eventList"
      :highlight-current-row="false"
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
          <template v-if="column.field === 'state'">
            {{scope.row[column.field]}}
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
    <el-pagination
      class="customer-event-table-pagination"
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
  import EventStateEnum from '@model/enum/EventStateEnum';

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
      openDetail(event){
        event.preventDefault();

        if (!window.frameElement) return;

        let el = event.target;
        var fromId = window.frameElement.getAttribute('id');

        parent.window.addTabs({
          id: "taskView_" + el.dataset.id,
          title: "正在加载",
          close: true,
          url: el.getAttribute('href'),
          fromId:fromId
        });
        parent.window.resizeFrame();
      },
      jump(pN) {
        this.paginationInfo.pageNum = pN;
        this.fetchData();
      },
      fetchData() {
        const params = {
          cusId: this.customerId,
          pageNum: this.paginationInfo.pageNum,
          pageSize: this.paginationInfo.pageSize,
        };

        this.$http.get('/v2/customer/event/list', params)
        .then(res => {
          this.eventList = res.list
          .map(event => {
            event.createTime = formatDate(new Date(event.createTime), 'YYYY-MM-DD HH:mm:ss');
            event.state = EventStateEnum.getName(event.state);
            return Object.freeze(event);
          });
          this.paginationInfo.totalItems = res.total;
        })
      },
      buildColumns() {
        return [{
          label: '事件编号',
          field: 'eventNo',
          show: true,
          // sortable: 'custom',
        }, {
          label: '事件类型',
          field: 'templateName',
          show: true,
        }, {
          label: '负责人',
          field: 'executorName',
          show: true,
        }, {
          label: '状态',
          field: 'state',
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

  .customer-event-table-container {
    
    .event-link {
      color: #2F93C0;
    }
    
    .customer-event-table-pagination {
      text-align: right;
      margin-top: 7px;
    }
  }
</style>