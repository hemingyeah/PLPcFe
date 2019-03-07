<template>
  <div class="performance-list-container" v-loading="loading">
    <form class="base-search" onsubmit="return false;">
      <div class="search-group">
        <el-input v-model="params.keyword" placeholder="根据绩效名称搜索">
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <base-button type="primary" @event="search({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
        <base-button type="ghost" @event="resetParams">重置</base-button>
      </div>
      <span class="advanced-search-visible-btn" @click="advancedSearchPanelShow = !advancedSearchPanelShow">高级搜索</span>
    </form>

    <div class="advanced-search">
      <h4>高级搜索</h4>
      <form class="advanced-search-form" onsubmit="return false;">
        <form-item label="绩效类型">
          <el-input v-model="params.keyword" placeholder="根据绩效名称搜索">
          </el-input>
        </form-item>
        <form-item label="创建时间">
          <el-date-picker
            v-model="params.createTime"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="createTimePickerOptions">
          </el-date-picker>
        </form-item>
      </form>
      <div class="btn-group">
        <base-button type="primary" @event="search({ pageNum: 1, }, true)" native-type="submit">搜索</base-button>
        <base-button type="ghost" @event="resetParams">重置</base-button>
      </div>
    </div>

    <div class="performance-list">
      <div class="operation-bar-container">
        <div class="top-btn-group">
          <base-button type="primary" icon="icon-add" @event="openDialog">新建</base-button>
          <base-button type="ghost" icon="icon-yemianshanchu" @click="deleteReport">删除</base-button>
          <a href="https://help.shb.ltd/doc?id=10501#Performance_report">如何通过绩效报告统计团队或个人数据？</a>
        </div>


        <div class="action-button-group">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link el-dropdown-btn">
              更多操作
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <div >导出</div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div >导出全部</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown :hide-on-click="false" :show-timeout="150" trigger="click">
            <span class="el-dropdown-link el-dropdown-btn">
              选择列
              <i class="iconfont icon-nav-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown" class="customer-columns-dropdown-menu">
              <el-dropdown-item v-for="item in columns" :key="item.field">
                <el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label"/>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>


      </div>


      <el-table
        :data="reports"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        ref="multipleTable" class="">

        <el-table-column type="selection" width="48" align="center"></el-table-column>
        <el-table-column
          v-for="column in columns"
          v-if="column.show"
          :key="column.field"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          show-overflow-tooltip
        >

          <template slot-scope="scope">
            <template v-if="column.field === 'cycle'">
              {{scope.row.startTime}} ~ {{scope.row.endTime}}
            </template>
            <template v-else-if="column.field === 'action'">
              <el-button plain @click="viewDetail(scope.row)" size="small">查看</el-button>
            </template>
            <template v-else>
              {{scope.row[column.field]}}
            </template>
          </template>
        </el-table-column>

      </el-table>

      <el-pagination
        class="customer-table-pagination"
        background
        @current-change="jump"
        @size-change="handleSizeChange"
        :page-sizes="[10, 20, 50]"
        :page-size="paginationInfo.pageSize"
        :current-page="paginationInfo.pageNum"
        layout="sizes, prev, pager, next, jumper"
        :total="paginationInfo.totalItems">
      </el-pagination>



    </div>
    <edit-performance-report-dialog :init-data="initData" @refresh-list="search" ref="reportDialog" />
  </div>
</template>

<script>
import { formatDate, } from '@src/util/lang';
import {getPerformanceReports, deletePerformanceReports} from '@src/api/PerformanceApi';

import EditPerformanceReportDialog from './components/EditPerformanceReportDialog.vue';

