<template>
  <div class="spare-parts">
    <!-- 头部搜索 -->
    <div class="task-flex task-ai">
      <div class="search-parts">
        <el-input v-model="searchParts" placeholder="请输入服务项目信息" />
      </div>
      <div class="select-state">
        <el-select v-model="selectState" placeholder="发布状态">
          <el-option
            v-for="item in selectStateList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <base-button type="primary" native-type="submit" class="task-ml12" @event="search">
        搜索
      </base-button>
      <base-button type="ghost" class="task-ml12" @event="initialization"> 重置 </base-button>
      <div class="task-span1" />
    </div>
    <!-- table -->
    <div class="task-mt12">
      <el-table
        stripe
        border
        :data="tableData"
        ref="multipleTable"
        header-row-class-name="common-list-table-header taks-list-table-header"
      >
        <el-table-column
          v-for="(item, index) in tableNames"
          :key="index"
          :label="item.displayName"
        >
          <template slot-scope="scope">
            <template v-if="item.fieldName === 'isShow'">
              <el-checkbox v-model="scope.row.isShow" @change="marketItem(scope.row.isShow, scope.row.id)"></el-checkbox>
            </template>
            <template v-else>{{ scope.row[item.fieldName] }}</template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div class="spare-parts-foot task-flex task-ai">
      <div class="task-span1"></div>

      <el-pagination
        class="comment-list-table-footer-pagination"
        background
        :page-sizes="[10, 20, 50]"
        :page-size="params.pageSize"
        :total="pagination.total"
        :current-page="params.pageNum"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        layout="prev, pager, next, sizes, jumper"
      >
      </el-pagination>
    </div>
  </div>
</template>
<script>
// api
import * as SettingApi from "@src/api/SettingApi";

// 发布状态
const STATELIST = [
  {
    value: 0,
    label: "全部",
  },
  {
    value: 1,
    label: "未发布",
  },
  {
    value: 2,
    label: "已发布",
  },
];

// table名称
const TABLENAME = [
  {
    displayName: "编号",
    fieldName: "serialNumber",
  },
  {
    displayName: "服务项目名称",
    fieldName: "name",
  },
  {
    displayName: "类别",
    fieldName: "type",
  },
  {
    displayName: "单位",
    fieldName: "unit",
  },
  {
    displayName: "销售价",
    fieldName: "salePrice",
  },
  {
    displayName: "出库价",
    fieldName: "costPrice",
  },
  {
    displayName: "发布/取消",
    fieldName: "isShow",
  },
];

export default {
  name: "service",
  data() {
    return {
      params: {
        pageNum: 1,
        pageSize: 10,
      }, // 列表请求参数
      pagination: {}, //分页
      searchParts: "", // 搜索备件信息
      selectState: "", //状态
      selectStateList: STATELIST,
      tableNames: TABLENAME,
      tableData: [],
    };
  },
  mounted() {
    this.serviceList();
  },
  methods: {
    /*列表 */
    async serviceList() {
      const params = {
        ...this.params,
      };
      const { list, total, pageNum, pageSize } = await SettingApi.serviceList(
        params
      );

      this.pagination = {
        total,
        pageNum,
        pageSize,
      };

      this.tableData = list.map((item) => {
        item.isShow = item.isShow ? true : false;
        return item;
      });
    },
    /*是否发布 */
    async marketItem(value, id) {
      const params = {
        type: '服务',
        id,
        isShow: value ? 1 : 0
      }
      const {} = await SettingApi.marketItem(params)
    },
    search() {
      const {selectState, searchParts} = this
      this.params.pageNum = 1
      this.params.isShow = selectState ? selectState - 1 : ''
      this.params.keyWord = searchParts
      this.serviceList()
    },
    /** 初始化 */
    initialization() {
      this.params = {
        pageNum: 1,
        pageSize: 10,
      }
      this.searchParts =  ""
      this.selectState = ""
      this.serviceList()
    },
    /*分页条数切换 */
    handleSizeChange(value) {
      this.params.pageNum = 1
      this.params.pageSize = value;
      this.serviceList();
    },
    /*分页页数切换 */
    handlePageChange(value) {
      this.params.pageNum = value;
      this.serviceList();
    },
  },
};
</script>
<style lang="scss" scoped>
.spare-parts {
  padding: 10px;
  .search-parts {
    width: 230px;
  }
  .select-state,
  .select-stock {
    margin-left: 12px;
    width: 180px;
  }
  &-foot {
    margin-top: 10px;
    > div {
      &:first-child {
        font-size: 13px;
        color: #767e89;
      }
    }
  }
}
</style>
<style lang="scss">
.spare-parts {
  .select-state,
  .select-stock {
    .el-select {
      width: 100%;
    }
  }
  th > div {
    font-size: 14px !important;
    font-weight: 500 !important;
    border-color: #f2f2f2 !important;
  }
}
</style>