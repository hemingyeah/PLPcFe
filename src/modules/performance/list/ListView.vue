<template>
  <div class="performance-list-container">
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
          <base-button type="primary" icon="icon-add">新建</base-button>
          <base-button type="ghost" icon="icon-yemianshanchu" >删除</base-button>
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
                <el-checkbox :value="item.show" @input="modifyColumnStatus($event, item)" :label="item.label" :disabled="item.field == 'name'"/>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>


      </div>


      <el-table
        :data="list"
        stripe
        @select="handleSelection"
        @select-all="handleSelection"
        ref="multipleTable" class="">

        <el-table-column type="selection" width="48" align="center" class-name="select-column"></el-table-column>
        <el-table-column
          v-for="column in columns"
          v-if="column.show"
          :key="column.field"
          :label="column.label"
          :prop="column.field"
          :width="column.width"
          :min-width="column.minWidth || '120px'"
          show-overflow-tooltip
          :align="column.align"></el-table-column>

      </el-table>

      <el-pagination
        class="customer-table-pagination"
        background
        @current-change="jump"
        @size-change="handleSizeChange"
        :page-sizes="[10, 20, 50]"
        :page-size="paginationInfo.pageSize"
        :current-page="paginationInfo.pageNum"
        layout="prev, pager, next, sizes, jumper"
        :total="paginationInfo.totalItems">
      </el-pagination>



    </div>
  </div>
</template>

<script>
export default {
  name: "list-view",
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
      params: {
        keyword: '',
        createTime: '',
      },
      paginationInfo: {
        pageSize: 10,
        pageNum: 1,
        totalItems: 0,
      },
      list: [],
    }
  },
  mounted() {

    console.log('mounted');
    this.fetchReport();
  },
  methods: {
    handleSelection() {

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
      this.saveDataToStorage('columnStatus', columnIsShow);
    },
    init() {
      console.log('init');
    },
    search() {

    },
    fetchReport() {
      // /performance/v2/list/report
      let params = {
        // ...this.params
        pageSize: 10,
        pageNum: 1
      };

      this.$http.get('/performance/v2/list/report', params)
        .then(res => {

          console.log('res', res);
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
          field: 'ptype',
          show: true,
          width: '100px'
        },
        {
          label: '名称',
          field: 'pname',
          show: true
        },
        {
          label: '创建时间',
          field: 'createTime',
          show: true
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
          show: true
        },
        {
          label: '统计规则',
          field: 'ruleName',
          show: true
        }
      ].map(c => {

        if (columnIsShow.some(key => key === c.field)) {
          c.show = true;
        } else {
          c.show = false;
        }

        return c;
      })
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
}
</script>

<style lang="scss">
  $color-primary-light-9: mix(#fff, $color-primary, 90%) !default;

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