export default {
  name: "list-view",
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    }
  },
  data() {
    return {
      createTimePickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      loading: false,
      advancedSearchPanelShow: false,
      columns: this.buildColumns(),
      multipleSelection: [],
      reports: [],
      params: {
        keyword: '',
        createTime: '',
      },
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
      },
    }
  },
  mounted() {

    console.log('mounted this.initData', this.initData);
    this.search();
  },
  methods: {
    async deleteReport() {
      if (!this.multipleSelection.length) {
        return this.$platform.alert('请选择需要删除的绩效报告');
      }
      try {
        if (!await this.$platform.confirm('确定要删除选择的绩效报告？')) return;

        deletePerformanceReports({
          ids: this.multipleSelection,
        })
          .then(res => {
            this.multipleSelection = [];
            this.search();
          })
          .catch(err => console.error('deleteCustomer err', err));
      } catch (e) {
        console.error('catch error', e);
      }


    },
    viewDetail(row) {
      // 新开tab 打开 /performance/report?id=623
      let fromId = window.frameElement.getAttribute('id');

      this.$platform.openTab({
        id: `performanceReport${row.id}`,
        title: '绩效报告详情',
        close: true,
        url: `/setting/performance/v2/report/detail/${row.id}`,
        fromId: fromId
      })

    },
    openDialog() {
      console.log('openDialog')
      this.$refs.reportDialog.toggleDialog();
    },
    handleSelection(selection) {

      console.log('selection', selection);
      this.multipleSelection = selection
        .map(({id}) => id);
    },
    jump() {

    },
    handleSizeChange() {

    },
    modifyColumnStatus(val, column) {
      this.columns = this.columns
        .map(c => {
          if (c.field === column.field) {
            c.show = val;
          }
          return c;
        });
      let columnIsShow = this.columns.filter(c => c.show).map(c => c.field);

      console.log('this.columns', this.columns);

      this.saveDataToStorage('columnStatus', columnIsShow);
    },
    init() {
      console.log('init');
    },
    search() {


      // /performance/v2/list/report
      let params = {
        // ...this.params
        pageSize: 10,
        pageNum: 1
      };
      this.loading = true;

      getPerformanceReports(params)
        .then(res => {

          this.loading = false;
          console.log('res', res);
          this.reports = res.data.reportList.list
            .map(({users, createUserName, createTime, startTime, endTime, type, reportName, ruleIds, id}) => Object.freeze({
              reportName,
              ruleIds: ruleIds.replace(/\[|\]/g, ''),
              users: users.replace(/\[|\]/g, ''),
              createUser: createUserName,
              createTime: formatDate(new Date(createTime), 'YYYY-MM-DD'),
              startTime: formatDate(new Date(startTime), 'YYYY-MM-DD'),
              endTime: formatDate(new Date(endTime), 'YYYY-MM-DD'),
              type: type ? '按团队' : '按个人',
              id
            }))
        })
        .catch(e => console.error('e', e));

    },
    resetParams() {

    },
    // todo 把之前的column状态迁移过来
    buildColumns() {
      let storage = this.getLocalStorageData();
      let columnIsShow = storage.columnStatus || [];

      return [
        {
          label: '类型',
          field: 'type',
          show: false,
          width: '70px'
        },
        {
          label: '名称',
          field: 'reportName',
          show: true
        },
        {
          label: '创建时间',
          field: 'createTime',
          show: true,
          width: '100px',
        },
        {
          label: '对象',
          field: 'users',
          show: true
        },
        {
          label: '周期',
          field: 'cycle',
          show: true
        },
        {
          label: '操作人',
          field: 'createUser',
          show: true,
          width: '100px'
        },
        {
          label: '统计规则',
          field: 'ruleIds',
          show: true
        },
        {
          label: '报告',
          field: 'action',
          show: true,
          width: '100px',
        }
      ].map(c => ({
        ...c,
        show: columnIsShow.some(key => key === c.field)
      }));
    },
    saveDataToStorage(key, value) {
      const data = this.getLocalStorageData();
      data[key] = value;
      localStorage.setItem('performance_storage_data_2019_02_28', JSON.stringify(data));
    },
    getLocalStorageData() {
      const dataStr = localStorage.getItem('performance_storage_data_2019_02_28') || '{}';
      return JSON.parse(dataStr);
    },
  },
  components: {
    [EditPerformanceReportDialog.name]: EditPerformanceReportDialog
  }
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

  html, body, .performance-list-container {
    height: 100%;
  }

  .performance-list-container {
    padding: 10px;

    .advanced-search, .base-search {
      background: #fff;
      border-radius: 3px;
      padding: 12px 10px;
    }

    .base-search {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;

      .search-group {
        display: flex;
        justify-content: space-between;
        width: 440px;
        .el-input {
          width: 300px;
          input {
            height: 34px;
            line-height: 34px;
            width: 300px;
          }
        }
      }

      .advanced-search-visible-btn {
        font-size: 14px;
        font-weight: lighter;
        line-height: 32px;
        color: $color-primary;
        border-color: $color-primary;
        background: #fff;
        padding: 0 13px;
        &:hover {
          cursor: pointer;
        }
      }
    }

    .advanced-search {
      padding-top: 0;
      margin-bottom: 10px;
      h4 {
        border-bottom: 1px solid #f4f4f4;
        line-height: 40px;
        font-size: 14px;
        margin: 0;
      }
      .el-input {
        width: 350px;
      }

      .advanced-search-form {
        .btn-group {
          display: flex;
          justify-content: flex-end;
        }
      }

    }

    .operation-bar-container {
      background: #fff;
      border-radius: 3px 3px 0 0;
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #f2f2f2;

      .top-btn-group .base-button {
        margin-right: 5px;
      }

      .action-button-group {
        .base-button {
          margin-left: 5px;
        }
      }

      .el-dropdown-btn {
        padding: 0 15px;
        line-height: 32px;
        display: inline-block;
        background: $color-primary-light-9;
        color: $text-color-primary;
        outline: none;
        margin-left: 5px;
        .iconfont {
          margin-left: 5px;
          font-size: 12px;
        }

        &:hover {
          cursor: pointer;
          color: #fff;
          background: $color-primary;
        }
      }
    }

    .performance-list {
      background: #fff;
    }

    .customer-table-pagination {
      text-align: right;
      padding: 10px 5px;
    }


  }

</style>