<template>
  <div class="spare-parts">
    <!-- 头部搜索 -->
    <div class="task-flex task-ai">
      <div class="search-parts">
        <el-input v-model="searchParts" placeholder="请输入备件信息" />
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
      <div class="select-stock">
        <el-select v-model="selectStock" placeholder="有无库存">
          <el-option
            v-for="item in selectStockList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <base-button type="primary" native-type="submit" class="task-ml12">
        搜索
      </base-button>
      <base-button type="ghost" @event="resetParams" class="task-ml12">
        重置
      </base-button>
    </div>
    <!-- 入库 出库  -->
    <div class="spare-parts-stock task-flex task-ai task-mt12">
      <div class="task-span1">
        <base-button type="primary" native-type="submit" class="task-mr12">
          入库
        </base-button>
        <base-button type="primary" native-type="submit"> 出库 </base-button>
      </div>
      <el-checkbox v-model="checkedParts">仅显示已发布的备件</el-checkbox>
    </div>
    <!-- table -->
  </div>
</template>
<script>
// 发布状态
const STATELIST = [
  {
    value: 1,
    label: "全部",
  },
  {
    value: 2,
    label: "未发布",
  },
  {
    value: 3,
    label: "已发布",
  },
];
// 库存
const STOCK = [
  {
    value: 1,
    label: "全部",
  },
  {
    value: 2,
    label: "有库存",
  },
  {
    value: 3,
    label: "无库存",
  },
];

// table名称
const TABLENAME = ["商品图片", "编号", "名称", "类别", "规格", "销售价", "出库价", "库存", "启用橱窗", "发布/取消"]

export default {
  name: "spare-parts",
  data() {
    return {
      searchParts: "", // 搜索备件信息
      selectState: "", //状态
      selectStock: "", //库存
      checkedParts: false, // 仅显示已发布的备件
      selectStateList: STATELIST,
      selectStockList: STOCK,
      tableNames: TABLENAME
    };
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
  &—stock {
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
}
</style>